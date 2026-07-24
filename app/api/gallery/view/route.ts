import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 60/hour: this fires implicitly as someone browses a photo gallery (once
// per photo opened), not on a deliberate abuse-prone action — the ceiling
// is set high enough that normal browsing never trips it, while still
// bounding a scripted hammering of the endpoint.
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`gallery-view_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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
    await ref.update({ views: FieldValue.increment(1) });
    const snap = await ref.get();

    return NextResponse.json({ success: true, views: snap.data()?.views });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
