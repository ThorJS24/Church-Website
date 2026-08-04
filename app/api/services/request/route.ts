import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getResend } from '@/lib/resend';
import * as Sentry from '@sentry/nextjs';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// 3/hour: this sends two real emails per submission (to the church and to
// the requester's own address) — a legitimate visitor requests a wedding
// or baptism service once, not repeatedly. A tight limit also blocks
// using the requester-email field to email-bomb a third party's inbox
// with fake confirmation messages.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// salempbc.in is verified in Resend, so RESEND_FROM_EMAIL is a real address
// on it — onboarding@resend.dev remains only as a fallback default so this
// route doesn't crash if that env var is ever unset (it would just fall
// back to the sandbox-restricted sender rather than throwing).
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`services-request_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests submitted. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const data = await request.json();

    const serviceRequest = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // The Firestore write IS the submission. Everything below is a best-
    // effort notification — its failure must never look like the request
    // itself failing, since the request is already saved and will show up
    // in the admin panel's moderation/requests view regardless of whether
    // either email below goes out.
    const docRef = await addDoc(collection(db, 'serviceRequests'), serviceRequest);

    const serviceTypeTitle = data.serviceType === 'wedding' ? 'Wedding' : 'Baptism';

    async function sendNotification(recipient: 'admin' | 'requester') {
      // The Resend SDK does NOT throw on API-level failures (bad key,
      // rejected recipient, etc.) — it resolves with { data: null, error }.
      // A bare try/catch around this call would never fire for exactly the
      // failure this route needs to handle, so `error` has to be checked
      // explicitly. Confirmed by actually simulating an invalid API key
      // before shipping this, not assumed from the SDK's types.
      let error: { message?: string; name?: string } | null = null;
      try {
        const result = recipient === 'admin'
          ? await getResend().emails.send({
              from: FROM_EMAIL,
              to: process.env.ADMIN_EMAIL!,
              subject: `New ${serviceTypeTitle} Service Request`,
              html: `
                <h2>New ${serviceTypeTitle} Service Request</h2>
                <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                ${data.partnerName ? `<p><strong>Partner:</strong> ${data.partnerName}</p>` : ''}
                <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
                ${data.alternateDate ? `<p><strong>Alternate Date:</strong> ${data.alternateDate}</p>` : ''}
                ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
                <p><strong>Request ID:</strong> ${docRef.id}</p>
              `
            })
          : await getResend().emails.send({
              from: FROM_EMAIL,
              to: data.email,
              subject: `${serviceTypeTitle} Service Request Confirmation`,
              html: `
                <h2>Thank you for your ${serviceTypeTitle.toLowerCase()} service request</h2>
                <p>Dear ${data.firstName},</p>
                <p>We have received your request for ${serviceTypeTitle.toLowerCase()} services. Our pastoral team will contact you within 24-48 hours.</p>
                <p><strong>Request Details:</strong></p>
                <ul>
                  <li>Service Type: ${serviceTypeTitle}</li>
                  <li>Preferred Date: ${data.preferredDate}</li>
                  ${data.alternateDate ? `<li>Alternate Date: ${data.alternateDate}</li>` : ''}
                </ul>
                <p>Blessings,<br>Salem Primitive Baptist Church</p>
              `
            });
        error = result.error;
      } catch (thrown) {
        // Network-level failures (DNS, timeout, etc.) do throw — handle both.
        error = { message: thrown instanceof Error ? thrown.message : String(thrown) };
      }

      if (!error) return true;

      // Visible on two channels on purpose: console.error alone gets lost
      // in log retention nobody watches; Sentry is already configured in
      // this project (sentry.server.config.ts) but nothing had ever called
      // it, so caught errors like this one were invisible even though the
      // SDK was "set up."
      console.error(`[EMAIL_SEND_FAILURE] services/request ${recipient} notification failed`, {
        requestId: docRef.id,
        recipient,
        error,
      });
      Sentry.captureException(new Error(`Resend send failed: ${error.message || error.name || 'unknown error'}`), {
        tags: { route: 'services/request', failureType: 'email-notification', recipient },
        extra: { requestId: docRef.id, serviceType: data.serviceType, resendError: error },
      });
      return false;
    }

    const adminNotified = await sendNotification('admin');
    const requesterConfirmed = await sendNotification('requester');

    const message = adminNotified && requesterConfirmed
      ? 'Your request has been submitted and a confirmation email has been sent to you.'
      : 'Your request has been submitted and saved — our team will follow up, though the confirmation email could not be sent right now.';

    return NextResponse.json({
      success: true,
      id: docRef.id,
      notifications: { adminNotified, requesterConfirmed },
      message,
    });
  } catch (error) {
    console.error('Service request error:', error);
    Sentry.captureException(error, { tags: { route: 'services/request' } });
    return NextResponse.json({ success: false, error: 'Failed to submit request' }, { status: 500 });
  }
}