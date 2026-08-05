import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireModerator, withAudit } from '@/lib/api-auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const ref = getAdminDb().collection('moderationReasonTemplates').doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'moderation-reason.delete', targetType: 'moderationReasonTemplates', targetId: id },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting rejection reason ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete reason' }, { status: 500 });
  }
}
