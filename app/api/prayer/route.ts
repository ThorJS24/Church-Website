import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 5/hour: matches the gallery-submission threshold — a public form feeding
// the moderation queue, where legitimate use is "a handful of requests",
// not a flow anyone submits often.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`prayer-submit_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many prayer requests submitted. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const body = await request.json();
    const { title, description, category, isPrivate, isAnonymous, authorName, email, followUpRequested } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required' },
        { status: 400 }
      );
    }
    if (followUpRequested && !email) {
      return NextResponse.json(
        { success: false, message: 'An email is required to request a follow-up check-in' },
        { status: 400 }
      );
    }

    const newPrayerRequest = {
      title,
      description,
      category: category || 'other',
      isPrivate: isPrivate || false,
      isAnonymous: isAnonymous || false,
      authorName: isAnonymous ? 'Anonymous' : (authorName || 'Anonymous'),
      // 'praying' (default) / 'ongoing' (still needed, longer-term) /
      // 'answered' — set by a moderator via the admin Prayer Requests tab,
      // not something a submitter can set for themselves.
      status: 'praying',
      prayerTally: 0,
      followUpRequested: !!followUpRequested,
      email: followUpRequested ? String(email).slice(0, 200) : null,
      moderationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'prayerRequests'), newPrayerRequest);

    return NextResponse.json({
      success: true,
      message: 'Prayer request submitted successfully',
      id: docRef.id
    });

  } catch (error) {
    console.error('Prayer request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit prayer request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const prayerRequestsRef = collection(db, 'prayerRequests');
    // No orderBy here deliberately — combined with the two equality
    // filters below it would need a composite index this environment can't
    // create (see FEATURE_BUILD_PLAN.md's established fix pattern from
    // earlier batches). Sorted in JS after fetching instead. Status is no
    // longer filtered server-side (unlike the original 'active'-only
    // query) since the public page now needs both the active wall and the
    // answered-prayer archive from one response.
    const q = query(
      prayerRequestsRef,
      where('isPrivate', '==', false),
      where('moderationStatus', '==', 'approved'),
    );

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs
      .map(doc => {
        // email is captured only for a private staff follow-up — never
        // send it to the public wall response.
        const { email, ...rest } = doc.data();
        return { id: doc.id, ...rest };
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      prayerRequests: requests
    });

  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prayer requests' },
      { status: 500 }
    );
  }
}