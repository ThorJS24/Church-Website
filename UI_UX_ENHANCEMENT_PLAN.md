# UI/UX Enhancement Plan

A backlog of concrete, scoped UI/UX improvements on top of the completed warm-rebuild
(navy + gold, Fraunces + Figtree, shadcn/Radix component library). Grouped by area,
roughly ordered by effort within each group. Nothing here touches Firestore schema,
security rules, or auth logic — these are presentation/interaction layer only unless
explicitly noted as needing a small new field.

Tags: **[Quick]** ≤ half a day · **[Med]** 1-3 days · **[Large]** multi-day/phase.
Not a commitment to build all 50+ — pick what's worth it, drop the rest.

---

## 1. Homepage

1. **[Quick]** Fix/populate the "Latest Announcements" section — currently renders an
   empty box when there's no announcement (confirm it's a real empty-state, not a bug,
   and give it a proper empty-state illustration/message instead of blank space).
2. **[Quick]** Skeleton loaders for the async homepage sections (verse, next service,
   stats, gallery preview) instead of a layout jump when data resolves — there's no
   `Skeleton` primitive in the codebase anymore; worth reintroducing purpose-built ones
   for this if the jump is visible on slow connections.
3. **[Med]** "Live now" state: promote it above the fold with a persistent, dismissible
   pill in the navbar (not just the hero button) so it's visible even after scrolling.
4. **[Med]** Personalized homepage strip for logged-in members — "Welcome back, {name}",
   their next RSVP'd event, saved sermons — using data `MemberDashboard.tsx` already
   fetches.
5. **[Med]** Verse-of-the-day: add a "share as image" export (canvas-rendered card with
   verse + church branding) alongside the existing copy/share.
6. **[Large]** Hero background: rotate through a small curated set of congregation
   photos (currently one static `hero-bg.jpg`) with a subtle crossfade, respecting
   `prefers-reduced-motion`.

## 2. Navigation & Wayfinding

7. **[Quick]** Active route indicator in the navbar beyond the underline — add it to
   the mobile bottom nav too (`MobileBottomNav.tsx`), currently unclear which tab is active.
8. **[Quick]** Breadcrumbs on deep pages (`/about/pastors`, `/blog/category/[category]`,
   `/small-groups/[id]`) — `components/ui/breadcrumbs.tsx` already exists, just needs wiring.
9. **[Med]** Sticky "jump to section" mini-nav on long pages (`/about/beliefs`, `/services`).
10. **[Med]** Command palette (`CommandPalette.tsx`) — add recent searches, and surface
    quick actions ("Submit a prayer request," "RSVP to next event") alongside content results.
11. **[Med]** 404 page: replace generic Next.js default with a branded page offering
    search + top 3 popular routes (sermons, events, give).
12. **[Large]** Mega-menu for "More" nav dropdown once it exceeds ~8 items — group by
    Worship / Community / Give / Account instead of a flat list.

## 3. Sermons & Media

13. **[Quick]** "Continue watching" resume position for sermon videos (localStorage,
    no schema change) — surface it as a homepage/sermons-list card.
14. **[Quick]** Playback speed control on the sermon video player.
15. **[Med]** Sermon transcript search — if transcripts exist in the data, let users
    search within one and jump to that timestamp.
16. **[Med]** "Related sermons" carousel on `/sermons/[id]` by series/speaker/tag.
17. **[Med]** Downloadable audio-only version for sermons (bandwidth-friendly, good for
    older congregants on limited data).
18. **[Med]** Sermon notes: a simple text field members can jot personal notes into
    while watching, saved to their profile.
19. **[Large]** Series landing pages — group sermons by series with a dedicated hero
    and progress-through-series indicator.

## 4. Events & Calendar

20. **[Quick]** Add-to-calendar button per event (Google/Apple/Outlook) — iCal export
    API already exists (`/api/events/ical`), just needs a one-click UI.
21. **[Quick]** "X people going" social proof on event cards, using existing RSVP data.
22. **[Med]** Event reminder opt-in (email/push the morning of) — UI toggle per RSVP.
23. **[Med]** Recurring-event visual grouping in `InteractiveCalendar.tsx` — a weekly
    Bible study shouldn't produce 52 identical entries in the list view.
24. **[Med]** Map thumbnail on event cards (not just the modal) for location-aware browsing.
25. **[Large]** Personal calendar sync — subscribe to a per-member iCal feed of RSVP'd
    events that stays live-updated, not a one-time export.

