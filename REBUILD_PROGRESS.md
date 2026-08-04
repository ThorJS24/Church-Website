# Premium Frontend Rebuild — Progress

Tracking doc for the full design-system rebuild described in `.claude` plan
`gentle-riding-sky` (branch: `redesign/design-system`). Updated at the end of
every phase. See that plan for the full phase list and constraints (no new
npm dependencies, backend/Firestore/API untouched, `ThemeContext`/
`LanguageContext`/`AuthContext` preserved as-is).

**Snapshot date:** 2026-08-04

---

## Completed

### Phase 0 — Foundation
- Design tokens (color, type scale, radius, shadow/elevation, motion) as CSS
  custom properties in `app/globals.css`, consumed by `tailwind.config.js`.
  Fixed a pre-existing duplicate `@tailwind` directive bug in `globals.css`
  and removed dead legacy utility classes (confirmed zero references via
  grep before deleting).
- `lib/cn.ts` — clsx + tailwind-merge helper.
- `components/ui/` primitive library (26 components + barrel `index.ts`):
  Button, LinkButton, IconButton, Card (+Header/Title/Description/Footer),
  Badge, Input, Textarea, Select, Checkbox, Radio, Switch, Container, Stack,
  Section, Grid, Avatar, Tooltip, Modal, Drawer, Dropdown (+Trigger/Menu/
  Item/Separator), Tabs (+List/Tab/Panel), Accordion (+Item), Skeleton
  (+Text/Card), States (Loading/Empty/Error — same prop shape as the old
  `components/admin/States.tsx`, for an easy Phase 9 swap), Toast/ToastProvider,
  Breadcrumbs, Pagination.
- `ToastProvider` wired into `app/layout.tsx`.
- Verified: `type-check`, `lint`, dev-server boot/render — all clean.

### Phase 1 — Global shell + command palette
- `app/api/search/route.ts` extended additively (new `blogPosts` and `forms`
  result keys; existing keys/shape untouched). Blog posts are filtered by
  the same draft/publishAt rule `lib/content.ts` uses client-side, since
  that collection has an explicit publish workflow the route wasn't
  previously gating on.
- `components/CommandPalette.tsx` (new) — Ctrl/Cmd+K, normalizes
  `/api/search` results, includes static quick-nav links (+ Admin link when
  `canAccessAdminPanel()`), full keyboard nav. Replaces `SearchModal`.
- `components/Navbar.tsx` rebuilt on the new primitives — sticky, scroll-aware,
  search trigger with `⌘K` hint, flattened "More" dropdown (was a fragile
  hover-triggered nested flyout), language switcher folded into a dropdown,
  client-side router navigation throughout (was `window.location.href` in
  a few spots).
- `components/Footer.tsx`, `components/MobileBottomNav.tsx` rebuilt on the
  new primitives (bottom nav is now a floating pill, iOS/Vercel-style).
- `components/LanguageToggle.tsx`, `components/SearchModal.tsx` deleted
  (fully superseded, confirmed zero remaining references).
- `components/ui/Button.tsx` gained a `LinkButton` export (motion-wrapped
  `next/link`) since the design system needs button-styled links throughout.
- Verified: `type-check`, `lint`, dev-server render across `/`, `/login`,
  `/register`, `/admin`, `/sermons`, `/events`, `/gallery`, `/contact`.

### Phase 2 — Landing page
- `app/page.tsx` fully rebuilt: hero, live-now banner + live stream toggle,
  today's verse + next service band, announcements, quick actions, featured
  sermon, upcoming events, church stats, latest blog, gallery preview,
  prayer CTA, find-us + newsletter. All on existing `lib/content.ts` getters
  (`getServiceTimes`, `getSermons`, `getEvents`, `getBlogPosts`,
  `getEventGalleries`, `getLivestream` newly wired in at the page level;
  `getAnnouncements`/`getSiteSettings` already were) — no data-layer changes.
