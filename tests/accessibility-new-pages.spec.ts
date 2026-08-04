import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Playwright's own bundled Chromium has never finished downloading in this
// environment (network-restricted); the system-installed Edge is used
// instead, same workaround as the earlier accessibility audit batch.
test.use({ channel: 'msedge' });

// Every new public page added in this session's CMS work — none of these
// existed when the last accessibility audit ran, so none have been
// checked. Admin pages are excluded here since they require an
// authenticated session this test doesn't set up; they're staff-only and
// lower-audience-risk than anything public-facing.
const PAGES = [
  '/blog',
  '/small-groups',
  '/testimonials',
  '/resources',
];

test.describe('New public pages have no critical/serious axe violations', () => {
  for (const path of PAGES) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path);
      // Framer Motion's JS-driven fade/slide-in transitions (used on nearly
      // every section) can make axe's canvas-sampled contrast check catch a
      // still-transitioning element and report a false low-contrast reading
      // — the same noise source the prior accessibility batch diagnosed.
      // Waiting for the page to settle before scanning avoids re-diagnosing
      // the same non-issue here.
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page }).analyze();
      const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

      if (critical.length > 0) {
        console.log(`\n${path} violations:\n${JSON.stringify(critical, null, 2)}`);
      }
      expect(critical, `${path} has critical/serious axe violations (see console output above)`).toEqual([]);
    });
  }
});
