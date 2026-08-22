# Salem Primitive Baptist Church — Complete Site Overview

**Snapshot date:** 2026-08-04
**Live domain:** salempbc.in
**Firebase project:** `church-website-c062a`

This is a point-in-time snapshot of the entire system — every page, every API route, every data collection, every integration, and every known gap. It will drift out of date as the code changes; treat it as a map of "what exists right now," not a living spec. `AUDIT_SUMMARY.md` in this same repo has the batch-by-batch history of *why* things are the way they are, if you want the story behind a decision rather than just the current state.

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Authentication & Roles](#4-authentication--roles)
5. [Data Model (Firestore Collections)](#5-data-model-firestore-collections)
6. [Public Site Map](#6-public-site-map)
7. [Admin Panel](#7-admin-panel)
8. [API Routes](#8-api-routes)
9. [Content Management Capabilities](#9-content-management-capabilities)
10. [Security](#10-security)
11. [Third-Party Integrations](#11-third-party-integrations)
12. [SEO & Discoverability](#12-seo--discoverability)
13. [PWA & Offline](#13-pwa--offline)
14. [Internationalization](#14-internationalization)
15. [Testing](#15-testing)
16. [Environment Variables](#16-environment-variables)
17. [Deployment](#17-deployment)
18. [Known Gaps & Limitations](#18-known-gaps--limitations)
19. [Explicitly Not Built](#19-explicitly-not-built)
20. [Directory Structure](#20-directory-structure)

---

## 1. What This Is

A Next.js website + custom-built CMS + light membership system for a church in Salem, Tamil Nadu (Salem Primitive Baptist Church). It started on Sanity CMS; that was fully removed and replaced with a Firestore-backed content system with an in-house admin panel (no third-party CMS dependency at all today).

The site serves two audiences:
- **Public visitors** — sermons, events, gallery, giving info, prayer requests, contact forms, a blog, testimonials, resources, small groups.
- **Staff/admins** — a full admin panel to manage every piece of that content, moderate public submissions, manage members, and review incoming messages, with no code deploy required for day-to-day content changes.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Server-side Firebase access | Firebase Admin SDK |
| Image/file storage | Cloudinary |
| Transactional email | Resend |
| Error monitoring | Sentry |
| Analytics | Google Analytics |
| Bible verses | Bible API (scripture.api.bible) |
| Text-to-speech (built, unused) | AWS Polly |
| PWA | next-pwa (service worker, installable) |
| CSV import/export | Papaparse |
| Testing | Playwright (integration tests against a real dev server + real Firebase project) |
| Accessibility testing | axe-core (via `@axe-core/playwright`) |

No ORM — all Firestore reads/writes are direct, either via the client SDK (public reads, a few public-submission writes) or the Admin SDK (all admin-panel writes, server-mediated public writes).

## 3. Architecture

- **Rendering:** Almost every public page is a Client Component (`'use client'`) that fetches its data from Firestore client-side after mount, and is statically prerendered (`○ Static` in the build output) since the initial HTML shell has no server-side data dependency. A handful of newer pages (`/blog/[slug]`, `/events/[id]`, `/sermons/[id]`) are Server Components that fetch at request time for `generateMetadata`/SEO purposes — these are dynamically rendered (`ƒ`).
- **Two Firebase access paths, deliberately kept separate:**
  - `lib/firebase.ts` — the public **client SDK**, used for all public reads and a couple of public-submission writes (subject to `firestore.rules`, the real security boundary for this path).
  - `lib/firebase-admin.ts` — the **Admin SDK**, used for every admin-panel API route, bypasses `firestore.rules` entirely (its own privilege check happens in `lib/api-auth.ts` before any Firestore call).
- **Middleware** (`middleware.ts`) — runs on every request (Edge runtime): sets security headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.) and a `Cache-Control` policy per route type. Deliberately does **not** do any Firestore lookups — see the redirect-manager note in §18.
- **Root layout** (`app/layout.tsx`) wraps everything in `ThemeProvider` → `LanguageProvider` → `AuthProvider` → `ClientLayout`, with a global `Navbar`, `Footer`, `MobileBottomNav`, install prompt, and GDPR cookie notice. A root `app/loading.tsx` provides a global loading spinner — this has a real, documented side effect described in §18.

## 4. Authentication & Roles

Single source of truth: Firebase Auth + a `role` field on `users/{uid}`. No parallel role system.

| Role | Can do |
|---|---|
| `member` | Nothing admin-side. Has a personal `/dashboard`, `/profile`, `/settings`. |
| `moderator` | Moderation queue (approve/reject prayer requests, comments, gallery submissions, testimonials). Read-only on form submissions (may contain personal info — same floor as moderation). Cannot edit content or touch accounts. |
| `admin` | Everything above, plus full content editing, media library, forms builder, newsletter, messages inbox, member management (view/suspend/delete, not role changes), settings. |
| `super_admin` | Everything, including changing another user's role. |

Every admin/member API route is gated with `requireAuth` / `requireModerator` / `requireAdmin` / `requireSuperAdmin` from `lib/api-auth.ts`, which verifies the caller's Firebase ID token server-side and reads their role from Firestore (never trusts a client-supplied role). `firestore.rules` enforces the same model independently for the client-SDK path.

## 5. Data Model (Firestore Collections)

| Collection | Purpose | Write path |
|---|---|---|
| `users` | Member profile + `role` | Self (limited fields) / admin |
| `sermons` | Sermon library | Admin |
| `events` | Church events/calendar | Admin |
| `series`, `speakers` | Sermon taxonomy | Admin |
| `pastors` | Pastoral staff | Admin |
| `ministries` | Ministry listings | Admin |
| `announcements` | Time-limited announcements (`expiresAt` support) | Admin |
| `services` | Weekly service times | Admin |
| `historyTimeline` | Church history | Admin |
| `staffMembers` | Staff directory | Admin |
| `siteSettings` | Global site config, social links, feature flags | Admin |
| `pageContent` | Editable marketing copy per page | Admin |
| `livestream`, `ambientAudio` | Live stream state, background audio | Admin |
| `galleryImages` | Photo gallery — admin-uploaded (pre-approved) or publicly submitted (pending) | Public create / Admin+Moderator |
| `comments` | Comments on gallery images | Public create / Moderator |
| `prayerRequests` | Prayer wall | Public create / Moderator |
| `testimonials` | Member testimonies — public submit or admin-authored | Public create / Admin+Moderator |
| `blogPosts` | Blog (doc ID = slug) | Admin |
| `smallGroups` | Small group listings | Admin |
| `resources` | Downloadable files (Bible studies, etc.) | Admin |
| `redirects` | Old-path → new-path 301/302 mappings (resolved at build time) | Admin |
| `contentTypes` | Custom content type *definitions* (the schema builder) | Admin |
| `customContent` | Actual documents for every custom type, partitioned by `contentType` field | Admin |
| `contentVersions` | Version history snapshots for every content edit | Server-only |
| `mediaLibrary` | Uploaded asset index (Cloudinary-backed) | Admin |
| `formDefinitions` | Forms Builder — form structure | Admin |
| `formSubmissions` | Forms Builder — submitted answers, partitioned by `formId` | Public create (server-mediated) |
| `newsletterSubscribers` | Newsletter subscriber list + unsubscribe tokens | Server-only |
| `newsletterCampaigns` | Sent-campaign history | Server-only |
| `contacts` | General contact form + volunteer applications (`department` field) | Public create |
| `enhanced_contacts` | **Dead** — has a `firestore.rules` entry but no code reads or writes it anymore (see §18) | — |
| `serviceRequests` | Wedding/baptism service requests | Public create |
| `auditLog` | Append-only admin action log | Server-only |
| `rateLimits` | Rate-limit counters | Server-only |
| `accountDeletionRequests` | GDPR account deletion queue | Server-only |
| `security_logs`, `emailNotifications` | Legacy/internal logging | Admin (super_admin) |

## 6. Public Site Map

**Core**
- `/` — Homepage
- `/about`, `/about/beliefs`, `/about/branches`, `/about/history`, `/about/pastors`
- `/services` — Service times
- `/contact` — Multi-step contact form
- `/community`

**Worship content**
- `/sermons` — Sermon list (video modal) · `/sermons/[id]` — shareable sermon detail page (added for SEO/sharing)
- `/events` — Event list (modal) · `/events/[id]` — shareable event detail page
- `/gallery` — Photo gallery + public submission
- `/podcast.xml` — Podcast RSS feed (sermons with an `audioUrl` set)

**Community / giving**
- `/ministries`, `/ministries/contact`, `/ministries/volunteer`
- `/small-groups`
- `/testimonials` — display + public submission
- `/resources` — downloadable files
- `/give` — giving info (see §19 — no payment processing)
- `/prayer` — prayer wall
- `/volunteer` — volunteer application

**Content**
- `/blog`, `/blog/[slug]`
- `/forms/[id]` — public renderer for any admin-defined form

**Account**
- `/login`, `/register`, `/dashboard`, `/profile`, `/settings`

**Legal / utility**
- `/privacy`, `/terms`, `/offline` (PWA offline fallback)
- `/services/request` — wedding/baptism request form
- `/sitemap.xml` (dynamic), `/robots.txt` (static)

## 7. Admin Panel

All under `/admin/*`, gated by `components/admin/AdminLayout.tsx`. Sidebar order:

| Screen | Route | Min role | What it does |
|---|---|---|---|
| Dashboard | `/admin` | admin | Real Firestore aggregation — new members, pending moderation, upcoming events, recent audit entries |
| Members | `/admin/users` | admin | Sortable/filterable table, role change (super_admin only), suspend/reactivate/delete, bulk actions, CSV export |
| Content | `/admin/content` | admin | 13 tabs: Sermons, Events, Gallery, Pastors, Ministries, Announcements, Blog, Small Groups, Testimonials, Resources, Redirects, Site Settings, **Content Types** (schema builder for defining new types) |
| Messages | `/admin/messages` | admin | Unified inbox: general contact submissions + volunteer applications + wedding/baptism requests |
| Media Library | `/admin/media` | admin | Upload/search/delete any file type (Cloudinary), reusable across all content forms |
| Forms | `/admin/forms` | admin | Build a custom form, get a shareable link, view/export submissions |
| Newsletter | `/admin/newsletter` | admin | Subscriber count, Resend-backed campaign composer, send history |
| Moderation Queue | `/admin/moderation` | moderator | Approve/reject prayer requests, comments, gallery submissions, testimonials in one view |
| Audit Log | `/admin/audit-log` | admin | Append-only, filterable, before/after per entry |
| Settings | `/admin/settings` | admin | Feature toggles, service times, one-click JSON backup export |

Every content tab (built-in or custom-type) shares one component (`GenericContentTab`) and gets, for free: draft/publish/scheduling, version history + restore, bulk CSV import/export, bulk delete, and a media picker on any file field.

## 8. API Routes

56 route files. Grouped by area (method omitted where a route has several):

- **Auth-gated admin CRUD:** `/api/admin/content/[type]`, `/api/admin/content/[type]/[id]`, `.../versions`, `.../versions/[versionId]/restore`
- **Schema builder:** `/api/admin/content-types`, `/api/admin/content-types/[slug]`, `/api/admin/custom-content/[slug]`, `/api/admin/custom-content/[slug]/[id]` (+ versions/restore)
- **Blog:** `/api/admin/blog`, `/api/admin/blog/[slug]` (+ versions/restore) — separate from generic content because slug is the doc ID
- **Media:** `/api/admin/media`, `/api/admin/media/[id]`
- **Forms:** `/api/admin/forms`, `/api/admin/forms/[id]`, `/api/admin/forms/[id]/submissions` (public: `/api/forms/[id]`, `/api/forms/[id]/submit`)
- **Newsletter:** `/api/admin/newsletter/subscribers`, `/api/admin/newsletter/campaigns` (public: `/api/newsletter/subscribe`, `/api/newsletter/unsubscribe`)
- **Messages:** `/api/admin/messages`, `/api/admin/messages/[collection]/[id]`
- **Moderation:** `/api/admin/moderation`, `/api/admin/moderation/[collection]/[id]`
- **Gallery:** `/api/admin/gallery`, `/api/admin/gallery/[id]` (public: `/api/gallery/submit`, `/api/gallery/upload`, `/api/gallery/comment`, `/api/gallery/like`, `/api/gallery/view`)
- **Members/settings/stats/audit:** `/api/admin/users`, `/api/admin/settings`, `/api/admin/stats`, `/api/admin/audit-log`
- **Backup:** `/api/admin/backup`
- **Public submissions:** `/api/contact`, `/api/prayer`, `/api/testimonials/submit`, `/api/services/request`
- **Member-facing:** `/api/member/dashboard`, `/api/privacy/download-data`, `/api/privacy/delete-account`
- **Misc:** `/api/search`, `/api/bible/verse`, `/api/tts` (orphaned, see §18), `/api/livestream`, `/api/livestream/chat`, `/api/ambient-audio`, `/api/docs`, `/api/health`

## 9. Content Management Capabilities

- **Draft/publish + scheduling** — every content type. `status: 'draft'|'published'` + optional `publishAt`; a draft becomes visible automatically once `publishAt` passes (computed at read time, no cron job).
- **Versioning** — every edit snapshots the pre-edit state; History/Restore UI per item; restoring creates a new version too (never a dead end).
- **Media library** — Cloudinary-backed, any file type, with a picker wired into content forms.
- **Custom content types (schema builder)** — define a new type's fields from the admin UI with zero code deploy. All custom types share one `customContent` collection so a new type is publicly readable immediately, without a `firestore.rules` redeploy.
- **Bulk CSV import/export + bulk delete** — on every content table.

## 10. Security

- **`firestore.rules`** — default-deny; every collection explicitly listed (see §5). Public-submission collections (`prayerRequests`, `galleryImages`, `comments`, `testimonials`, `contacts`, `serviceRequests`) allow anonymous `create`, gate `read`/`update`/`delete` by moderation status and role. Everything admin-only is either `allow read: if isAdmin(); allow write: if false` (server-mediated only) or `allow write: if isAdmin()` for the older, directly-admin-writable collections.
- **Rate limiting** (`lib/rateLimit.ts`, Firestore-transaction-backed, survives cold starts) on every unauthenticated public POST route, sized per route's abuse/cost profile — from 5/hour (prayer, contact, testimonials, newsletter signup) down to tighter windows for anything sending real email (3/hour for wedding/baptism requests) or costing real money per call (10/hour for text-to-speech).
- **Audit log** — every admin mutation is logged server-side via `withAudit()` (actor, action, before/after, IP) after the role check already passed. Clients cannot write to `auditLog` directly.

## 11. Third-Party Integrations

| Service | Used for | Status |
|---|---|---|
| Firebase Auth | All authentication | Live |
| Firestore | All data storage | Live |
| Cloudinary | Image/file uploads (gallery, media library) | Live |
| Resend | Transactional email (service requests, newsletter campaigns) | Live, domain-verified |
| Sentry | Error monitoring | Configured, actively used |
| Google Analytics | Traffic analytics | Live |
| Bible API | Daily verse | Live |
| AWS Polly | Text-to-speech | **Built and functional, but orphaned — no UI calls it** |
| YouTube | Sermon/livestream video embeds | Live (embed only, no API key needed) |

## 12. SEO & Discoverability

- Dynamic `app/sitemap.ts` — includes every static page, all blog posts, events, and sermons. Replaced an old hand-maintained static file.
- `Church`/Organization JSON-LD sitewide; `Article` JSON-LD on blog posts; `Event` JSON-LD on event detail pages; `VideoObject` JSON-LD on sermon detail pages (when a YouTube video is present).
- Per-page Open Graph + Twitter Card metadata via layout-level `metadata` exports (list pages) or `generateMetadata` (detail pages).
- Redirect manager (`/admin/content` → Redirects tab) for 301/302s, resolved via `next.config.js`'s `redirects()` at **build time** — see §18 for why, and the "takes effect on next deploy" trade-off.

## 13. PWA & Offline

- `next-pwa` generates the service worker (`public/sw.js`) at build time; disabled in development.
- `/offline` fallback page.
- Installable (manifest + install prompt component).

## 14. Internationalization

English and Tamil, via `contexts/LanguageContext.tsx` (a hand-rolled key→string dictionary, not `next-intl` — that was tried and removed). Missing translation keys fall back to rendering the raw key rather than crashing.

## 15. Testing

Playwright integration suite, run against a real dev server and the real Firebase project (test users/data created and cleaned up per-test, not mocked):

- `admin-auth.spec.ts` — table-driven 401 (unauthenticated) / 403 (wrong role) checks across every admin route (93 cases)
- `admin-moderation-and-escalation.spec.ts` — moderation audit trail, privilege-escalation attempts
- `admin-audit.spec.ts`, `audit-log-daterange.spec.ts` — audit log correctness and date-range filtering
- `enterprise-cms-flows.spec.ts` — real create/edit/restore/delete round-trips for the schema builder and forms builder
- `gallery-submission-e2e.spec.ts` — public submission → moderation → approval, file validation, rate limiting
- `rate-limiting.spec.ts` — every public POST route's limit/reset behavior
- `services-request-resilience.spec.ts` — Firestore write independence from email notification outcome
- `accessibility-new-pages.spec.ts` — axe-core scan of the newest public pages

All passing as of the last full run (130/130 + a separately-run 4/4 accessibility pass).

## 16. Environment Variables

Names and purpose only — see `.env.local` (gitignored, never committed) for actual values.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK config |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin SDK service account |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email sending |
| `ADMIN_EMAIL` | Where service-request admin notifications go |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Analytics |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Media uploads |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring |
| `BIBLE_API_KEY`, `NEXT_PUBLIC_BIBLE_API_KEY` | Daily verse |

Everything else that used to be here (Sanity, Twilio, Razorpay, Cloudflare, VAPID, Algolia, JWT/encryption keys, GDPR/child-protection flags) was removed as dead/unused — confirmed by grepping actual `process.env.*` usage across the codebase before deleting each one.

## 17. Deployment

- **App code:** Vercel (implied by `vercel --prod` in `package.json`'s `deploy` script and Vercel-specific headers config). Deploys on push if connected to this repo.
- **Firestore rules/indexes:** `firebase deploy --only firestore:rules,firestore:indexes` — separate from the app deploy. The account running this needs the `Firebase Admin` **and** `Service Usage Consumer` IAM roles on the GCP project; `Firebase Admin` alone is not sufficient (`serviceusage.services.use` isn't included in it).
- **Redirects:** resolved from the `redirects` Firestore collection at Next.js build time (`next.config.js`), so a newly-added redirect needs a fresh deploy to take effect — not instant.

## 18. Known Gaps & Limitations

- **`notFound()` returns HTTP 200, not 404** on `/blog/[slug]`, `/events/[id]`, `/sermons/[id]`. Documented Next.js behavior: the root `app/loading.tsx` wraps every route in a Suspense boundary, and Next.js returns 200 for streamed `notFound()` responses. The rendered "not found" content is correct; only the raw status code is wrong. Fixing it means removing the site's global loading spinner — a separate, deliberate change, not done here.
- **The redirect manager isn't instant** — it's resolved at build time via `next.config.js`, not per-request, specifically to avoid the same Suspense/streaming problem above (an earlier version that read `headers()` in `not-found.tsx` was found to force the *entire site* to render dynamically instead of statically). Stated in the admin UI itself.
- **`/api/tts` (AWS Polly text-to-speech) is orphaned** — fully built, rate-limited, would work, but no component calls it.
- **`enhanced_contacts` has a dead `firestore.rules` entry** — the only route that ever used it (`/api/contact/admin`) was removed as dead code; the rule itself was never cleaned up. Harmless (nothing reads/writes it) but should be removed next time `firestore.rules` is touched.
- **The accessibility scan covers only 4 public pages** (`/blog`, `/small-groups`, `/testimonials`, `/resources`) — none of the new admin screens have been scanned (would need an authenticated browser session the current test doesn't set up).
- **Composite Firestore indexes** are declared in `firestore.indexes.json` and deployed; if a not-yet-exercised query combination throws `FAILED_PRECONDITION`, either redeploy indexes or use the direct link Firestore includes in that error.

## 19. Explicitly Not Built

Scoped out deliberately, not forgotten:

- **Online payments/donations** — `/give` has a real, prior decision not to fake a payment flow pending real bank account details from the church. Building this now would mean either wiring a real payment gateway (a business decision — which provider, real merchant credentials) or shipping something that looks functional but isn't.
- **SMS/WhatsApp notifications** — no vendor account, no request for one.
- **AI features** (sermon transcription, chatbot, etc.) — no AI provider API key configured.
- **Multi-campus support** — speculative for a single-congregation site; would be real, unnecessary complexity today.
- **Membership/pastoral-care records** (baptism, marriage, funeral, family relationships, child check-in) — sensitive personal data that deserves a deliberate schema designed *with* church staff, not guessed. The schema builder (§9) can model any of these later without a code change.
- **CI/CD pipelines, a public GraphQL API, feature-flag infrastructure** — ops tooling, largely already covered in spirit by the Settings feature toggles; not "CMS" in the sense originally asked for.

## 20. Directory Structure

```
app/                     Next.js App Router — pages + API routes
  admin/                 Admin panel pages (10 screens)
  api/                    56 route.ts files
  [public pages]/         ~30 public routes
components/
  admin/                  Admin-only UI (AdminLayout, GenericContentTab, modals)
  [public components]/    Navbar, Footer, modals, effects, etc.
contexts/                 AuthContext, LanguageContext, ThemeContext, LoadingContext
lib/                      Firebase clients, api-auth, rateLimit, content.ts (public reads), etc.
models/                   TypeScript data-shape interfaces (a few legacy ones; most shapes now live inline in lib/content.ts)
types/                    Shared schema types (FieldSchema, ContentTypeDefinition, FormDefinition)
tests/                    Playwright integration suite + helpers/testAuth.ts
public/                   Static assets, generated service worker, manifest
firestore.rules           Security rules (source of truth for the client-SDK access boundary)
firestore.indexes.json    Composite index declarations
middleware.ts             Security headers, cache-control policy
next.config.js            Build config, image domains, redirects() (build-time redirect resolution)
```
