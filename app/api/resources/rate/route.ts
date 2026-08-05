import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rateLimit';

// 20/hour/member: generous enough for browsing and rating several
// resources in one sitting, low enough to bound rating-spam from a single
// account (auth already rules out anonymous abuse; this bounds a
// compromised or malicious member account).
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// Ratings are stored one doc per (resourceId, uid) — id `${resourceId}_${uid}`
// — so re-rating overwrites rather than accumulating duplicate entries, and
// the average is computed on read rather than maintained as a running
// counter (simpler and race-free; this app's resource-rating volume never
// justifies the complexity of incremental aggregate maintenance).
function ratingDocId(resourceId: string, uid: string) {
  return `${resourceId}_${uid}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');
    if (!resourceId) {
      return NextResponse.json({ success: false, message: 'resourceId is required' }, { status: 400 });
    }

    const snap = await getAdminDb().collection('resourceRatings').where('resourceId', '==', resourceId).get();
    const ratings = snap.docs.map((d) => d.data());
    const count = ratings.length;
    const average = count > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    const reviews = ratings
      .filter((r) => r.review)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 20)
      .map((r) => ({ rating: r.rating, review: r.review }));

    let myRating: number | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const auth = await requireAuth(request);
      if (auth.ok) {
        const mine = ratings.find((r) => r.uid === auth.user.uid);
        myRating = mine?.rating ?? null;
      }
    }

    return NextResponse.json({ success: true, average, count, myRating, reviews });
  } catch (error) {
    console.error('Error fetching resource ratings:', error);
    return NextResponse.json({ success: false, message: 'Failed to load ratings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const rateLimit = await checkRateLimit(`resource-rate_${auth.user.uid}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many ratings submitted. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { resourceId, rating, review } = await request.json();
    if (!resourceId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: 'resourceId and a rating from 1-5 are required' }, { status: 400 });
    }

    await getAdminDb().collection('resourceRatings').doc(ratingDocId(resourceId, auth.user.uid)).set({
      resourceId,
      uid: auth.user.uid,
      rating,
      review: review ? String(review).slice(0, 500) : null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting resource rating:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit rating' }, { status: 500 });
  }
}