- `components/BibleVerse.tsx` reskinned onto tokens (kept all existing
  logic — version switcher, like/copy/share, sparkle animation — untouched).
- `components/NewsletterSignup.tsx` reskinned onto tokens.
- Verified: `type-check`, `lint`, dev-server render, no console/runtime
  errors in rendered HTML.

### Phase 3 — Core informational pages
- About/Beliefs, About/History, About/Pastors, About/Branches, Services,
  Services/Request, Contact, Community rebuilt on primitives. New
  `PageHero` primitive for consistent page headers. `ScriptureReference`
  reskinned. All functional behavior preserved (history search/filter/
  autoplay, pastor/branch detail modals now on the `Modal` primitive,
  multi-step contact form, react-hook-form service request).

### Phase 4 — Sermon experience
- Sermons list + detail rebuilt. Unified video modal (was three
  near-duplicate inline modals). New localStorage-backed "Continue
  Watching" strip. New `ShareButton` (Web Share API + clipboard fallback).
  Detail page stays a server component; gains related-sermons + breadcrumbs.

### Phase 5 — Event experience
- New `lib/eventCategories.ts` centralizes category-color config and the
  weekly-service→recurring-events expansion, previously duplicated across
  `events/page.tsx`, `EventModal.tsx`, `InteractiveCalendar.tsx`.
  `EventModal` rebuilt on `Modal`. `InteractiveCalendar` rebuilt on tokens.
  Event detail page gains a countdown, per-event map embed, share, and
  related events by category.

