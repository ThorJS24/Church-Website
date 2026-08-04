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

---

## Remaining (see plan for full detail)

- Phase 3 — Core informational pages (About/History/Pastors/Beliefs/Branches,
  Services, Contact, Community)
- Phase 4 — Sermon experience
- Phase 5 — Event experience
- Phase 6 — Blog experience
- Phase 7 — Gallery
- Phase 8 — Remaining public pages (Ministries, Small Groups, Testimonials,
  Resources, Give, Prayer, Volunteer, Forms renderer, Dashboard, Profile,
  Settings, Login, Register, Privacy, Terms, Offline)
- Phase 9 — Admin shell + shared `DataTable` primitive
- Phase 10 — `GenericContentTab` reskin (covers 10/13 content tabs at once)
- Phase 11 — Remaining admin screens
- Phase 12 — Motion/accessibility/performance pass
- Phase 13 — Cleanup & full verification (delete retired components once
  unreferenced, full Playwright suite)

## Components still pending retirement (in active use by unmigrated pages)

`DivineButton`, `HeavenlyCard`, `AnimatedButton`, `AnimatedCard`,
`DivineEffects`, `HeavenlyBackground`, `AnimatedBackground`, `FloatingElements`,
`SacredText`, `PrayerEffects` — still referenced by `app/gallery`,
`app/sermons`, `app/prayer`, `app/about/branches`, `app/community`,
`app/about/beliefs`. Delete each only once its call sites are migrated in
the corresponding phase above and `grep` confirms zero remaining references.

## Known issues carried forward (not introduced by this rebuild, not yet fixed)

- `/api/search` doesn't filter `sermons`/`events`/`announcements`/`gallery`
  by draft status (pre-existing; only the newly-added `blogPosts` key is
  filtered, since fixing the other four is a behavior change out of scope
  for an "additive" Phase 1 extension).
- `notFound()` returns HTTP 200 on `/blog/[slug]`, `/events/[id]`,
  `/sermons/[id]` (documented Next.js/Suspense interaction, see
  `SITE_OVERVIEW.md` §18 — not a frontend styling issue, out of scope here).
- `DynamicLiveStream.tsx` not yet reskinned onto tokens (functional, visually
  acceptable, low priority — candidate for a polish pass during Phase 4).
