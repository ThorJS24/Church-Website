import 'server-only';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { EventAttendanceInputSchema, type EventAttendanceInput } from '@/lib/domain/schemas';
import type { EventAttendance, Person, Location } from '@/lib/domain/types';
import { getPersonById } from '@/lib/repositories/people';
import { getLocationById } from '@/lib/repositories/locations';

const EVENTS = 'events';
const ATTENDANCE = 'eventAttendance';
const REGISTRATIONS = 'eventRegistrations';

function withId<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as T;
}

export async function recordEventAttendance(input: EventAttendanceInput): Promise<EventAttendance> {
  const data = EventAttendanceInputSchema.parse(input);
  const record = { ...data, checkedInAt: new Date().toISOString() };
  const ref = await getAdminDb().collection(ATTENDANCE).add(record);
  return { id: ref.id, ...record } as EventAttendance;
}

export async function listAttendanceForEvent(eventId: string): Promise<EventAttendance[]> {
  const snap = await getAdminDb().collection(ATTENDANCE).where('eventId', '==', eventId).get();
  return snap.docs.map((d) => withId<EventAttendance>(d));
}

export async function getEventById(id: string): Promise<Record<string, unknown> | null> {
  const snap = await getAdminDb().collection(EVENTS).doc(id).get();
  return snap.exists ? withId(snap) : null;
}

export interface ResolvedEvent {
  id: string;
  [key: string]: unknown;
  organizer: Person | null;
  /** The resolved Location doc — named distinctly from the pre-existing
   * `location` free-text string field so this never overwrites it. */
  locationDetails: Location | null;
  ministry: { id: string; title: string } | null;
  group: { id: string; name: string } | null;
  registeredCount: number;
  attendedCount: number;
}

/**
 * Joins an event with its organizer/location/ministry/group and
 * registration/attendance counts — the shape §5 of the architecture doc
 * promises, resolved server-side so no caller has to do multi-collection
 * lookups or guess relationships from free text.
 */
export async function resolveEvent(eventId: string): Promise<ResolvedEvent | null> {
  const db = getAdminDb();
  const eventSnap = await db.collection(EVENTS).doc(eventId).get();
  if (!eventSnap.exists) return null;
  const event = withId<Record<string, any>>(eventSnap);

  const [organizer, locationDetails, ministrySnap, groupSnap, registrationsSnap, attendanceSnap] = await Promise.all([
    event.organizerId ? getPersonById(event.organizerId) : Promise.resolve(null),
    event.locationId ? getLocationById(event.locationId) : Promise.resolve(null),
    event.ministryId ? db.collection('ministries').doc(event.ministryId).get() : Promise.resolve(null),
    event.groupId ? db.collection('smallGroups').doc(event.groupId).get() : Promise.resolve(null),
    db.collection(REGISTRATIONS).where('eventId', '==', eventId).get(),
    db.collection(ATTENDANCE).where('eventId', '==', eventId).get(),
  ]);

  return {
    ...event,
    id: eventSnap.id,
    organizer,
    locationDetails,
    ministry: ministrySnap?.exists ? { id: ministrySnap.id, title: ministrySnap.data()?.title } : null,
    group: groupSnap?.exists ? { id: groupSnap.id, name: groupSnap.data()?.name } : null,
    registeredCount: registrationsSnap.docs.filter((d) => d.data().status !== 'cancelled').length,
    attendedCount: attendanceSnap.size,
  };
}
