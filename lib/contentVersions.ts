import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { AuthenticatedUser } from '@/lib/api-auth';

/**
 * Snapshots a doc's pre-edit state into `contentVersions` so the admin
 * panel can show history and restore a prior version. Called with the
 * `before` state, not `after` — a version entry represents "what this
 * doc looked like immediately before this edit."
 */
export async function saveContentVersion(
  user: AuthenticatedUser,
  params: { collection: string; docId: string; snapshot: unknown }
) {
  await getAdminDb().collection('contentVersions').add({
    collection: params.collection,
    docId: params.docId,
    snapshot: params.snapshot,
    editedBy: user.uid,
    editedByEmail: user.email,
    editedAt: FieldValue.serverTimestamp(),
  });
}
