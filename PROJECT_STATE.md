# PROJECT_STATE.md — Salem PBC Website: Technical Handoff

**Audit date:** 2026-08-25
**Branch audited:** `redesign/warm-rebuild` (60 commits ahead of `main`, not yet merged; clean working tree at audit time)
**Audited by:** Claude, via direct code inspection + 4 parallel read-only research passes. This document is a factual snapshot of what exists, not a design or architecture recommendation.

> **Read this before touching anything.** This project already has working authentication, a working database layer, working settings persistence, and ~90 working API routes. Do not rebuild any of that. The one thing that is explicitly *not* preserved is the visual UI — see §15.

---

## 0. Document Provenance & Trust Notes

This audit leaned heavily on an existing in-repo document, **`SITE_OVERVIEW.md`** (dated 2026-08-04), which is itself a careful, code-verified snapshot — and on four parallel research passes performed today that re-verified and extended it against the current code. Where this document and `SITE_OVERVIEW.md` disagree, **this document is newer and was re-verified today**; `SITE_OVERVIEW.md` is now stale in specific, named ways (below).

**Do NOT trust these other root-level docs as current state** — they were spot-checked and found to describe earlier eras of the project (pre-Firestore-migration-era language, TTS/Tamil-i18n-rollout framing, a navy/gold palette that no longer exists):
- `AUDIT_SUMMARY.md`, `CHANGELOG.md` — stale, an older project era.
- `REBUILD_PROGRESS.md` — documents the **first** frontend rebuild (`redesign/design-system` branch, already merged to `main`). Historically accurate for that rebuild, but superseded visually.
- `REBUILD_PROGRESS_V2.md` — documents the **second** frontend rebuild on the current branch, but its stated palette ("deep navy primary `#1D3557`, antique gold secondary `#8A5E18`") **is no longer the current palette** — it was replaced by "Terracotta Earth" (sandstone/clay/olive) in a later commit on the same branch (`27301fc`), and the header/settings were further restructured after that. Trust it for architecture/methodology, not current visuals.
- `FEATURE_BUILD_PLAN.md`, `UI_UX_ENHANCEMENT_PLAN.md` — planning documents; many items are now built (confirmed via git log: batches P1–P19, A1–A10 all landed).

**Specific known drift from `SITE_OVERVIEW.md` (Aug 4) confirmed today:**
- It says "56 route files" for the API — **actual current count is 89** `route.ts` files (confirmed via `find app/api -name route.ts | wc -l`). Many features (RSVP/waitlist, volunteer hours, resource ratings, saved items, in-app notifications, moderation-reason templates, message templates, form submissions, etc.) were added after that snapshot.
- Its palette/component descriptions predate two full frontend rebuilds that happened after it was written.
- Everything else in it (data model, auth model, architecture split, security model, third-party integrations, deployment) was **re-verified today and found accurate** — it remains a trustworthy source for those sections.

---

## 1. Project Overview

- **Name:** Salem Primitive Baptist Church website (package name `salem-primitive-baptist-church`).
- **Purpose:** Public church website + light membership system + custom in-house CMS/admin panel for a single congregation in Salem, Tamil Nadu, India. Live at `salempbc.in` (per `SITE_OVERVIEW.md`; not independently re-verified today).
- **Target users:** (1) Public visitors — sermons, events, gallery, giving info, prayer requests, contact, blog, testimonials, resources, small groups. (2) Members — personal dashboard, profile, settings, saved items, volunteer hour logging, resource ratings. (3) Staff/admins — full content CMS, moderation queue, forms builder, newsletter, member management, audit log — no code deploy needed for day-to-day content changes.
- **Frontend:** Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Backend:** Next.js API routes (`app/api/**/route.ts`), Node runtime, no separate backend server. Firebase Admin SDK for all privileged server-side data access.
- **Database:** Cloud Firestore (NoSQL document store). No ORM — all reads/writes are direct Firestore calls.
- **Authentication:** Firebase Authentication (email/password). No OAuth flow currently wired up despite Google sign-in code existing unused in `lib/firebase.ts`.
- **Hosting/deployment:** Vercel for the app (`vercel --prod` in `package.json`'s `deploy` script); Firestore rules/indexes deployed separately via Firebase CLI. See §16 for a documented chain of past Vercel-only production failures.
- **Package manager:** npm (`package-lock.json` present).
- **Key frameworks/libraries:** Tailwind CSS v4, shadcn/ui component patterns on Radix UI primitives, `class-variance-authority`, `motion` (Framer Motion successor), `lucide-react` icons, `react-hook-form`, `zod`, `sonner` (toasts), `cmdk` (command palette), `@tanstack/react-table` (installed, not yet used for the real DataTable — see §8), Cloudinary (media), Resend (email), Sentry (errors), Playwright (integration tests).
- **Project structure:** Standard Next.js App Router layout — see §18.

---

## 2. Current Architecture

### Frontend
- **Framework/routing:** Next.js 15 App Router. Most public pages are Client Components (`'use client'`) that fetch Firestore data client-side after mount and are statically prerendered. A growing subset are Server Components fetching at request time for SEO (`/blog/[slug]`, `/events/[id]`, `/sermons/[id]`, `/about/beliefs`, `/events`, `/sermons`, homepage `/`, and others — the count of Server Components has grown since Aug 4; see commits `bfdd4d2`, `f4164bc`, `972d1de`, `989c485` converting several list pages to Server Components).
- **State management:** No global state library (no Redux/Zustand). App-level state lives in React Context: `AuthContext`, `ThemeContext`, `LanguageContext`, `AccessibilityContext`, `LoadingContext` (all in `contexts/`). Page-local state is `useState`/`useEffect`.
- **Styling system:** Tailwind CSS v4 (CSS-first `@theme` config in `app/globals.css`, not a `tailwind.config.js`), shadcn/ui-pattern components in `components/ui/`, a hand-authored warm color-token system (see §15). No CSS-in-JS.
- **Component architecture:** A `components/ui/` primitive library (buttons, cards, inputs, modals, etc. — full inventory in §8) consumed by page-level and feature components in `components/`, `components/admin/`, `components/about/`, `components/events/`, `components/home/`, `components/sermons/`.
- **Data fetching:** Client-side via the Firebase **client SDK** (`lib/firebase.ts`, public reads governed by `firestore.rules`) for most public pages, or via `fetch()` to internal API routes with a `Authorization: Bearer <Firebase ID token>` header for anything requiring privilege. Server Components fetch directly via `lib/content.ts`'s helper functions at request time.
- **Forms:** Mix of hand-rolled `useState`-driven forms and `react-hook-form` (e.g. `services/request`). Client-side validation is ad hoc per form (no single shared validation layer) plus `zod` is a dependency (used in places, not universally).
- **Authentication handling (frontend):** `contexts/AuthContext.tsx` wraps Firebase Auth's `onAuthStateChanged` listener; exposes `user`, `isLoading`, and methods (`login`, `register`, `logout`, `changePassword`, `updateUser`, permission helpers). No password-reset method exists yet (see §11).

### Backend
- **Framework/runtime:** Next.js API routes under `app/api/**/route.ts`, one file per route, exporting named `GET`/`POST`/`PUT`/`PATCH`/`DELETE` functions. Node.js runtime (not Edge) for API routes; `middleware.ts` runs on the Edge runtime.
- **API structure:** 89 `route.ts` files. Full inventory in §4/§9. Organized by area: `admin/*` (privileged CMS operations), public content-facing (`sermons`, `events`, `gallery`, etc. read via `lib/content.ts` directly, not API routes, for GET; API routes handle public POST/write operations), `member/*` (authenticated member self-service).
- **Authentication (backend):** Every protected API route calls a shared helper from `lib/api-auth.ts` (`requireAuth`/`requireModerator`/`requireAdmin`/`requireSuperAdmin`) which verifies the caller's Firebase ID token server-side via the Admin SDK and reads their role from Firestore — **the client-supplied role is never trusted**. See §11 for full detail.
- **Authorization:** Role-based, 4 tiers (`member < moderator < admin < super_admin`), single source of truth is `lib/permissions.ts`'s `UserRole` enum + `ROLE_LEVEL`/`ROLE_PERMISSIONS`, mirrored independently in `firestore.rules` (for the client-SDK access path) and in `lib/api-auth.ts` (for the API-route path). No parallel/competing role system exists.
- **Database access:** Two deliberately separate paths — `lib/firebase.ts` (client SDK, subject to `firestore.rules`) and `lib/firebase-admin.ts` (Admin SDK, bypasses rules entirely, used by every `app/api/**` route). `lib/firebase-admin.ts` uses **lazy initialization** (`getAdminApp()`/`getAdminAuth()`/`getAdminDb()` only construct on first use inside a request handler) — this is deliberate, documented, and load-bearing: eager init would break `next build` on any machine without `FIREBASE_ADMIN_*` env vars set, since Next.js imports every route module during build.
- **Services:** `lib/resend.ts` (email, lazy-init singleton — see §16 for why), `lib/cloudinary.ts` (media upload), `lib/bible-api.ts`/`lib/bible-fallback.ts` (external Bible API + local fallback), `lib/rateLimit.ts` (Firestore-transaction-backed rate limiting, survives cold starts), `lib/notifications.ts` (in-app notification writes), `lib/contentVersions.ts` (version-history snapshots), `lib/analytics.ts`, `lib/zip.ts` (gallery album ZIP download streaming).
- **Middleware:** `middleware.ts` runs on every request (Edge runtime). **It does zero authentication or route-protection work** — it only sets security headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.) and a per-route-type `Cache-Control` policy. All auth/redirect logic lives client-side (page-level guards) and server-side (per-API-route checks). This is a load-bearing fact for anyone redesigning routing: **there is no central route-protection config to update** — protection is inline in each guarded component/route.
- **Validation:** Per-route, hand-rolled (required-field checks, regex patterns for slugs, length checks). `zod` is a dependency but not universally applied across every route.

