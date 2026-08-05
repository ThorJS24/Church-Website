import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getResend } from '@/lib/resend';
import { requireAdmin, withAudit } from '@/lib/api-auth';

const SOURCES = new Set(['contacts', 'serviceRequests']);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Sends a reply straight from the inbox and logs it on the message doc's
// `replies` array so the conversation history stays with the record
// instead of only living in the staff member's own inbox.
export async function POST(request: NextRequest, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { collection, id } = await params;
  if (!SOURCES.has(collection)) {
    return NextResponse.json({ success: false, message: 'Unknown source' }, { status: 404 });
  }

  try {
    const { subject, body } = await request.json();
    if (!subject || !body) {
      return NextResponse.json({ success: false, message: 'subject and body are required' }, { status: 400 });
    }

    const ref = getAdminDb().collection(collection).doc(id);
    const before = (await ref.get()).data();
    if (!before?.email) {
      return NextResponse.json({ success: false, message: 'This message has no reply-to email on file' }, { status: 400 });
    }

    const result = await getResend().emails.send({ from: FROM_EMAIL, to: before.email, subject, html: body });
    if (result.error) {
      return NextResponse.json({ success: false, message: result.error.message }, { status: 502 });
    }

    const reply = {
      subject,
      body,
      sentBy: authResult.user.email,
      sentAt: new Date().toISOString(),
    };

    await withAudit(
      authResult.user,
      request,
      { action: 'message.reply', targetType: collection, targetId: id },
      async () => {
        const updates: Record<string, unknown> = {
          replies: [...(Array.isArray(before.replies) ? before.replies : []), reply],
          updatedAt: new Date().toISOString(),
        };
        if (!before.status || before.status === 'new') updates.status = 'contacted';
        await ref.update(updates);
        return { before: null, after: reply, result: null };
      }
    );

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error(`Error sending reply for ${collection}/${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to send reply' }, { status: 500 });
  }
}
