# FRONTEND_REBUILD_STATUS.md — Warm Rebuild Progress

Tracking document for the page-by-page visual rebuild on `redesign/warm-rebuild`.
See `PROJECT_STATE.md` for the functional/architecture baseline — that document
does not get rewritten as this progresses; this one does.

---

## Completed areas

**Phase 1 — Foundation (done, prior sessions)**
Design tokens, typography, color system (Terracotta Earth: sandstone/clay/olive),
spacing, radius, shadow, and border systems are all in place in `app/globals.css`.
Three site-wide cascade-layer bugs (Preflight `border`/`bg`/`radius` resets beating
utilities; unlayered `border-color` beating `border-transparent`; bare `<button>`
chrome) were found and fixed at the component level — see `PROJECT_STATE.md` §12/§14.

**Phase 2 — Application shell (done, prior + this session)**
- Header/`Navbar.tsx` — rebuilt from first principles (prior session).
- `Footer.tsx`, `MobileBottomNav.tsx` — inspected this session, already consistent
  with the current design language (warm tokens, real touch targets, no leftover
  SaaS-toolbar patterns). No changes needed.

**Phase 4/5 — Public pages (in progress)**
- `/settings` — rebuilt from first principles (prior session).
- `/` homepage hero — rebuilt as "Layered Blobs" (prior session).
- `/ministries` — redesigned this session. Replaced the generic
  "hero + uniform 3-col card grid + CTA" composition (the exact anti-pattern
  the design direction calls out) with a grouped, alternating image/text row
  layout — ministries are grouped under a category heading (dot + label + rule)
  when the data has a matching category, and rows alternate image-left/
  image-right down the page instead of a repeating card grid. Verified in real
  Chrome via Playwright at 1440px: renders correctly, no layout breaks, search/
  filter functionality untouched.
  - **Known data gap surfaced, not fixed:** the live `ministries` Firestore docs
    in this environment have no `category` value set, so today all ministries
    render as a single ungrouped list (the category filter chips technically
    still work, they just have nothing to filter against in this dataset). This
    is a content/data issue, not a redesign bug — the grouping UI is there and
    will activate once ministry docs carry real category values. Left as-is per
    "preserve functionality, don't invent new backend behavior."
- `/give` — done. "Your Impact" is now a bordered stat-strip (amount-first,
  icon inline), "Ways to Give" is a connected vertical stepper (icon
  medallion + line). "Why We Give" was left as plain centered icon+text
  (no card wrapper, already reads distinctly from the other two). Fund
  selector cards, transparency bars, and legacy-giving card untouched — each
  already a distinct treatment. No functional change; verified in real
  Chrome at both steps.
- `/community` — the page repeated the same "centered icon + heading + card
  grid" block five times in a row. Rewrote two: Missions & Local Outreach is
  now a divided list (location pinned right) instead of a 3-card grid;
  Outreach Stories got an accent-bordered editorial card instead of a plain
  icon card. Resource directory (search + grid — appropriate for a directory)
  and testimonies (quote cards — already distinct) left as-is. **Could not be
  visually verified**: this environment has no seeded `community` page
  content, so these sections render as the page's empty state; only
  type-checked, not browser-verified. Re-verify in real Chrome once content
  exists or a Firestore emulator/seed is available.

**Pages checked and intentionally left alone (already well-differentiated,
not the generic pattern)**: `/about/pastors` (photo cards + staff grid + bio
modal cross-referenced with sermons), `/about/beliefs` (varies composition
per section: mission/vision cards, values grid, belief checklist, accordion
FAQ), `/about/branches` (photo cards + rich detail modal with carousel/map),
`/about/history` (purpose-built vertical timeline with search/filter/
autoplay — not a card grid at all), `/services` (service-time cards, plain
icon list, badge-dated events, 2-col video panel, accent CTA — five
different treatments already), `/events` (photo-driven card grid,
appropriate for event browsing), `/contact` (multi-step form + info
sidebar, staff grid, map — already rich and varied), `/login` (a focused
centered auth card — the right composition for a single form, not the
collage anti-pattern), `/testimonials`, `/small-groups`, `/volunteer`,
`/resources`, `/prayer` (each a single-purpose listing page with one grid
suited to its content, same idiom as `/events` — not the repeated-pattern
issue). `/sermons` (grid/timeline view toggle, featured-sermon card, video
thumbnails). `/gallery` (masonry layout, not a card grid).

---

## Currently being rebuilt

Nothing in-flight at the end of this session.

---

## Remaining areas (by blueprint phase)

**Phase 4/5 — Public pages**, still on the pre-rebuild/second-rebuild reskin,
not yet given first-principles treatment or a redesign-candidacy check:
`/events/[id]`, `/sermons/[id]`, `/sermons/series/[id]`,
`/services/request` + `/services/request/status`, `/blog` + detail/author/
category, `/give/legacy`, `/newsletter/*`, `/register`, `/privacy`, `/terms`.

**Public page audit is essentially complete for the list pages.** Every
top-level public listing page has now been either redesigned or checked and
confirmed already-differentiated (see above). What's left in Phase 4/5 is
mostly detail/sub-pages (`[id]` routes) and legal/utility pages, which are
lower-traffic and lower design-risk than the list pages just covered.

**Phase 6 — Member experience**: checked this session. `/dashboard`
(`components/MemberDashboard.tsx`) already has a genuine dashboard
hierarchy — stat-card row, quick-actions grid, filterable activity
timeline, saved-items library, sidebar profile card + ministry
involvement — not "public site with a profile icon." `/profile` is an
edit-in-place profile card with a completeness meter, distinct from both
`/dashboard` and `/settings`. Neither needed changes; `PROJECT_STATE.md`'s
concern about the member area looking like the public site does not hold
up against the actual code.

**Phase 8 — Admin**: not yet audited this session. All 10 `/admin/*`
screens are still on the second-rebuild's shared-component reskin — next
priority.

**Phase 9 — Responsive**: verify each page above at the 6 standard breakpoints
as it's redesigned, not as a separate pass at the end.

---

## Known visual issues

- Ministry cards without `imageUrl` fall back to a plain icon tile — acceptable,
  but worth a look once real ministry photos exist in the CMS.
- Everything not yet listed as "done" above should be assumed visually
  provisional (carried over from the second rebuild's systematic reskin), not a
  finished reference, per `PROJECT_STATE.md` §6/§14.

## Known functional issues

None introduced this session. Pre-existing gaps (no password reset, orphaned
`/api/tts`, `/api/search` draft-status filter unconfirmed, `/api/health` stub)
are tracked in `PROJECT_STATE.md` §12/§19 and out of scope for a visual pass.

---

## Regression findings

- `/ministries`: none found after real-browser verification (Playwright + system
  Chrome, 1440px). Search input, category filter chips, "Join Ministry"/"Learn
  More" links, and the bottom CTA section all still point at their original
  routes/handlers — only markup/composition changed.
