import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

function loadServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, ' +
      'FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in the server environment.'
    );
  }

  return {
    projectId,
    clientEmail,
    // Vercel/most env UIs store the key with literal "\n" sequences.
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  return initializeApp({
    credential: cert(loadServiceAccount()),
  });
}

// Lazy: credentials are validated on first real use (inside a request
// handler), not at module load. Next.js imports every route module during
// `next build` to collect its metadata, so eager initialization here would
// make the production build itself fail on any machine that doesn't have
// FIREBASE_ADMIN_* set — including CI/build environments that never
// actually serve a request.
let _adminAuth: ReturnType<typeof getAuth> | undefined;
let _adminDb: ReturnType<typeof getFirestore> | undefined;

export function getAdminAuth() {
  if (!_adminAuth) _adminAuth = getAuth(getAdminApp());
  return _adminAuth;
}

export function getAdminDb() {
  if (!_adminDb) _adminDb = getFirestore(getAdminApp());
  return _adminDb;
}

/**
 * Recursively converts Firestore `Timestamp` values to ISO date strings.
 * The Admin SDK's `Timestamp` only exposes `_seconds`/`_nanoseconds` as
 * real (JSON.stringify-visible) own properties — `.seconds` is a getter
 * that `JSON.stringify` silently drops — so `NextResponse.json(doc.data())`
 * ships a shape frontend code checking `typeof ts.seconds === 'number'`
 * can never match. Call this on any Firestore doc data before returning it
 * from an API route.
 */
export function serializeTimestamps<T>(value: T): T {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => serializeTimestamps(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = serializeTimestamps(v);
    }
    return out as T;
  }
  return value;
}
