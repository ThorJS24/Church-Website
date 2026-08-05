import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// Same threshold as prayer/gallery submission — a public form feeding the
// moderation queue, not a flow anyone submits often.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`testimonial-submit_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many testimonials submitted. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const body = await request.json();
    const { authorName, content, imageUrl, category, displayPreference, consentGiven } = body;

    if (!authorName || !content) {
      return NextResponse.json({ success: false, message: 'Name and testimony are required' }, { status: 400 });
    }
    if (consentGiven !== true) {
      return NextResponse.json({ success: false, message: 'Consent to share this testimony publicly is required' }, { status: 400 });
    }

    const ALLOWED_DISPLAY_PREFERENCES = ['full', 'first', 'anonymous'];

    const doc = {
      authorName: String(authorName).slice(0, 100),
      content: String(content).slice(0, 2000),
      imageUrl: imageUrl ? String(imageUrl).slice(0, 500) : null,
      category: category ? String(category).slice(0, 50) : null,
      displayPreference: ALLOWED_DISPLAY_PREFERENCES.includes(displayPreference) ? displayPreference : 'full',
      consentGiven: true,
      featured: false,
      moderationStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'testimonials'), doc);

    return NextResponse.json({ success: true, id: docRef.id, message: 'Thank you — your testimony will appear once reviewed.' });
  } catch (error) {
    console.error('Testimonial submission error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit testimony' }, { status: 500 });
  }
}
