import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Bulk email to a specific set of members (a filtered/selected segment from
// the Members table) — distinct from the Newsletter feature, which sends to
// the separate newsletterSubscribers opt-in list. This sends to member
// accounts directly, so it's admin-only and every send is audit-logged.
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { userIds, subject, body } = await request.json();
    if (!Array.isArray(userIds) || userIds.length === 0 || !subject || !body) {
      return NextResponse.json({ success: false, message: 'userIds, subject, and body are required' }, { status: 400 });
    }

    const db = getAdminDb();
    const docs = await Promise.all(userIds.map((id: string) => db.collection('users').doc(id).get()));
    const recipients = docs.filter((d) => d.exists && d.data()?.email).map((d) => d.data()!.email as string);

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, message: 'None of the selected members have an email on file' }, { status: 400 });
    }

    let sent = 0;
    const failures: string[] = [];
    await Promise.all(
      recipients.map(async (email) => {
        try {
          const result = await getResend().emails.send({ from: FROM_EMAIL, to: email, subject, html: body });
          if (result.error) failures.push(`${email}: ${result.error.message}`);
          else sent++;
        } catch (thrown) {
          failures.push(`${email}: ${thrown instanceof Error ? thrown.message : String(thrown)}`);
        }
      })
    );

    await withAudit(
      authResult.user,
      request,
      { action: 'user.bulk_email', targetType: 'user', targetId: 'batch' },
      async () => ({ before: null, after: { subject, recipientCount: recipients.length, sent, failed: failures.length }, result: null })
    );

    return NextResponse.json({ success: true, sent, failed: failures.length, failures: failures.slice(0, 10) });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}
