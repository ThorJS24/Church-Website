import 'server-only';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { MediaAssetInputSchema, type MediaAssetInput } from '@/lib/domain/schemas';
import type { MediaAsset } from '@/lib/domain/types';

const COLLECTION = 'mediaAssets';

function withId(doc: FirebaseFirestore.DocumentSnapshot): MediaAsset {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as MediaAsset;
}

export async function createMediaAsset(input: MediaAssetInput): Promise<MediaAsset> {
  const data = MediaAssetInputSchema.parse(input);
  const record = { ...data, createdAt: new Date().toISOString() };
  const ref = await getAdminDb().collection(COLLECTION).add(record);
  return { id: ref.id, ...record } as MediaAsset;
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(id).get();
  return snap.exists ? withId(snap) : null;
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const snap = await getAdminDb().collection(COLLECTION).get();
  return snap.docs.map(withId);
}
