import { test, expect } from '@playwright/test';
import { UserRole } from '../lib/permissions';
import { createTestUser, deleteTestUser } from './helpers/testAuth';

// Representative sample covering every screen's primary route, plus the
// mutating routes each screen depends on.
const ADMIN_ROUTES: { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; path: string; body?: object }[] = [
  { method: 'GET', path: '/api/admin/users' },
  { method: 'PUT', path: '/api/admin/users', body: { userId: 'x', role: 'admin' } },
  { method: 'PATCH', path: '/api/admin/users', body: { userId: 'x', isActive: false } },
  { method: 'DELETE', path: '/api/admin/users', body: { userId: 'x' } },
  { method: 'GET', path: '/api/admin/stats' },
  { method: 'GET', path: '/api/admin/content/sermons' },
  { method: 'POST', path: '/api/admin/content/sermons', body: { title: 'x' } },
  { method: 'GET', path: '/api/admin/gallery' },
  { method: 'GET', path: '/api/admin/moderation' },
  { method: 'GET', path: '/api/admin/audit-log' },
  { method: 'GET', path: '/api/admin/settings' },
  { method: 'PUT', path: '/api/admin/settings', body: { churchName: 'x' } },
  // Enterprise CMS additions — one representative route per new surface,
  // same philosophy as above rather than all ~25 new endpoints.
  { method: 'GET', path: '/api/admin/content/blog' },
  { method: 'PUT', path: '/api/admin/content/sermons/x', body: { title: 'x' } },
  { method: 'DELETE', path: '/api/admin/content/sermons/x' },
  { method: 'GET', path: '/api/admin/content/sermons/x/versions' },
  { method: 'POST', path: '/api/admin/content/sermons/x/versions/y/restore' },
  { method: 'GET', path: '/api/admin/content-types' },
  { method: 'POST', path: '/api/admin/content-types', body: { id: 'x', label: 'x', pluralLabel: 'x', fields: [] } },
  { method: 'GET', path: '/api/admin/custom-content/x' },
  { method: 'POST', path: '/api/admin/custom-content/x', body: {} },
  { method: 'GET', path: '/api/admin/media' },
  { method: 'DELETE', path: '/api/admin/media/x' },
  { method: 'GET', path: '/api/admin/forms' },
  { method: 'POST', path: '/api/admin/forms', body: { id: 'x', title: 'x', fields: [] } },
  { method: 'GET', path: '/api/admin/forms/x/submissions' },
  { method: 'GET', path: '/api/admin/newsletter/subscribers' },
  { method: 'POST', path: '/api/admin/newsletter/campaigns', body: { subject: 'x', body: 'x' } },
  { method: 'GET', path: '/api/admin/messages' },
  { method: 'PATCH', path: '/api/admin/messages/contacts/x', body: { status: 'closed' } },
  { method: 'GET', path: '/api/admin/backup' },
];

test.describe('Every admin route rejects unauthenticated requests', () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route.method} ${route.path} -> 401 with no Authorization header`, async ({ request }) => {
      const response = await request.fetch(route.path, {
        method: route.method,
        data: route.body,
      });
      expect(response.status()).toBe(401);
    });
  }
});

test.describe('Every admin route rejects a member-role request', () => {
  let member: Awaited<ReturnType<typeof createTestUser>>;

  test.beforeAll(async () => {
    member = await createTestUser(UserRole.MEMBER);
  });

  test.afterAll(async () => {
    await deleteTestUser(member.uid);
  });

  for (const route of ADMIN_ROUTES) {
    test(`${route.method} ${route.path} -> 403 for a member`, async ({ request }) => {
      const response = await request.fetch(route.path, {
        method: route.method,
        headers: { Authorization: `Bearer ${member.idToken}` },
        data: route.body,
      });
      expect(response.status()).toBe(403);
    });
  }
});

test.describe('Moderator can reach the moderation queue but not admin-only routes', () => {
  let moderator: Awaited<ReturnType<typeof createTestUser>>;

  test.beforeAll(async () => {
    moderator = await createTestUser(UserRole.MODERATOR);
  });

  test.afterAll(async () => {
    await deleteTestUser(moderator.uid);
  });

  test('GET /api/admin/moderation succeeds for a moderator', async ({ request }) => {
    const response = await request.get('/api/admin/moderation', {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
    });
    expect(response.status()).toBe(200);
  });

  // Form submissions can hold sensitive answers (contact info, free text),
  // so viewing them is gated at requireModerator — same floor as the
  // moderation queue — not requireAdmin like the rest of /api/admin/forms.
  test('GET /api/admin/forms/x/submissions succeeds for a moderator', async ({ request }) => {
    const response = await request.get('/api/admin/forms/x/submissions', {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
    });
    expect(response.status()).toBe(200);
  });

  const adminOnlyForModerator = ADMIN_ROUTES.filter(
    r => !r.path.startsWith('/api/admin/moderation') && r.path !== '/api/admin/forms/x/submissions'
  );

  for (const route of adminOnlyForModerator) {
    test(`${route.method} ${route.path} -> 403 for a moderator (below admin)`, async ({ request }) => {
      const response = await request.fetch(route.path, {
        method: route.method,
        headers: { Authorization: `Bearer ${moderator.idToken}` },
        data: route.body,
      });
      expect(response.status()).toBe(403);
    });
  }
});
