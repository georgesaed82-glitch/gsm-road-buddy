
# GSM Complete Platform — Phased Roadmap

You've asked for the full platform in one go. To be honest with you: shipping all of this in a single turn produces 40 half-broken features. I'm proposing a 6-phase roadmap where each phase is a shippable, publishable milestone. Reply with the phase you want me to start (or "start Phase 1" to go in order).

---

## Phase 1 — Website polish & UX (this session)

Everything you listed under "Complete Website & User Experience". Ships as one commit, then publish.

**Bug sweep**
- `mailto:` / `tel:` audit across Header, Footer, Contact, GSM Plus, Portal
- Language selector: fix Google Translate init race, mobile tap target, outside-click close, keyboard access
- `Zoomable` lightbox: always-visible close button (safe-area), ESC + swipe-down close, wrap remaining gallery/VRP images
- Opening hours: single `site_settings` field feeds banner + contact page
- Broken link scan → `tests/link-audit.ts`
- Focus rings + skip-to-content link + `alt` sweep for accessibility
- Perf: preload hero image, lazy-load below-the-fold sections, defer heavy anims until in view

**Homepage sticky jump-nav** — extend existing `HomeSectionNav` with the full list you gave (Why GSM, Areas, Lessons, Theory, Hazard, Reviews, GSM Plus, Instructors, FAQ, Contact) and add anchor IDs to every section.

**GSM Plus explainer redesign** — replace current block with What / Who / Free vs Premium table / 11 feature cards, moved directly under hero.

**Pricing transparency band** — £45–£75/hr, "what affects price" list, keep CTA.

**Instructor profile pages** — extend `instructors` table with `qualification`, `years_experience`, `languages[]`, `teaching_style`, `areas_covered[]`, `bio_long`; new `/instructors/$slug` route; upgraded card + admin form.

**Blog gate** — hide `/blog`, Header/Footer/sitemap links behind `BLOG_ENABLED` flag (already in code) until content is ready.

**FAQ merge** — move About FAQs into `/faq` and de-duplicate.

**Cross-browser QA** — Playwright pass on Chrome/Safari/Firefox/Edge viewports (desktop, tablet, mobile).

---

## Phase 2 — Student Progress System (own session)

The 6-state progress tracker across the full DVSA + GSM syllabus. Data-heavy, needs a fresh session.

- New tables: `syllabus_modules`, `syllabus_topics`, `student_progress` (status enum: not_started / in_progress / practised / independent / test_standard / completed), `lesson_notes`, `homework_items`
- Seed migration with all 4 DVSA modules + Extra Visuals + your full GSM system list (BGO, POM 2-6-2, 15-70-15, etc.)
- Instructor UI: per-student progress board with status toggle, notes, homework
- Student view inside GSM Plus dashboard
- Progress rings on lesson cards

## Phase 3 — AI Lesson Reports (own session)

Depends on Phase 2 tables.
- Instructor dictation → Lovable AI STT (`openai/gpt-4o-transcribe`)
- Auto-summary → Lovable AI chat model → structured strengths / weaknesses / homework / next objectives
- Save to `lesson_notes` linked to the student + topics
- Email summary to student (optional)

## Phase 4 — Lesson Planner (own session)

- Booking model redesign: upcoming / previous, duration, calendar view
- `.ics` export + optional Google Calendar via existing `google_calendar` App User Connector
- Reschedule + cancel requests with 48h policy engine
- Instructor + student notifications

## Phase 5 — Photorealistic VRP & realistic diagrams (own session, needs your input)

- I'll build the dashboard-photo + overlay pipeline
- Requires 6–10 reference photos from inside your teaching car (dashboard, side mirrors, interior mirror, standard parking view, bay lines view) — you shoot them, I integrate
- Same style applied to all reference-point lessons

## Phase 6 — AI video library & hazard perception (multi-week product)

Not a one-session job — it's video production plus an admin content pipeline.
- Ship the video player + admin upload/tag pipeline first (same session as start)
- Commission or generate realistic UK-road clips over time
- Categories you listed (roundabouts, junctions, meeting, parking, dual carriageway, motorway, cyclists, pedestrians, emergency vehicles, hazard perception, reference points, BGO, defensive driving)
- Hazard perception mode: 6 clips per test, DVSA-style scoring window, replay for review
- Each clip: transcript / commentary track + linked lesson

---

## What I'd start with

If you say **"start Phase 1"** I'll implement all of it in this session and publish. Phases 2–6 each get their own turn so they're built properly rather than stubbed.

If you want a different order (e.g. Progress System first because it's the biggest lift), just say which phase to start.
