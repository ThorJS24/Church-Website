import 'server-only';
import { getAdminDb } from '@/lib/firebase-admin';
import { serializeTimestamps } from '@/lib/firebase-admin';
import { PersonInputSchema, type PersonInput } from '@/lib/domain/schemas';
import type { Person } from '@/lib/domain/types';

const COLLECTION = 'people';

function withId(doc: FirebaseFirestore.DocumentSnapshot): Person {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as Person;
}

export async function getPersonById(id: string): Promise<Person | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(id).get();
  return snap.exists ? withId(snap) : null;
}

export async function getPeopleByIds(ids: string[]): Promise<Person[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return [];
  const refs = uniqueIds.map((personId) => getAdminDb().collection(COLLECTION).doc(personId));
  const snaps = await getAdminDb().getAll(...refs);
  return snaps.filter((s) => s.exists).map((s) => withId(s));
}

export async function listPeople(): Promise<Person[]> {
  const snap = await getAdminDb().collection(COLLECTION).get();
  return snap.docs.map(withId);
}

/**
 * Exact, case-insensitive match against `displayName`. Used by the
 * migration to decide whether a free-text name unambiguously resolves to
 * an existing Person — never fabricates a match beyond this.
 */
export async function findPeopleByExactName(name: string): Promise<Person[]> {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return [];
  const all = await listPeople();
  return all.filter((p) => p.displayName.trim().toLowerCase() === normalized);
}

/** Creates a Person doc at a specific id — used to link a Person 1:1 with users/{uid}. */
export async function createPersonWithId(id: string, input: PersonInput): Promise<Person> {
  const data = PersonInputSchema.parse(input);
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now, updatedAt: now };
  await getAdminDb().collection(COLLECTION).doc(id).set(record);
  return { id, ...record } as Person;
}

export async function createPerson(input: PersonInput): Promise<Person> {
  const data = PersonInputSchema.parse(input);
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now, updatedAt: now };
  const ref = await getAdminDb().collection(COLLECTION).add(record);
  return { id: ref.id, ...record } as Person;
}

export async function updatePerson(id: string, input: Partial<PersonInput>): Promise<void> {
  const data = PersonInputSchema.partial().parse(input);
  await getAdminDb().collection(COLLECTION).doc(id).update({ ...data, updatedAt: new Date().toISOString() });
}
