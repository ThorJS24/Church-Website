import { test, expect, APIRequestContext } from '@playwright/test';
import { UserRole } from '../lib/permissions';
import {
  clearRateLimit,
  expireRateLimitWindow,
  getRateLimitDoc,
  createFirestoreDoc,
  deleteFirestoreDoc,
  deleteFirestoreDocsWhere,
  createTestUser,
  deleteTestUser,
} from './helpers/testAuth';

/**
 * Every route below puts its rate-limit check first, before any external
 * call (Firestore write, Cloudinary/AWS/SMTP) — so these tests exercise
 * the real gate on every route without depending on AWS Polly actually
 * being configured. `services/request` DOES send real email through the
 * live Resend API on every non-429 call, so each route gets exactly ONE
 * consolidated test (max successes, then a 429, then a post-reset success)
 * instead of three separate tests — this keeps the real-world side effects
 * (Firestore writes, Cloudinary uploads, and especially real emails to the
 * live ADMIN_EMAIL inbox) to the minimum needed to prove all three
 * behaviors, on every future run of this suite, not just this one.
 */

async function fireN(request: APIRequestContext, path: string, body: object, n: number, headers: Record<string, string>) {
  const statuses: number[] = [];
  for (let i = 0; i < n; i++) {
    const resp = await request.post(path, { headers, data: body });
    statuses.push(resp.status());
  }
  return statuses;
}

