import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rateLimit';

// 20/hour/member: a volunteer logging several shifts in one sitting is
// normal; this just bounds runaway/scripted writes from one account.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// volunteerHours isn't a first-class collection (no firestore.rules entry)
// — every read/write goes through this route with the Admin SDK, same
// approach as resourceRatings (Batch P11) and prayerRequests' email field.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const snap = await getAdminDb().collection('volunteerHours').where('uid', '==', auth.user.uid).get();
    const entries = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalHours = entries.reduce((sum: number, e: any) => sum + (e.hours || 0), 0);

    return NextResponse.json({ success: true, entries, totalHours });
  } catch (error) {
    console.error('Error fetching volunteer hours:', error);
    return NextResponse.json({ success: false, message: 'Failed to load volunteer hours' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const rateLimit = await checkRateLimit(`volunteer-hours_${auth.user.uid}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many entries submitted. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { hours, area, date, notes } = await request.json();
    const parsedHours = Number(hours);
    if (!parsedHours || parsedHours <= 0 || parsedHours > 24) {
      return NextResponse.json({ success: false, message: 'Hours must be a number between 0 and 24' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ success: false, message: 'Date is required' }, { status: 400 });
    }

    const doc = {
      uid: auth.user.uid,
      hours: parsedHours,
      area: area ? String(area).slice(0, 100) : null,
      date: String(date).slice(0, 10),
      notes: notes ? String(notes).slice(0, 500) : null,
      createdAt: new Date().toISOString(),
    };

    const docRef = await getAdminDb().collection('volunteerHours').add(doc);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error logging volunteer hours:', error);
    return NextResponse.json({ success: false, message: 'Failed to log volunteer hours' }, { status: 500 });
  }
}
