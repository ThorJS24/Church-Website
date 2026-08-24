import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { UserRole } from '../lib/permissions';
import { createTestUser, deleteTestUser } from './helpers/testAuth';

// Playwright's own bundled Chromium has never finished downloading in this
// environment (network-restricted); the system-installed Edge is used
// instead, same workaround as tests/accessibility-new-pages.spec.ts.
test.use({ channel: 'msedge' });

// Every app/admin/**/page.tsx route. AdminLayout gates all of them behind
// UserRole.MODERATOR at minimum and several behind UserRole.ADMIN (see
// NAV_ITEMS in components/admin/AdminLayout.tsx) — none require
// SUPER_ADMIN, so a single ADMIN test user covers every route below.
const ADMIN_PAGES = [
  '/admin',
  '/admin/users',
  '/admin/content',
  '/admin/messages',
  '/admin/media',
  '/admin/forms',
  '/admin/newsletter',
  '/admin/moderation',
  '/admin/audit-log',
  '/admin/settings',
];

test.describe('Admin pages have no critical/serious axe violations', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let context: BrowserContext;
  let page: Page;

  // AdminLayout's auth gate is entirely client-side (Firebase Auth via
  // useAuth()/onAuthStateChanged, no server-side session cookie — see
  // middleware.ts, which does no route protection at all), so the only way
  // to reach these pages as Playwright would need to is a real UI sign-in,
  // not just an API-level ID token like tests/admin-auth.spec.ts uses. One
  // shared authenticated page is reused across every route below rather
  // than signing in per test.
  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    // createTestUser does two real network round-trips (Admin SDK user
    // creation + Identity Toolkit token exchange), and next dev's
    // first-hit compile tax (see playwright.config.ts's `retries` comment)
    // can land on /login here too — the default 30s hook timeout is too
    // tight for both together.
    test.setTimeout(90_000);
    admin = await createTestUser(UserRole.ADMIN);
    context = await browser.newContext();
    page = await context.newPage();
    // Pre-seed cookie consent (see components/GDPRCompliance.tsx) so its
    // modal doesn't render and intercept clicks on the login form/admin nav.
    await context.addInitScript(() => {
      localStorage.setItem('cookiePreferences', JSON.stringify({ essential: true, analytics: true, marketing: true, functional: true }));
    });
    await page.goto('/login');
    // Scoped to the login form specifically — the footer's newsletter
    // signup form (rendered on every page) also has an "Email address"
    // field, and getByLabel's default substring/case-insensitive matching
    // resolves both, so an unscoped locator here is ambiguous. Anchored
    // regexes for the same reason: unscoped/substring matches on "Password"
    // also catch the show/hide-password icon button's "Show password"
    // aria-label.
    const loginForm = page.locator('form').first();
    const emailInput = loginForm.getByLabel(/^Email Address/);
    // The login page is a client component; filling immediately after
    // goto()'s 'load' event can race React hydration — the very first fill
    // lands before the controlled input's onChange is wired up and gets
    // silently overwritten back to empty on the next render (confirmed
    // empirically: an unconditional first fill here is flaky, a second fill
    // on the same field always sticks). Waiting for visible + a brief
    // settle avoids the race without a fragile double-fill workaround.
    await emailInput.waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await emailInput.fill(admin.email);
    await loginForm.getByLabel(/^Password/).fill('Test-Password-123!');
    await loginForm.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard');
  });

  test.afterAll(async () => {
    await context?.close();
    if (admin) await deleteTestUser(admin.uid);
  });

  for (const path of ADMIN_PAGES) {
    test(`${path} @axe`, async () => {
      await page.goto(path);
      // Same settle-before-scan reasoning as accessibility-new-pages.spec.ts:
      // motion-driven transitions can make axe's contrast check catch a
      // still-transitioning element and report a false low-contrast reading.
      await page.waitForTimeout(1500);

      const results = await new AxeBuilder({ page }).analyze();
      const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

      if (critical.length > 0) {
        console.log(`\n${path} violations:\n${JSON.stringify(critical, null, 2)}`);
      }
      expect(critical, `${path} has critical/serious axe violations (see console output above)`).toEqual([]);
    });
  }
});
