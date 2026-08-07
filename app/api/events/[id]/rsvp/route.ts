import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getResend } from '@/lib/resend';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';
import { createNotification } from '@/lib/notifications';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

async function activeHeadcount(eventId: string): Promise<number> {
  const snap = await getAdminDb().collection('eventRegistrations')
    .where('eventId', '==', eventId)
    .where('status', '==', 'confirmed')
    .get();
  return snap.docs.reduce((sum, d) => sum + (d.data().headcount || 1), 0);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if (!email) return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });

  try {
    const snap = await getAdminDb().collection('eventRegistrations')
      .where('eventId', '==', id)
      .where('email', '==', email)
      .get();
    const active = snap.docs.map((d) => ({ id: d.id, ...d.data() })).find((r: any) => r.status !== 'cancelled');
    return NextResponse.json({ success: true, registration: active || null });
  } catch (error) {
    console.error(`Error checking RSVP for event ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to check registration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`event-rsvp_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { name, email, headcount } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }
    const count = Math.max(1, Math.min(20, parseInt(headcount, 10) || 1));
    const normalizedEmail = String(email).trim().toLowerCase();

    const db = getAdminDb();
    const eventDoc = await db.collection('events').doc(id).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    const event = eventDoc.data()!;

    // Same person RSVPing again for the same event updates their existing
    // registration rather than creating a duplicate entry.
    const existingSnap = await db.collection('eventRegistrations')
      .where('eventId', '==', id)
      .where('email', '==', normalizedEmail)
      .get();
    const existing = existingSnap.docs.find((d) => d.data().status !== 'cancelled');

    const currentHeadcount = await activeHeadcount(id);
    const existingHeadcount = existing?.data().headcount || 0;
    const projectedHeadcount = currentHeadcount - existingHeadcount + count;
    const hasCapacity = !event.maxAttendees || projectedHeadcount <= event.maxAttendees;
    const status: 'confirmed' | 'waitlisted' = hasCapacity ? 'confirmed' : 'waitlisted';

    const data = {
      eventId: id, eventTitle: event.title, name, email: normalizedEmail, headcount: count, status,
      updatedAt: new Date().toISOString(),
    };

    let registrationId: string;
    if (existing) {
      registrationId = existing.id;
      await existing.ref.update(data);
    } else {
      const ref = await db.collection('eventRegistrations').add({ ...data, createdAt: FieldValue.serverTimestamp() });
      registrationId = ref.id;
    }

    const subject = status === 'confirmed' ? `You're confirmed: ${event.title}` : `You're on the waitlist: ${event.title}`;
    const body = status === 'confirmed'
      ? `<p>Hi ${name},</p><p>You're confirmed for <strong>${event.title}</strong> (${count} ${count === 1 ? 'person' : 'people'}) on ${new Date(event.startDate).toLocaleString()} at ${event.location}.</p>`
      : `<p>Hi ${name},</p><p><strong>${event.title}</strong> is at capacity, so you've been added to the waitlist for ${count} ${count === 1 ? 'person' : 'people'}. We'll email you if a spot opens up.</p>`;
    getResend().emails.send({ from: FROM_EMAIL, to: normalizedEmail, subject, html: body }).catch((err) => console.error('RSVP email failed:', err));

    return NextResponse.json({ success: true, status, registrationId });
  } catch (error) {
    console.error(`Error submitting RSVP for event ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to submit RSVP' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if (!email) return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });

  try {
    const db = getAdminDb();
    const snap = await db.collection('eventRegistrations').where('eventId', '==', id).where('email', '==', email).get();
    const active = snap.docs.find((d) => d.data().status !== 'cancelled');
    if (!active) return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });

    const wasConfirmed = active.data().status === 'confirmed';
    await active.ref.update({ status: 'cancelled', updatedAt: new Date().toISOString() });

    // Freed a confirmed spot — promote the earliest waitlisted registrant,
    // if any, so the waitlist actually moves instead of just sitting there.
    if (wasConfirmed) {
      const waitlistSnap = await db.collection('eventRegistrations')
        .where('eventId', '==', id)
        .where('status', '==', 'waitlisted')
        .get();
      const next = waitlistSnap.docs.sort((a, b) => new Date(a.data().createdAt?.toDate?.() ?? a.data().createdAt ?? 0).getTime() - new Date(b.data().createdAt?.toDate?.() ?? b.data().createdAt ?? 0).getTime())[0];
      if (next) {
        await next.ref.update({ status: 'confirmed', updatedAt: new Date().toISOString() });
        const eventDoc = await db.collection('events').doc(id).get();
        const event = eventDoc.data();
        getResend().emails.send({
          from: FROM_EMAIL,
          to: next.data().email,
          subject: `A spot opened up: ${event?.title || 'your event'}`,
          html: `<p>Hi ${next.data().name},</p><p>Good news — a spot opened up and you're now confirmed for <strong>${event?.title}</strong>.</p>`,
        }).catch((err) => console.error('Waitlist promotion email failed:', err));
        createNotification({
          email: next.data().email,
          title: 'You’re off the waitlist!',
          message: `A spot opened up for ${event?.title || 'your event'} — you're now confirmed.`,
          link: `/events/${id}`,
        }).catch((err) => console.error('Waitlist promotion notification failed:', err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error cancelling RSVP for event ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to cancel registration' }, { status: 500 });
  }
}
