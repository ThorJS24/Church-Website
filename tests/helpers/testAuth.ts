import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { UserRole } from '../../lib/permissions';

function getAdminApp() {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth(getAdminApp());
const adminDb = getFirestore(getAdminApp());

/**
 * Creates a real Firebase Auth user + Firestore users/{uid} doc with the
 * given role, and returns a real ID token for it (via custom-token exchange
 * against the Identity Toolkit REST API — the same mechanism a real client
 * SDK sign-in produces). Tests hit actual routes with this token rather
 * than mocking auth, so they exercise the real requireRole() path.
 */
export async function createTestUser(role: UserRole) {
  const email = `test-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  const userRecord = await adminAuth.createUser({ email, password: 'Test-Password-123!' });

  await adminDb.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    role,
    isActive: true,
    membershipStatus: 'member',
    joinDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  const customToken = await adminAuth.createCustomToken(userRecord.uid);
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to exchange custom token: ${JSON.stringify(data)}`);
  }

  return { uid: userRecord.uid, email, idToken: data.idToken as string };
}

export async function deleteTestUser(uid: string) {
  await Promise.allSettled([
    adminAuth.deleteUser(uid),
    adminDb.collection('users').doc(uid).delete(),
  ]);
}

export async function getUserDoc(uid: string) {
  const snap = await adminDb.collection('users').doc(uid).get();
  return snap.data();
}

export async function deleteFirestoreDoc(collection: string, id: string) {
  await adminDb.collection(collection).doc(id).delete();
}

export async function createFirestoreDoc(collection: string, data: Record<string, unknown>) {
  const ref = await adminDb.collection(collection).add(data);
  return ref.id;
}

export async function getFirestoreDocById(collection: string, id: string) {
  const snap = await adminDb.collection(collection).doc(id).get();
  return snap.exists ? snap.data() : null;
}

// ---- Rate limit test helpers (lib/rateLimit.ts backs its counters onto
// the `rateLimits` collection) ----

export async function clearRateLimit(key: string) {
  await adminDb.collection('rateLimits').doc(key).delete();
}

/** Rewinds a rate-limit counter's window into the past, so the next
 * request is treated as a fresh window without waiting out the real
 * duration — the standard way to test time-window resets. */
export async function expireRateLimitWindow(key: string, windowMs: number) {
  const ref = adminDb.collection('rateLimits').doc(key);
  const snap = await ref.get();
  if (!snap.exists) return;
  await ref.update({ windowStart: Date.now() - windowMs - 1000 });
}

export async function getRateLimitDoc(key: string) {
  const snap = await adminDb.collection('rateLimits').doc(key).get();
  return snap.data();
}

/**
 * Deletes every doc in `collection` matching `field == value`. Used for
 * routes where the created doc's ID isn't recoverable from the response
 * (e.g. a route that writes to Firestore before an external call that then
 * fails and returns an error status without the new doc's ID).
 */
export async function deleteFirestoreDocsWhere(collection: string, field: string, value: unknown) {
  const snap = await adminDb.collection(collection).where(field, '==', value).get();
  await Promise.all(snap.docs.map(d => d.ref.delete()));
  return snap.size;
}

/** Read counterpart to deleteFirestoreDocsWhere — for asserting on docs a
 * route writes without a recoverable ID in its response (e.g. contentVersions
 * entries, which are looked up by collection+docId rather than returned). */
export async function queryFirestoreDocs(collection: string, field: string, value: unknown) {
  const snap = await adminDb.collection(collection).where(field, '==', value).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Seeds an auditLog entry with a specific timestamp (bypassing
 * FieldValue.serverTimestamp(), which can't be backdated) so date-range
 * tests can seed entries spread across real dates rather than a handful of
 * rows all created within the same test run.
 */
export async function seedAuditEntry(overrides: {
  actorUid?: string;
  actorEmail?: string;
  actorRole?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  timestamp: Date;
}) {
  const ref = await adminDb.collection('auditLog').add({
    actorUid: overrides.actorUid ?? 'seed-actor',
    actorEmail: overrides.actorEmail ?? 'seed@example.test',
    actorRole: overrides.actorRole ?? 'admin',
    action: overrides.action ?? 'test.seed',
    targetType: overrides.targetType ?? 'test',
    targetId: overrides.targetId ?? 'seed',
    before: null,
    after: null,
    timestamp: Timestamp.fromDate(overrides.timestamp),
    ip: null,
  });
  return ref.id;
}

/**
 * No orderBy on purpose — targetType+targetId+orderBy(timestamp) would need
 * its own composite index. In test scenarios a target has at most a
 * handful of entries, so fetching the equality-only match (which Firestore
 * serves without a composite index) and sorting in memory is simpler than
 * asking for another manually-deployed index just for test verification.
 */
export async function getLatestAuditEntry(targetType: string, targetId: string) {
  const snap = await adminDb
    .collection('auditLog')
    .where('targetType', '==', targetType)
    .where('targetId', '==', targetId)
    .get();
  if (snap.empty) return null;
  const docs = snap.docs.map(d => d.data());
  docs.sort((a, b) => (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0));
  return docs[0];
}
