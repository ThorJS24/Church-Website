# Feature Build Plan

Curated from `FEATURE_ROADMAP` (the 580+ item artifact) down to what's actually
buildable now: existing stack only (Next.js/Firestore/Resend/Papaparse), no
new paid integrations (no payment processor, SMS, AI API, or church-software
sync — those stay on the roadmap for later, once those accounts exist).
~165 items. Built in batches, committed as each batch ships, checked off here
so progress survives context resets across sessions.

**How to resume this**: find the first unchecked batch below, implement it
end-to-end (schema + admin UI + public UI as applicable), verify with
type-check/lint/a quick manual pass, commit, check it off, move to the next.

---

## Admin

### Batch A1 — Dashboard ✅
- [x] Unified action inbox (messages + moderation + form submissions, one feed)
- [x] Content freshness indicator (sermons/pages untouched 30+ days)
- [x] Upcoming-event countdown strip
- [x] Role distribution chart
- [x] Audit activity sparkline (staff engagement over time)
- [x] Quick announcement composer (post to homepage banner from dashboard)
- [x] New-member welcome queue (recent registrations)

### Batch A2 — Members ✅
- [x] Photo grid view toggle
- [x] Custom tags/segments
- [x] CSV roster import
- [x] Staff-only pastoral notes field
- [x] Emergency contact fields
- [x] Inactive-member flagging
- [x] Bulk email to a filtered segment (via Resend)
- [x] Household/family grouping

### Batch A3 — Content ✅
- [x] Shared content calendar view
- [x] Cross-type search
- [x] Bulk publish/unpublish (extend existing bulk-select)
- [x] Duplicate-as-new
- [x] Tag taxonomy manager
- [x] SEO fields (meta description, share image) with preview
- [x] Sermon series builder

### Batch A4 — Messages
- [ ] Reply from inbox (via Resend)
- [ ] Canned response templates
- [ ] Priority flagging
- [ ] Internal staff-only comment thread
- [ ] Assign to staff member
- [ ] Linked member lookup (match sender email to a member)
- [ ] Full-field search

### Batch A5 — Media Library
- [ ] Folder/album organization
- [ ] Bulk tagging and search-by-tag
- [ ] Trash/restore window (soft delete)
- [ ] Duplicate-file detection
- [ ] Alt-text enforcement
- [ ] Copyright/license field
- [ ] Usage tracker (where is this image referenced)

### Batch A6 — Forms
- [ ] Conditional field logic
- [ ] File upload field type
- [ ] Notification routing (per-form staff email)
- [ ] Duplicate-submission prevention
- [ ] Custom thank-you page per form
- [ ] Bulk submission actions

### Batch A7 — Newsletter
- [ ] Subscriber segmentation by tag
- [ ] Digest auto-compiler (pull recent content into a draft)
- [ ] Preference center
- [ ] Campaign public archive view
- [ ] Basic rich-text campaign editor

### Batch A8 — Moderation Queue
- [ ] Bulk approve/reject
- [ ] Rejection-reason templates
- [ ] Preview-in-context
- [ ] Batch image review grid
- [ ] Side-by-side before/after for edits
- [ ] Queue SLA display (time pending)

### Batch A9 — Audit Log
- [ ] Advanced filter builder (actor + action + date range + target combined)
- [ ] Saved filter presets
- [ ] Grouped bulk-op view
- [ ] Target history view (all changes to one record)
- [ ] CSV export
- [ ] Free-text search across payloads

### Batch A10 — Settings
- [ ] Theme customizer (accent color override)
- [ ] Role-permission matrix (read-only view first)
- [ ] 404/broken-link report
- [ ] Backup restore tool
- [ ] System health page

---

## Public

### Batch P1 — Home
- [ ] Welcome-back state for logged-in members
- [ ] Recent-sermon auto-carousel
- [ ] "This week at a glance" digest block
- [ ] Countdown to next major event
- [ ] Social proof strip

### Batch P2 — About / Beliefs / Pastors / Branches
- [ ] Interactive doctrinal statement (expandable scripture refs)
- [ ] Pastor bio + their recent sermons
- [ ] FAQ accordion
- [ ] Leadership listing
- [ ] History timeline (interactive)

