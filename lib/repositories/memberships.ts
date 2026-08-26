import 'server-only';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import {
  MinistryMembershipInputSchema,
  GroupMembershipInputSchema,
  type MinistryMembershipInput,
  type GroupMembershipInput,
} from '@/lib/domain/schemas';
import type { MinistryMembership, GroupMembership } from '@/lib/domain/types';

const MINISTRY_MEMBERSHIPS = 'ministryMemberships';
const GROUP_MEMBERSHIPS = 'groupMemberships';

function withId<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as T;
}

// ---- Ministry memberships ----

export async function addMinistryMembership(input: MinistryMembershipInput): Promise<MinistryMembership> {
  const data = MinistryMembershipInputSchema.parse(input);
  const id = `${data.personId}_${data.ministryId}`;
  const record = { ...data, joinedAt: new Date().toISOString() };
  await getAdminDb().collection(MINISTRY_MEMBERSHIPS).doc(id).set(record, { merge: true });
  return { id, ...record } as MinistryMembership;
}

export async function removeMinistryMembership(id: string): Promise<void> {
  await getAdminDb().collection(MINISTRY_MEMBERSHIPS).doc(id).delete();
}

export async function listMinistryMembershipsForPerson(personId: string): Promise<MinistryMembership[]> {
  const snap = await getAdminDb().collection(MINISTRY_MEMBERSHIPS).where('personId', '==', personId).get();
  return snap.docs.map((d) => withId<MinistryMembership>(d));
}

export async function listMinistryMembershipsForMinistry(ministryId: string): Promise<MinistryMembership[]> {
  const snap = await getAdminDb().collection(MINISTRY_MEMBERSHIPS).where('ministryId', '==', ministryId).get();
  return snap.docs.map((d) => withId<MinistryMembership>(d));
}

// ---- Group memberships ----

export async function addGroupMembership(input: GroupMembershipInput): Promise<GroupMembership> {
  const data = GroupMembershipInputSchema.parse(input);
  const id = `${data.personId}_${data.groupId}`;
  const record = { ...data, joinedAt: new Date().toISOString() };
  await getAdminDb().collection(GROUP_MEMBERSHIPS).doc(id).set(record, { merge: true });
  return { id, ...record } as GroupMembership;
}

export async function removeGroupMembership(id: string): Promise<void> {
  await getAdminDb().collection(GROUP_MEMBERSHIPS).doc(id).delete();
}

export async function listGroupMembershipsForPerson(personId: string): Promise<GroupMembership[]> {
  const snap = await getAdminDb().collection(GROUP_MEMBERSHIPS).where('personId', '==', personId).get();
  return snap.docs.map((d) => withId<GroupMembership>(d));
}

export async function listGroupMembershipsForGroup(groupId: string): Promise<GroupMembership[]> {
  const snap = await getAdminDb().collection(GROUP_MEMBERSHIPS).where('groupId', '==', groupId).get();
  return snap.docs.map((d) => withId<GroupMembership>(d));
}
