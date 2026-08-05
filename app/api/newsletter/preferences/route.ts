import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// Token-authenticated, same pattern as the unsubscribe link — no login
// required, since a subscriber only ever proves identity via the token
// embedded in their own campaign emails.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ success: false, message: 'Missing token' }, { status: 400 });
  }

  try {
    const snap = await getAdminDb().collection('newsletterSubscribers').where('unsubscribeToken', '==', token).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ success: false, message: 'Invalid or expired link' }, { status: 404 });
    }
    const doc = snap.docs[0];
    return NextResponse.json({
      success: true,
      subscriber: { email: doc.data().email, status: doc.data().status, tags: doc.data().tags ?? [] },
    });
  } catch (error) {
    console.error('Error loading preferences:', error);
    return NextResponse.json({ success: false, message: 'Failed to load preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, tags } = await request.json();
    if (!token || !Array.isArray(tags)) {
      return NextResponse.json({ success: false, message: 'token and tags are required' }, { status: 400 });
    }

    const snap = await getAdminDb().collection('newsletterSubscribers').where('unsubscribeToken', '==', token).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ success: false, message: 'Invalid or expired link' }, { status: 404 });
    }

    await snap.docs[0].ref.update({ tags: tags.map((t: unknown) => String(t).trim()).filter(Boolean) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ success: false, message: 'Failed to save preferences' }, { status: 500 });
  }
}
