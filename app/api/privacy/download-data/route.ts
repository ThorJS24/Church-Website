import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 5/hour: a "download my data" action a real visitor triggers rarely, if
// ever, more than once in a sitting.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;

  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`privacy-download_${authResult.user.uid}_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { uid } = authResult.user;
    const db = getAdminDb();

    const [profileSnap, prayerRequestsSnap] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('prayerRequests').where('requestedBy', '==', uid).get(),
    ]);

    const userData = {
      profile: profileSnap.exists ? profileSnap.data() : null,
      prayerRequests: prayerRequestsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      exportDate: new Date().toISOString(),
    };

    const dataBlob = JSON.stringify(userData, null, 2);

    return new NextResponse(dataBlob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="my-church-data.json"',
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
