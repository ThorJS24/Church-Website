import { test, expect } from '@playwright/test';

/**
 * Regression coverage for the gap-fix that made notFound() actually return
 * HTTP 404 on the three dynamic detail routes. Root cause: the root
 * app/loading.tsx wrapped every route in the app in a Suspense boundary, so
 * Next.js streamed the 200-status document shell before notFound() could
 * resolve to a real 404. All three pages already correctly called
 * notFound() when the doc didn't exist — the rendered "not found" UI was
 * always right, only the HTTP status code was wrong. The fix was deleting
 * app/loading.tsx (not replacing it with a folder-level loading.tsx on
 * blog/events/sermons, which would silently reintroduce the same bug on
 * the nested [slug]/[id] route).
 */
test.describe('notFound() returns a real HTTP 404, not 200', () => {
  const cases = [
    { name: 'blog post', path: '/blog/this-slug-does-not-exist-anywhere' },
    { name: 'event', path: '/events/this-id-does-not-exist-anywhere' },
    { name: 'sermon', path: '/sermons/this-id-does-not-exist-anywhere' },
    { name: 'arbitrary top-level route (no dynamic segment)', path: '/this-route-does-not-exist-at-all' },
  ];

  for (const c of cases) {
    test(`${c.name}: ${c.path} returns 404`, async ({ request }) => {
      const resp = await request.get(c.path);
      expect(resp.status()).toBe(404);
      const body = await resp.text();
      // Guards against a future change that fixes the status code but
      // accidentally serves the wrong body (e.g. a raw framework error
      // page) instead of the app's actual not-found UI.
      expect(body.toLowerCase()).toContain('not found');
    });
  }

  test('a real, existing page still returns 200 (sanity check)', async ({ request }) => {
    const resp = await request.get('/blog');
    expect(resp.status()).toBe(200);
  });
});
