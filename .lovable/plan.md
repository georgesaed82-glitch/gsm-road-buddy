# Driving Clips — UK DVSA-style overhaul

This is a large rebuild. To ship quality (not 15 half-done clips), I'll do it in **phases**, each shippable on its own. Please confirm the phase order or tell me to change it.

## Phase 1 — Shared UK road-art kit + lesson chrome (foundation)

Before touching any lesson, build a reusable art + layout kit so every clip looks identical and correct.

New file: `src/components/driving-clips/uk-kit.tsx` exporting:
- `UkRoad`, `UkTJunction`, `UkCrossroads`, `UkRoundabout` (4-arm, mini, spiral) with **correct UK markings**: solid/broken white lines, dashed give-way "shark teeth" at roundabouts, double-broken give-way at T-junctions, yellow box junctions, hatched areas, arrows, edge lines.
- `Car` (left-hand-drive UK car, driver on right), `Van`, `Bus`, `Cyclist`, `Motorbike`, `HorseRider`, `Pedestrian` — all drawn to scale (UK 3.65 m lane).
- Scenery: `Hedge`, `Tree`, `Fence`, `TerracedHouse`, `SemiDetachedHouse`, `ParkedCar`, `PostBox`, `LampPost`.
- Signs: `GiveWaySign`, `StopSign`, `RoundaboutAhead`, `SpeedLimit` — official shapes/colours, original artwork.
- Overlays: `VisibilityCone(color)` (red = blocked, green = clear), `HazardHighlight`, `ArrowFlow`, `FormulaStrip` (animates PLAN → STOP → LOOK → GO), `BGLStrip` (Blockers → Gap → Look for opportunity).
- All left-hand traffic. All lane widths, markings, and colours from a single tokens file so every clip matches.

Extend `LessonShell.tsx` so every lesson page renders **exactly** in this order:
1. Animation
2. George Explains (existing block, unchanged)
3. Common Mistakes (existing)
4. George's Tip (rename current "GSM tips" heading to match your wording)
5. Interactive Question (already supported inline; also surface at the end)
6. **Next lesson** link (new — auto-derived from `drivingLessons` order)

## Phase 2 — Redo the two junction clips you called out

- `open-vs-closed-junction` split into **two** lessons using the new kit:
  - **Closed junction**: T-junction, parked cars both sides, tall hedges, trees, fences, houses close to kerb, red visibility cones fanning out and being clipped by the hedges/cars, giant STOP line, labels "CLOSED JUNCTION / Limited visibility / Plan to Stop", voiceover captions timed to the animation.
  - **Open junction**: same T-junction geometry, no parked cars, low hedges, wide sightlines, green visibility cones sweeping unobstructed, labels "OPEN JUNCTION / Good visibility / Proceed if safe".
- Update the driving-clips index so both appear as separate tiles.

## Phase 3 — Roundabout formula clip

Rebuild `roundabouts` on the new `UkRoundabout` component with:
- Animated `FormulaStrip`: PLAN → STOP → LOOK → GO.
- When LOOK is active, `BGLStrip` reveals **B**lockers (highlight cyclist, van, bus, motorbike, horse rider one at a time), then **G**ap (green shaded safe gap on the ring), then **L**ook for opportunity ("Is it safe? Is it legal? Can I go?" caption).
- Ego car then executes GO.
- Timed captions match your voiceover script verbatim.

## Phase 4 — Rebuild remaining 13 clips on the kit

Same visual language for: speed-adjustment, two-second-rule, zebra-crossing, going-uphill, going-downhill, meeting-traffic, dual-carriageway-lane-discipline, lane-merging, keeping-junctions-clear, overtaking, blind-spots, stretch-your-vision, plan-to-stop-look-to-go.

Each one gets: UK-correct layout, camera choice (bird's eye vs driver's eye) picked per lesson, animated arrows, hazard zooms, and the standard shell sections including a Next-lesson link.

## Technical notes

- Art is SVG only (no raster) so it scales cleanly and stays lightweight for the portal + social clips.
- Kit lives in one file to keep visual tokens (lane width, line dash, colours) in one place — matches GSM brand tokens from `src/styles.css`.
- No new npm deps.
- Preview cards on `/driving-clips` keep the current always-playing `LessonPreview`.
- Nothing changes for auth, routing, data model, or backend.

## What I need from you

**Confirm the phase order** (foundation → junctions → roundabout → the rest), or tell me to jump straight to a specific lesson first. Once you approve, I'll ship Phase 1 in the next turn and Phase 2 immediately after.
