import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

/** One-click unsubscribe link target, embedded in every campaign email —
 * a GET (not POST) so it works as a plain link with no JS required. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ success: false, message: 'Missing token' }, { status: 400 });
  }

  try {
    const snap = await getAdminDb().collection('newsletterSubscribers').where('unsubscribeToken', '==', token).limit(1).get();
    if (snap.empty) {
      return NextResponse.redirect(new URL('/?unsubscribed=invalid', request.url));
    }
    await snap.docs[0].ref.update({ status: 'unsubscribed', unsubscribedAt: new Date().toISOString() });
    return NextResponse.redirect(new URL('/?unsubscribed=success', request.url));
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.redirect(new URL('/?unsubscribed=error', request.url));
  }
}
