import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
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
    const { title, description, category, isPrivate, isAnonymous, authorName } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required' },
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
      status: 'active',
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
    const q = query(
      prayerRequestsRef,
      where('isPrivate', '==', false),
      where('status', '==', 'active'),
      where('moderationStatus', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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