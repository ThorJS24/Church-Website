import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { createVolunteerAssignment, listAssignmentsForOpportunity, listAssignmentsForPerson } from '@/lib/repositories/volunteering';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get('opportunityId');
  const personId = searchParams.get('personId');

  try {
    const assignments = opportunityId
      ? await listAssignmentsForOpportunity(opportunityId)
      : personId
        ? await listAssignmentsForPerson(personId)
        : [];
    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error('Error listing volunteer assignments:', error);
    return NextResponse.json({ success: false, message: 'Failed to list assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const assignment = await withAudit(
      authResult.user,
      request,
      { action: 'volunteerAssignment.create', targetType: 'volunteerAssignments', targetId: `${body.personId}_${body.opportunityId}` },
      async () => {
        const result = await createVolunteerAssignment({ opportunityId: body.opportunityId, personId: body.personId, status: body.status ?? 'applied' });
        return { after: result, result };
      }
    );
    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error('Error creating volunteer assignment:', error);
    return NextResponse.json({ success: false, message: error.message ?? 'Failed to create assignment' }, { status: 400 });
  }
}
