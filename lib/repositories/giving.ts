// Application-level scaffolding only — see the architecture doc's Giving
// section. No payment provider is integrated in this codebase; nothing
// calls createGivingRecord() today. This exists so the collection has an
// enforced shape whenever that work happens, not so it can be used now.
import 'server-only';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { GivingFundInputSchema, GivingRecordInputSchema, type GivingFundInput, type GivingRecordInput } from '@/lib/domain/schemas';
import type { GivingFund, GivingRecord } from '@/lib/domain/types';

const FUNDS = 'givingFunds';
const RECORDS = 'givingRecords';

function withId<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as T;
}

export async function createGivingFund(input: GivingFundInput): Promise<GivingFund> {
  const data = GivingFundInputSchema.parse(input);
  const record = { ...data, raisedAmount: 0 };
  const ref = await getAdminDb().collection(FUNDS).add(record);
  return { id: ref.id, ...record } as GivingFund;
}

export async function listGivingFunds(): Promise<GivingFund[]> {
  const snap = await getAdminDb().collection(FUNDS).get();
  return snap.docs.map((d) => withId<GivingFund>(d));
}

/** Not called by any route today — reserved for when a payment provider exists. See module comment. */
export async function createGivingRecord(input: GivingRecordInput): Promise<GivingRecord> {
  const data = GivingRecordInputSchema.parse(input);
  const record = { ...data, createdAt: new Date().toISOString() };
  const ref = await getAdminDb().collection(RECORDS).add(record);
  return { id: ref.id, ...record } as GivingRecord;
}

export async function listGivingRecordsForPerson(personId: string): Promise<GivingRecord[]> {
  const snap = await getAdminDb().collection(RECORDS).where('donorPersonId', '==', personId).get();
  return snap.docs.map((d) => withId<GivingRecord>(d));
}
