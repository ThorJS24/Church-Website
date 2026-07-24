import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 20 messages / 5 minutes: chat is the most visible abuse surface — spam
// shows up immediately to everyone watching a live service — so this uses
// a short window rather than the hourly pattern used elsewhere, closer to
// how real chat clients throttle flooding.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`livestream-chat_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { livestreamId, message, author } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'message is required' }, { status: 400 });
    }

    const docRef = await getAdminDb().collection('chatMessages').add({
      livestreamId: livestreamId || null,
      message,
      author: author || 'Anonymous',
      timestamp: FieldValue.serverTimestamp(),
      isVisible: true,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const livestreamId = searchParams.get('livestreamId');

    let q = getAdminDb().collection('chatMessages').where('isVisible', '==', true).orderBy('timestamp', 'desc').limit(50);
    if (livestreamId) {
      q = getAdminDb().collection('chatMessages')
        .where('isVisible', '==', true)
        .where('livestreamId', '==', livestreamId)
        .orderBy('timestamp', 'desc')
        .limit(50);
    }

    const snap = await q.get();
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
