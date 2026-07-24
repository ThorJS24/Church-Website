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

  const adminOnlyForModerator = ADMIN_ROUTES.filter(r => !r.path.startsWith('/api/admin/moderation'));

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
