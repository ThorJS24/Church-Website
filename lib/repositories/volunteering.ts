import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import {
  VolunteerOpportunityInputSchema,
  VolunteerAssignmentInputSchema,
  type VolunteerOpportunityInput,
  type VolunteerAssignmentInput,
} from '@/lib/domain/schemas';
import type { VolunteerOpportunity, VolunteerAssignment, VolunteerAssignmentStatus } from '@/lib/domain/types';

const OPPORTUNITIES = 'volunteerOpportunities';
const ASSIGNMENTS = 'volunteerAssignments';

function withId<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as T;
}

export async function createVolunteerOpportunity(input: VolunteerOpportunityInput): Promise<VolunteerOpportunity> {
  const data = VolunteerOpportunityInputSchema.parse(input);
  const record = { ...data, spotsFilled: 0 };
  const ref = await getAdminDb().collection(OPPORTUNITIES).add(record);
  return { id: ref.id, ...record } as VolunteerOpportunity;
}

export async function listVolunteerOpportunities(): Promise<VolunteerOpportunity[]> {
  const snap = await getAdminDb().collection(OPPORTUNITIES).get();
  return snap.docs.map((d) => withId<VolunteerOpportunity>(d));
}

export async function getVolunteerOpportunityById(id: string): Promise<VolunteerOpportunity | null> {
  const snap = await getAdminDb().collection(OPPORTUNITIES).doc(id).get();
  return snap.exists ? withId<VolunteerOpportunity>(snap) : null;
}

/**
 * Assigns a person to an opportunity and increments `spotsFilled` in the
 * same transaction — the denormalized count on VolunteerOpportunity must
 * never drift from the actual number of active assignments.
 */
export async function createVolunteerAssignment(input: VolunteerAssignmentInput): Promise<VolunteerAssignment> {
  const data = VolunteerAssignmentInputSchema.parse(input);
  const db = getAdminDb();
  const opportunityRef = db.collection(OPPORTUNITIES).doc(data.opportunityId);
  const assignmentRef = db.collection(ASSIGNMENTS).doc();
  const record = { ...data, createdAt: new Date().toISOString() };

  await db.runTransaction(async (tx) => {
    const opportunitySnap = await tx.get(opportunityRef);
    if (!opportunitySnap.exists) throw new Error('Volunteer opportunity not found');
    tx.set(assignmentRef, record);
    if (data.status === 'confirmed' || data.status === 'applied') {
      tx.update(opportunityRef, { spotsFilled: FieldValue.increment(1) });
    }
  });

  return { id: assignmentRef.id, ...record } as VolunteerAssignment;
}

export async function updateVolunteerAssignmentStatus(id: string, status: VolunteerAssignmentStatus): Promise<void> {
  const db = getAdminDb();
  const assignmentRef = db.collection(ASSIGNMENTS).doc(id);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(assignmentRef);
    if (!snap.exists) throw new Error('Assignment not found');
    const before = snap.data() as VolunteerAssignment;
    tx.update(assignmentRef, { status });
    if (before.status !== 'cancelled' && status === 'cancelled') {
      const opportunityRef = db.collection(OPPORTUNITIES).doc(before.opportunityId);
      tx.update(opportunityRef, { spotsFilled: FieldValue.increment(-1) });
    }
  });
}

export async function listAssignmentsForOpportunity(opportunityId: string): Promise<VolunteerAssignment[]> {
  const snap = await getAdminDb().collection(ASSIGNMENTS).where('opportunityId', '==', opportunityId).get();
  return snap.docs.map((d) => withId<VolunteerAssignment>(d));
}

export async function listAssignmentsForPerson(personId: string): Promise<VolunteerAssignment[]> {
  const snap = await getAdminDb().collection(ASSIGNMENTS).where('personId', '==', personId).get();
  return snap.docs.map((d) => withId<VolunteerAssignment>(d));
}

/** Deletes an assignment and releases its spot if it was counted as filled — mirrors the transaction in updateVolunteerAssignmentStatus. */
export async function deleteVolunteerAssignment(id: string): Promise<void> {
  const db = getAdminDb();
  const assignmentRef = db.collection(ASSIGNMENTS).doc(id);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(assignmentRef);
    if (!snap.exists) throw new Error('Assignment not found');
    const before = snap.data() as VolunteerAssignment;
    tx.delete(assignmentRef);
    if (before.status !== 'cancelled') {
      const opportunityRef = db.collection(OPPORTUNITIES).doc(before.opportunityId);
      tx.update(opportunityRef, { spotsFilled: FieldValue.increment(-1) });
    }
  });
}
