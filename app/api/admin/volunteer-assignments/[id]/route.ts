import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { updateVolunteerAssignmentStatus, deleteVolunteerAssignment } from '@/lib/repositories/volunteering';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  try {
    const body = await request.json();
    await withAudit(
      authResult.user,
      request,
      { action: 'volunteerAssignment.update', targetType: 'volunteerAssignments', targetId: id },
      async () => {
        await updateVolunteerAssignmentStatus(id, body.status);
        return { after: { status: body.status }, result: null };
      }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error updating volunteer assignment ${id}:`, error);
    return NextResponse.json({ success: false, message: error.message ?? 'Failed to update assignment' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  try {
    await withAudit(
      authResult.user,
      request,
      { action: 'volunteerAssignment.delete', targetType: 'volunteerAssignments', targetId: id },
      async () => {
        await deleteVolunteerAssignment(id);
        return { before: null, after: null, result: null };
      }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting volunteer assignment ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete assignment' }, { status: 500 });
  }
}
