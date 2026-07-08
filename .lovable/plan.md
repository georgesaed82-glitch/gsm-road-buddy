# GSM Learner Portal — Illustration & Diagram Overhaul

This is a big job and doing it in one turn would produce a shallow, inconsistent pass — exactly what we're trying to move away from. I'd like to break it into phases so every diagram is properly designed, technically correct, and consistent, rather than rushed.

## Phase 0 — Define the GSM illustration system (this turn, after you approve)

Before touching individual diagrams, lock the shared visual language so everything from here on uses it:

- **Palette:** road `#2b2b2e`, paint `#f5f5f0`, kerb `#8b8f95`, grass `#3d6a2f`, hatch red `#c94a3a`, ego vehicle GSM forest-green, other vehicles neutral greys, hazard warnings terracotta accent, safe/clear emerald, warning amber.
- **Line thickness:** 1.4 for kerbs/road edges, 0.9 for vehicle outlines, 1.2 dashed for advisory guides.
- **Vehicles:** one reusable `<Car>` component (ego / oncoming / traffic variants) with consistent 44×22 proportions, matching windows, lights and brake indicators.
- **Arrows / paths:** one reusable arrow head + dashed-path style, always terracotta for the learner's intended path and grey for other traffic.
- **Typography inside diagrams:** matches site display font, uniform label sizes (9pt caption, 11pt banner).
- **Shadows / depth:** single subtle drop-shadow token; no per-diagram experimentation.

Delivered as `src/components/diagram/*` (Car, Arrow, Road, Kerb, Hatch, Label, SpeedPanel, MirrorPulse) that every existing and future lesson diagram uses.

## Phase 1 — Rebuild the Joining a Dual Carriageway lesson

Full redesign with a proper top-down UK layout:

```text
        ══════════════════════════════════════════════   (central reservation)
    →   ────────────  running lane 2 (overtaking)  ────
    →   ────────────  running lane 1 (normal)      ────
        ─────  ▲▲▲ hatched taper (NOT drivable) ▲▲▲ ────
                  ╲___ acceleration lane ___
                       ↑ ego car joins here
```

Animation sequence (single play-through, ends at completion):
1. Ego enters the acceleration lane at slip-road speed.
2. Builds speed to match traffic on the main carriageway.
3. Mirror check pulse → right-shoulder blind-spot check pulse.
4. Gap identification (highlighted safe gap in lane 1).
5. Indicator on, smooth merge from acceleration lane into lane 1.
6. Continues in lane 1 at matched speed — the diagram explicitly shows the hatched taper is skirted, never crossed.

Copy blocks: objective, THINK questions, rule, why (with a callout on hatched areas + Rule 130), George explains, common mistakes, GSM tips, key takeaway. One decision-point question at the mirror/blind-spot moment.

## Phase 2 — Rebuild the crossings & signals library

New `src/components/crossings/` module with pixel-precise TSRGD-correct SVGs, all sharing the Phase 0 style:

- Zebra crossing (belisha beacons, black/white stripes, zig-zags)
- Pelican, Puffin, Toucan, Pegasus crossings — each with correct signals, ground layout and user (pedestrian / pedestrian+cyclist / horse)
- Red man / Green man / Green man+bike / Green horse+rider signal heads
- Traffic light head (3-aspect) and filter arrow
- Warning sign: children / pedestrians / horses / cycles (triangles with correct pictograms)
- Regulatory circles (no entry, give way triangle, stop octagon)

Every crossing gets a matching diagram variant for use inside lesson animations (top-down road with the crossing embedded), so the Highway Code page and the driving lessons pull from the same components.

## Phase 3 — Audit and rebuild remaining Driving Strategy diagrams

Working through every lesson in `src/data/lessons/` and `src/data/drivingLessons.tsx`, converting each to the Phase 0 primitives:

- Plan to Stop, Look to Go
- Give Way Lines
- Meeting in Small Spaces (already redesigned last turn — align to new primitives)
- POM routine
- Pull up on the left
- Parallel parking
- Roundabouts, junctions, lane discipline, etc.

Each diagram must clearly show: lane position, vehicle path, steering, direction arrows, road markings, priority, hazards and safe distances — as you specified.

## Phase 4 — Portal-wide QA pass

Automated + manual sweep:
- Playwright walk of every learner-portal route at desktop + mobile, capturing screenshots.
- Check for stretched images (aspect-ratio drift), low-res raster placeholders, misaligned SVGs, incorrect Highway Code copy.
- Fix findings in a single follow-up turn with a short report.

---

## Technical notes (for your reference)

- All new diagrams are **inline SVG** components in `src/components/diagram/` and `src/components/crossings/`. No raster clip-art anywhere.
- Existing `src/components/SignVisual.tsx`, `OfficialSignImage.tsx`, `RoadMarkingVisual.tsx`, `PoliceSignalVisual.tsx` will migrate to the new primitives; call sites keep working.
- Data files in `src/data/signImages.ts`, `src/data/roadMarkings.ts`, `src/data/policeSignals.ts` will point at the new components rather than external image URLs.
- Lesson `render(t)` functions keep the same signature — animation shell (already improved last turn to play once end-to-end and pause for questions) stays as is.
- Type-checked with `bunx tsgo` and visual-diffed at the end of each phase.

---

## What I need from you

1. **Approve the plan** so I can start Phase 0 + Phase 1 immediately (this is the highest-impact starting point: locks the system and fixes the Dual Carriageway lesson you called out).
2. Confirm you're happy for me to work through Phases 2–4 in follow-up turns rather than one giant turn — that's the only way to hit the quality bar you've asked for.
3. Flag any lessons or pages that you specifically want prioritised in Phase 3.

Once you say go, I'll ship Phase 0 + Phase 1 in the next turn.