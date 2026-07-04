# GSM Driving School — Full Lesson Revision Plan

The lesson shell already renders every section you listed (Objective, GSM Formula, Rule, What/When/Why/How, George Explains, Common Mistakes, GSM Tips, Interactive Question, Key Takeaway, Next Lesson). What's inconsistent is the **per-lesson content** and the **animation quality**. Rewriting all 16 lessons + animations in one pass is a huge job, so I'll do it in ordered batches you can review between.

## Scope

Every one of the 16 lessons will be rewritten to the same GSM standard:

1. **What are we doing?** — plain-English manoeuvre description
2. **When do we use it?** — real UK situations
3. **Why do we do it?** — safety reasoning, not Highway Code recitation
4. **How do we do it?** — numbered steps
5. **George Explains** — natural, teaching-voice paragraph
6. **GSM Formula** — the memorable pattern (Plan→Stop→Look→Go, BGL, 15-70-15, Less Space = Less Speed, etc.)
7. **Common Mistakes** — wrong method → why wrong → correct method
8. **Animated Demonstration** — polished UK road + smoother car motion
9. **Interactive Question** — decision point with reveal
10. **Key Takeaway** — one memorable sentence

## Animation upgrades (applied to every clip)

- Eased steering/acceleration/braking curves (no linear motion)
- Working indicators + brake lights synced to actions
- Rotating wheels, soft ground shadows
- UK road kit per environment: kerbs, pavements, lamp posts, parked cars, houses (urban); hedges, verges, bends (rural); crash barriers, central reservation (dual carriageway)
- Consistent GSM overlay + "UK · Left-hand traffic" tag (already in place)

## Delivery order (batches, ~3-4 lessons per turn)

```text
Batch 1  Plan to Stop – Look to Go   Stretch Your Vision   Closed Junction   Open Junction
Batch 2  Turning Right (roundabouts) Roundabouts           Meeting Traffic   Speed Adjustment
Batch 3  Two-Second Rule             Zebra Crossing        Going Uphill      Going Downhill
Batch 4  Dual Carriageway Discipline Lane Merging          Keeping Junctions Clear
Batch 5  Overtaking                  Blind Spots            + animation polish sweep
```

Each batch: I rewrite the lesson objects (copy + GSM formula + wrong/right mistakes + interactive question) and upgrade that lesson's SVG render function. After each batch you can preview and tell me what to tighten before I move on — that way credits aren't spent redoing work you'd change anyway.

## Technical notes

- All edits stay in `src/data/drivingLessons.tsx` and (for animation polish) reusable helpers I'll add to `src/components/driving-clips/`.
- Shared easing + UK road kit helpers (`easeInOut`, `<UkKerb/>`, `<ParkedCar/>`, `<LampPost/>`, `<Hedgerow/>`, `<CrashBarrier/>`) go into a new `src/components/driving-clips/uk-kit.tsx` so every lesson uses the same visual language.
- No shell changes needed — the structure is already correct.

## What I need from you

Confirm the batch order above (or reorder) and I'll start Batch 1 immediately.
