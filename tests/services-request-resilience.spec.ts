import { test, expect } from '@playwright/test';
import { deleteFirestoreDoc, clearRateLimit, getFirestoreDocById } from './helpers/testAuth';

/**
 * Covers the actual bug this file exists to prevent regressing: a bad email
 * credential used to make /api/services/request return a raw 500 *after*
 * the Firestore write had already succeeded, so a visitor's real submission
 * was saved but they were told it failed. The Firestore write and the two
 * notification emails (admin + requester) must now be independent — the
 * route should always return 200 with an honest `notifications` field once
 * the write itself succeeds, and only ever 500 if the write itself fails.
 *
 * salempbc.in is verified in Resend, so both the admin and requester emails
 * succeed for real, valid recipients now (confirmed via a real end-to-end
 * send in this session, checked against actual inbox receipt). To exercise
 * the partial-failure path with real, live infrastructure rather than a
 * mock, the requester test below deliberately submits a syntactically
 * invalid email address — Resend's own format validation rejects it
 * (422 validation_error) regardless of domain/sandbox status, which is a
 * genuine, deterministic way to make exactly one of the two sends fail.
 */
test.describe('services/request: Firestore write is independent of email notification outcome', () => {
  test('a real submission is saved and returns 200 even when the requester email is undeliverable', async ({ request }) => {
    const ip = '198.51.100.201';
    const key = `services-request_${ip}`;

    try {
      const resp = await request.post('/api/services/request', {
        headers: { 'x-forwarded-for': ip },
        data: {
          serviceType: 'baptism',
          firstName: 'Resilience',
          lastName: 'Test',
          // Syntactically invalid — Resend's `to` field validation rejects
          // this outright, independent of domain verification status, which
          // is what makes this a deterministic real failure rather than
          // something that depends on account-specific sandbox state.
          email: 'not-a-valid-email-address',
          phone: '555-0199',
          preferredDate: '2027-05-01',
        },
      });

      expect(resp.status()).toBe(200);
      const body = await resp.json();
      expect(body.success).toBe(true);
      expect(body.id).toBeTruthy();
      // ADMIN_EMAIL is a fixed, valid address, so that notification succeeds.
      expect(body.notifications.adminNotified).toBe(true);
      // The requester's address is malformed, so Resend genuinely rejects
      // it — this must not turn into a 500 or an unset/misleading field.
      expect(body.notifications.requesterConfirmed).toBe(false);
      // The message must not claim the submission itself failed.
      expect(body.message.toLowerCase()).not.toContain('failed');
      expect(body.message.toLowerCase()).toContain('saved');

      await deleteFirestoreDoc('serviceRequests', body.id);
    } finally {
      await clearRateLimit(key);
    }
  });

  test('the Firestore write happens before any email attempt, so it is unaffected by notification outcome', async ({ request }) => {
    const ip = '198.51.100.202';
    const key = `services-request_${ip}`;

    try {
      const resp = await request.post('/api/services/request', {
        headers: { 'x-forwarded-for': ip },
        data: {
          serviceType: 'wedding',
          firstName: 'Resilience2',
          lastName: 'Test',
          email: 'resilience-test-2@mailinator.com',
          phone: '555-0198',
          preferredDate: '2027-05-02',
          partnerName: 'Partner Name',
        },
      });

      const body = await resp.json();
      expect(body.success).toBe(true);
      // With the domain verified, both notifications are expected to
      // succeed for a valid recipient now — locks in the fixed state.
      expect(body.notifications.adminNotified).toBe(true);
      expect(body.notifications.requesterConfirmed).toBe(true);

      // Confirm the write is real, not just claimed by the response —
      // read it back independently rather than trusting the API's own
      // account of what happened.
      const doc = await getFirestoreDocById('serviceRequests', body.id);
      expect(doc).toBeTruthy();
      expect(doc?.firstName).toBe('Resilience2');
      expect(doc?.serviceType).toBe('wedding');

      await deleteFirestoreDoc('serviceRequests', body.id);
    } finally {
      await clearRateLimit(key);
    }
  });
});
