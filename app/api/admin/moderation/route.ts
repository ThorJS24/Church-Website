import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { requireModerator } from '@/lib/api-auth';

// Unified queue: everything with moderationStatus == 'pending' across the
// three collections that accept public submissions. One screen, not three,
// per the brief — these collections overlap conceptually (a moderator
// approving something makes it visible; that's the same action regardless
// of which collection it's in) even though they're stored separately.
const MODERATION_COLLECTIONS = ['prayerRequests', 'comments', 'galleryImages', 'testimonials'] as const;

// Each collection uses a different field for "when was this submitted" and
// "who submitted it" — normalized here so the queue can show one SLA clock
// and match resubmissions after a rejection without the client needing to
// know per-collection schema quirks.
const DATE_FIELD: Record<string, string> = {
  prayerRequests: 'createdAt',
  comments: 'createdAt',
  testimonials: 'createdAt',
  galleryImages: 'uploadDate',
};
const AUTHOR_FIELD: Record<string, string> = {
  prayerRequests: 'authorName',
  comments: 'author',
  testimonials: 'authorName',
  galleryImages: 'photographer',
};

export async function GET(request: NextRequest) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  try {
    const db = getAdminDb();
    const [pendingSnapshots, rejectedSnapshots] = await Promise.all([
      Promise.all(MODERATION_COLLECTIONS.map((col) => db.collection(col).where('moderationStatus', '==', 'pending').get())),
      Promise.all(MODERATION_COLLECTIONS.map((col) => db.collection(col).where('moderationStatus', '==', 'rejected').get())),
    ]);

    const items = MODERATION_COLLECTIONS.flatMap((col, i) => {
      const authorField = AUTHOR_FIELD[col];
      const dateField = DATE_FIELD[col];
      const rejectedDocs = rejectedSnapshots[i].docs;

      return pendingSnapshots[i].docs.map((d) => {
        const data = serializeTimestamps({ id: d.id, collection: col, ...d.data() }) as any;
        const author = data[authorField];
        // Best-effort: same collection, same display name, previously
        // rejected — not a real identity match (no email/account on these
        // public forms), but a useful signal for "did this person edit and
        // resubmit after we rejected it."
        const priorRejected = author && author !== 'Anonymous'
          ? rejectedDocs
              .map((r) => serializeTimestamps({ id: r.id, collection: col, ...r.data() }) as any)
              .filter((r) => r[authorField] === author)
              .sort((a, b) => new Date(b[dateField] ?? 0).getTime() - new Date(a[dateField] ?? 0).getTime())[0]
          : null;

        return { ...data, submittedAt: data[dateField] ?? null, priorRejected: priorRejected ?? null };
      });
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch moderation queue' }, { status: 500 });
  }
}
