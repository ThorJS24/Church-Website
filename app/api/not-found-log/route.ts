import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// Fired by app/not-found.tsx on every render — anonymous, unauthenticated,
// just a path + a counter. Feeds the admin Settings "404 Report" so broken
// links can be found and turned into redirects without a real analytics
// service.
export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`not-found-log_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    const { path } = await request.json();
    if (!path || typeof path !== 'string' || path.length > 500) {
      return NextResponse.json({ success: false, message: 'Invalid path' }, { status: 400 });
    }

    // Doc id derived from the path itself (not auto-id) so repeat hits on
    // the same broken link increment one counter instead of creating a new
    // row every time.
    const docId = Buffer.from(path).toString('base64url').slice(0, 200);
    const ref = getAdminDb().collection('notFoundHits').doc(docId);
    await getAdminDb().runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      tx.set(
        ref,
        {
          path,
          count: FieldValue.increment(1),
          lastSeenAt: new Date().toISOString(),
          ...(existing.exists ? {} : { firstSeenAt: new Date().toISOString() }),
        },
        { merge: true }
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging 404:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
