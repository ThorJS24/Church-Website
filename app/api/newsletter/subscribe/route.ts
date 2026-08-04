import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`newsletter-subscribe_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { email } = await request.json();
    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ success: false, message: 'A valid email address is required.' }, { status: 400 });
    }

    const normalized = String(email).trim().toLowerCase();
    const db = getAdminDb();
    const existing = await db.collection('newsletterSubscribers').where('email', '==', normalized).limit(1).get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      if (doc.data().status === 'unsubscribed') {
        await doc.ref.update({ status: 'subscribed', resubscribedAt: new Date().toISOString() });
      }
      return NextResponse.json({ success: true, message: 'You are subscribed.' });
    }

    await db.collection('newsletterSubscribers').add({
      email: normalized,
      status: 'subscribed',
      unsubscribeToken: crypto.randomBytes(24).toString('hex'),
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Thanks for subscribing!' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ success: false, message: 'Failed to subscribe' }, { status: 500 });
  }
}
