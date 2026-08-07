import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';

interface ActivityEntry {
  type: string;
  title: string;
  date: string;
}

// Departments on the /api/contact route that represent a member reaching
// out about getting involved with a ministry or small group — used to
// build the "ministry involvement" summary from data that already exists
// rather than introducing a new membership-tracking model.
const MINISTRY_DEPARTMENTS = new Set(['volunteer', 'ministry-volunteer', 'ministry-contact', 'small-group-join']);

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { uid, email } = authResult.user;
    const db = getAdminDb();

    const [prayerSnap, hoursSnap, ratingsSnap, savedSnap, contactsSnap, registrationsSnap] = await Promise.all([
      db.collection('prayerRequests').where('requestedBy', '==', uid).get(),
      db.collection('volunteerHours').where('uid', '==', uid).get(),
      db.collection('resourceRatings').where('uid', '==', uid).get(),
      db.collection('savedItems').where('uid', '==', uid).get(),
      email ? db.collection('contacts').where('email', '==', email).get() : Promise.resolve(null),
      email
        ? db.collection('eventRegistrations').where('email', '==', email.toLowerCase()).where('status', '==', 'confirmed').get()
        : Promise.resolve(null),
    ]);

    // upcomingEvents was previously hardcoded to 0 — eventRegistrations
    // already exists (the RSVP system writes to it), it just wasn't being
    // queried here. Cross-reference against the actual event dates so a
    // past RSVP doesn't count as "upcoming".
    let upcomingEventsCount = 0;
    let nextEvent: { id: string; title: string; startDate: string } | null = null;
    if (registrationsSnap && !registrationsSnap.empty) {
      const eventIds = Array.from(new Set(registrationsSnap.docs.map((d) => d.data().eventId as string)));
      const eventDocs = await Promise.all(eventIds.map((id) => db.collection('events').doc(id).get()));
      const upcoming = eventDocs
        .filter((d) => d.exists && new Date(d.data()!.startDate).getTime() >= Date.now())
        .map((d) => ({ id: d.id, title: d.data()!.title as string, startDate: d.data()!.startDate as string }))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      upcomingEventsCount = upcoming.length;
      nextEvent = upcoming[0] || null;
    }

    const activity: ActivityEntry[] = [];
    prayerSnap.docs.forEach((d) => {
      const data = d.data();
      const tally = data.prayerTally || 0;
      const statusNote = data.status === 'answered'
        ? ' — marked answered'
        : tally > 0
          ? ` — ${tally} ${tally === 1 ? 'person has' : 'people have'} prayed for this`
          : '';
      activity.push({ type: 'prayer', title: `Submitted a prayer request: "${data.title}"${statusNote}`, date: data.createdAt });
    });
    hoursSnap.docs.forEach((d) => {
      const data = d.data();
      activity.push({ type: 'volunteer', title: `Logged ${data.hours} volunteer hour${data.hours === 1 ? '' : 's'}${data.area ? ` — ${data.area}` : ''}`, date: data.createdAt });
    });
    ratingsSnap.docs.forEach((d) => {
      const data = d.data();
      activity.push({ type: 'rating', title: 'Rated a resource', date: data.updatedAt });
    });
    savedSnap.docs.forEach((d) => {
      const data = d.data();
      activity.push({ type: 'saved', title: `Saved ${data.itemType === 'sermon' ? 'a sermon' : 'a blog post'}: "${data.title}"`, date: data.savedAt });
    });

    const ministryInvolvement: { area: string; department: string; date: string }[] = [];
    if (contactsSnap) {
      contactsSnap.docs.forEach((d) => {
        const data = d.data();
        if (!MINISTRY_DEPARTMENTS.has(data.department)) return;
        const area = data.details?.ministry || data.details?.smallGroup || data.subject || 'General';
        ministryInvolvement.push({ area, department: data.department, date: data.createdAt });
        activity.push({ type: 'ministry', title: `Reached out about getting involved: ${area}`, date: data.createdAt });
      });
    }

    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // NOTE: attendance/donation aggregation is not implemented — there is
    // no attendance or donation collection to query. Flagging rather than
    // faking: these two numbers are placeholders until that data model
    // exists (tracked for Phase 3 analytics work).
    const stats = {
      attendanceCount: 0,
      prayerRequests: prayerSnap.size,
      donationTotal: 0,
      upcomingEvents: upcomingEventsCount,
      volunteerHours: hoursSnap.docs.reduce((sum, d) => sum + (d.data().hours || 0), 0),
      savedItems: savedSnap.size,
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActivity: activity.slice(0, 15),
      ministryInvolvement,
      nextEvent,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
