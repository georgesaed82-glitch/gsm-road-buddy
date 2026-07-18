# GSM Visual Teaching System — Full Rebuild Roadmap

Honest scope note: what you've described is a 4–8 week product build, not a single-turn edit. Roughly 25 original animated lessons + a design system + a media/animation editor for the admin portal. Trying to do it all in one message produces 25 half-broken lessons and a broken editor. I'm proposing 5 phases; each is shippable and publishable on its own. Reply with the phase name (e.g. **"start Phase 1"**) to begin.

**Non-negotiable ground rules I'll follow throughout**
- Every diagram, vehicle, sign and road drawn from scratch as SVG in `src/components/diagram/*` — no traced or copied artwork from DITA / any instructor aid.
- One unified GSM design language: forest green `#234B36`, cream `#F7F3E8`, gold accent, black — already tokenised in `src/styles.css`.
- Every lesson follows the fixed GSM template: **What · Why · When · Where · How · Reference Points · Common Mistakes · Test Tips · Summary · Interactive Animation**.
- Existing `LessonShell` extended (not replaced) — Play / Pause / Slow-motion (0.25× / 0.5× / 1×) / Step frame / Restart / Camera toggle (Driver / Overhead / Examiner).
- Interactive quiz checkpoints pause the animation at decision points (already the pattern in `bgoSystem` and `giveWayLines`).

---

## Phase 1 — GSM Design Language + Diagram Kit (this session)

Foundation everything else builds on. No lesson content yet — just the primitives, so all 25 lessons look consistent.

- **`src/components/diagram/primitives.tsx` — expanded kit**
  - `Road`, `Lane`, `Kerb`, `CentreLine`, `HatchedArea`, `GiveWayLine`, `StopLine`, `ZebraStripes`, `PelicanStuds`, `RoundaboutHub`, `MiniRoundaboutDome`, `SlipRoad`, `HardShoulder`, `LaneArrow`, `BoxJunction`.
  - `Car` (GSM saloon in forest-green + gold), `Bus`, `Cyclist`, `Pedestrian`, `HGV`, `Motorbike` — all as clean flat vectors with headlight/brake/indicator states.
  - `EyeGaze` (scanning fan), `MirrorCheck` badge, `SignalArrow`, `HazardBloom`, `DecisionCard`.
- **Camera-view controller** — `useCameraView()` hook returns Driver / Overhead / Examiner with matching viewBox transforms so any scene can render 3 angles from the same data.
- **Playback controller upgrade** — extend `LessonShell` with 0.25× / 0.5× / 1× / step-frame / restart / camera switcher.
- **Original UK sign set** — SVG-only, TSRGD-correct, drawn from scratch. Wire through existing `SignVisual`.

Deliverable: docs page `/admin/design-kit` showing every primitive, ready for lesson authors.

## Phase 2 — Junction, Roundabout & Crossing lessons (own session)

Using the Phase 1 kit. Each lesson: What → Why → When → Where → How → Reference Points → Common Mistakes → Test Tips → Summary → animation with quiz checkpoints and 3 camera angles.

- Open Junctions · Closed Junctions · Crossroads · Controlled Junctions
- Zebra · Pelican · Puffin · Toucan · Equestrian crossings
- Roundabouts · Mini Roundabouts · Spiral Roundabouts · Gyratory Systems
- **BGO** is already done — will be visually reskinned to match the new kit.

## Phase 3 — Manoeuvres + On-road strategies (own session)

- Parallel Park · Bay Park (forward & reverse) · Reverse on the Right · Turn in the Road · Controlled Stop · Emergency Stop
- Meeting Traffic · Adequate Clearance · Overtaking · Dual Carriageways · Slip Roads · Motorways
- Existing lessons (`pullUpOnLeft`, `parallelParking`, `joiningDualCarriageway`, `meetingInSmallSpaces`) get reskinned to the new kit rather than rewritten.

## Phase 4 — GSM Method modules (own session)

Rebuild `/gsm-method` as fully interactive:
- DSSSM · PALM · MSPSL · POM 2-6-2 · 15-70-15 · Stretch Your Vision · Plan to Stop Look to Go · BGO · Reference Points · GSM Commentary · Fault categories (Driving / Serious / Dangerous).

## Phase 5 — Admin Lesson Studio (own session)

The editor you asked for, in the existing admin portal. Field-based (not visual drag-drop of SVG) so React structure stays intact.

- New tables: `lessons_cms`, `lesson_sections`, `lesson_media`, `lesson_quizzes`, `lesson_reference_points`, `lesson_publish_events`.
- Admin routes: `/admin/lessons` (list + reorder), `/admin/lessons/$slug` (editor).
- Editor tabs: **Content** (rich text per section) · **Diagram** (pick scene template + tweak params like ego path, hazards, timings) · **Media** (upload MP4/WebM/Lottie via existing Media Library) · **Quiz** (checkpoints, options, feedback) · **Reference Points** (photo + hotspots) · **Publish** (draft / preview / publish + version history — reuses `content_versions`).
- RBAC: content_editor can edit drafts, admin/owner can publish (extends existing `has_role`).
- Instant publish: TanStack Query cache invalidation + `queryClient.invalidateQueries(["lessons-cms"])`.

## Technical notes

- No new dependencies for animation — continue with SVG + `requestAnimationFrame` timeline that `LessonShell` already runs (60fps, deterministic, cheap, no framer-motion in hot paths).
- 3D-lite where it helps (roundabouts, motorway merges) via CSS `perspective` on the SVG group — not a WebGL engine. Full WebGL/Three.js would blow scope and battery on mobile.
- Everything remains offline-cacheable (SW already registered) so GSM Plus works during lessons.

---

## What I'd start with

Reply **"start Phase 1"** and I'll build the design kit + camera/playback controller in this session and publish. Or name a different phase (e.g. "start Phase 5" if you want the editor before the content).
