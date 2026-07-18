# GSM Learning Platform — Phase 2 → 5

Phase 1 (database foundation, 21 tables, 4 modules + 37 topics seeded, storage buckets, RLS) is already live. Pricing page shows **£40–£70/hr** with the full explanation, and the GSM Plus explainer already presents Free vs Premium tiers, "Who it's for" chips, and benefit cards. Those two items are done — I will not rebuild them.

Below is what still needs to ship, grouped so each phase is independently deployable and each ends with a mobile + desktop verification pass.

## Phase 2 — Admin CMS: Content authoring (this next drop)

Goal: you can create, edit, reorder, and delete every piece of learner-facing content from `/admin`.

- `/admin/learning` — Modules & Topics manager
  - CRUD Modules (title, summary, order, icon, colour, published)
  - CRUD Topics under each Module (title, slug, summary, order, stage, published, prerequisite topic)
  - Drag-and-drop reordering (both levels)
- `/admin/learning/:topic` — Lesson & Block editor
  - CRUD Lessons per Topic
  - Block editor: text, image, diagram, animation embed, AI video, quiz, key-points, safety-note, instructor-tip, BGO, MSPSL, POM
  - Rich text with the existing `RichTextEditor`
  - Version history + autosave (reusing `content_versions`)
- `/admin/videos` — AI Video Library
  - CRUD videos (title, description, module, topic, provider (mux/youtube/upload), poster, transcript, duration)
  - Bulk-assign videos to topics
- `/admin/assessments`
  - Mock test builder (question pool, pass mark, timer)
  - Hazard clip manager (already partially exists — extend with scoring windows)
- `/admin/certificates` — Certificate templates (title, criteria, artwork upload, active)
- `/admin/students` — Student progress admin
  - View any learner's 7-stage progress per topic
  - Instructor notes, override stage, mark topic complete, issue certificate
  - View AI lesson summary history
- RBAC: every screen respects existing `has_permission()` — content editor, video editor, assessment editor, learner viewer permissions added to `admin_permissions`

## Phase 3 — Student Portal: Full GSM Plus experience

- `/portal` dashboard: 4 modules, 37 topics in the exact seeded order, readiness score, next-up card, streak
- Topic page: renders block-graph from Phase 2 (text / diagram / animation / video / quiz / GSM elements)
- 7-stage skill tracker per topic (introduced → confident → test-ready)
- Hazard Perception library: filter by module, live scoring window, review mode
- Vehicle Reference Points: interactive diagrams (extends existing `vehicle-reference-points.tsx`)
- AI Video Library page with module/topic filters and progress markers
- Mock tests: DVSA-style theory + practical readiness, pass probability
- AI Lesson Summary: per-lesson strengths / focus / next steps (server function → Lovable AI Gateway, stored on `progress_lesson_entries`)
- Lesson Planner & Calendar view (reuses `calendar_events`)
- Certificates: earned certificates page + PDF download from `certificates` bucket

## Phase 4 — Scoring engine & AI

- Composite readiness score (theory, hazards, skill stages, mock tests, homework)
- Nightly snapshot into `progress_snapshots`
- AI summary generator (server fn) triggered when instructor submits a lesson entry
- Achievement rules engine reading `achievement_rules`

## Phase 5 — QA & polish

- Playwright pass: desktop (1280) + mobile (390) across every new route
- Lighthouse pass on portal dashboard + topic page
- RLS audit on all new server fns
- Migration of any legacy `skill_ratings` rows into new `progress_student_topics` (read-only preservation of old data)
- Publish

---

## Delivery order and size

Each phase = one turn from you saying "go", one plan, one code drop, one verification pass. Phase 2 alone is the largest — roughly:

- 1 migration (permissions rows, small schema additions for video library / certificate templates)
- ~12 new server-fn files under `src/lib/learning/*.functions.ts`
- ~8 new admin route files
- Reuses existing `RichTextEditor`, `MediaLibrary`, `content_versions`, drag-and-drop pattern from `/admin/home`

I will **not** try to ship Phases 2–5 in a single turn — that guarantees half-broken screens. I will ship Phase 2 end-to-end next, verify it on mobile + desktop, then move to Phase 3.

## Confirm before I start

1. Ship **Phase 2 (Admin CMS)** first as described? Or reorder so student-facing portal (Phase 3) comes first on top of the current seeded topics with placeholder content?
2. AI Video Library: host videos on Mux, YouTube unlisted, or Supabase storage? (Affects the video table schema I ship in Phase 2's migration.)
