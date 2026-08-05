import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
}

// A visitor's personal calendar — every event they're confirmed for (not
// waitlisted, not cancelled), not the full public events list. Linked from
// the events page for anyone who has RSVP'd with this email.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const regSnap = await db.collection('eventRegistrations')
      .where('email', '==', email)
      .where('status', '==', 'confirmed')
      .get();

    const eventIds = Array.from(new Set(regSnap.docs.map((d) => d.data().eventId as string)));
    const eventDocs = await Promise.all(eventIds.map((id) => db.collection('events').doc(id).get()));

    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Salem Primitive Baptist Church//RSVP//EN'];
    eventDocs.forEach((doc) => {
      if (!doc.exists) return;
      const event = doc.data()!;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${doc.id}@salempbc.in`,
        `DTSTART:${toICSDate(event.startDate)}`,
        `DTEND:${toICSDate(event.endDate || event.startDate)}`,
        `SUMMARY:${escapeICS(event.title)}`,
        `LOCATION:${escapeICS(event.location || '')}`,
        `DESCRIPTION:${escapeICS(event.shortDescription || event.description || '')}`,
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');

    return new NextResponse(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="my-salempbc-events.ics"',
      },
    });
  } catch (error) {
    console.error('Error generating personal iCal export:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate calendar' }, { status: 500 });
  }
}
