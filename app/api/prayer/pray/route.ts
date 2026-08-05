import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 30/hour: same profile as the gallery like button — a real visitor might
// tap "I'm praying" on several requests while browsing the wall in one
// sitting; this bounds scripted tally-inflation, not normal use.
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`prayer-tally_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'requestId is required' }, { status: 400 });
    }

    const ref = getAdminDb().collection('prayerRequests').doc(requestId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, message: 'Prayer request not found' }, { status: 404 });
    }

    await ref.update({ prayerTally: FieldValue.increment(1) });
    const updated = await ref.get();

    return NextResponse.json({ success: true, prayerTally: updated.data()?.prayerTally ?? 0 });
  } catch (error) {
    console.error('Error incrementing prayer tally:', error);
    return NextResponse.json({ success: false, message: 'Failed to record prayer' }, { status: 500 });
  }
}
