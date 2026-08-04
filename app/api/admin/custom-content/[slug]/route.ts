import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

// All custom types share the single `customContent` collection, partitioned
// by a `contentType` field — see firestore.rules for why (new types must
// never require a rules redeploy to become publicly readable).
async function typeExists(slug: string): Promise<boolean> {
  const doc = await getAdminDb().collection('contentTypes').doc(slug).get();
  return doc.exists;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug } = await params;
  if (!(await typeExists(slug))) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const snap = await getAdminDb().collection('customContent').where('contentType', '==', slug).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error(`Error listing customContent/${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to list content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug } = await params;
  if (!(await typeExists(slug))) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    // contentType is server-set, never trusted from the client body, so a
    // caller can't write into a different type's partition via this route.
    const data = { ...body, contentType: slug, createdAt: now, updatedAt: now };

    const docRef = getAdminDb().collection('customContent').doc();

    const id = await withAudit(
      authResult.user,
      request,
      { action: `custom-content.${slug}.create`, targetType: 'customContent', targetId: docRef.id },
      async () => {
        await docRef.set(data);
        return { after: data, result: docRef.id };
      }
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(`Error creating customContent/${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to create content' }, { status: 500 });
  }
}
