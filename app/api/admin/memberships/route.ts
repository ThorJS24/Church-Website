import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import {
  addMinistryMembership,
  addGroupMembership,
  listMinistryMembershipsForPerson,
  listMinistryMembershipsForMinistry,
  listGroupMembershipsForPerson,
  listGroupMembershipsForGroup,
} from '@/lib/repositories/memberships';

/**
 * Ministry/group membership management. Not exposed as a GenericContentTab
 * (see PLAN.md-equivalent note in the final report): membership records
 * are join rows, not publishable content, and this scope intentionally
 * covers only the API + repository layer plus the person-picker inputs
 * required by the approved architecture — not a new admin table UI.
 *
 * GET  ?kind=ministry&personId=... | &ministryId=...
 * GET  ?kind=group&personId=... | &groupId=...
 * POST { kind: 'ministry'|'group', personId, ministryId|groupId, role }
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind');
  const personId = searchParams.get('personId');
  const ministryId = searchParams.get('ministryId');
  const groupId = searchParams.get('groupId');

  try {
    if (kind === 'ministry') {
      const memberships = personId
        ? await listMinistryMembershipsForPerson(personId)
        : ministryId
          ? await listMinistryMembershipsForMinistry(ministryId)
          : [];
      return NextResponse.json({ success: true, memberships });
    }
    if (kind === 'group') {
      const memberships = personId
        ? await listGroupMembershipsForPerson(personId)
        : groupId
          ? await listGroupMembershipsForGroup(groupId)
          : [];
      return NextResponse.json({ success: true, memberships });
    }
    return NextResponse.json({ success: false, message: 'kind must be "ministry" or "group"' }, { status: 400 });
  } catch (error) {
    console.error('Error listing memberships:', error);
    return NextResponse.json({ success: false, message: 'Failed to list memberships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    if (body.kind === 'ministry') {
      const membership = await withAudit(
        authResult.user,
        request,
        { action: 'ministryMembership.create', targetType: 'ministryMemberships', targetId: `${body.personId}_${body.ministryId}` },
        async () => {
          const result = await addMinistryMembership({ personId: body.personId, ministryId: body.ministryId, roleInMinistry: body.role ?? 'member', status: 'active' });
          return { after: result, result };
        }
      );
      return NextResponse.json({ success: true, membership });
    }
    if (body.kind === 'group') {
      const membership = await withAudit(
        authResult.user,
        request,
        { action: 'groupMembership.create', targetType: 'groupMemberships', targetId: `${body.personId}_${body.groupId}` },
        async () => {
          const result = await addGroupMembership({ personId: body.personId, groupId: body.groupId, roleInGroup: body.role ?? 'member', status: 'active' });
          return { after: result, result };
        }
      );
      return NextResponse.json({ success: true, membership });
    }
    return NextResponse.json({ success: false, message: 'kind must be "ministry" or "group"' }, { status: 400 });
  } catch (error: any) {
    console.error('Error creating membership:', error);
    return NextResponse.json({ success: false, message: error.message ?? 'Failed to create membership' }, { status: 400 });
  }
}
