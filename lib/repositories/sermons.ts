import 'server-only';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import type { Person, MediaAsset } from '@/lib/domain/types';
import { getPersonById } from '@/lib/repositories/people';

const SERMONS = 'sermons';
const SERIES = 'series';
const MEDIA_ASSETS = 'mediaAssets';

function withId<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as T;
}

export interface ResolvedSermon {
  id: string;
  [key: string]: unknown;
  speaker: Person | null;
  series: (Record<string, unknown> & { siblingSermons: Record<string, unknown>[] }) | null;
  media: MediaAsset | null;
}

/** Joins a sermon with its speaker, series (plus sibling sermons in that series), and primary media asset. */
export async function resolveSermon(sermonId: string): Promise<ResolvedSermon | null> {
  const db = getAdminDb();
  const snap = await db.collection(SERMONS).doc(sermonId).get();
  if (!snap.exists) return null;
  const sermon = withId<Record<string, any>>(snap);

  const [speaker, mediaSnap, seriesSnap] = await Promise.all([
    sermon.speakerId ? getPersonById(sermon.speakerId) : Promise.resolve(null),
    sermon.mediaAssetId ? db.collection(MEDIA_ASSETS).doc(sermon.mediaAssetId).get() : Promise.resolve(null),
    sermon.seriesId ? db.collection(SERIES).doc(sermon.seriesId).get() : Promise.resolve(null),
  ]);

  let series: ResolvedSermon['series'] = null;
  if (seriesSnap?.exists) {
    const siblingsSnap = await db.collection(SERMONS).where('seriesId', '==', sermon.seriesId).get();
    series = {
      ...withId(seriesSnap),
      siblingSermons: siblingsSnap.docs
        .filter((d) => d.id !== sermonId)
        .map((d) => ({ id: d.id, title: d.data().title, date: d.data().date })),
    };
  }

  return {
    ...sermon,
    id: snap.id,
    speaker,
    series,
    media: mediaSnap?.exists ? (withId(mediaSnap) as MediaAsset) : null,
  };
}

/** Recomputes and stores Series.sermonCount — called after any sermon's seriesId changes. */
export async function refreshSeriesSermonCount(seriesId: string): Promise<void> {
  const db = getAdminDb();
  const snap = await db.collection(SERMONS).where('seriesId', '==', seriesId).get();
  await db.collection(SERIES).doc(seriesId).update({ sermonCount: snap.size });
}
