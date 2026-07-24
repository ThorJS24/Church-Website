import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 30/hour: a real visitor might like several photos while browsing a
// gallery; the risk here is scripted like-inflation, not a form-abuse
// cost, so the ceiling is generous relative to the write itself being
// cheap (an atomic increment, no moderation queue involvement).
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`gallery-like_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { imageId } = await request.json();
    if (!imageId) {
      return NextResponse.json({ success: false, error: 'imageId is required' }, { status: 400 });
    }

    const ref = getAdminDb().collection('galleryImages').doc(imageId);
    await ref.update({ likes: FieldValue.increment(1) });
    const snap = await ref.get();

    return NextResponse.json({ success: true, likes: snap.data()?.likes });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
