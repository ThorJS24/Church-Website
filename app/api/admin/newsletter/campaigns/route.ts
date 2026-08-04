import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const resend = new Resend(process.env.RESEND_API_KEY);
const CHUNK_SIZE = 10; // concurrent sends per batch — bounds load on Resend's API, not a hard vendor limit we've hit

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('newsletterCampaigns').orderBy('sentAt', 'desc').get();
    const campaigns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json({ success: false, message: 'Failed to list campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { subject, body } = await request.json();
    if (!subject || !body) {
      return NextResponse.json({ success: false, message: 'Subject and body are required.' }, { status: 400 });
    }

    const db = getAdminDb();
    const subscribersSnap = await db.collection('newsletterSubscribers').where('status', '==', 'subscribed').get();
    const subscribers = subscribersSnap.docs.map(d => ({ email: d.data().email as string, token: d.data().unsubscribeToken as string }));

    if (subscribers.length === 0) {
      return NextResponse.json({ success: false, message: 'No subscribers to send to.' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://salempbc.in';
    let sent = 0;
    const failures: string[] = [];

    for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
      const chunk = subscribers.slice(i, i + CHUNK_SIZE);
      const results = await Promise.all(
        chunk.map(async (sub) => {
          const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${sub.token}`;
          try {
            // Resend resolves { data: null, error } on API-level failures rather
            // than throwing — checked explicitly, same as app/api/services/request.
            const result = await resend.emails.send({
              from: FROM_EMAIL,
              to: sub.email,
              subject,
              html: `${body}<hr/><p style="font-size:12px;color:#888;"><a href="${unsubscribeUrl}">Unsubscribe</a></p>`,
            });
            if (result.error) return { ok: false, email: sub.email, message: result.error.message };
            return { ok: true };
          } catch (thrown) {
            return { ok: false, email: sub.email, message: thrown instanceof Error ? thrown.message : String(thrown) };
          }
        })
      );
      results.forEach(r => {
        if (r.ok) sent += 1;
        else failures.push(`${r.email}: ${r.message}`);
      });
    }

    const campaign = {
      subject,
      body,
      recipientCount: subscribers.length,
      sentCount: sent,
      failedCount: failures.length,
      sentBy: authResult.user.uid,
      sentAt: FieldValue.serverTimestamp(),
    };

    await withAudit(
      authResult.user,
      request,
      { action: 'newsletter.send', targetType: 'newsletterCampaigns', targetId: 'batch' },
      async () => {
        const ref = await db.collection('newsletterCampaigns').add(campaign);
        return { after: { subject, recipientCount: subscribers.length, sentCount: sent }, result: ref.id };
      }
    );

    return NextResponse.json({ success: true, sent, failed: failures.length, failures: failures.slice(0, 10) });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json({ success: false, message: 'Failed to send campaign' }, { status: 500 });
  }
}
