import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 5/hour: same profile as prayer requests — a public form, not something a
// legitimate visitor submits often.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`contact-submit_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many messages submitted. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const body = await request.json();
    const { name, firstName, lastName, email, phone, department, subject, message, ...rest } = body;

    // The live contact form (app/contact/page.tsx) sends firstName/lastName
    // rather than a single name field; other callers may send `name`
    // directly. Accept either rather than requiring one specific shape.
    const resolvedName = (name || [firstName, lastName].filter(Boolean).join(' ')).trim();

    if (!resolvedName || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const newContact = {
      name: resolvedName,
      email,
      phone: phone || '',
      department: department || rest.category || rest.formType || 'general',
      subject: subject || '',
      message,
      // Everything else the caller sent (category, formType, ministry,
      // address, etc.) — kept for context without hand-maintaining an
      // allowlist of every field each caller happens to send.
      details: rest,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'contacts'), newContact);

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: docRef.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}