### Phase 6 — Blog experience
- List gains search/category filter + featured-post hero slot. Detail page
  gains a reading-progress bar, computed reading time, and a heuristic
  table of contents (`lib/blogContent.ts` — content is plain text with no
  markdown, so short non-sentence lines are treated as headings; TOC and
  article body share the same parser so they can't disagree) plus related
  posts by category. No new markdown dependency.

### Phase 7 — Gallery
- Album grid gains search/category filters. Individual event photo grid is
  now true masonry (CSS columns) with `IntersectionObserver`-based
  infinite scroll. New `PhotoLightbox` with arrow-key navigation. Submit-
  a-photo flow preserved exactly; success now surfaces via `ToastProvider`.

### Phase 8 — Remaining public pages
- Small Groups, Resources, Testimonials, Ministries (+contact/volunteer),
  top-level Volunteer, Give, Prayer, `/forms/[id]` (public form-render
  contract preserved exactly), `MemberDashboard`, Profile, Settings, Login,
  Register, Privacy, Terms, Offline — all rebuilt on primitives.
- Deleted all 10 legacy decorative components (`DivineButton`,
  `HeavenlyCard`, `DivineEffects`, `AnimatedBackground`, `AnimatedButton`,
  `AnimatedCard`, `HeavenlyBackground`, `PrayerEffects`, `SacredText`,
  `FloatingElements`) — confirmed zero remaining references before deleting.
- **Bug found and fixed:** `components/ui/PageHero.tsx` used framer-motion
  without `'use client'`. Silently broke (React falls back to client
  rendering) whenever a plain Server Component page was its first
  non-client ancestor — invisible everywhere it had only ever been used
  from already-`'use client'` pages, surfaced on the new Privacy/Terms
  pages. Fixed; audited every other `components/ui` file for the same gap
  (framer-motion/hooks without `'use client'`) — none found.
- Verified: type-check, lint, and a full 30-route sweep specifically
  re-checking for the "element type is invalid" signature (broader than
  earlier phases' spot checks).

### Phase 9 — Admin shell + DataTable primitive
- New `components/ui/DataTable.tsx`: sort/search/resizable/column-visibility/
  bulk-select/CSV export/keyboard nav, built entirely on the existing stack
  (papaparse for CSV, no new library) — the shared primitive Phases 10-11
  build every admin table on.
- `AdminLayout` rebuilt: collapsible sidebar, topbar with the same Ctrl/Cmd+K
  `CommandPalette` used on the public site, breadcrumbs, role badge.
  `ConfirmModal` rebuilt on `Modal` (same props API). Admin `States.tsx`
  now re-exports `components/ui/States`, instantly reskinning 14 files.
- New `components/PublicChrome.tsx`: public Navbar/Footer/MobileBottomNav/
  ambient-audio/PWA-prompt/cookie-notice now render only outside `/admin`,
  so the admin panel is its own immersive dashboard shell instead of
  nesting inside the public marketing chrome (explicit brief ask).

### Phase 10 — GenericContentTab reskin
- Rebuilt on `DataTable` — this one component drives 10 of the 13 admin
  Content tabs (Sermons, Events, Pastors, Ministries, Announcements, Blog,
  Small Groups, Testimonials, Resources, Redirects, plus every custom
  content type), so this single change visually transforms all of them.
  `MediaPickerModal` rebuilt on the same primitives. Draft/publish/schedule,
  CSV import/export, version history + restore, bulk delete, media picker
  wiring all preserved exactly; `alert()` calls replaced with `ToastProvider`.

### Phase 11 — Remaining admin screens
- Dashboard, Members (→ `DataTable`), Content tab-switcher (→ `Tabs`
  primitive) + its three bespoke tabs (Gallery, Site Settings, Content
  Types), Messages (hand-rolled expand-to-edit rows, not the `Accordion`
  primitive — the row header needs a two-column badge/name/subject/date
  layout `AccordionItem`'s single-line title doesn't fit; `aria-expanded`/
  `aria-controls` added directly instead), Media Library,
  Forms builder (submissions viewer → `DataTable`), Newsletter, Moderation
  Queue, Audit Log, Settings — every remaining admin screen rebuilt.
  All behavior preserved: role/suspend/delete flows, schema builders,
  media upload/copy/delete, campaign sending, feature toggles, JSON
  backup export, moderation approve/reject, audit before/after diff.

**This completes the full site rebuild — every public page and every
admin screen now runs on the design system.**

---

### Phase 12 — Motion/accessibility/performance pass
- Ran `tests/accessibility-new-pages.spec.ts` (axe-core) directly via
  `npx playwright test` (the `npm run axe` script's `--grep=@axe` filter
  doesn't match this file's test titles — pre-existing script/tag mismatch,
  left as-is since fixing it isn't a rendering/accessibility issue).
- **Bug found and fixed — real, high-impact:** `lib/cn.ts` used bare
  `twMerge()` with no knowledge of this project's custom Tailwind `fontSize`
  scale (`text-body-sm`, `text-caption`, `text-headline-md`, etc., defined in
  `tailwind.config.js`). tailwind-merge's default config doesn't recognize
  those names as a distinct "font-size" group, so it silently classified
  them as conflicting with `text-{color}` utilities and dropped whichever
  one appeared earlier in a `cn()` call — order-dependent and invisible at
  the type level. Confirmed two concrete failure modes:
  - `components/ui/Button.tsx`'s `buttonClasses()` puts the variant's text
    color first and the size class second, so **every primary/warm button
    and `LinkButton` was silently missing its text color** (falling back to
    inherited body text color — near-invisible/low-contrast on colored
    backgrounds like the indigo accent). This is what axe caught as a
    2.81:1 contrast failure on the `/resources` page's "Register" link.
  - `components/ui/Badge.tsx` puts the size class first and color second,
    so **every `Badge` was silently missing its `text-caption` sizing**
    (rendered at inherited/default font size instead of 12px).
  Fixed by switching to `extendTailwindMerge` with an explicit `font-size`
  class group listing the custom scale, so it no longer collides with
  `text-color`. Verified via direct `twMerge()` calls before/after, plus a
  clean `type-check`/`lint`/axe re-run.
- Also darkened `--foreground-subtle` in light mode (zinc-400 `#a1a1aa` →
  zinc-500 `#71717a`, matching the value dark mode already used) — even
  before the `cn()` fix, this token was independently too light for AA
  (2.45–2.56:1 against white/near-white surfaces) wherever it was actually
  rendering correctly. New value is ~4.6–4.8:1 against white/`#fafafa`.
- Re-ran the axe suite after both fixes: `/blog`, `/small-groups`,
  `/testimonials`, `/resources` — all 4 pass with zero critical/serious
  violations.
- **`prefers-reduced-motion` gap fixed:** the CSS override in `globals.css`
  only ever affected native CSS transitions/animations. It did nothing for
  Framer Motion's own JS-driven animations — `motion.div`, `whileTap`,
  `AnimatePresence`, `layoutId` — which drive nearly every animated element
  in this rebuild, and no `MotionConfig`/`useReducedMotion` existed anywhere
  in the codebase. Fixed by wrapping the app in
  `<MotionConfig reducedMotion="user">` inside `components/ClientLayout.tsx`
  (already a client component sitting just inside the providers in
  `app/layout.tsx`), which makes every Framer Motion animation in the app
  respect the OS-level setting with zero per-component changes.
- Extended `tests/accessibility-new-pages.spec.ts` from 4 pages to all 20
  static, unauthenticated top-level public routes (every route rebuilt this
  session except ones needing a session or a dynamic id). Running the wider
  sweep surfaced four more real, previously-undetected issues, all fixed:
  - **`lib/eventCategories.ts`**: every category's `dotClass`/
    `chipActiveClass` paired white text with a plain Tailwind `-500` shade
    (e.g. `bg-blue-500 text-white`) on small calendar/filter-chip labels —
    2.3:1-4.0:1 contrast, all fail AA's 4.5:1. Bumped each to the darkest
    shade that actually clears 4.5:1 (verified numerically): `-600` for
    blue/purple/pink/indigo/zinc, `-700` for green/orange (their `-600`
    still falls short).
  - **`--accent-warm` token** (`app/globals.css`): amber-600 with white
    foreground text only reaches 3.18:1. Several call sites (prayer page
    stat cards, homepage prayer CTA) also layer a translucent
    `bg-white/10` "glass card" or `opacity-90` text on top of it, which
    lightens the effective background further. Iterated amber-600 →
    amber-700 (fixes the flat-background case, ~5:1, but the glass-card
    case still measured 4.21:1) → **amber-800** (146 64 14), which keeps
    ~5.7-6:1 through both the card overlay and the opacity-90 text case.
  - `app/prayer/page.tsx`: the stat-card labels used `opacity-80` on white
    text on top of the (already marginal) warm background, compounding the
    contrast problem for no real design reason — swapped for a plain
    `text-body-sm` at full opacity.
  - **`components/InteractiveCalendar.tsx` — real critical (not just
    serious) bug**: blank leading/trailing grid cells (days outside the
    current month) rendered as `<button disabled>` with zero content and no
    `aria-label` — an interactive-role element with no accessible name at
    all (WCAG 4.1.2 / axe `button-name`, impact: critical). Fixed by
    rendering those cells as a plain non-interactive `<div aria-hidden>`
    instead of a button; real day cells are unaffected.
  - Two intermittent failures (`/about`, `/small-groups` on one run;
    `/prayer` differently on an earlier run) turned out to be a Next.js
    dev-server Fast-Refresh recompile-on-first-visit interrupting the page
    mid-scan (`Execution context was destroyed, most likely because of a
    navigation`) — self-heals on Playwright's existing retry, not a real
    defect; wouldn't occur against a production build. Bumped the
    post-navigation settle wait from 1000ms → 1500ms to reduce how often
    the Framer Motion entrance-transition false-positive (already
    documented in this file's comments) gets hit on slower dev-mode
    compiles.
  - Final state: all 20 pages pass with zero critical/serious violations.

### Phase 13 — Cleanup & full verification
- Orphan sweep across `components/` and `lib/` (reference-counted every
  top-level component, every `components/admin/*`, every `components/ui/*`,
  every `lib/*` module against the rest of the codebase):
  - Deleted `components/CountryCodeSelect.tsx` — a genuine orphan, zero
    references anywhere, unmodified since the original pre-rebuild commit.
  - `components/ui/Accordion.tsx`, `Drawer.tsx`, `Skeleton.tsx`, `Stack.tsx`,
    `Tooltip.tsx` currently have zero call sites. Left in place rather than
    deleted — these are correctly-built primitives from the component
    library itself (an explicit deliverable of the brief), not retired
    legacy one-offs; a shared UI library normally ships more primitives
    than any single page currently consumes. `Tooltip` in particular is
    superseded case-by-case by simpler native `title` attributes (see
    `IconButton.tsx`), which is a reasonable per-instance choice, not a gap.
  - Corrected a stale claim in this file's own Phase 11 entry: Messages
    does *not* use the `Accordion` primitive (its row header needs a
    two-column badge/name/subject/date layout that `AccordionItem`'s
    single-line title doesn't fit) — it's a hand-rolled expand/collapse.
    Added the `aria-expanded`/`aria-controls` pair it was missing while
    fixing the doc.
  - `lib/analytics.ts` (pre-existing GA helper, never wired to a provider)
    and `lib/bible-fallback.ts` (used internally by `lib/bible-api.ts` via
    a relative import, invisible to an `@/lib/...` grep) are not orphans in
    the way that matters — left untouched, out of scope for a frontend
    redesign either way.
- Full suite (`npm test` / `npx playwright test`, all 9 spec files —
  accessibility, admin-auth, admin-audit, admin-moderation-and-escalation,
  audit-log-daterange, enterprise-cms-flows, gallery-submission-e2e,
  rate-limiting, services-request-resilience): **149 passed, 1 flaky**
  (the same documented dev-server Fast-Refresh artifact, self-healed on
  Playwright's built-in retry). `admin-auth.spec.ts`'s 93 role-gating cases
  and every `enterprise-cms-flows.spec.ts` create/edit/restore/delete
  round-trip — the tests most likely to catch an accidental DOM/behavior
  change from three phases of admin UI work — all pass unchanged. Both
  suites operate at the API/`request.fetch` level rather than asserting on
  rendered DOM, which is also why they were structurally low-risk to this
  rebuild in the first place.
- Final `npm run type-check` and `npm run lint`: clean (one pre-existing,
  unrelated `react-hooks/exhaustive-deps` warning in `BibleVerse.tsx`).

---

## Rebuild complete

All 13 phases are done: every public page and every admin screen runs on
the new token-driven design system; the accessibility pass found and fixed
five real, previously-undetected defects (three contrast, one critical
missing-accessible-name bug, one app-wide `prefers-reduced-motion` gap) plus
a systemic `cn()`/tailwind-merge bug that was silently dropping text colors
and sizes across the component library; cleanup found one genuine orphaned
component; and the full Playwright suite (150 tests across 9 files,
including the 93-case admin role-gating suite and the enterprise CMS
round-trip tests) passes.

## Known issues carried forward (not introduced by this rebuild, not yet fixed)

## Known issues carried forward (not introduced by this rebuild, not yet fixed)

- `/api/search` doesn't filter `sermons`/`events`/`announcements`/`gallery`
  by draft status (pre-existing; only the newly-added `blogPosts` key is
  filtered, since fixing the other four is a behavior change out of scope
  for an "additive" Phase 1 extension).
- `notFound()` returns HTTP 200 on `/blog/[slug]`, `/events/[id]`,
  `/sermons/[id]` (documented Next.js/Suspense interaction, see
  `SITE_OVERVIEW.md` §18 — not a frontend styling issue, out of scope here).
- `DynamicLiveStream.tsx` not yet reskinned onto tokens (functional, visually
  acceptable, low priority).
