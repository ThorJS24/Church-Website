import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getResend } from '@/lib/resend';
import { requireAdmin, withAudit } from '@/lib/api-auth';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Marks the event cancelled (shown as a banner on its public page) and
// emails everyone who registered — confirmed or waitlisted, since both
// were expecting to attend. Distinct from just deleting/unpublishing the
// event, which would silently leave registrants in the dark.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const { message } = await request.json().catch(() => ({ message: '' }));

    const db = getAdminDb();
    const eventRef = db.collection('events').doc(id);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    const event = eventDoc.data()!;

    const regSnap = await db.collection('eventRegistrations').where('eventId', '==', id).get();
    const recipients = regSnap.docs
      .map((d) => d.data())
      .filter((r) => r.status === 'confirmed' || r.status === 'waitlisted');

    let sent = 0;
    await withAudit(
      authResult.user,
      request,
      { action: 'event.cancel_broadcast', targetType: 'events', targetId: id },
      async () => {
        await eventRef.update({ cancelled: true, updatedAt: new Date().toISOString() });
        await Promise.all(
          recipients.map(async (r) => {
            try {
              const result = await getResend().emails.send({
                from: FROM_EMAIL,
                to: r.email,
                subject: `Cancelled: ${event.title}`,
                html: `<p>Hi ${r.name},</p><p><strong>${event.title}</strong> (scheduled for ${new Date(event.startDate).toLocaleString()}) has been cancelled.</p>${message ? `<p>${message}</p>` : ''}`,
              });
              if (!result.error) sent += 1;
            } catch (err) {
              console.error(`Cancellation email failed for ${r.email}:`, err);
            }
          })
        );
        return { before: { cancelled: false }, after: { cancelled: true, notified: sent, totalRecipients: recipients.length }, result: null };
      }
    );

    return NextResponse.json({ success: true, notified: sent, totalRecipients: recipients.length });
  } catch (error) {
    console.error(`Error broadcasting cancellation for event ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to send cancellation broadcast' }, { status: 500 });
  }
}
