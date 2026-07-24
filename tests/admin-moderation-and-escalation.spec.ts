import { test, expect } from '@playwright/test';
import { UserRole } from '../lib/permissions';
import {
  createTestUser,
  deleteTestUser,
  createFirestoreDoc,
  deleteFirestoreDoc,
  getLatestAuditEntry,
  getUserDoc,
} from './helpers/testAuth';

test.describe('Moderation queue: approve/reject decisions are audited', () => {
  let moderator: Awaited<ReturnType<typeof createTestUser>>;
  let prayerRequestId: string;

  test.beforeAll(async () => {
    moderator = await createTestUser(UserRole.MODERATOR);
    prayerRequestId = await createFirestoreDoc('prayerRequests', {
      title: 'Integration test prayer request',
      description: 'test',
      category: 'general',
      isPrivate: false,
      isAnonymous: true,
      authorName: 'Anonymous',
      status: 'active',
      moderationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  test.afterAll(async () => {
    await Promise.allSettled([
      deleteTestUser(moderator.uid),
      deleteFirestoreDoc('prayerRequests', prayerRequestId),
    ]);
  });

  test('moderator approving a prayer request writes an audit entry', async ({ request }) => {
    const resp = await request.patch(`/api/admin/moderation/prayerRequests/${prayerRequestId}`, {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
      data: { decision: 'approved' },
    });
    expect(resp.status()).toBe(200);

    const entry = await getLatestAuditEntry('prayerRequests', prayerRequestId);
    expect(entry).not.toBeNull();
    expect(entry?.action).toBe('moderation.approved');
    expect(entry?.actorEmail).toBe(moderator.email);
  });
});

test.describe('Privilege escalation is impossible', () => {
  let moderator: Awaited<ReturnType<typeof createTestUser>>;

  test.beforeAll(async () => {
    moderator = await createTestUser(UserRole.MODERATOR);
  });

  test.afterAll(async () => {
    await deleteTestUser(moderator.uid);
  });

  test('a moderator cannot promote themself to admin via the API', async ({ request }) => {
    const resp = await request.put('/api/admin/users', {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
      data: { userId: moderator.uid, role: 'admin' },
    });
    expect(resp.status()).toBe(403);

    const doc = await getUserDoc(moderator.uid);
    expect(doc?.role).toBe('moderator');
  });

  test('a moderator cannot reach user management by guessing the URL', async ({ request }) => {
    const resp = await request.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
    });
    expect(resp.status()).toBe(403);
  });

  test('a moderator cannot reach the content editor by guessing the URL', async ({ request }) => {
    const resp = await request.get('/api/admin/content/sermons', {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
    });
    expect(resp.status()).toBe(403);
  });
});
