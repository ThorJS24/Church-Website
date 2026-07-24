import { test, expect } from '@playwright/test';
import { UserRole } from '../lib/permissions';
import {
  createTestUser,
  deleteTestUser,
  getLatestAuditEntry,
  getUserDoc,
} from './helpers/testAuth';

test.describe('Mutations from each admin screen are recorded in the audit log', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let superAdmin: Awaited<ReturnType<typeof createTestUser>>;
  let targetMember: Awaited<ReturnType<typeof createTestUser>>;

  test.beforeAll(async () => {
    admin = await createTestUser(UserRole.ADMIN);
    superAdmin = await createTestUser(UserRole.SUPER_ADMIN);
    targetMember = await createTestUser(UserRole.MEMBER);
  });

  test.afterAll(async () => {
    await Promise.allSettled([
      deleteTestUser(admin.uid),
      deleteTestUser(superAdmin.uid),
      deleteTestUser(targetMember.uid),
    ]);
  });

  test('Content editor: creating a sermon writes an audit entry', async ({ request }) => {
    const createResp = await request.post('/api/admin/content/sermons', {
      headers: { Authorization: `Bearer ${admin.idToken}` },
      data: { title: 'Integration Test Sermon' },
    });
    expect(createResp.status()).toBe(200);
    const { id } = await createResp.json();

    const entry = await getLatestAuditEntry('sermons', id);
    expect(entry).not.toBeNull();
    expect(entry?.action).toBe('sermons.create');
    expect(entry?.actorEmail).toBe(admin.email);

    // cleanup
    const delResp = await request.delete(`/api/admin/content/sermons/${id}`, {
      headers: { Authorization: `Bearer ${admin.idToken}` },
    });
    expect(delResp.status()).toBe(200);
    const deleteEntry = await getLatestAuditEntry('sermons', id);
    expect(deleteEntry?.action).toBe('sermons.delete');
  });

  test('Settings screen: updating site settings writes an audit entry', async ({ request }) => {
    const resp = await request.put('/api/admin/settings', {
      headers: { Authorization: `Bearer ${admin.idToken}` },
      data: { tagline: `Integration test tagline ${Date.now()}` },
    });
    expect(resp.status()).toBe(200);

    const entry = await getLatestAuditEntry('siteSettings', 'main');
    expect(entry).not.toBeNull();
    expect(entry?.action).toBe('settings.update');
    expect(entry?.actorEmail).toBe(admin.email);
  });

  test('User management: role change is super_admin-only and audited', async ({ request }) => {
    // Admin (not super_admin) must be rejected.
    const deniedResp = await request.put('/api/admin/users', {
      headers: { Authorization: `Bearer ${admin.idToken}` },
      data: { userId: targetMember.uid, role: 'moderator' },
    });
    expect(deniedResp.status()).toBe(403);

    // Super admin succeeds.
    const resp = await request.put('/api/admin/users', {
      headers: { Authorization: `Bearer ${superAdmin.idToken}` },
      data: { userId: targetMember.uid, role: 'moderator' },
    });
    expect(resp.status()).toBe(200);

    const updated = await getUserDoc(targetMember.uid);
    expect(updated?.role).toBe('moderator');

    const entry = await getLatestAuditEntry('user', targetMember.uid);
    expect(entry).not.toBeNull();
    expect(entry?.action).toBe('user.role_change');
    expect(entry?.actorEmail).toBe(superAdmin.email);
    expect((entry?.after as any)?.role).toBe('moderator');
  });
});
