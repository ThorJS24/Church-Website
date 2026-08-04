import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import * as Sentry from '@sentry/nextjs';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';

// salempbc.in is verified in Resend — see app/api/services/request/route.ts
// for why the sandbox address remains only as a fallback default.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Account deletion is a tracked request reviewed by staff, not an instant
// self-service action — deleting a member's Firestore data outright could
// orphan records other collections reference (audit log entries, prayer
// requests, gallery submissions) without a defined cascade policy, so a
// human reviews each request rather than the API silently cascading deletes.
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const { user } = authResult;

  try {
    const docRef = await getAdminDb().collection('accountDeletionRequests').add({
      uid: user.uid,
      email: user.email,
      status: 'pending',
      requestedAt: FieldValue.serverTimestamp(),
    });

    // Mirrors app/api/services/request/route.ts's pattern: the Firestore
    // write IS the request; email delivery is best-effort and never turns
    // a saved request into a failure response.
    async function sendNotification(recipient: 'admin' | 'requester') {
      let error: { message?: string; name?: string } | null = null;
      try {
        const result = recipient === 'admin'
          ? await getResend().emails.send({
              from: FROM_EMAIL,
              to: process.env.ADMIN_EMAIL!,
              subject: 'Account Deletion Request',
              html: `
                <h2>Account Deletion Request</h2>
                <p><strong>User:</strong> ${user.email}</p>
                <p><strong>UID:</strong> ${user.uid}</p>
                <p><strong>Request ID:</strong> ${docRef.id}</p>
                <p>Review this request and process the deletion manually.</p>
              `,
            })
          : await getResend().emails.send({
              from: FROM_EMAIL,
              to: user.email!,
              subject: 'Your account deletion request has been received',
              html: `
                <h2>We received your account deletion request</h2>
                <p>Our staff will review your request and follow up with you by email before anything is removed.</p>
                <p>If you didn't request this, please contact us immediately.</p>
                <p>Blessings,<br>Salem Primitive Baptist Church</p>
              `,
            });
        error = result.error;
      } catch (thrown) {
        error = { message: thrown instanceof Error ? thrown.message : String(thrown) };
      }

      if (!error) return true;

      console.error(`[EMAIL_SEND_FAILURE] privacy/delete-account ${recipient} notification failed`, {
        requestId: docRef.id,
        recipient,
        error,
      });
      Sentry.captureException(new Error(`Resend send failed: ${error.message || error.name || 'unknown error'}`), {
        tags: { route: 'privacy/delete-account', failureType: 'email-notification', recipient },
        extra: { requestId: docRef.id, uid: user.uid },
      });
      return false;
    }

    const adminNotified = await sendNotification('admin');
    const requesterConfirmed = user.email ? await sendNotification('requester') : false;

    return NextResponse.json({
      success: true,
      message: 'Your account deletion request has been received. Our staff will review it and follow up with you by email.',
      notifications: { adminNotified, requesterConfirmed },
    });
  } catch (error) {
    console.error('Account deletion request error:', error);
    Sentry.captureException(error, { tags: { route: 'privacy/delete-account' } });
    return NextResponse.json({ success: false, error: 'Failed to submit deletion request' }, { status: 500 });
  }
}