## 5. Giving

26. **[Quick]** Suggested-amount chips (e.g., $25/$50/$100/custom) ready for whenever a
    payment gateway is wired in — currently `/give` only shows bank-transfer instructions.
27. **[Med]** Recurring-giving explainer section — even pre-payment-gateway, explain
    what recurring giving will look like so members can plan.
28. **[Med]** Giving impact stories — "here's what your gifts supported this quarter" —
    pairs well with `/testimonials`.
29. **[Large]** Full giving history in the member dashboard once a payment gateway
    lands (dashboard already has a stubbed `donationTotal: 0` waiting for this).

## 6. Prayer & Community

30. **[Quick]** "Praying for you" counter animation (currently functional via
    `/api/prayer/pray`) — add a satisfying micro-interaction on click (heart burst,
    haptic-style scale).
31. **[Med]** Prayer request status tracking for the submitter ("your request is being
    prayed for by 12 people") without exposing who, respecting the existing
    public/private toggle.
32. **[Med]** Testimonials: add a lightweight submission flow so members can submit
    their own (currently admin-populated only, per the content model).
33. **[Med]** Small group finder — filter by day/time/location/topic instead of a flat list.
34. **[Large]** Member directory (opt-in) for small group members to connect with each
    other — needs a privacy-first opt-in model, not default-on.

## 7. Blog & Content

35. **[Quick]** Reading time + progress bar are built (`ReadingProgressBar.tsx`) —
    confirm they're wired on every blog post, and extend to sermon transcript pages.
36. **[Quick]** "Save for later" / bookmark on blog posts and sermons, surfaced in the
    member dashboard's "saved items" (dashboard already aggregates saved items).
37. **[Med]** Related-posts algorithm improvement — tag/category-based instead of pure recency.
38. **[Med]** Author bio card at the end of posts, linking to `/blog/author/[name]`.
39. **[Med]** Print-friendly stylesheet for blog posts and sermon notes
    (`PrintButton.tsx` exists — verify the print CSS actually strips nav/footer/ads-equivalent chrome).

## 8. Gallery

40. **[Quick]** Masonry layout polish — verify true variable-height masonry, not a
    fixed-aspect grid pretending to be one.
41. **[Med]** Album cover auto-selection (most-liked photo) instead of first-uploaded.
42. **[Med]** Lightbox keyboard nav (arrow keys, Esc) — verify it's implemented, not just visual.
43. **[Large]** Face-blur/consent workflow for photos of minors before public gallery
    publish — a real safeguarding feature, worth prioritizing even though it's more
    moderation-workflow than pure UI.

## 9. Member Account & Dashboard

44. **[Med]** Profile completeness indicator with gentle prompts (add photo, phone,
    family members) — encourages richer member data over time.
45. **[Med]** Activity timeline polish — dashboard aggregates prayer requests/volunteer
    hours/saved items already; present as a unified, filterable timeline instead of separate blocks.
46. **[Med]** Notification preferences center — granular per-channel (email/push) and
    per-category (events, prayer updates, newsletter) toggles.
47. **[Large]** Family accounts — link household members under one profile for RSVP/giving continuity.

## 10. Notifications

48. **[Med]** In-app notification bell with an inbox (list of past notifications), not
    just transient toasts (`NotificationSystem.tsx`/sonner currently only do point-in-time toasts).
49. **[Med]** Push notification opt-in prompt timed well (after a positive action, not
    on page load) — ties into the existing PWA install prompt flow.

## 11. Search

50. **[Quick]** Empty-state and zero-results suggestions in the command palette
    ("Try 'sermons' or 'events'") instead of a blank list.
51. **[Med]** Search result type icons/badges (sermon vs event vs blog vs page) for
    faster scanning — command palette exists, verify this is already visually distinct.
52. **[Med]** Recent + trending searches surfaced before the user types anything.

## 12. Accessibility

53. **[Quick]** Run an automated contrast/ARIA audit pass specifically against the
    *new* warm palette (last one was done for the previous rebuild's tokens).
54. **[Quick]** Verify every icon-only button sitewide has an accessible label — this
    was a real bug class in the first rebuild (`IconButton` requires a `label` prop by
    type, but confirm no call sites suppress it).
55. **[Med]** Font-size / line-height user preference (beyond browser zoom) for
    older congregants — a persistent "larger text" toggle.
56. **[Med]** High-contrast theme variant beyond light/dark, for low-vision users.
57. **[Large]** Full keyboard-nav audit of every Radix-based interactive component
    (Dialog, DropdownMenu, Select, Tabs, Accordion) — the plan for the second rebuild
    called for this in Phase 12; worth a dedicated re-pass now that the layout bugs are fixed.

## 13. Performance & PWA

58. **[Quick]** Generate the full PWA icon set — only one size (`icon-144x144.png`)
    currently exists; add 192/512 and maskable variants for proper install prompts on
    Android/iOS.
59. **[Med]** Image loading audit — confirm `next/image` + lazy-loading is used
    consistently across gallery/blog/sermon thumbnails, not just the hero.
60. **[Med]** Route-level loading states audit — confirm every route has a meaningful
    `loading.tsx`, not a generic spinner.
61. **[Large]** Lighthouse pass now that layout is fixed (font payload, CLS, LCP) — the
    rebuild plan called for this in Phase 12 but the collapsed-spacing bug this session
    just fixed would have skewed CLS/LCP measurements taken before today.

## 14. Admin Panel

62. **[Med]** Dashboard home (`/admin`) — add at-a-glance sparkline trends (new members,
    prayer requests, giving-related content once available) instead of static counts.
63. **[Med]** Bulk actions polish across content tabs — confirm keyboard shortcuts
    (select-all, delete) work consistently across every `GenericContentTab`-driven type.
64. **[Med]** Content calendar view (`ContentCalendarTab`) — add drag-to-reschedule for
    scheduled posts/announcements.
65. **[Large]** Role-based dashboard customization — a moderator's `/admin` landing
    should surface the moderation queue first, not the same generic overview every role sees.

## 15. Micro-interactions & Polish

66. **[Quick]** Toast notifications: verify success/error variants are used consistently
    sitewide (sonner is wired via `lib/toast.ts` — audit call sites for the right variant).
67. **[Quick]** Hover/focus states audit on all card components — confirm the shadow/border
    lift on hover (now that shadows actually render post-fix) reads consistently everywhere.
68. **[Med]** Page transition polish — subtle fade/slide between route changes via
    `MotionConfig`, respecting reduced-motion.
69. **[Med]** Form validation micro-interactions — inline shake/highlight on error
    instead of just red text, across `/services/request`, `/forms/[id]`, contact forms.
70. **[Med]** Confetti/celebration moment for meaningful actions (first prayer request
    answered, event RSVP confirmed) — used sparingly, not everywhere.

## 16. Mobile

71. **[Quick]** Verify `MobileBottomNav` doesn't overlap the cookie popup or in-page
    sticky elements now that the popup is a centered modal (should be fine post-fix,
    worth a real-device check).
72. **[Med]** Swipe gestures for the gallery lightbox and sermon carousel.
73. **[Med]** Bottom-sheet pattern (`components/ui/sheet.tsx` exists) for mobile filters
    on `/events`, `/sermons`, `/gallery` instead of a full-page filter panel.
74. **[Large]** One-thumb-reachable redesign pass for the mobile bottom nav + FAB
    actions (prayer request, give) — audit tap-target placement against real thumb-zone research.

## 17. Trust & Social Proof

75. **[Quick]** "As seen at 3 weekly services" / member-count stat bar is present on
    the homepage — extend the same pattern to `/about` and `/ministries`.
76. **[Med]** Staff/pastor bios with a warmer, more personal card design on
    `/about/pastors` — photo + short personal note, not just title.
77. **[Med]** Testimonial carousel on the homepage (currently only a dedicated
    `/testimonials` page) — surface 2-3 rotating quotes above the fold.

---

## Suggested sequencing

If picking a first slice rather than the whole backlog:

- **Sprint 1 (quick wins, ~1 week)**: items 1, 2, 7, 8, 20, 21, 30, 35, 36, 40, 53, 54, 58, 66, 67 — all `[Quick]`, high visible impact, low risk.
- **Sprint 2 (accessibility + PWA hardening)**: 55-59, 61 — worth doing as a block since they share an audit-then-fix workflow.
- **Sprint 3 (member engagement)**: 4, 13, 18, 36, 44-46, 48 — deepens the logged-in experience, which is currently the thinnest part of the site relative to the public pages.
- **Later**: giving-related items (26-29) once a payment gateway decision is made — that's a business/vendor decision outside UI/UX scope, but the UI can be built ahead of it.
