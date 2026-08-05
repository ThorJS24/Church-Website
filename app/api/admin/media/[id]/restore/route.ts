import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      { action: 'media.restore', targetType: 'mediaLibrary', targetId: id },
      async () => {
        await ref.update({ deletedAt: null });
        return { before: { deletedAt: before.deletedAt ?? null }, after: { deletedAt: null }, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error restoring media/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to restore media' }, { status: 500 });
  }
}
