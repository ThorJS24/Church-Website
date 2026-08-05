import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { saveContentVersion } from '@/lib/contentVersions';

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
  staffMembers: 'staffMembers',
  prayerRequests: 'prayerRequests',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string; versionId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { type, id, versionId } = await params;
  const collectionName = COLLECTIONS[type];
  if (!collectionName) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const versionSnap = await getAdminDb().collection('contentVersions').doc(versionId).get();
    const version = versionSnap.data();
    if (!version || version.collection !== collectionName || version.docId !== id) {
      return NextResponse.json({ success: false, message: 'Version not found' }, { status: 404 });
    }

    const ref = getAdminDb().collection(collectionName).doc(id);
    const current = (await ref.get()).data();
    if (!current) {
      return NextResponse.json({ success: false, message: 'Content no longer exists' }, { status: 404 });
    }

    const restored = { ...version.snapshot, updatedAt: new Date().toISOString() };

    await withAudit(
      authResult.user,
      request,
      { action: `${type}.restore`, targetType: collectionName, targetId: id },
      async () => {
        // Snapshot the current (pre-restore) state too, so restoring is
        // itself just another version — never a dead end.
        await saveContentVersion(authResult.user, { collection: collectionName, docId: id, snapshot: current });
        await ref.set(restored);
        return { before: current, after: restored, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error restoring version ${versionId} for ${collectionName}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to restore version' }, { status: 500 });
  }
}
