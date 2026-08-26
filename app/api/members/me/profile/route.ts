import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';
import { getPersonById } from '@/lib/repositories/people';
import { listMinistryMembershipsForPerson, listGroupMembershipsForPerson } from '@/lib/repositories/memberships';
import { listAssignmentsForPerson, getVolunteerOpportunityById } from '@/lib/repositories/volunteering';
import { getMinistryById, getGroupById } from '@/lib/repositories/ministries';
import { getEventById } from '@/lib/repositories/events';

/**
 * Domain-shaped read for "what am I part of" — a Person plus their
 * ministries, groups, event registrations, and volunteer assignments,
 * each resolved to the entity it points at, not just a list of ids.
 * See architecture doc §5.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const { uid } = authResult.user;
  const db = getAdminDb();

  try {
    const person = await getPersonById(uid);
    const [ministryMemberships, groupMemberships, registrationsSnap, assignments] = await Promise.all([
      listMinistryMembershipsForPerson(uid),
      listGroupMembershipsForPerson(uid),
      db.collection('eventRegistrations').where('personId', '==', uid).get(),
      listAssignmentsForPerson(uid),
    ]);

    const [ministries, groups, opportunities] = await Promise.all([
      Promise.all(ministryMemberships.map(async (m) => {
        const ministry = await getMinistryById(m.ministryId);
        return ministry ? { ...ministry, roleInMinistry: m.roleInMinistry } : null;
      })),
      Promise.all(groupMemberships.map(async (m) => {
        const group = await getGroupById(m.groupId);
        return group ? { ...group, roleInGroup: m.roleInGroup } : null;
      })),
      Promise.all(assignments.map(async (a) => {
        const opportunity = await getVolunteerOpportunityById(a.opportunityId);
        return { ...a, opportunity };
      })),
    ]);

    // eventRegistrations predates this redesign and has no dedicated
    // repository — read directly here, same as the existing
    // /api/events/[id]/rsvp and /api/admin/events/[id]/registrations routes.
    const eventRegistrations = await Promise.all(
      registrationsSnap.docs.map(async (d) => {
        const reg = serializeTimestamps({ id: d.id, ...d.data() }) as Record<string, any>;
        const event = await getEventById(reg.eventId);
        return { ...reg, event };
      })
    );

    return NextResponse.json({
      success: true,
      profile: {
        person,
        ministries: ministries.filter(Boolean),
        groups: groups.filter(Boolean),
        eventRegistrations,
        volunteerAssignments: opportunities,
      },
    });
  } catch (error) {
    console.error('Error resolving member profile:', error);
    return NextResponse.json({ success: false, message: 'Failed to load profile' }, { status: 500 });
  }
}