### Batch P3 — Services + Request
- [ ] Add-to-calendar per service
- [ ] What-to-expect info block
- [ ] Accessibility accommodations info per service
- [ ] Visible request-status tracker for the requester
- [ ] Document checklist per request type

### Batch P4 — Sermons
- [ ] Scripture-reference index/browse
- [ ] Speaker filter with bio card
- [ ] Related-sermon recommendations (topic/scripture)
- [ ] Listen-later queue (member feature)
- [ ] Print-friendly transcript view

### Batch P5 — Events
- [ ] RSVP with headcount
- [ ] Waitlist at capacity
- [ ] Personal iCal export (filtered)
- [ ] Cancellation broadcast to registrants
- [ ] Post-event photo gallery auto-link

### Batch P6 — Blog
- [ ] Author profile pages
- [ ] Category landing pages
- [ ] RSS feed
- [ ] Related-post recommendations
- [ ] Print/PDF view

### Batch P7 — Gallery
- [ ] Photo tagging
- [ ] Sort by most-liked/viewed
- [ ] Album download (zip)
- [ ] Private/family-only albums
- [ ] Comment/reaction on photos

### Batch P8 — Ministries
- [ ] Ministry finder filter
- [ ] Leader contact card
- [ ] Volunteer opportunity board
- [ ] Testimonial spotlight per ministry
- [ ] Team photo roster

### Batch P9 — Small Groups
- [ ] Finder by location/day/stage
- [ ] Capacity indicator
- [ ] Join-request workflow
- [ ] Group directory (opt-in)
- [ ] Group resource sharing

### Batch P10 — Testimonials
- [ ] Category filter
- [ ] Featured rotation
- [ ] Anonymous/first-name display option
- [ ] Search by keyword
- [ ] Consent capture at submission

### Batch P11 — Resources
- [ ] Type filter
- [ ] Personal library/bookmark
- [ ] Age-appropriate filtering
- [ ] Resource request form
- [ ] Rating/review from members

### Batch P12 — Give (no payment integration yet)
- [ ] Fund/designation informational selector
- [ ] Giving FAQ
- [ ] Transparency report
- [ ] Legacy/planned-giving info page

### Batch P13 — Prayer
- [ ] Status tracking (praying/answered/ongoing)
- [ ] "I'm praying for this" tally
- [ ] Public/private toggle
- [ ] Category selection
- [ ] Answered-prayer archive
- [ ] Follow-up check-in prompt

### Batch P14 — Volunteer
- [ ] Opportunity board
- [ ] Shift sign-up calendar
- [ ] Skills inventory intake
- [ ] Family volunteer flag
- [ ] Volunteer hour log

### Batch P15 — Contact / Community
- [ ] Department/staff routing
- [ ] Response-time expectation display
- [ ] Local resource directory
- [ ] FAQ accordion
- [ ] Community survey

### Batch P16 — Forms (public render)
- [ ] Auto-save draft
- [ ] Progress indicator (multi-step)
- [ ] Improved inline validation messaging
- [ ] Confirmation email with a copy of answers
- [ ] Duplicate-submission warning

### Batch P17 — Member Area
- [ ] Saved sermons/posts library
- [ ] Ministry involvement summary
- [ ] Communication preference center
- [ ] Activity timeline
- [ ] Quick-actions widget

### Batch P18 — Login / Register
- [ ] Progressive registration
- [ ] Referral field
- [ ] Welcome tour on first login
- [ ] Password strength meter
- [ ] Membership self-declaration at signup

### Batch P19 — Privacy / Terms
- [ ] Plain-language summary alongside legal text
- [ ] Change comparison view (diff between versions)
- [ ] Print/PDF download
- [ ] Policy FAQ

---

## Explicitly deferred (needs a new paid integration/account first)

Payment processor (Give: recurring gifts, text-to-give, stock/crypto), SMS/WhatsApp
(prayer chain broadcast, shift reminders), AI summarization/transcription,
church-management-software sync (Breeze/Planning Center), face recognition,
video hosting beyond YouTube embeds. Revisit once those accounts exist.