test.describe('Rate limiting is applied to every unauthenticated public POST route', () => {
  let testImageId: string;

  test.beforeAll(async () => {
    // gallery/like and gallery/view update-in-place, so they need a real
    // doc to target — otherwise every "under the limit" request would 500
    // on a Firestore NOT_FOUND before the rate limit is even relevant.
    testImageId = await createFirestoreDoc('galleryImages', {
      title: 'rate-limit-test-image',
      imageUrl: 'https://example.test/test.png',
      likes: 0,
      views: 0,
      moderationStatus: 'approved',
    });
  });

  test.afterAll(async () => {
    await deleteFirestoreDoc('galleryImages', testImageId);
  });

  const IP_COUNTER = { n: 0 };
  function uniqueIp() {
    IP_COUNTER.n += 1;
    return `198.51.100.${IP_COUNTER.n}`;
  }

  interface Case {
    name: string;
    path: string;
    body: () => object;
    max: number;
    windowMs: number;
    keyPrefix: string;
    expectSuccessStatus?: number; // omit when the route's success status depends on unrelated external config (AWS/SMTP)
    timeoutMs?: number; // override for routes whose real round-trips (60 sequential requests, or SMTP auth delay) exceed the default 30s
    cleanup?: { collection: string; field: string; value: unknown }; // routes that create docs identifiable only by field, not by response ID
  }

  const cases: Case[] = [
    {
      name: 'prayer request submission',
      path: '/api/prayer',
      body: () => ({ title: 'rl test', description: 'rl test body' }),
      max: 5,
      windowMs: 60 * 60 * 1000,
      keyPrefix: 'prayer-submit_',
      expectSuccessStatus: 200,
      cleanup: { collection: 'prayerRequests', field: 'title', value: 'rl test' },
    },
    {
      name: 'contact form submission',
      path: '/api/contact',
      body: () => ({ name: 'RL Test', email: 'rl-test@example.test', subject: 'test', message: 'test message' }),
      max: 5,
      windowMs: 60 * 60 * 1000,
      keyPrefix: 'contact-submit_',
      expectSuccessStatus: 200,
      cleanup: { collection: 'contacts', field: 'email', value: 'rl-test@example.test' },
    },
    {
      name: 'gallery comment',
      path: '/api/gallery/comment',
      body: () => ({ imageId: 'rl-test-nonexistent-image', comment: 'rl test comment' }),
      max: 10,
      windowMs: 60 * 60 * 1000,
      keyPrefix: 'gallery-comment_',
      expectSuccessStatus: 200,
      cleanup: { collection: 'comments', field: 'imageId', value: 'rl-test-nonexistent-image' },
    },
    {
      name: 'gallery like',
      path: '/api/gallery/like',
      body: () => ({ imageId: '__SEEDED__' }),
      max: 30,
      windowMs: 60 * 60 * 1000,
      keyPrefix: 'gallery-like_',
      expectSuccessStatus: 200,
    },
    {
      name: 'gallery view',
      path: '/api/gallery/view',
      body: () => ({ imageId: '__SEEDED__' }),
      max: 60,
      windowMs: 60 * 60 * 1000,
      keyPrefix: 'gallery-view_',
      expectSuccessStatus: 200,
      timeoutMs: 120_000, // 62 sequential real requests, each doing multiple live Firestore round-trips
    },
    {
      name: 'livestream chat',
      path: '/api/livestream/chat',
      body: () => ({ message: 'rl test message' }),
      max: 20,
      windowMs: 5 * 60 * 1000,
      keyPrefix: 'livestream-chat_',
      expectSuccessStatus: 200,
      cleanup: { collection: 'chatMessages', field: 'message', value: 'rl test message' },
    },
    {
      name: 'text-to-speech',
      path: '/api/tts',
      body: () => ({ text: 'rate limit test', language: 'en' }),
      max: 10,
      windowMs: 60 * 60 * 1000,
      keyPrefix: 'tts_',
      // AWS isn't configured in this environment, so a non-429 response is
      // 503 (TTS_NOT_CONFIGURED), not 200 — the point is it's never 429
      // until the limit is actually exceeded.
    },
    {
      name: 'service request (wedding/baptism)',
      path: '/api/services/request',
      body: () => ({ serviceType: 'wedding', firstName: 'RL', lastName: 'Test', email: 'rl-test@example.test', phone: '555-0100', preferredDate: '2027-01-01' }),
      max: 3,
      windowMs: 60 * 60 * 1000,
      keyPrefix: 'services-request_',
      // Sends real email via the live Resend API on every non-429 call — see
      // file-level comment. Always 200 regardless of email outcome: the
      // Firestore write is the actual submission, and any notification
      // failure is reported via the `notifications` field, not a failed
      // HTTP status (see services-request-resilience.spec.ts for dedicated
      // coverage of that failure path with a deterministically-invalid
      // recipient).
      expectSuccessStatus: 200,
    },
  ];

  for (const c of cases) {
    test(`${c.name}: enforces its limit (${c.max}/${c.windowMs / 1000}s), returns clean 429, and resets`, async ({ request }) => {
      if (c.timeoutMs) test.setTimeout(c.timeoutMs);
      const ip = uniqueIp();
      const key = `${c.keyPrefix}${ip}`;
      const rawBody = c.body() as { imageId?: string };
      const body = rawBody.imageId === '__SEEDED__' ? { imageId: testImageId } : rawBody;

      try {
        // 1. `max` requests must never be rejected as 429.
        const okStatuses = await fireN(request, c.path, body, c.max, { 'x-forwarded-for': ip });
        expect(okStatuses.every(s => s !== 429)).toBe(true);
        if (c.expectSuccessStatus !== undefined) {
          expect(okStatuses.every(s => s === c.expectSuccessStatus)).toBe(true);
        }

        // 2. The next request is a clean 429, not a 500.
        const blockedResp = await request.post(c.path, { headers: { 'x-forwarded-for': ip }, data: body });
        expect(blockedResp.status()).toBe(429);
        expect(blockedResp.headers()['retry-after']).toBeTruthy();
        const blockedBody = await blockedResp.json().catch(() => ({}));
        expect(blockedBody.success === false || !!blockedBody.error).toBe(true);

        // 3. After the window elapses, the limit resets to a fresh count of 1.
        await expireRateLimitWindow(key, c.windowMs);
        const afterResetResp = await request.post(c.path, { headers: { 'x-forwarded-for': ip }, data: body });
        expect(afterResetResp.status()).not.toBe(429);
        const doc = await getRateLimitDoc(key);
        expect(doc?.count).toBe(1);
      } finally {
        await clearRateLimit(key);
        if (c.cleanup) {
          await deleteFirestoreDocsWhere(c.cleanup.collection, c.cleanup.field, c.cleanup.value);
        }
        // services/request writes its Firestore doc before attempting the
        // (possibly-failing) email send, so the doc can exist even when the
        // response itself is an error — clean up by field, not by ID.
        if (c.path === '/api/services/request') {
          await deleteFirestoreDocsWhere('serviceRequests', 'email', 'rl-test@example.test');
        }
      }
    });
  }

  // privacy/download-data now requires auth (it didn't when this suite was
  // first written — that was the bug: it returned another user's data to
  // anyone who could guess/brute-force nothing, since it needed nothing).
  // It doesn't fit the generic "unauthenticated public route" loop above,
  // so it gets its own test with a real signed-in user, same as gallery/submit
  // below gets its own test for a different reason (multipart body).
  test('privacy data download: requires auth, then enforces its limit (5/3600s), returns clean 429, and resets', async ({ request }) => {
    const testUser = await createTestUser(UserRole.MEMBER);
    const ip = uniqueIp();
    const key = `privacy-download_${testUser.uid}_${ip}`;
    const headers = { 'x-forwarded-for': ip, Authorization: `Bearer ${testUser.idToken}` };

    try {
      // Unauthenticated requests are rejected before rate limiting even applies.
      const unauth = await request.post('/api/privacy/download-data', { headers: { 'x-forwarded-for': ip } });
      expect(unauth.status()).toBe(401);

      // 1. `max` authenticated requests must never be rejected as 429.
      const okStatuses = await fireN(request, '/api/privacy/download-data', {}, 5, headers);
      expect(okStatuses.every(s => s !== 429)).toBe(true);
      expect(okStatuses.every(s => s === 200)).toBe(true);

      // 2. The next request is a clean 429, not a 500.
      const blockedResp = await request.post('/api/privacy/download-data', { headers, data: {} });
      expect(blockedResp.status()).toBe(429);
      expect(blockedResp.headers()['retry-after']).toBeTruthy();

      // 3. After the window elapses, the limit resets to a fresh count of 1.
      await expireRateLimitWindow(key, 60 * 60 * 1000);
      const afterResetResp = await request.post('/api/privacy/download-data', { headers, data: {} });
      expect(afterResetResp.status()).not.toBe(429);
      const doc = await getRateLimitDoc(key);
      expect(doc?.count).toBe(1);
    } finally {
      await clearRateLimit(key);
      await deleteTestUser(testUser.uid);
    }
  });

  // gallery/submit needs multipart with a real file, so it gets its own
  // dedicated test rather than fitting the generic JSON-body loop above.
  test('gallery submission (multipart): 5 allowed, 6th blocked with 429', async ({ request }) => {
    const TEST_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBytes = Buffer.from(TEST_PNG_BASE64, 'base64');
    const ip = uniqueIp();
    const key = `gallery-submit_${ip}`;
    const submittedIds: string[] = [];

    try {
      const statuses: number[] = [];
      for (let i = 0; i < 6; i++) {
        const resp = await request.post('/api/gallery/submit', {
          headers: { 'x-forwarded-for': ip },
          multipart: { file: { name: `rl-${i}.png`, mimeType: 'image/png', buffer: pngBytes } },
        });
        statuses.push(resp.status());
        if (resp.status() === 200) {
          const { id } = await resp.json();
          submittedIds.push(id);
        }
      }
      expect(statuses.filter(s => s === 200).length).toBe(5);
      expect(statuses[5]).toBe(429);
    } finally {
      await clearRateLimit(key);
      await Promise.allSettled(submittedIds.map(id => deleteFirestoreDoc('galleryImages', id)));
    }
  });
});