### Database
- **Technology:** Cloud Firestore, no ORM, ~38 collections in active use (full list in §10).
- **Schema/models:** No formal schema enforcement (Firestore is schemaless) — the closest thing to a schema is `lib/content.ts` (the real, actively-used source of truth for all public-content TypeScript interfaces + their fetch functions) plus a handful of Firestore rules validation checks. **`models/` (except `models/User.ts`) and `types/index.ts` are dead/legacy code** — see §10 for specifics; do not treat them as current schema.
- **Relationships:** Mostly denormalized/string-matched rather than true foreign keys (e.g. sermon series matched by `seriesTitle` string, not a series ID; event galleries joined by `eventId`). `customContent` docs are partitioned by a `contentType` string field rather than separate collections per admin-defined type (deliberate — avoids needing a `firestore.rules` redeploy every time an admin defines a new content type).
- **Migrations:** None in the traditional sense (schemaless DB). One seed script: `scripts/seed-firestore-content.js` (idempotent, merge-safe, seeds `siteSettings`, `pageContent`, starter `services`, singleton `ambientAudio`/`livestream` docs, and the `volunteer-opportunities` custom content-type definition — does NOT seed sermons/events/gallery/pastors/ministries/announcements/history, left empty by design for admin-panel entry).
- **Seed data:** See above — minimal, intentionally so.

---

## 3. Route Inventory

### 3a. Public & Account Page Routes

| Route | Purpose | Auth | Status | Notable functionality |
|---|---|---|---|---|
| `/` | Homepage | Public | Working | Hero, daily verse, next service, week-at-a-glance, announcements, sermon carousel, event countdown, stats, testimonials, blog highlights, gallery preview, prayer CTA, newsletter signup. Server Component. |
| `/about` | Redirect | Public | Working | Server redirect → `/about/beliefs`. |
| `/about/beliefs` | Beliefs/mission | Public | Working | Server Component (revalidate=300). |
| `/about/branches` | Branch locations | Public | Working | Image carousel, map, service times. |
| `/about/history` | Church history | Public | Working | Searchable/filterable timeline. |
| `/about/pastors` | Pastoral team | Public | Working | Bio modal cross-referenced against sermons by speaker name. |
| `/blog`, `/blog/[slug]` | Blog | Public | Working | `[slug]` is a Server Component with JSON-LD. |
| `/blog/author/[name]`, `/blog/category/[category]` | Blog filters | Public | Working | Server Components. |
| `/blog/feed.xml` | RSS | Public | Working | Outside `/api`, latest 50 posts. |
| `/community` | Community/outreach | Public | Working | Includes a "community survey" form → `/api/contact`. |
| `/contact` | Contact | Public | Working | 3-step multi-category form → `/api/contact`. |
| `/dashboard` | Member dashboard | **Auth required** | Working | Inline gate in `MemberDashboard.tsx` (no redirect, shows "please log in" message). |
| `/events`, `/events/[id]` | Events | Public | Working | Calendar + list; `[id]` has RSVP, countdown, cancellation banner, JSON-LD. |
| `/forms/[id]` | Public form renderer | Public | Working | Renders any admin-defined form; multi-step, localStorage draft autosave, file uploads. |
| `/gallery` | Photo gallery | Public (members-only albums gated) | Working | Masonry/lightbox, like/comment, ZIP download, public submission. |
| `/give`, `/give/legacy` | Giving info | Public | Working, **intentionally no payment processing** | See §19-equivalent in "Explicitly Not Built" below. |
| `/login` | Sign in | Public (redirects if signed in) | Working | |
| `/ministries`, `/ministries/[id]`, `/ministries/contact`, `/ministries/volunteer` | Ministries | Public | Working | Contact/volunteer forms → `/api/contact`. |
| `/newsletter/archive`, `/newsletter/archive/[id]` | Newsletter archive | Public | Working | |
| `/newsletter/preferences` | Newsletter prefs | Public, token-authenticated (`?token=`) | Working | No login required — token-based like an unsubscribe link. |
| `/offline` | PWA fallback | Public | Working | |
| `/prayer` | Prayer wall | Public (optional auth) | Working | Active/answered tabs, category filter, "pray for this" tally. |
| `/privacy`, `/terms` | Legal | Public | Working | Version-diff viewer, print button. |
| `/profile` | Member profile | **Auth required** (redirects to `/login`) | Working | Editable name/phone/address/DOB, completeness meter. |
| `/register` | Sign up | Public (redirects if signed in) | Working | 2-step; always creates `role: 'member'`. |
| `/resources` | Downloadable resources | Public (rating requires sign-in) | Working | Bookmarking (localStorage), star ratings. |
| `/sermons`, `/sermons/[id]`, `/sermons/series/[id]` | Sermons | Public | Working | Video, transcript, audio download, JSON-LD. |
| `/services`, `/services/request`, `/services/request/status` | Services | Public | Working | Wedding/baptism request form (`react-hook-form`) + status tracker. |
| `/settings` | Account settings | **Auth required** (redirects to `/login`) | Working — **just redesigned today**, see §12 and §15 | Notification/privacy toggles, password change, account deletion request. |
| `/small-groups`, `/small-groups/[id]` | Small groups | Public | Working | Capacity bar, join/waitlist → `/api/contact`. |
| `/testimonials` | Testimonials | Public | Working | Submission → `/api/testimonials/submit`. |
| `/volunteer` | Volunteer | Public (hour-logging requires sign-in) | Working | Opportunity sign-up, hour log, application form. |
| `/podcast.xml` | Podcast RSS | Public | Working | Sermons with `audioUrl` set only. |
| `/sitemap.xml` (dynamic), `/robots.txt` (static) | SEO | Public | Working | |

### 3b. Admin Panel Routes (all under `/admin/*`, gated by `components/admin/AdminLayout.tsx` — client-side redirect if `!canAccessAdminPanel()`, i.e. below MODERATOR)

| Route | Min role | Purpose |
|---|---|---|
| `/admin` | moderator (reduced view) / admin (full) | Dashboard — stats, membership breakdown, recent admin actions, "needs attention" feed, new-member welcome queue, announcement composer. |
| `/admin/audit-log` | admin | Filterable audit log, CSV export, saved filter presets, per-target history. |
| `/admin/content` | admin | Tabbed CRUD for 14+ content types + custom-type schema builder. Shared `GenericContentTab` component drives all of it. |
| `/admin/forms` | admin | Form builder (conditional-field logic), submissions viewer/export. |
| `/admin/media` | admin | Media library — upload, dedupe detection, trash/restore, usage lookup. |
| `/admin/messages` | admin | Unified contact + service-request inbox, reply (Resend), internal comments. |
| `/admin/moderation` | moderator | Approve/reject queue: prayer requests, comments, gallery, testimonials. |
| `/admin/newsletter` | admin | Campaign composer, subscriber/tag management. |
| `/admin/settings` | admin | Feature flags, theme accent color, service times, backup export/restore (restore is super_admin-only server-side), **read-only** role/permission matrix. |
| `/admin/users` | admin (role-change is super_admin-only) | Member table, CSV import, suspend/reactivate/delete, bulk email. |

**Important:** the admin *page* client-side gate (`AdminLayout.tsx`) only checks `canAccessAdminPanel()` (moderator+). It is **not** the real security boundary — each underlying API route independently re-checks the actual required role server-side. A future UI redesign must preserve both layers; do not assume the page-level gate alone is sufficient.

### 3c. API Routes

**89 total `route.ts` files.** Full per-route detail (method, purpose, auth level, Firestore collection(s) touched) was captured in the research pass and is extensive — see the condensed groupings below; if implementing against a specific route, read that route file directly rather than trusting a table transcription for exact request/response shape.

