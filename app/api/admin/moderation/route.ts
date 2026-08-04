import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireModerator } from '@/lib/api-auth';

// Unified queue: everything with moderationStatus == 'pending' across the
// three collections that accept public submissions. One screen, not three,
// per the brief — these collections overlap conceptually (a moderator
// approving something makes it visible; that's the same action regardless
// of which collection it's in) even though they're stored separately.
const MODERATION_COLLECTIONS = ['prayerRequests', 'comments', 'galleryImages', 'testimonials'] as const;

export async function GET(request: NextRequest) {
  const authResult = await requireModerator(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snapshots = await Promise.all(
      MODERATION_COLLECTIONS.map(col =>
        getAdminDb().collection(col).where('moderationStatus', '==', 'pending').get()
      )
    );

    const items = MODERATION_COLLECTIONS.flatMap((col, i) =>
      snapshots[i].docs.map(d => ({ id: d.id, collection: col, ...d.data() }))
    );

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch moderation queue' }, { status: 500 });
  }
}
