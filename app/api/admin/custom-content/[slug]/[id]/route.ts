import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { saveContentVersion } from '@/lib/contentVersions';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug, id } = await params;

  try {
    const ref = getAdminDb().collection('customContent').doc(id);
    const before = (await ref.get()).data();
    if (!before || before.contentType !== slug) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    // contentType can't be changed via an update — moving a doc between
    // types would silently break the type it's leaving and joining.
    const updates = { ...body, contentType: slug, updatedAt: new Date().toISOString() };

    await withAudit(
      authResult.user,
      request,
      { action: `custom-content.${slug}.update`, targetType: 'customContent', targetId: id },
      async () => {
        await saveContentVersion(authResult.user, { collection: 'customContent', docId: id, snapshot: before });
        await ref.update(updates);
        return { before, after: updates, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating customContent/${slug}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug, id } = await params;

  try {
    const ref = getAdminDb().collection('customContent').doc(id);
    const before = (await ref.get()).data();
    if (!before || before.contentType !== slug) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: `custom-content.${slug}.delete`, targetType: 'customContent', targetId: id },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting customContent/${slug}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete content' }, { status: 500 });
  }
}