| Area | Routes (representative, not exhaustive — see subsections) | Auth pattern |
|---|---|---|
| Admin — audit/backup | `/api/admin/audit-log`, `/api/admin/backup`, `/api/admin/backup/restore` | requireAdmin / requireSuperAdmin (restore) |
| Admin — generic content CRUD | `/api/admin/content/[type]`, `.../[id]`, `.../versions`, `.../versions/[versionId]/restore` | requireAdmin |
| Admin — custom content types (schema builder) | `/api/admin/content-types`, `/api/admin/content-types/[slug]`, `/api/admin/custom-content/[slug]`, `.../[id]` (+versions/restore) | requireAdmin |
| Admin — blog (separate CRUD family, slug-as-doc-id) | `/api/admin/blog`, `/api/admin/blog/[slug]` (+versions/restore) | requireAdmin |
| Admin — content search/tags | `/api/admin/content-search`, `/api/admin/content-tags` | requireAdmin |
| Admin — events | `/api/admin/events/[id]/cancel-broadcast`, `/api/admin/events/[id]/registrations` | requireAdmin |
| Admin — forms | `/api/admin/forms`, `/api/admin/forms/[id]`, `.../submissions`, `.../submissions/[submissionId]` | requireAdmin (submissions list is requireModerator) |
| Admin — gallery/media | `/api/admin/gallery`, `/api/admin/gallery/[id]`, `/api/admin/gallery/upload`, `/api/admin/media`, `/api/admin/media/[id]`, `.../restore`, `.../usage` | requireAdmin |
| Admin — messages/moderation | `/api/admin/messages`, `.../[collection]/[id]`, `.../reply`, `.../comment`, `/api/admin/message-templates`(+`[id]`), `/api/admin/moderation`, `.../[collection]/[id]`, `/api/admin/moderation-reasons`(+`[id]`) | requireAdmin (moderation routes: requireModerator) |
| Admin — newsletter | `/api/admin/newsletter/campaigns`, `/api/admin/newsletter/subscribers`(+`[id]`) | requireAdmin |
| Admin — misc | `/api/admin/not-found-report`(+`[id]`), `/api/admin/settings`, `/api/admin/stats`, `/api/admin/system-health`, `/api/admin/users`(+`/email`) | requireAdmin (users PUT role-change is requireSuperAdmin) |
| Public content-facing | `/api/ambient-audio`, `/api/bible/verse`, `/api/contact`, `/api/docs`, `/api/health`, `/api/not-found-log`, `/api/search` | Public, several rate-limited |
| Events (public) | `/api/events/[id]/attendee-count`, `/api/events/[id]/rsvp` (GET/POST/DELETE), `/api/events/ical` | Public, rate-limited on POST |
| Forms (public) | `/api/forms/[id]`, `/api/forms/[id]/submit` | Public, rate-limited |
| Gallery (public) | `/api/gallery/album/[eventId]/download`, `/api/gallery/comment`, `/api/gallery/like`, `/api/gallery/submit`, `/api/gallery/view` | Public, rate-limited (album download requires auth if event is members-only) |
| Livestream | `/api/livestream` (GET public, PATCH requireAdmin), `/api/livestream/chat` | Public GET/POST, rate-limited |
| Member (auth required) | `/api/member/dashboard`, `/api/member/notifications`(+`[id]/read`), `/api/member/saved` | requireAuth |
| Newsletter (public) | `/api/newsletter/archive`(+`[id]`), `/api/newsletter/preferences`, `/api/newsletter/subscribe`, `/api/newsletter/unsubscribe` | Public, some token-authenticated |
| Prayer/Privacy/Resources/Services/Testimonials/Volunteer | `/api/prayer`(+`/pray`), `/api/privacy/delete-account`, `/api/privacy/download-data`, `/api/resources/rate`, `/api/services/request`(+`/[id]`), `/api/testimonials/submit`, `/api/volunteer/hours` | Mix — see §4/§11/§12 for the ones that matter most |

**Confirmed dead/stale findings (do not build against these as if real):**
- `/api/docs` (self-documenting API description) **references three endpoints that do not exist**: `/api/donations/history`, `/api/notifications/sms`, `/api/webhooks`. Stale/aspirational documentation — do not trust `/api/docs` output as ground truth; read the actual route files.
- `/api/health` is a static stub (`{status:'healthy'}` unconditionally) with **no real dependency check** — if wired to an uptime monitor, it will never report an outage. The real health check is the admin-only `/api/admin/system-health`.
- `/api/tts` (AWS Polly text-to-speech) is **fully built and functional but orphaned** — no UI component calls it (per `SITE_OVERVIEW.md`, not independently re-verified today but no contradicting evidence found).

---

## 4. Functionality Inventory

Only features actually confirmed present. Status is based on code inspection, not live testing (Playwright suite was not re-run during this audit — see §13).

### Registration
- **What it does:** Email/password account creation, 2-step form (credentials → membership status/referral source).
- **Where:** `app/register/page.tsx`.
- **Frontend:** Client component, client-side password-strength meter, validation (length ≥6, confirm-match).
- **Backend/API:** No API route — direct Firebase Auth SDK call (`createUserWithEmailAndPassword`) + direct Firestore write (`users/{uid}`) via `contexts/AuthContext.tsx` → `lib/firebase.ts`.
- **Database:** `users/{uid}` document created with `role: 'member'` always (no client can self-register as anything higher).
- **Auth/permissions:** N/A (this creates the identity).
- **Status:** Working.
- **Known issues:** None found.

