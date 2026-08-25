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

---

## Currently being rebuilt

Nothing in-flight at the end of this session.

---

## Remaining areas (by blueprint phase)

**Phase 4/5 — Public pages**, still on the pre-rebuild/second-rebuild reskin,
not yet given first-principles treatment: `/about/*` (beliefs, branches,
history, pastors), `/events` + `/events/[id]`, `/sermons` + detail + series,
`/services` + request/status, `/blog` + detail/author/category, `/gallery`,
`/give` + `/give/legacy`, `/prayer`, `/testimonials`, `/resources`,
`/small-groups` + detail, `/community`, `/contact`, `/newsletter/*`,
`/volunteer`, `/login`, `/register`, `/privacy`, `/terms`.

**Phase 6 — Member experience**: `/dashboard`, `/profile`. Not yet redesigned;
`/settings` is the only member-area page done so far, and it should not be
treated as proof the others are — `PROJECT_STATE.md` explicitly flags that the
member experience needs its own information hierarchy, not "public site + a
profile icon."

**Phase 8 — Admin**: all 10 `/admin/*` screens are on the second-rebuild's
shared-component reskin, not a first-principles admin IA pass.

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
