import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 10/hour: higher than a full form submission (prayer/contact) since
// commenting on several photos while browsing is normal behavior, but
// still moderated afterward so shouldn't be wide open either.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`gallery-comment_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many comments submitted. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { imageId, comment, author } = await request.json();
    if (!imageId || !comment) {
      return NextResponse.json({ success: false, error: 'imageId and comment are required' }, { status: 400 });
    }

    const docRef = await getAdminDb().collection('comments').add({
      imageId,
      text: comment,
      author: author || 'Anonymous',
      createdAt: FieldValue.serverTimestamp(),
      moderationStatus: 'pending',
    });

    return NextResponse.json({ success: true, id: docRef.id, moderationStatus: 'pending' });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    if (!imageId) {
      return NextResponse.json({ success: false, error: 'imageId is required' }, { status: 400 });
    }

    const snap = await getAdminDb()
      .collection('comments')
      .where('imageId', '==', imageId)
      .where('moderationStatus', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
