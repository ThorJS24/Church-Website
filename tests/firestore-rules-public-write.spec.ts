import { test, expect } from '@playwright/test';
import { deleteFirestoreDoc } from './helpers/testAuth';

/**
 * Regression coverage for the gap-fix that closed a real bypass: six
 * public-submission collections (prayerRequests, contacts, serviceRequests,
 * galleryImages, testimonials, comments) used to allow `create: if true` in
 * firestore.rules, so a client could write straight to Firestore using the
 * public client SDK config, skipping the rate limiting that only lived
 * inside the corresponding Next.js API route. The four routes that still
 * used the client SDK internally (prayer, contact, services/request,
 * testimonials/submit) were converted to the Admin SDK — matching the
 * pattern gallery/submit and gallery/comment already used — specifically so
 * the rules could then be tightened to `create: if false` without breaking
 * the routes themselves.
 *
 * This spec checks both directions: an unauthenticated write straight to
 * Firestore (bypassing the API entirely) must now be rejected, and the real
 * API route for the same collection must still succeed.
 *
 * The direct-write check goes through the Firestore REST API rather than
 * the `firebase` client SDK — the SDK's gRPC channel retries indefinitely
 * on a permission error in a plain Node/CI process instead of surfacing it
 * promptly, which made this check hang. REST returns the rejection as a
 * normal HTTP response.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function attemptDirectWrite(request: import('@playwright/test').APIRequestContext, collection: string) {
  return request.post(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}`,
    {
      headers: { 'Content-Type': 'application/json' },
      data: { fields: { title: { stringValue: 'rules-bypass-check' } } },
    }
  );
}

test.describe('Firestore rules: public-write collections reject direct client writes', () => {
  const collections = ['prayerRequests', 'contacts', 'serviceRequests', 'galleryImages', 'testimonials', 'comments'];

  for (const collection of collections) {
    test(`${collection}: unauthenticated direct write is rejected with PERMISSION_DENIED`, async ({ request }) => {
      const resp = await attemptDirectWrite(request, collection);
      expect(resp.status()).toBe(403);
      const body = await resp.json();
      expect(body.error?.status).toBe('PERMISSION_DENIED');
    });
  }
});

test.describe('Firestore rules: the corresponding API route still works (Admin SDK, bypasses rules)', () => {
  test('prayer: /api/prayer still accepts a real submission', async ({ request }) => {
    const resp = await request.post('/api/prayer', {
      headers: { 'x-forwarded-for': '198.51.100.210' },
      data: { title: 'rules regression check', description: 'x', category: 'other', isPrivate: false, isAnonymous: true },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    await deleteFirestoreDoc('prayerRequests', body.id);
  });

  test('contact: /api/contact still accepts a real submission', async ({ request }) => {
    const resp = await request.post('/api/contact', {
      headers: { 'x-forwarded-for': '198.51.100.211' },
      data: { name: 'Rules Check', email: 'rules-check@example.test', message: 'rules regression check' },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    await deleteFirestoreDoc('contacts', body.id);
  });

  test('testimonials: /api/testimonials/submit still accepts a real submission', async ({ request }) => {
    const resp = await request.post('/api/testimonials/submit', {
      headers: { 'x-forwarded-for': '198.51.100.212' },
      data: { authorName: 'Rules Check', content: 'rules regression check', consentGiven: true },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    await deleteFirestoreDoc('testimonials', body.id);
  });

  // services/request is deliberately not exercised here — it sends two real
  // emails per call (see services-request-resilience.spec.ts and
  // rate-limiting.spec.ts's file comment on keeping live-email side effects
  // to a minimum); its Admin SDK conversion is covered by those existing
  // specs continuing to pass, not a fresh call here.
});
