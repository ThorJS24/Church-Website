import 'server-only';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import type { Person, Location } from '@/lib/domain/types';
import { getPeopleByIds } from '@/lib/repositories/people';

const MINISTRIES = 'ministries';
const GROUPS = 'smallGroups';
const EVENTS = 'events';
const OPPORTUNITIES = 'volunteerOpportunities';

function withId<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as T;
}

export async function getMinistryById(id: string): Promise<Record<string, unknown> | null> {
  const snap = await getAdminDb().collection(MINISTRIES).doc(id).get();
  return snap.exists ? withId(snap) : null;
}

export async function getGroupById(id: string): Promise<Record<string, unknown> | null> {
  const snap = await getAdminDb().collection(GROUPS).doc(id).get();
  return snap.exists ? withId(snap) : null;
}

export interface ResolvedMinistry {
  id: string;
  [key: string]: unknown;
  leaders: Person[];
  groups: Record<string, unknown>[];
  upcomingEvents: Record<string, unknown>[];
  volunteerOpportunities: Record<string, unknown>[];
}

/** Joins a ministry with its leaders, groups, upcoming events, and open volunteer opportunities — the shape §5 of the architecture doc promises. */
export async function resolveMinistry(ministryId: string): Promise<ResolvedMinistry | null> {
  const db = getAdminDb();
  const snap = await db.collection(MINISTRIES).doc(ministryId).get();
  if (!snap.exists) return null;
  const ministry = withId<Record<string, any>>(snap);

  const now = new Date().toISOString();
  const [leaders, groupsSnap, eventsSnap, opportunitiesSnap] = await Promise.all([
    getPeopleByIds(ministry.leaderIds ?? []),
    db.collection(GROUPS).where('ministryId', '==', ministryId).get(),
    db.collection(EVENTS).where('ministryId', '==', ministryId).where('startDate', '>=', now).get(),
    db.collection(OPPORTUNITIES).where('ministryId', '==', ministryId).where('status', '==', 'open').get(),
  ]);

  return {
    ...ministry,
    id: snap.id,
    leaders,
    groups: groupsSnap.docs.map((d) => withId(d)),
    upcomingEvents: eventsSnap.docs.map((d) => withId(d)),
    volunteerOpportunities: opportunitiesSnap.docs.map((d) => withId(d)),
  };
}

export interface ResolvedGroup {
  id: string;
  [key: string]: unknown;
  leaders: Person[];
  /** The resolved Location doc — named distinctly from the pre-existing
   * `location` free-text string field on smallGroups so this never
   * overwrites it (see the same fix in resolveEvent). */
  locationDetails: Location | null;
  ministry: { id: string; title: string } | null;
}

export async function resolveGroup(groupId: string): Promise<ResolvedGroup | null> {
  const db = getAdminDb();
  const snap = await db.collection(GROUPS).doc(groupId).get();
  if (!snap.exists) return null;
  const group = withId<Record<string, any>>(snap);

  const [leaders, locationSnap, ministrySnap] = await Promise.all([
    getPeopleByIds(group.leaderIds ?? []),
    group.locationId ? db.collection('locations').doc(group.locationId).get() : Promise.resolve(null),
    group.ministryId ? db.collection(MINISTRIES).doc(group.ministryId).get() : Promise.resolve(null),
  ]);

  return {
    ...group,
    id: snap.id,
    leaders,
    locationDetails: locationSnap?.exists ? (withId(locationSnap) as Location) : null,
    ministry: ministrySnap?.exists ? { id: ministrySnap.id, title: ministrySnap.data()?.title } : null,
  };
}
