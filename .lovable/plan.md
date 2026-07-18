# GSM Complete Syllabus — Master Curriculum Build

You've asked for the **entire GSM Progress-Tracker syllabus** (~75 topics) built as full lessons, each with 15 sections (What / Why / When / Where / How / Reference Points / Common Mistakes / BGO / Instructor Tips / Safety Notes / Animation / Interactive Questions / Quiz / Summary / Progress Tracking / Pass Criteria), plus original diagrams, right-hand-drive animations, and portal + tracker wiring.

That is roughly **25,000–40,000 lines** of authored content and animation code. Trying to ship it in one turn would produce shallow, repetitive lessons and unreviewable diffs. Below is how I will deliver it properly — approve and I start immediately.

## One-time foundation (Batch 0 — first turn after approval)

Everything downstream depends on this, so it ships first.

1. **Extend the `Lesson` type** to include every new section: `where`, `referencePoints`, `bgo`, `instructorTips`, `safetyNotes`, `summary`, `passCriteria` (score threshold + required checkpoints), `syllabusKey` (links to progress tracker).
2. **Update `LessonShell`** to render all sections in a consistent mobile / tablet / desktop layout, with the existing playback + camera controls from Phase 1.
3. **Add Pass/Fail flow** — quiz ≥ 80% posts a pass to `theory_progress` / `skill_ratings` under the lesson's `syllabusKey`; below 80% shows a "Retry" screen with the missed questions.
4. **Curriculum registry** (`src/data/syllabus.ts`) — single source of truth mapping every syllabus key → lesson slug → progress-tracker skill. Learner portal, admin portal, and tracker all read from this one file.
5. **Admin listing** — `/admin/lessons` shows curriculum coverage (built / draft / missing) so you can see progress at a glance.

## Delivery batches (one per turn thereafter)

Roughly **8 lessons per turn** — largest size that still allows genuinely original diagrams and quality quiz writing per lesson. Ordered so a learner can follow it end-to-end.

| Batch | Lessons |
|---|---|
| A | Cockpit Drill (DSSSM) · Moving Off & Stopping · Mirrors & Mirror Checks · MSPSL · Steering · Clutch Control · Gears · Hill Starts |
| B | Junctions (overview) · Open · Closed · T-Junctions · Crossroads · Mini Roundabouts · Normal Roundabouts · Spiral Roundabouts |
| C | Dual Carriageways · Motorways · Lane Discipline · Lane Positioning · Road Positioning · Meeting Traffic · Passing Parked Cars · Clearance & Safety Margins |
| D | Speed Management · Following Distance · Overtaking · Traffic Lights · Box Junctions · Bus Lanes · Cycle Lanes · One-Way Systems |
| E | Slip Roads · Emergency Vehicles · Pedestrian Crossings (overview) · Zebra · Pelican · Puffin · Toucan · Pegasus |
| F | Hazard Perception · Observation Techniques · 15-70-15 Scanning · Stretch Your Vision · Plan to Stop, Look to Go · BGO · Defensive Driving · Eco Driving |
| G | Weather Driving · Night Driving · Independent Driving · Sat Nav Driving · Show Me Tell Me · Bay Parking · Parallel Parking · Forward Bay Parking |
| H | Reverse Bay Parking · Pull Up on the Right & Reverse · Pull Up on the Left · Emergency Stop · Mock Tests · Test Preparation · Highway Code index · Road Signs index |
| I | Road Markings index · Vehicle Warning Lights · Tyres · Basic Car Maintenance |
| J (features, not lessons) | Progress Tracker page · Instructor Feedback · Lesson Reports · Achievement Badges · Certificates · Revision Centre · Final Test Readiness Assessment |

Lessons already partly built (Pull Up on Left, Meeting Traffic, POM, Give Way Lines, Meeting in Small Spaces, Joining Dual Carriageway, DSSSM, Crossroads, Mini Roundabouts, Passing Parked, BGO System, Bus Awareness, Parallel Parking, Unorthodox Roundabouts, Yellow Box) are **retrofitted to the new template** inside their respective batches — not rebuilt from scratch.

## Guarantees I'll hold on every lesson

- **Original artwork only.** All diagrams are composed from `src/components/diagram/primitives.tsx` — no DVSA or third-party imagery. No third-party licensed materials.
- **Right-hand-drive** ego vehicle and left-side traffic throughout.
- **Mobile / tablet / desktop** verified via the existing `LessonShell` responsive layout.
- **Progress tracker + pass criteria** wired for every lesson.
- **Consistent visual style** — same palette, same primitives, same playback controls.

## What I will NOT do

- Ship a shallow "for every syllabus item, generate a stub" pass. Every lesson gets a real animation authored for that specific topic.
- Copy DVSA graphics, third-party lesson content, or copyrighted materials.
- Collapse batches to try to ship faster — quality would drop.

## Cadence

Reply **"start"** and I ship Batch 0 (foundation). After each batch reply **"next"** and I ship the next one. Expected batches to full completion: 0 + A–J = **11 turns**.

Approve this plan to begin.
