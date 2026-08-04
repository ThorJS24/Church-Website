import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

// Allowlist of editable content collections — prevents the [type] param
// from being used to reach arbitrary Firestore collections (users,
// auditLog, etc). Gallery has its own routes (app/api/admin/gallery/*)
// because it also carries moderation state; site settings has its own
// singleton route (app/api/admin/settings).
const COLLECTIONS: Record<string, string> = {
  sermons: 'sermons',
  events: 'events',
  pastors: 'pastors',
  series: 'series',
  speakers: 'speakers',
  ministries: 'ministries',
  announcements: 'announcements',
  services: 'services',
  smallGroups: 'smallGroups',
  testimonials: 'testimonials',
  redirects: 'redirects',
  resources: 'resources',
};

function resolveCollection(type: string): string | null {
  return COLLECTIONS[type] ?? null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { type } = await params;
  const collectionName = resolveCollection(type);
  if (!collectionName) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const snap = await getAdminDb().collection(collectionName).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error(`Error listing ${collectionName}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to list content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { type } = await params;
  const collectionName = resolveCollection(type);
  if (!collectionName) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    // Testimonials submitted through this route came from an admin, not
    // the public form (app/api/testimonials/submit) — pre-approve them,
    // matching the same convention app/api/gallery/upload uses for
    // admin-uploaded (vs. publicly-submitted) gallery images.
    const extra = collectionName === 'testimonials' ? { moderationStatus: 'approved' } : {};
    const data = { ...body, ...extra, createdAt: now, updatedAt: now };

    // Pre-generate the doc ref so its real ID is known before the audit
    // entry is written — logging targetId as a placeholder here would mean
    // the audit trail could never actually be traced back to this doc.
    const docRef = getAdminDb().collection(collectionName).doc();

    const id = await withAudit(
      authResult.user,
      request,
      { action: `${type}.create`, targetType: collectionName, targetId: docRef.id },
      async () => {
        await docRef.set(data);
        return { after: data, result: docRef.id };
      }
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(`Error creating ${collectionName} doc:`, error);
    return NextResponse.json({ success: false, message: 'Failed to create content' }, { status: 500 });
  }
}
