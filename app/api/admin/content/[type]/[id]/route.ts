import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { saveContentVersion } from '@/lib/contentVersions';
import { resolveCollection } from '@/lib/adminContentCollections';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { type, id } = await params;
  const collectionName = resolveCollection(type);
  if (!collectionName) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const ref = getAdminDb().collection(collectionName).doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const updates = { ...body, updatedAt: new Date().toISOString() };

    await withAudit(
      authResult.user,
      request,
      { action: `${type}.update`, targetType: collectionName, targetId: id },
      async () => {
        await saveContentVersion(authResult.user, { collection: collectionName, docId: id, snapshot: before });
        await ref.update(updates);
        return { before, after: updates, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating ${collectionName}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { type, id } = await params;
  const collectionName = resolveCollection(type);
  if (!collectionName) {
    return NextResponse.json({ success: false, message: 'Unknown content type' }, { status: 404 });
  }

  try {
    const ref = getAdminDb().collection(collectionName).doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: `${type}.delete`, targetType: collectionName, targetId: id },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete content' }, { status: 500 });
  }
}
