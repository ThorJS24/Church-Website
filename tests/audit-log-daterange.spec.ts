import { test, expect } from '@playwright/test';
import { UserRole } from '../lib/permissions';
import { createTestUser, deleteTestUser, deleteFirestoreDoc, seedAuditEntry } from './helpers/testAuth';

// Seeds a real spread of entries (not 2-3 rows) across many months so the
// Firestore range query on `timestamp` actually has something non-trivial
// to filter, rather than trivially returning everything or nothing.
const MONTHS_AGO = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24];
const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

test.describe('Audit log date-range filtering is a real Firestore query', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  const seededIds: string[] = [];
  const ACTION = `daterange-test-${Date.now()}`;
  // Fixed reference point captured once, alongside seeding, and reused by
  // every test below — computing "N months ago" freshly in each test
  // against a moving Date.now() caused boundary entries to drift across
  // cutoffs between seed time and assertion time.
  let referenceNow: number;

  test.beforeAll(async () => {
    admin = await createTestUser(UserRole.ADMIN);
    referenceNow = Date.now();

    for (const monthsAgo of MONTHS_AGO) {
      const ts = new Date(referenceNow - monthsAgo * MS_PER_MONTH);
      const id = await seedAuditEntry({
        actorUid: admin.uid,
        actorEmail: admin.email,
        action: ACTION,
        targetType: 'test',
        targetId: `monthsAgo-${monthsAgo}`,
        timestamp: ts,
      });
      seededIds.push(id);
    }
  });

  test.afterAll(async () => {
    await Promise.allSettled([
      deleteTestUser(admin.uid),
      ...seededIds.map(id => deleteFirestoreDoc('auditLog', id)),
    ]);
  });

  function cutoffFor(monthsAgo: number): Date {
    return new Date(referenceNow - monthsAgo * MS_PER_MONTH);
  }

  test('no date filter returns entries scoped by action, including all seeded rows', async ({ request }) => {
    const resp = await request.get(`/api/admin/audit-log?action=${ACTION}&limit=100`, {
      headers: { Authorization: `Bearer ${admin.idToken}` },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.entries.length).toBe(MONTHS_AGO.length);
  });

  test('from filter excludes entries older than the cutoff', async ({ request }) => {
    const cutoff = cutoffFor(5); // exactly matches the "5 months ago" seeded entry
    const resp = await request.get(
      `/api/admin/audit-log?action=${ACTION}&from=${cutoff.toISOString()}&limit=100`,
      { headers: { Authorization: `Bearer ${admin.idToken}` } }
    );
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    const expectedCount = MONTHS_AGO.filter(m => m <= 5).length; // 0..5 inclusive
    expect(data.entries.length).toBe(expectedCount);
  });

  test('to filter excludes entries newer than the cutoff', async ({ request }) => {
    const cutoff = cutoffFor(10);
    const resp = await request.get(
      `/api/admin/audit-log?action=${ACTION}&to=${cutoff.toISOString()}&limit=100`,
      { headers: { Authorization: `Bearer ${admin.idToken}` } }
    );
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    const expectedCount = MONTHS_AGO.filter(m => m >= 10).length;
    expect(data.entries.length).toBe(expectedCount);
  });

  test('from+to together select only the middle window', async ({ request }) => {
    const from = cutoffFor(12);
    const to = cutoffFor(3);
    const resp = await request.get(
      `/api/admin/audit-log?action=${ACTION}&from=${from.toISOString()}&to=${to.toISOString()}&limit=100`,
      { headers: { Authorization: `Bearer ${admin.idToken}` } }
    );
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    const expectedCount = MONTHS_AGO.filter(m => m >= 3 && m <= 12).length;
    expect(data.entries.length).toBe(expectedCount);
  });

  test('date range combined with actorUid still resolves without a missing-index error', async ({ request }) => {
    const from = cutoffFor(24); // covers everything seeded
    const resp = await request.get(
      `/api/admin/audit-log?actorUid=${admin.uid}&action=${ACTION}&from=${from.toISOString()}&limit=100`,
      { headers: { Authorization: `Bearer ${admin.idToken}` } }
    );
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.entries.length).toBe(MONTHS_AGO.length);
  });

  test('invalid date strings are rejected with 400, not a server error', async ({ request }) => {
    const resp = await request.get(`/api/admin/audit-log?from=not-a-date`, {
      headers: { Authorization: `Bearer ${admin.idToken}` },
    });
    expect(resp.status()).toBe(400);
  });
});
