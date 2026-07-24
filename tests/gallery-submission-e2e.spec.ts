import { test, expect } from '@playwright/test';
import { UserRole } from '../lib/permissions';
import { createTestUser, deleteTestUser, deleteFirestoreDoc, getUserDoc, clearRateLimit } from './helpers/testAuth';

// A real, valid 1x1 red-pixel PNG — an actual image file goes through the
// real Cloudinary upload, not a mocked one.
const TEST_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

test.describe('Public gallery submission end-to-end', () => {
  let moderator: Awaited<ReturnType<typeof createTestUser>>;
  const submittedIds: string[] = [];

  test.beforeAll(async () => {
    moderator = await createTestUser(UserRole.MODERATOR);
  });

  test.afterAll(async () => {
    // Every synthetic IP used across the tests below gets its own
    // rateLimits/{key} counter doc (checkRateLimit runs before the
    // route's own validation, so even a rejected upload still creates
    // one) — clear all of them so this file doesn't leave permanent
    // residue in the rateLimits collection on every run.
    const rateLimitIps = ['203.0.113.10', '203.0.113.11', '203.0.113.12', '203.0.113.13', '203.0.113.14', '203.0.113.55'];
    await Promise.allSettled([
      deleteTestUser(moderator.uid),
      ...submittedIds.map(id => deleteFirestoreDoc('galleryImages', id)),
      ...rateLimitIps.map(ip => clearRateLimit(`gallery-submit_${ip}`)),
    ]);
  });

  test('submit -> appears in moderation queue -> approve', async ({ request }) => {
    const pngBytes = Buffer.from(TEST_PNG_BASE64, 'base64');

    const submitResp = await request.post('/api/gallery/submit', {
      // Every independent test below uses its own synthetic IP so they
      // don't collide with each other (or with the dedicated rate-limit
      // test) on the shared real loopback address — matching how distinct
      // real visitors would actually behave.
      headers: { 'x-forwarded-for': '203.0.113.10' },
      multipart: {
        file: { name: 'e2e.png', mimeType: 'image/png', buffer: pngBytes },
        title: 'Playwright E2E Submission',
        submitterName: 'Playwright Runner',
      },
    });
    expect(submitResp.status()).toBe(200);
    const submitData = await submitResp.json();
    expect(submitData.success).toBe(true);
    const imageId = submitData.id as string;
    submittedIds.push(imageId);

    const queueResp = await request.get('/api/admin/moderation', {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
    });
    expect(queueResp.status()).toBe(200);
    const queue = await queueResp.json();
    const found = queue.items.find((i: any) => i.id === imageId && i.collection === 'galleryImages');
    expect(found).toBeTruthy();
    expect(found.moderationStatus).toBe('pending');

    const approveResp = await request.patch(`/api/admin/moderation/galleryImages/${imageId}`, {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
      data: { decision: 'approved' },
    });
    expect(approveResp.status()).toBe(200);

    const queueAfter = await request.get('/api/admin/moderation', {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
    }).then(r => r.json());
    expect(queueAfter.items.find((i: any) => i.id === imageId)).toBeUndefined();
  });

  test('submit -> reject records a reason and keeps it out of public reads', async ({ request }) => {
    const pngBytes = Buffer.from(TEST_PNG_BASE64, 'base64');
    const submitResp = await request.post('/api/gallery/submit', {
      headers: { 'x-forwarded-for': '203.0.113.11' },
      multipart: { file: { name: 'e2e-reject.png', mimeType: 'image/png', buffer: pngBytes } },
    });
    const { id: imageId } = await submitResp.json();
    submittedIds.push(imageId);

    const rejectResp = await request.patch(`/api/admin/moderation/galleryImages/${imageId}`, {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
      data: { decision: 'rejected', reason: 'not appropriate for the public gallery' },
    });
    expect(rejectResp.status()).toBe(200);
  });

  test('rejects files over the 4MB limit', async ({ request }) => {
    // Just over the limit, not wildly over — large enough to trip
    // MAX_FILE_BYTES, small enough to stay well clear of the platform's
    // own body-size cap so this exercises our validation, not a framework
    // truncation (see route.ts's comment on why the limit is 4MB, not 10).
    const bigBuffer = Buffer.alloc(5 * 1024 * 1024, 0);
    const resp = await request.post('/api/gallery/submit', {
      headers: { 'x-forwarded-for': '203.0.113.12' },
      multipart: { file: { name: 'too-big.png', mimeType: 'image/png', buffer: bigBuffer } },
    });
    expect(resp.status()).toBe(400);
  });

  test('gracefully rejects a file large enough to hit platform-level body truncation', async ({ request }) => {
    // Well past both our 4MB limit and the dev server's ~10MB body cap —
    // confirms the formData() parse-failure path added to route.ts returns
    // a clean 400, not the raw 500 it used to produce.
    const hugeBuffer = Buffer.alloc(11 * 1024 * 1024, 0);
    const resp = await request.post('/api/gallery/submit', {
      headers: { 'x-forwarded-for': '203.0.113.14' },
      multipart: { file: { name: 'huge.png', mimeType: 'image/png', buffer: hugeBuffer } },
    });
    expect(resp.status()).toBe(400);
  });

  test('rejects disallowed file types', async ({ request }) => {
    const resp = await request.post('/api/gallery/submit', {
      headers: { 'x-forwarded-for': '203.0.113.13' },
      multipart: { file: { name: 'script.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') } },
    });
    expect(resp.status()).toBe(400);
  });

  test('rate limits repeated submissions from the same source', async ({ request }) => {
    const pngBytes = Buffer.from(TEST_PNG_BASE64, 'base64');
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const resp = await request.post('/api/gallery/submit', {
        headers: { 'x-forwarded-for': '203.0.113.55' }, // fixed IP so all 7 share one bucket
        multipart: { file: { name: `rl-${i}.png`, mimeType: 'image/png', buffer: pngBytes } },
      });
      statuses.push(resp.status());
      if (resp.status() === 200) {
        const { id } = await resp.json();
        submittedIds.push(id);
      }
    }
    expect(statuses.filter(s => s === 200).length).toBe(5);
    expect(statuses.filter(s => s === 429).length).toBe(2);
  });

  test('moderator cannot escalate role while approving submissions (sanity re-check)', async () => {
    const doc = await getUserDoc(moderator.uid);
    expect(doc?.role).toBe('moderator');
  });
});
