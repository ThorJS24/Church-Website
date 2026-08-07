import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// Public, PII-free headcount for "X people going" social proof on event
// cards — separate from the existing GET /rsvp (which requires an email
// and returns one person's registration), since this needs to be safely
// callable by anonymous visitors.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const snap = await getAdminDb().collection('eventRegistrations')
      .where('eventId', '==', id)
      .where('status', '==', 'confirmed')
      .get();
    const count = snap.docs.reduce((sum, d) => sum + (d.data().headcount || 1), 0);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error(`Error fetching attendee count for event ${id}:`, error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}
