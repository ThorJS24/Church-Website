import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import cloudinary from '@/lib/cloudinary';

const EDITABLE_FIELDS = ['altText', 'copyright', 'folder', 'tags'] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const ref = getAdminDb().collection('mediaLibrary').doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in body) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: 'No editable fields provided' }, { status: 400 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'media.update', targetType: 'mediaLibrary', targetId: id },
      async () => {
        await ref.update(updates);
        return { before: null, after: updates, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating media/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update media' }, { status: 500 });
  }
}

// Soft-deletes on first call (sets deletedAt, keeps the Cloudinary asset —
// this is what "move to Trash" does client-side); a second DELETE on an
// already-trashed item is the permanent delete, which also removes the
// Cloudinary asset. Two calls, not a query param, so the destructive path
// always requires the item to have passed through Trash first.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const ref = getAdminDb().collection('mediaLibrary').doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (!before.deletedAt) {
      await withAudit(
        authResult.user,
        request,
        { action: 'media.trash', targetType: 'mediaLibrary', targetId: id },
        async () => {
          await ref.update({ deletedAt: new Date().toISOString() });
          return { before: { deletedAt: null }, after: { deletedAt: 'trashed' }, result: null };
        }
      );
      return NextResponse.json({ success: true, trashed: true });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'media.delete', targetType: 'mediaLibrary', targetId: id },
      async () => {
        if (before.publicId) {
          // Best-effort: an already-missing Cloudinary asset shouldn't block
          // removing the library entry itself.
          await cloudinary.uploader.destroy(before.publicId).catch((err) => {
            console.error(`Cloudinary destroy failed for ${before.publicId}:`, err);
          });
        }
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true, trashed: false });
  } catch (error) {
    console.error(`Error deleting media/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete media' }, { status: 500 });
  }
}
