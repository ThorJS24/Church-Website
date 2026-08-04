import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import cloudinary from '@/lib/cloudinary';

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting media/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete media' }, { status: 500 });
  }
}
