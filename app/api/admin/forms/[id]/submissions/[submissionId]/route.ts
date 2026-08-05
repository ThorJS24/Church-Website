import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; submissionId: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id, submissionId } = await params;

  try {
    const ref = getAdminDb().collection('formSubmissions').doc(submissionId);
    const before = (await ref.get()).data();
    if (!before || before.formId !== id) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'form.submission_delete', targetType: 'formSubmissions', targetId: submissionId },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting submission ${submissionId}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete submission' }, { status: 500 });
  }
}