### Login
- **What it does:** Email/password sign-in.
- **Where:** `app/login/page.tsx`.
- **Backend:** Firebase Auth SDK (`signInWithEmailAndPassword`), no custom API call.
- **Status:** Working.
- **Known issues:** No "forgot password" link/flow exists on this page (the backend method doesn't exist either — see §11).

### Logout
- **What it does:** Signs out via Firebase Auth (`signOut`), clears local `user` state.
- **Where:** `AuthContext.logout()`, called from Navbar dropdown and mobile drawer.
- **Status:** Working.

### Password change
- **What it does:** Re-authenticates with current password, then updates to a new one.
- **Where:** `app/settings/page.tsx` (inline form) → `AuthContext.changePassword()` → `lib/firebase.ts`'s `changeUserPassword()`.
- **Backend:** Pure Firebase Auth SDK operation (`reauthenticateWithCredential` + `updatePassword`). **No Firestore write, no API route.**
- **Status:** Working.
- **Known issues:** Throws on error rather than returning a boolean, unlike `login`/`register`/`updateUser` — inconsistent error-handling contract to be aware of if touching this code.

### Password reset ("forgot password")
- **Status: DOES NOT EXIST.** No `sendPasswordResetEmail` call, no `/forgot-password` route, no UI entry point anywhere in the codebase. If required, this is new functionality to build (Firebase supports it natively — `sendPasswordResetEmail(auth, email)` — just isn't wired up).

### Profile management
- **What it does:** Edit name/phone/address/DOB; shows a profile-completeness meter.
- **Where:** `app/profile/page.tsx`.
- **Backend:** Direct Firestore write via `AuthContext.updateUser()` (same mechanism as Settings — see below).
- **Status:** Working.

### Settings (Communication Preferences, Privacy, Account)
See §12 for full field-by-field detail. Summary: **all working**, all persist to `users/{uid}` via direct client-SDK writes except account deletion (which goes through an API route). **The page's visual redesign happened today (this session)** — functionality untouched.

### Account deletion
- **What it does:** Submits a **request for staff review**, not an instant/hard delete.
- **Where:** `app/settings/page.tsx` → `DELETE /api/privacy/delete-account`.
- **Backend:** `app/api/privacy/delete-account/route.ts` — writes a `accountDeletionRequests` doc (`status: 'pending'`), sends 2 best-effort emails via Resend (admin notification + requester confirmation). **The user account and their `users/{uid}` doc are left completely untouched by this endpoint.**
- **Status:** Working as designed. This is a deliberate architectural choice (documented in-code) to avoid orphaning records in other collections with no defined cascade policy — **do not "fix" this into a real delete without a deliberate product decision**.

### Events (browsing, RSVP, calendar)
- **What it does:** Public event list/calendar, event detail pages, RSVP with waitlist auto-promotion, personal iCal export, attendee counts, admin cancellation broadcasts.
- **Where:** `app/events/**`, `app/api/events/**`, `app/api/admin/events/**`.
- **Status:** Working, feature-rich (added in Batch P5 "RSVP, waitlist, iCal, cancellation, photos" per git history).

### Sermons
- **What it does:** Sermon library with video/audio, transcripts, series grouping, scripture references, "save to library."
- **Where:** `app/sermons/**`, `lib/content.ts`.
- **Status:** Working.

### Gallery
- **What it does:** Photo albums (event-linked), masonry layout, lightbox, likes/comments, ZIP download, public submission (moderated), members-only album gating.
- **Where:** `app/gallery/page.tsx`, `app/api/gallery/**`, `app/api/admin/gallery/**`.
- **Status:** Working.

### Prayer wall
- **What it does:** Public prayer request submission (moderated), active/answered views, category filter, "pray for this" tally counter.
- **Where:** `app/prayer/page.tsx`, `app/api/prayer/**`.
- **Status:** Working. **One inconsistency noted:** `app/api/prayer/route.ts`'s GET handler uses the client Firebase SDK rather than the Admin SDK every other route uses — appears intentional (reads only public/approved/non-private docs) but is a pattern outlier worth knowing about.

### Giving
- **What it does:** Informational only — bank transfer instructions, fund designation guidance, impact stats, FAQ. **No online payment processing.**
- **Where:** `app/give/page.tsx`, `app/give/legacy/page.tsx`.
- **Status:** Working as designed — this is a **deliberate, documented decision**, not an unfinished feature (pending real bank/merchant details from the church). Do not silently add a fake "Donate" button.

### Communication preferences / Privacy settings
See §12.

### Search
- **What it does:** Cross-content search over sermons/events/announcements/gallery/blogPosts/formDefinitions.
- **Where:** `app/api/search/route.ts`, triggered from `CommandPalette.tsx` (Cmd/Ctrl+K).
- **Status:** Working, rate-limited. **Known gap (per `SITE_OVERVIEW.md`, not re-verified today):** does not filter `sermons`/`events`/`announcements`/`gallery` by draft status.

### Language (i18n)
- **What it does:** English/Tamil toggle via a hand-rolled key→string dictionary (not `next-intl`, which was tried and removed).
- **Where:** `contexts/LanguageContext.tsx`, `components/i18n/`.
- **Status:** Working for the pages explicitly covered (homepage, services, contact, prayer, give, about — per commit `040b5ea` "Phase G: scoped Tamil/i18n coverage"). **Coverage is scoped, not sitewide** — missing keys fall back to rendering the raw key rather than crashing, which is a deliberate degradation strategy, not a bug.

### Theme (light/dark)
- **What it does:** Light/dark mode toggle, plus a separate high-contrast accessibility mode.
- **Where:** `contexts/ThemeContext.tsx`, toggle in `Navbar.tsx`.
- **Status:** Working.

### Notifications (in-app)
- **What it does:** Bell icon in header, dropdown list of the member's notifications, mark-as-read.
- **Where:** `components/NotificationBell.tsx`, `app/api/member/notifications/**`, `lib/notifications.ts`.
- **Status:** Working. Notifications are queried by email match (not uid), keyed in the `notifications` collection.

### Admin CMS (content management)
- **What it does:** Draft/publish + scheduling, version history + restore, media library with a picker, bulk CSV import/export, bulk delete — shared across 14+ content-type tabs via one `GenericContentTab` component, plus a no-code custom content-type schema builder.
- **Where:** `app/admin/content/**`, `components/admin/content/**`, `app/api/admin/content/**`, `app/api/admin/custom-content/**`.
- **Status:** Working, described as "the single highest-leverage admin change" during the second rebuild (reskinning `GenericContentTab` transformed all 14+ tabs at once).

### Admin moderation queue
- **What it does:** Unified approve/reject queue for prayer requests, comments, gallery submissions, testimonials.
- **Where:** `app/admin/moderation/page.tsx`, `app/api/admin/moderation/**`.
- **Status:** Working.

### Admin audit log
- **What it does:** Append-only log of every admin mutation (actor, action, before/after diff, IP), filterable, CSV-exportable.
- **Where:** `app/admin/audit-log/page.tsx`, `app/api/admin/audit-log/**`, written via `lib/api-auth.ts`'s `withAudit()`.
- **Status:** Working. Clients cannot write to `auditLog` directly (Admin-SDK-only).

### PWA / offline
- **What it does:** Installable app, service worker, offline fallback page.
- **Where:** `next-pwa` config, `app/offline/page.tsx`, `components/PWAInstallPrompt.tsx`.
- **Status:** Working (per `SITE_OVERVIEW.md`; service worker only generated in production builds, disabled in dev).

---

## 5. DO NOT BREAK THESE

This section is the load-bearing one for a future redesign. Everything below is verified-working functionality that a visual redesign must route through unchanged.

- **Registration writes `users/{uid}` via `lib/firebase.ts`'s `createUserProfile`, always forcing `role: 'member'`.** Never let a redesign accidentally expose a role field on the signup form, and never let a redesign bypass this function to write the profile a different way.
- **Login/logout/session are entirely Firebase Auth SDK-driven**, subscribed via `onAuthStateChanged` in `AuthContext`. There is no custom cookie/JWT session to reimplement. Do not invent a parallel session mechanism.
- **API routes authenticate via `Authorization: Bearer <Firebase ID token>`**, obtained client-side via `getIdToken()` in `lib/firebase.ts`. Any new authenticated fetch call from a redesigned component must follow this exact pattern (see `app/settings/page.tsx`'s `handleDeleteAccount` for the canonical example).
- **Middleware does no auth/route-protection work.** Do not assume adding a new protected route "just works" via middleware — it needs its own client-side guard (pattern: `AdminLayout.tsx` or `MemberDashboard.tsx`'s inline check) AND its own server-side `requireX()` call in the API route.
- **Role checks always happen server-side against Firestore, never trusting a client-supplied role.** `lib/api-auth.ts`'s `requireRole()` is the single implementation — do not duplicate this logic inline in a new route; import and use it.
- **Settings persistence:** notification preferences (6 booleans) and privacy preferences (2 booleans) save together, as one `updateDoc` call, only on explicit "Save" — this is intentional batching, not two separate saves. The exact field names (`email`, `events`, `prayers`, `newsletter`, `sermons`, `volunteerOpportunities`, `profileVisible`, `contactVisible`) are the real Firestore field names on `users/{uid}.notificationPreferences`/`.privacyPreferences` — do not rename them without a migration plan.
- **Account deletion is a request-for-review, not a real delete.** A redesign must keep this expectation visible to the user (do not imply instant deletion in new copy/UI).
- **Password change re-authenticates before updating** (Firebase requirement) — this is not optional defensive code, it will fail without it.
- **`accountDeletionRequests`, `auditLog`, `rateLimits`, `contentVersions`, `notFoundHits` and most `newsletter*`/`admin*`-only collections are Admin-SDK-only** (no direct client writes possible, enforced by `firestore.rules`'s default-deny catch-all even where no explicit rule exists). Never add a client-side direct Firestore write to any of these.
- **Rate limiting exists on every unauthenticated public POST route** (`lib/rateLimit.ts`), sized per route's abuse/cost profile. Do not remove it when redesigning a form's submission flow.
- **The generic `[type]` content-editor route (`/api/admin/content/[type]/**`) uses an explicit allowlist** (`lib/adminContentCollections.ts`) that deliberately excludes `users`, `auditLog`, `galleryImages`, `siteSettings` (these have their own dedicated routes for security reasons). Do not route those collections through the generic endpoint.
- **`/give` intentionally has no payment processing.** This is a documented product decision, not a gap to silently fill with a fake "Donate" button during a redesign.
- **Search, theme, language, notification-bell, accessibility-menu functionality must stay wired to their existing context/API — a header redesign changes their visual presentation only** (this was already done correctly today — see §15).
- **`Switch`, `Button`, `IconButton`, `Accordion`, `Pagination`, `DataTable` in `components/ui/` are widely reused** (Button: 74 files, Card: 59 files, Container: 30, Grid: 33, Section: 35, Modal: 26, PageHero: 28, Input: 43, States: 33 — see §8). Changing their base API/props will ripple across dozens of files — do not casually rename props.

---

## 6. Current UI State

### KEEP FUNCTIONALLY (works, must remain connected — visual treatment is separately negotiable)
- Every item in §5.
- Search (Cmd/Ctrl+K command palette), theme toggle, language switcher, accessibility menu (text size/high contrast), notification bell — all functionally complete, just redesigned visually today for the header (see §15).
- The entire admin CMS (content editing, versioning, media library, forms builder, moderation queue, audit log, newsletter, member management).
- All public content browsing (sermons, events, gallery, blog, testimonials, resources, small groups, ministries).
- All public submission forms (contact, prayer, testimonials, volunteer, gallery upload, service requests) and their rate limiting.

### SCRAP VISUALLY (being/already being replaced — do not treat as design reference)
- **Everything about the pre-`redesign/warm-rebuild` visual design** — two full frontend rebuilds have already happened (first: `redesign/design-system`, merged to `main`, navy/gold; second: current branch, shadcn/ui + Tailwind v4 + originally navy/gold then replaced with Terracotta Earth palette). The user has explicitly rejected prior results at least twice ("too plain / cold / corporate," "not modern enough," "wrong structure/UX, not just style" — per `REBUILD_PROGRESS_V2.md`'s own header) and, in this session, explicitly rejected the Settings page and Header as "AI-generated/template UI" requiring first-principles redesign, not incremental tweaking.
- The Settings page was fully redesigned today (see §15) — its prior single-mega-card layout is gone.
- The header (`components/Navbar.tsx`) was fully redesigned today (see §15) — its prior "SaaS toolbar" appearance (boxed dropdown triggers, command-palette-style search box, undifferentiated utility icons) is gone.
- **Any remaining page not yet touched by today's session should be assumed visually provisional**, not a finished reference — the user's standing instruction (from the original Settings/Header redesign prompts, both still in force) is that visual polish is disposable and should not be treated as inspiration for future work unless explicitly reconfirmed.

---

## 7. UI Component Inventory (`components/ui/`)

Usage counts = number of distinct files elsewhere importing that module (rough measure of blast radius if changed).

| File | Exports | Purpose | Usage | Notes |
|---|---|---|---|---|
| `button.tsx` | `Button`, `LinkButton`, `buttonClasses`, `buttonVariants` | Primary CTA/button, 7 variants (primary/secondary/outline/ghost/danger/warm/link) × 3 sizes | 74 files (heaviest primitive) | **Fixed today**: ghost/primary/danger/warm/link variants needed `border-0`/`bg-transparent` — see §14/§15 for the cascade bug this fixed. |
| `card.tsx` | `Card` (+ sub-parts) | Generic content panel, 4 variants (flat/raised/outline/interactive) | 59 files | |
| `input.tsx` | `Input` | Text input w/ label/hint/error, icon slots | 43 files | |
| `container.tsx` | `Container` | Max-width page wrapper, 5 size presets | 30 files | |
| `grid.tsx` | `Grid` | Responsive CSS grid wrapper | 33 files | |
| `section.tsx` | `Section` | Page section spacing/background wrapper | 35 files | |
| `states.tsx` | `LoadingState`, `EmptyState`, `ErrorState` | Standard placeholder UI states | 33 files | |
| `modal.tsx` | `Modal` | App's primary modal (distinct from `dialog.tsx`) | 26 files | |
| `page-hero.tsx` | `PageHero` | Page-top hero block | 28 files | |
| `icon-button.tsx` | `IconButton` | Icon-only button, 6 variants × 3 sizes | 27 files | **Extended today** with an optional `size` prop pass-through pattern for `AccessibilityMenu`/`NotificationBell`. Base classes needed `border-0` added today (bare-button chrome fix). |
| `badge.tsx` | `Badge` | Status/label pill, 6 variants | 31 files | |
| `select.tsx` | `Select` | Styled native `<select>` | 21 files | |
| `textarea.tsx` | `Textarea` | Multi-line input | 21 files | |
| `checkbox.tsx` | `Checkbox` | Styled checkbox | 12 files | |
| `avatar.tsx` | `Avatar` | User avatar (photo/initials) | 11 files | |
| `switch.tsx` | `Switch` | Toggle switch | 3 files (Settings, AccessibilityMenu) | **Fixed today**: needed a persistent track border + thumb ring, since off-state track color was too close to card background to read as a control. |
| `accordion.tsx` | `Accordion`, `AccordionItem` | Collapsible panel group | 5 files | **Fixed today**: trigger button needed `border-0 bg-transparent` (bare-button chrome fix — affected every FAQ section sitewide). |
| `breadcrumbs.tsx` | `Breadcrumbs` | Breadcrumb trail | 4 files | |
| `dropdown-menu.tsx` | Full Radix-pattern dropdown set | Dropdown/context menus | 5 files | |
| `data-table.tsx` | `DataTable` | Generic sortable table | 3 files (admin) | **Fixed today**: column-sort `<button>` needed `border-0 bg-transparent`. Deliberately NOT rebuilt on `@tanstack/react-table` despite that being installed and originally planned — existing hand-rolled version already covers sort/search/resize/CSV/bulk-select/keyboard-nav with no known bugs; rebuild wasn't justified (documented reasoning in `REBUILD_PROGRESS_V2.md` Phase 9). |
| `pagination.tsx` | `Pagination` | Page-number nav | **0 direct usages found** | Present but not currently wired into any page — **fixed today anyway** (page-number button needed `border-0`) since it's a shared primitive that will eventually be used. |
| `section-nav.tsx` | `SectionNav` | In-page anchor nav | 2 files | |
| `sheet.tsx` | Radix-pattern slide-in drawer | Mobile nav drawer | 2 files (Navbar mobile menu) | |
| `tabs.tsx` | Radix-pattern tabs | Tabbed panels | 2 files | **Known unfixed issue**: dark-mode-only `data-active:border-transparent` variant has the same border-transparent cascade trap described in §14 — narrow/low-priority, not fixed today. |
| `command.tsx` | cmdk-pattern command palette primitives | Powers `CommandPalette.tsx` | 1 file | |
| `dialog.tsx` | Radix-pattern dialog | | 1 file (narrow use) | |
| `tooltip.tsx` | Radix-pattern tooltip | | 1 file | |
| `input-group.tsx` | Input w/ addons | | 1 file | |
| `sonner.tsx` | `Toaster` | Toast notification provider | 1 file (root layout) | |
| `confetti-burst.tsx` | `ConfettiBurst` | Celebratory animation | 1 file | |
| `label.tsx` | `Label` | Form label primitive | 0 direct hits (may be consumed indirectly) | |
| `radio.tsx`, `radio-group.tsx`, `separator.tsx`, `skeleton.tsx` | respective | | 0 direct hits | Present, unused — likely added ahead of need during the shadcn migration. Do not assume dead/safe to delete without a fresh grep; possible indirect/relative-import usage not caught by the research pass's grep pattern. |

**Major non-UI shared components** (`components/*.tsx`): `Navbar.tsx` (redesigned today, see §15), `Footer.tsx`, `MobileBottomNav.tsx`, `CommandPalette.tsx`, `NotificationBell.tsx`, `AccessibilityMenu.tsx`, `EnhancedLoginModal.tsx`, `ClientLayout.tsx`, `PublicChrome.tsx`, `GDPRCompliance.tsx` (cookie consent banner), `PrivacyDialog.tsx`, `WelcomeTourModal.tsx`, `MemberDashboard.tsx`, `InteractiveCalendar.tsx` (had a `border-transparent` bug fixed today — see §14), `ScriptureReference.tsx` (had a CSS-triangle-arrow `border-transparent` bug fixed today), plus per-content-type helpers (`EventModal`, `EventCountdown`, `SermonVideoPlayer`, `SermonTranscript`, `ShareButton`, `PrintButton`, `SaveButton`, `StatBar`, `DynamicLiveStream`, `PolicyVersionDiff`, `ReadingProgressBar`, `SkipLink`, `ThemeAccentInjector`, `PWAInstallPrompt`, `NewsletterSignup`, `BibleVerse`, `DivineAudio`, `AddToCalendarButton`). `components/admin/ConfirmModal.tsx` is reused 10× (Settings' delete-account flow + several admin screens).

---

## 8. API Inventory

See §3c for the full grouped route table. For exact request/response shapes, **read the actual route file** — 89 files is too many to safely hand-transcribe field-by-field here without risking transcription error; the research pass captured method + purpose + auth + collection accurately, which is what matters most for not duplicating or breaking functionality.

**High-value routes to know before touching Settings/Auth/Account UI:**
- `DELETE /api/privacy/delete-account` — see §4, §5, §12.
- `POST /api/privacy/download-data` — GDPR "download my data" export (profile + prayer requests as JSON), `requireAuth`, rate-limited 5/hr per uid+IP.
- No settings-save API route exists — settings save directly to Firestore client-side (see §12). **Do not build a new API route for this; it already works via direct write.**

---

## 9. Database Inventory

### Collections in active use (confirmed via `.collection()` grep across `app/` and `lib/`)

| Collection | Purpose | Write path |
|---|---|---|
| `users` | Member/staff accounts, incl. `role`, `notificationPreferences`, `privacyPreferences` | Self (limited fields, cannot self-promote role) / admin |
| `sermons`, `series`, `speakers`, `events`, `pastors`, `ministries`, `announcements`, `services`, `historyTimeline`, `staffMembers`, `siteSettings`, `pageContent`, `blogPosts`, `smallGroups`, `resources` | Public-readable content | Admin (Admin SDK) |
| `livestream`, `ambientAudio` | Singleton state docs (`current`) | Admin |
| `galleryImages`, `comments`, `prayerRequests`, `testimonials` | Public-submitted, moderated content | Public create via Admin-SDK-mediated API route (client-direct `create` is now blocked — see §14 known-bugs-fixed history); moderator+ manages |
| `contacts`, `serviceRequests` | Contact/service-request submissions | Public create via API route (Admin SDK) |
| `contentTypes`, `customContent` | Custom content-type schema builder + its documents (partitioned by `contentType` field) | Admin (Admin SDK only) |
| `contentVersions` | Version-history snapshots for every edit | Server-only |
| `mediaLibrary` | Uploaded asset index (Cloudinary-backed) | Admin |
| `formDefinitions`, `formSubmissions` | Forms builder + submitted answers | Admin defines; public submits via API route |
| `newsletterSubscribers`, `newsletterCampaigns` | Newsletter | Server-only |
| `auditLog` | Append-only admin action log | Server-only, written via `withAudit()` |
| `rateLimits` | Rate-limit counters | Server-only |
| `accountDeletionRequests` | GDPR account-deletion queue | Server-only |
| `redirects` | Old→new path mappings, resolved at **build time** (not per-request) | Admin |
| `volunteerHours`, `resourceRatings`, `notFoundHits`, `savedItems`, `eventRegistrations`, `notifications`, `moderationReasonTemplates`, `messageTemplates`, `chatMessages` | Various feature-specific collections | Server-only (Admin SDK); **not explicitly listed in `firestore.rules`** but protected by its default-deny catch-all |

**Present in `firestore.rules` but no confirmed writer found in code:** `emailNotifications`, `security_logs` — rules exist, no `.collection()` call found anywhere. Either dead/planned-but-unbuilt, or written by something outside this grep's reach.

**`enhanced_contacts`** — confirmed dead: has a `firestore.rules` entry, the one route that used it was removed as dead code, the rule itself was never cleaned up. Harmless, should be removed next time `firestore.rules` is touched.

### Legacy/dead type definitions — do not treat as current schema
- `models/Event.ts`, `models/Sermon.ts`, `models/Series.ts`, `models/Speaker.ts` — **zero importers**, superseded by richer interfaces defined inline in `lib/content.ts`.
- `models/User.ts` — **the one live model in `models/`**, actively used by `AuthContext` and `lib/firebase.ts`. Fields: `uid, email, displayName, firstName, lastName, role, membershipStatus, isActive, notificationPreferences: {email, events, prayers, newsletter, sermons, volunteerOpportunities}, privacyPreferences: {profileVisible, contactVisible}` (+ more — read the file directly for the full shape before changing anything).
- `types/index.ts` — **entirely dead**, zero importers, Mongo/Mongoose-shaped leftover from a pre-Firestore prototype. Do not use as a reference for any collection's real shape.
- `types/contentType.ts`, `types/formSchema.ts`, `types/contact.ts` — **live, actively used** for the schema builder, form builder, and contact form respectively.
- `lib/content.ts` — **the real source of truth** for every public-content collection's TypeScript shape and fetch function. This is where to look, not `models/`.

### Seed script
`scripts/seed-firestore-content.js` — `node scripts/seed-firestore-content.js`, idempotent (merge-safe singleton writes, empty-collection-only seeding), seeds `siteSettings`, `pageContent`, starter `services`, placeholder `ambientAudio`/`livestream`, and the `volunteer-opportunities` custom content type. Does not seed sermons/events/gallery/pastors/ministries/announcements/history by design.

---

## 10. Authentication & Authorization

Full detail (this is the single most important section to read before touching any auth-adjacent UI):

1. **Registration** — `app/register/page.tsx` → `AuthContext.register()` → `createUserWithEmailAndPassword` (Firebase Auth) + `updateProfile` (displayName) + `createUserProfile()` (Firestore `users/{uid}` write, `role` always forced to `'member'`). Redirects to `/dashboard` on success.
2. **Login** — `app/login/page.tsx` → `AuthContext.login()` → `signInWithEmailAndPassword` (Firebase Auth only, no custom API call). Redirects to `/dashboard`.
3. **Session/token handling** — Firebase Auth's own client-side persisted session (not a custom cookie). `AuthContext` subscribes via `onAuthStateChanged`; on sign-in, separately fetches the Firestore `users/{uid}` profile and exposes *that* as the app-level `user` object. For calling internal API routes, the client manually attaches `Authorization: Bearer <token>` via `getIdToken()` from `lib/firebase.ts`.
4. **Logout** — `AuthContext.logout()` → `signOut(auth)`.
5. **Password change** — re-authenticates with `EmailAuthProvider.credential` + `reauthenticateWithCredential`, then `updatePassword`. No Firestore involvement. **Throws on error** (inconsistent with other Auth methods' boolean-return pattern).
6. **Password reset** — **does not exist**. No route, no UI, no method. Would need to be built from scratch if required (`sendPasswordResetEmail` is available from Firebase but unused).
7. **Protected routes** — **middleware does zero enforcement.** All protection is: (a) client-side inline guards per page/layout (`AdminLayout.tsx` redirects to `/login` if signed out or to `/` if under-privileged; `MemberDashboard.tsx` shows an inline "please sign in" message instead of a redirect; login/register pages redirect signed-in users away), and (b) server-side per-API-route `requireX()` checks. **There is no central route-config to update** — a redesign that adds a new protected page must add its own guard following one of these two existing patterns.
8. **Role/permission handling** — `lib/permissions.ts`: `UserRole` enum (`member < moderator < admin < super_admin`), `roleAtLeast()`, `Permission` enum (`MODERATE, MANAGE_CONTENT, MANAGE_SETTINGS, MANAGE_USERS, MANAGE_ROLES, VIEW_AUDIT_LOG`), `ROLE_PERMISSIONS` map, `canAccessAdminPanel()` = moderator+. Mirrored independently in `firestore.rules` (client-SDK path) and re-derived server-side in `lib/api-auth.ts` (Admin-SDK path, **never trusts a client-supplied role** — always re-reads `users/{uid}.role` from Firestore).
9. **Account deletion** — see §4/§5/§12. Request-for-review workflow, not an instant delete.
10. **Middleware/guards summary** — `middleware.ts` = headers/cache-control only. `lib/api-auth.ts`'s `requireAuth`/`requireModerator`/`requireAdmin`/`requireSuperAdmin` = the real server-side gate, used across ~63+ route files. `components/admin/AdminLayout.tsx` and `components/MemberDashboard.tsx` = the real client-side gates.

**Notable gaps/quirks flagged by the research pass:**
- `signInWithGoogle` exists in `lib/firebase.ts` but is **not wired into `AuthContext`** or any page found — don't assume Google sign-in is live in the UI even though the code exists.
- Registration always creates `role: 'member'` — only an existing super_admin can promote a user (via `/admin/users`, `MANAGE_ROLES` permission).

---

## 11. Settings Functionality (field-by-field)

Page: `app/settings/page.tsx` (redesigned visually today — functionality below is unchanged by that redesign).

| Setting | Controls | Firestore path | API route | Save trigger |
|---|---|---|---|---|
| Email | Account notifications toggle | `users/{uid}.notificationPreferences.email` (default `true`) | none — direct client-SDK write | Batched, explicit "Save Changes" click |
| Events | Event notifications toggle | `.notificationPreferences.events` (default `true`) | none | same |
| Prayer Requests | Prayer-request update notifications | `.notificationPreferences.prayers` (default `true`) | none | same |
| Newsletter | Newsletter notifications | `.notificationPreferences.newsletter` (default `true`) | none | same |
| Sermons | New-sermon notifications | `.notificationPreferences.sermons` (default `false`) | none | same |
| Volunteer Opportunities | Volunteer-opening notifications | `.notificationPreferences.volunteerOpportunities` (default `false`) | none | same |
| Profile Visibility | Other members can find/view profile | `users/{uid}.privacyPreferences.profileVisible` (default `true`) | none | same batch |
| Contact Visibility | Contact info visible to other members | `.privacyPreferences.contactVisible` (default `false`) | none | same batch |
| Password | Sign-in password | N/A — Firebase Auth, not Firestore | none (direct Firebase Auth SDK) | Own "Update Password" form submit, immediate |
| Delete Account | Requests account deletion | New doc in `accountDeletionRequests` (Admin SDK) | `DELETE /api/privacy/delete-account` | Immediate on `ConfirmModal` confirm |

**Exact write mechanism for the two preference groups:** `handleSave()` calls `updateUser({ notificationPreferences, privacyPreferences })` from `AuthContext`, which calls `lib/firebase.ts`'s `updateUserProfile(uid, updates)`:
```ts
const userRef = doc(db, 'users', uid);
await updateDoc(userRef, { ...updates, updatedAt: new Date().toISOString() });
```
Both groups are always saved together in one write (there is no per-toggle optimistic save, and no separate "Save" for privacy vs. notifications) — **preserve this batching behavior**, it's not an oversight.

`AuthContext.updateUser()` also does an optimistic local merge into React state after the Firestore write succeeds, so the UI reflects the change without a full refetch.

---

## 12. Known Bugs / Problems

Only issues verified during this audit or earlier today's session (with file:line-level confidence). This is not an exhaustive site-wide bug hunt.

### FIXED TODAY (documented here so the next AI doesn't "rediscover" and re-fix them, or assume the underlying pattern is still broken elsewhere unfixed)

**Problem:** A site-wide Tailwind CSS v4 cascade-layers regression where Preflight's base-layer resets (`border: 0 solid` on every element; `background-color: transparent` + `border-radius: 0` on every `button`/`input`/`select`/`textarea`/`optgroup`/`::file-selector-button`) kept winning over later-registered utility classes (`bg-*`, `border-*`, `rounded-*`) in real Chrome, despite correct Tailwind layer source order.
**Location:** `app/globals.css` (the fix), affecting every native `<button>`/bordered element sitewide.
**Reproduction (historical, now fixed):** Any `<button>` with `bg-accent`/`border`/`rounded-lg` classes rendered with no visible fill, no border, and square corners.
**Fix applied:** Three `@layer base` blocks in `app/globals.css` using `revert-layer` on the exact Preflight selectors, matching an already-established pattern in this codebase (there were two earlier instances of the same regression class, for `padding`/`margin` and for link `color`, already fixed before this session).
**Severity was:** Critical (affected buttons/borders/radii everywhere) — now resolved.
**Verified:** In real installed Chrome (not just Playwright's bundled Chromium), across home/about/events/contact/give/login/register/prayer/settings/header, desktop widths 1920/1440/1280/1024/768 + mobile 390, the mobile nav drawer, an open dropdown menu, and the scrolled header state.

**Problem:** A second, independent CSS trap: `app/globals.css` has an intentional **unlayered** `* { border-color: rgb(var(--border)) }` rule (by design, for convenience), and unlayered CSS always beats layered Tailwind utilities regardless of source order or specificity — so the `border-transparent` utility class **has never actually worked anywhere in this codebase**.
**Location:** Was masked by the Preflight `border: 0` bug above (0-width border made the wrong color moot) until that was fixed, which is how this second bug surfaced.
**Fix applied today, case by case (not a blanket fix — each needed its own):**
- `components/ui/button.tsx` — ghost/primary/danger/warm/link variants switched from `border-transparent` to `border-0` (a width property, not a color, so it can't lose to the unlayered rule).
- `components/Navbar.tsx` — the header's own scroll-state border toggle switched from `border-transparent`/`border-border` to `border-b-0`/`border-b border-border`.
- `components/InteractiveCalendar.tsx` — a calendar-grid spacer div's invisible border switched to an inline `style={{ borderColor: 'transparent' }}` (inline style beats unlayered CSS).
- `components/ScriptureReference.tsx` — a CSS-triangle tooltip arrow (which relies on *different* colors per side, so `border-0` isn't an option) switched to inline `style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'rgb(var(--border))' }}`.
- **NOT fixed (known remaining instances, low-priority/low-traffic):** `components/admin/content/MediaPickerModal.tsx` (admin-only thumbnail hover border — the hover/focus accent border likely never visually applies), `components/ui/tabs.tsx` (a dark-mode-only `data-active:border-transparent` variant).
**Severity:** Was Medium (visual only, but sitewide) for the fixed instances; the two unfixed instances are Low (narrow/admin-only).

**Problem:** A third instance of the same Preflight-reset-was-masking-missing-styling pattern: several bare `<button>` elements across `Navbar.tsx`'s mobile drawer (section-expand toggles, logout button) and shared primitives (`IconButton`, `Accordion` trigger, `Pagination` page-number button, `DataTable` column-sort button) had no explicit `bg-*`/`border-*` classes at all, relying implicitly on Preflight's suppression to render as "invisible until styled." Once Preflight's suppression was correctly reverted (fix #1 above), these fell through to native browser button chrome (gray fill, visible border) instead.
**Fix applied:** Added explicit `border-0 bg-transparent` to each. **General lesson for future work:** any bare `<button>` in this codebase that wants to look like plain text/an icon (not a filled button) now needs to say so explicitly — it can no longer rely on an implicit browser-default suppression.
**Severity:** Was Medium (visual noise on FAQ accordions, pagination, mobile drawer) — resolved for the instances found; **a sweep found ~76 button usages sitewide without obvious border/bg classes, of which only the highest-traffic shared primitives were individually fixed — page-level one-off buttons were not exhaustively audited.** See §17 "Functional work remaining" equivalent below.

### NOT FIXED — still open

**Problem:** `notFound()` on `/blog/[slug]`, `/events/[id]`, `/sermons/[id]` — **actually already fixed** per git history (`9df317f`, "Fix notFound() returning HTTP 200 instead of 404" — deleted the global `app/loading.tsx` that was causing streamed 200 responses). `SITE_OVERVIEW.md` (Aug 4) still lists this as open; it is not, as of `9df317f` (Aug 22). Documenting here specifically so the next AI doesn't "fix" an already-fixed bug based on the stale doc.

**Problem:** `MediaPickerModal.tsx` thumbnail hover/focus border likely never applies (uses `border-transparent`/`hover:border-accent`, same unlayered-CSS trap as above, not yet fixed).
**Location:** `components/admin/content/MediaPickerModal.tsx` line ~111.
**Severity:** Low (admin-only, cosmetic — thumbnails are still clickable/functional).

**Problem:** `components/ui/tabs.tsx` has a dark-mode-only `data-active:border-transparent` line-variant class that will have the same issue if that specific variant+mode combination is ever exercised.
**Severity:** Low (narrow, unconfirmed whether this variant is even used anywhere).

**Problem:** `/api/search` does not filter `sermons`/`events`/`announcements`/`gallery` results by draft status (per `SITE_OVERVIEW.md`, not independently re-verified today — flagged as unverified, not confirmed).
**Severity:** Unknown/Low — could surface unpublished content in search results to anonymous users.

**Problem:** `/api/health` is a static stub with no real dependency check; an external uptime monitor pointed at it would never detect a real outage.
**Severity:** Low/Medium depending on whether anything external actually monitors this endpoint (unknown from code alone).

**Problem:** `/api/docs` documents 3 endpoints that don't exist (`/api/donations/history`, `/api/notifications/sms`, `/api/webhooks`).
**Severity:** Low (documentation-only, but could mislead an integration effort).

**Problem:** `enhanced_contacts` has a dead `firestore.rules` entry with no code reader/writer.
**Severity:** Trivial/cosmetic — harmless, cleanup candidate next time `firestore.rules` is touched.

---

## 13. Previous Implementation Mistakes (lessons, not design critique)

- **Two full-codebase visual rebuilds have already happened** (`redesign/design-system`, then the current `redesign/warm-rebuild`) — both triggered by the user rejecting the *previous* rebuild's result outright, not iterating on it. **Do not assume the current visual state is stable enough to build heavily upon without checking with the user first** — this project has a track record of "start over" being the actual instruction, not "polish this."
- **Documentation drifts fast and silently in this repo.** `SITE_OVERVIEW.md` was accurate on 2026-08-04 and is already measurably wrong on route counts and palette 3 weeks later. `AUDIT_SUMMARY.md`/`CHANGELOG.md` are old enough to be actively misleading (Sanity-era, TTS-rollout-era framing). **Always verify a specific claim against the actual code before acting on any doc in this repo, including this one, if enough time has passed.**
- **`models/` (except `User.ts`) and `types/index.ts` are dead code from a pre-Firestore prototype.** A future AI reading `models/Event.ts`/`Sermon.ts`/etc. and assuming they're the real schema would build against the wrong shape — `lib/content.ts` is the real source of truth for public content types.
- **The generic content-editor route and the custom-content-type route are two parallel, near-duplicate CRUD implementations** (by deliberate design — `customContent` needs to avoid `firestore.rules` redeploys for new admin-defined types) — this is not accidental duplication to "clean up," it's an intentional tradeoff. Don't merge them without understanding why they're separate.
- **Blog posts have their own third parallel CRUD+versioning implementation** because they use slug-as-doc-id. Same caution applies.
- **A component that looks "obviously fine" in source can still render broken** — the border/background/radius bugs fixed today were invisible by reading the JSX (correct Tailwind classes were present); they only surfaced via computed-style inspection in a *real* browser (Playwright's own bundled/cached Chromium builds gave misleading/inconsistent results in this environment — see §16 for the workaround used). **Trust real-browser verification over "the classes look right."**
- **`REBUILD_PROGRESS_V2.md`'s own text says Playwright's Chromium install "never worked in this sandbox across the entire project"** — today's session found a workaround (pointing Playwright at the system's actual installed Chrome via `executablePath`, or at a stale-but-functional pre-existing Playwright Chromium cache directory) that did work. Future sessions blocked on this should try that before concluding visual verification is impossible.
- **Settings/account UI copy must stay honest about account deletion being a review process, not instant** — a future redesign's copywriting pass could easily "simplify" this into misleading language ("Delete my account" reading as instant) without realizing the backend doesn't do that.

---

## 14. Current Design Reset

## VISUAL DESIGN STATUS

The existing frontend visual design is being treated as **fully discardable, page by page, as the user directs.** As of this audit:
- **Settings page** and **Header/Navbar** were explicitly torn down and rebuilt from first principles earlier in this same session (not incrementally patched) — see below for what that means concretely.
- No other page has received this treatment yet in the current session. Do not assume any other page's current visual layout, card structure, spacing, or color usage is a deliberate final decision — it may simply not have been revisited yet.
- The color system itself has already changed twice on this branch (navy/gold → Terracotta Earth) — do not treat the current warm sandstone/terracotta/olive palette as untouchable, but it *is* the current deliberate choice (extensively WCAG-contrast-verified per-token, with documented math in `app/globals.css`'s comments) as of this audit, not an accident.

**Do NOT, purely because it currently exists:**
- preserve the current layout of any page not mentioned above as redesigned
- preserve the current header/navigation structure of pages that reuse `Navbar`/`Footer` (their chrome was redesigned today; page *bodies* were not)
- treat any current page composition as design inspiration
- assume current spacing/density choices are intentional final decisions rather than carryover from the second rebuild's page-by-page reskin pass

## FUNCTIONAL STATUS

Everything in §4/§5/§9/§10/§11 (working functionality, database behavior, API contracts, authentication, permissions, business logic) **must be preserved** through any further visual work unless a specific, deliberate, user-approved decision changes it. A UI redesign is a redesign of markup/classes/component structure — it is never an implicit license to change what a button does, what a form submits to, or what a collection stores.

---

## 15. Environment & Development

**Env var names only — see `.env.local` (gitignored) for actual values. Currently configured (confirmed present in `.env.local` today):**
`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`, `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `BIBLE_API_KEY`, `NEXT_PUBLIC_BIBLE_API_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

**Present in `.env.example` but NOT configured locally (template/aspirational, features likely unused):** Twilio SMS, Razorpay payments, Cloudflare CDN, Algolia search, Google Maps, VAPID push notification keys, 2FA secret, GDPR/child-protection flags, `ENCRYPTION_KEY`/`WEBHOOK_SECRET`, `JWT_SECRET_KEY` (this project uses Firebase Auth session handling, not JWT — this var appears vestigial).

**Commands** (from `package.json`):
```
npm run dev              # next dev — local dev server
npm run build             # next build
npm run build:analyze     # ANALYZE=true next build
npm run start              # next start (serve production build)
npm run type-check        # tsc --noEmit
npm run lint                # next lint
npm run setup              # node setup.js
npm run deploy              # vercel --prod
npm run clean               # rm -rf .next out node_modules/.cache
npm run fresh-install      # rm -rf node_modules package-lock.json && npm install
npm run seed-content       # node scripts/seed-firestore-content.js
npm test                     # playwright test
npm run test:ui             # playwright test --ui
npm run test:headed        # playwright test --headed
npm run axe                  # playwright test --grep=@axe
npm run lighthouse          # lhci autorun
```
**Firestore rules/indexes deploy separately** (not in `package.json`): `firebase deploy --only firestore:rules,firestore:indexes`. Per `SITE_OVERVIEW.md`, the deploying account needs both `Firebase Admin` and `Service Usage Consumer` IAM roles on the GCP project.

---

## 16. Dependencies

### Core
`next` (15.5), `react`/`react-dom` (19.2), `typescript` (5.7).

### UI
`@radix-ui/react-*` (accordion, avatar, checkbox, dialog, dropdown-menu, label, popover, radio-group, select, separator, slot, switch, tabs, tooltip), `radix-ui` (umbrella package), `class-variance-authority`, `tailwind-merge`, `tw-animate-css`, `lucide-react` (icons), `motion` (animation, Framer Motion's successor package), `cmdk` (command palette), `sonner` (toasts), `@tanstack/react-table` (installed, **not currently used** — see §7's `data-table.tsx` note), `next-themes` (installed; note `REBUILD_PROGRESS_V2.md` says this app uses its own `ThemeContext` instead and one shadcn-generated file's import of `next-themes` had to be fixed to use the app's context — verify before assuming `next-themes` itself is actually wired up anywhere).

### Backend
`firebase-admin` (**pinned to 13.10.0** — do not casually bump past 14.x, see §16 known-gotchas memory below), `resend` (email), `cloudinary`, `server-only`, `dotenv`.

### Database
`firebase` (client SDK, 12.4.0).

### Forms/validation
`react-hook-form`, `zod`.

### Dev tooling
`@playwright/test`, `@axe-core/playwright`, `eslint-config-next`, `tailwindcss` v4 + `@tailwindcss/postcss` + `@tailwindcss/forms`, `postcss`, `shadcn` (CLI, used to generate `components/ui/` originally — not a runtime dependency).

### Other
`date-fns`, `papaparse` (CSV import/export), `@sentry/nextjs`, `next-pwa`.

---

## 17. File/Architecture Map

```text
app/                       Next.js App Router — pages + API routes
  admin/                   10 admin panel screens (client components, gated by AdminLayout)
  api/                     89 route.ts files — see §3c
  [~48 public page dirs]   about/, blog/, community/, contact/, dashboard/, events/,
                            forms/, gallery/, give/, login/, ministries/, newsletter/,
                            offline/, prayer/, privacy/, profile/, register/, resources/,
                            sermons/, services/, settings/, small-groups/, testimonials/,
                            volunteer/, plus root page.tsx, layout.tsx, error.tsx,
                            not-found.tsx, sitemap.ts, robots.txt, podcast.xml
  globals.css              Tailwind v4 @theme config + warm color token system
components/
  admin/                   Admin-only UI: AdminLayout, ConfirmModal, GenericContentTab,
                            content/ (per-tab editors), 
  ui/                      Design-system primitives — see §7
  about/, events/, home/, i18n/, sermons/   Feature-scoped component groups
  [~35 top-level .tsx]     Navbar, Footer, MobileBottomNav, CommandPalette,
                            NotificationBell, AccessibilityMenu, EnhancedLoginModal,
                            InteractiveCalendar, ScriptureReference, etc. — see §7
contexts/                  AuthContext, ThemeContext, LanguageContext,
                            AccessibilityContext, LoadingContext
lib/                       firebase.ts (client SDK), firebase-admin.ts (Admin SDK,
                            lazy-init), api-auth.ts (server-side role checks),
                            permissions.ts (role model), content.ts (public-content
                            read layer — the REAL schema source of truth),
                            rateLimit.ts, notifications.ts, contentVersions.ts,
                            resend.ts, cloudinary.ts, bible-api.ts, adminContentCollections.ts
models/                    Mostly DEAD legacy types — only User.ts is live (see §9)
types/                     contentType.ts, formSchema.ts, contact.ts (live);
                            index.ts (DEAD — pre-Firestore prototype leftover)
tests/                     Playwright integration suite (12 spec files) + helpers/testAuth.ts
public/                    Static assets, generated service worker (prod only), manifest
scripts/                   seed-firestore-content.js (the only seed/migration script)
firestore.rules            Client-SDK access boundary — source of truth for that path
firestore.indexes.json     Composite index declarations
middleware.ts              Security headers + cache-control ONLY — no auth logic
next.config.js             Build config, image domains, build-time redirects()
```

---

## 18. Current Development Status

| Area | Status | Notes |
|---|---|---|
| Authentication | **Complete** | Register/login/logout/password-change all working. No password-reset flow exists (gap, not broken). |
| Registration | **Complete** | Always creates `role: 'member'`. |
| Profiles | **Complete** | `/profile` page, editable fields, completeness meter. |
| Settings (notifications/privacy/password/deletion) | **Complete, functionally** | Visually redesigned today; underlying persistence untouched. |
| Events | **Complete** | RSVP, waitlist, iCal export, cancellation broadcast, photo galleries. |
| Sermons | **Complete** | Video/audio, transcripts, series, scripture refs, save-to-library. |
| Services | **Complete** | Times, wedding/baptism request + status tracker. |
| Giving | **Complete, informational-only by design** | No payment processing — deliberate. |
| Gallery | **Complete** | Submission, moderation, likes/comments, ZIP download, members-only albums. |
| Prayer wall | **Complete** | Submission, moderation, tally, answered archive. |
| Testimonials | **Complete** | Submission, moderation, featured rotation. |
| Blog | **Complete** | RSS, author/category pages, reading progress. |
| Small groups / Ministries / Resources / Volunteer | **Complete** | Search/filter, join/apply flows, hour logging, resource ratings. |
| Forms builder | **Complete** | Custom forms with conditional logic, file uploads, public renderer. |
| Newsletter | **Complete** | Subscribe/unsubscribe, preferences (token-auth), admin campaign composer. |
| Search | **Mostly complete** | Cross-content search working; possible draft-status filter gap (unverified). |
| Notifications (in-app) | **Complete** | Bell dropdown, mark-as-read. |
| Admin CMS | **Complete** | 14+ content types via shared `GenericContentTab`, versioning, media library, custom-type schema builder. |
| Admin moderation | **Complete** | Unified queue across 4 collections. |
| Admin audit log | **Complete** | Filterable, CSV export. |
| Admin member management | **Complete** | CSV import, suspend/role-change/delete, bulk email. |
| i18n (English/Tamil) | **Partially implemented** | Scoped to specific pages, not sitewide; documented fallback behavior for missing keys. |
| Theme (light/dark/high-contrast) | **Complete** | |
| Responsive UI | **Mostly complete, actively being reworked page-by-page** | Header verified today at 6 breakpoints; most other pages not re-verified this session. |
| Backend (API layer) | **Complete, mature** | 89 routes, consistent auth pattern, rate limiting, audit logging. |
| Database (Firestore) | **Complete, mature** | ~38 active collections, rules enforced, some dead/legacy rule entries to clean up. |
| Text-to-speech (AWS Polly) | **Built, orphaned** | No UI calls it. |
| Online payments | **Not implemented — deliberate** | Pending real merchant details from the church. |
| Password reset | **Not implemented** | Real gap — no code exists. |
| Google sign-in | **Built, not wired up** | Code exists in `lib/firebase.ts`, unused. |

---

## 19. What Remains To Be Done

### Functional work remaining
- **Password reset flow** — genuinely missing, would need building (Firebase supports it natively).
- **Wire up or remove `signInWithGoogle`** — currently dead code in `lib/firebase.ts`.
- **Decide the fate of `/api/tts`** — built and functional, orphaned. Either wire it into a UI or remove it.
- **Verify/fix `/api/search`'s draft-status filtering** (unconfirmed gap, worth a direct check before assuming it's real).
- **Clean up `enhanced_contacts`'s dead `firestore.rules` entry** next time that file is touched.
- **Consider a real health check behind `/api/health`**, or clarify that `/api/admin/system-health` is the intended one for monitoring.
- **`/api/docs` should either be fixed to match reality or removed** — it currently documents 3 nonexistent endpoints.
- **Complete the bare-`<button>` chrome-fix sweep** — today's session fixed the highest-traffic shared primitives (`Button`, `IconButton`, `Accordion`, `Pagination`, `DataTable`, `Navbar`'s own buttons) but a broader grep found ~76 button usages sitewide without obvious border/bg classes; page-level one-offs were not individually audited. `components/admin/content/MediaPickerModal.tsx` and `components/ui/tabs.tsx`'s dark-mode variant are two confirmed-but-unfixed instances.
- **Decide whether `models/Event.ts`/`Sermon.ts`/`Series.ts`/`Speaker.ts` and `types/index.ts` should be deleted** — confirmed dead code, zero importers, but deletion wasn't in scope for this audit (which is read-only by explicit instruction).

### UI/UX work remaining
**The visual interface is being rebuilt page-by-page, deliberately, not "polished."** As of this audit, only the header (`Navbar.tsx`) and Settings page have received the first-principles treatment. Every other page's current visual state should be treated as provisional carryover from the second rebuild (`redesign/warm-rebuild`)'s systematic reskin pass — functional, not necessarily final, and not to be used as a design reference for how the *next* page redesign should look unless the user says so. Do not describe remaining UI work as "finishing touches" — treat each page as a fresh redesign candidate until the user indicates otherwise.

---

## 20. INSTRUCTIONS FOR THE NEXT AI

1. Read this document before modifying the project.
2. Do not assume the existing UI is correct or finished — most of it has not been reviewed by the user in its current form (only Settings and the Header have been explicitly signed off on today, and even those may still change).
3. Preserve every verified backend behavior in §4/§5 — none of it needs to be rebuilt, it already works.
4. Preserve API contracts (routes, methods, request/response shapes, auth requirements) unless a change is explicitly requested and justified.
5. Do not duplicate existing functionality — check §4/§9 before adding a new API route or Firestore collection; something similar may already exist (e.g. don't build a new settings-save API route, it doesn't need one).
6. Do not replace working business logic (account deletion's review workflow, giving's no-payment-processing decision, settings' batched save) with a "simpler" frontend mock.
7. Do not recreate functionality that already exists — search §7/§9 for a component/collection before building a new one.
8. Verify existing implementation by reading the actual file before changing it — this codebase's documentation (including `SITE_OVERVIEW.md` and this file, eventually) drifts out of date within weeks.
9. Treat the visual UI as disposable, page by page, only as the user actually redirects — do not take that as blanket permission to redesign pages nobody asked about yet.
10. Build new UI independently of old markup — copy the *data flow*, not the JSX structure, from an existing page when redesigning it.
11. Do not make assumptions about undocumented behavior (e.g. password-reset, Google sign-in) — they either don't exist or aren't wired up; check before referencing them as if live.
12. Inspect the actual code before modifying any system, especially auth, settings, or anything touching Firestore rules.
13. Test functionality after major UI changes — this session used real-Chrome Playwright screenshots plus computed-style inspection (not just eyeballing) to catch three separate CSS regressions that looked fine in source but rendered broken.
14. Never silently remove existing functionality, including things that look like dead code (`models/Event.ts` etc. are confirmed dead — but confirm freshly with a grep before assuming any given file still is, since this codebase changes fast).

---

## 21. CURRENT PROJECT TRUTH

### What is working
Authentication (register/login/logout/password-change), the entire settings/privacy/account-deletion flow, the full public content site (sermons, events, gallery, blog, testimonials, resources, small groups, ministries, prayer wall), all public submission forms with rate limiting, the entire admin CMS (content editing, versioning, media library, forms builder, moderation, audit log, newsletter, member management), search, theme, language (scoped), notifications, and 89 API routes' worth of backend logic — all verified via direct code inspection today.

### What is partially working
i18n (Tamil coverage is scoped to specific pages, not sitewide, by design with a documented fallback). Responsive UI (header verified today at 6 breakpoints; most other pages carried over from the second rebuild's reskin pass, not re-verified this session).

### What is broken
No password-reset flow (never built). `/api/health` doesn't actually check anything. `/api/docs` references 3 nonexistent endpoints. Two low-traffic components (`MediaPickerModal.tsx`, `tabs.tsx`'s dark-mode variant) still have the unlayered-`border-transparent` cascade bug. An unknown number of page-level one-off `<button>` elements sitewide may still exhibit the "no explicit bg/border → native chrome" issue beyond the highest-traffic shared components already fixed today.

### What must be preserved
Everything in §5 ("DO NOT BREAK THESE") — most importantly: the Firebase Auth session model, the `requireX()` server-side role-check pattern, the direct-Firestore-write settings-save mechanism, the account-deletion-is-a-request pattern, and the deliberate absence of payment processing on `/give`.

### What is being discarded
The pre-today visual treatment of the header and Settings page (already replaced). The visual treatment of every other page is *not yet* confirmed discarded or kept — treat it as provisional, not as a design decision to defend, but also don't tear it down unprompted.

### What should happen next
Continue the page-by-page visual redesign only as directed by the user, using the same discipline demonstrated today: inspect real rendered output in an actual browser (not just source), verify computed styles when something looks subtly wrong, and treat any discovered site-wide bug (like the three CSS cascade issues found today) as worth fixing at the component level rather than patching around it page by page.
