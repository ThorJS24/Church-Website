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
  Types), Messages (→ `Accordion` for expand-to-edit rows), Media Library,
  Forms builder (submissions viewer → `DataTable`), Newsletter, Moderation
  Queue, Audit Log, Settings — every remaining admin screen rebuilt.
  All behavior preserved: role/suspend/delete flows, schema builders,
  media upload/copy/delete, campaign sending, feature toggles, JSON
  backup export, moderation approve/reject, audit before/after diff.

**This completes the full site rebuild — every public page and every
admin screen now runs on the design system.**

---

## Remaining (see plan for full detail)

- Phase 12 — Motion/accessibility/performance pass
- Phase 13 — Cleanup & full verification (full Playwright suite)

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
