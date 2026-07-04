## What you're seeing

The screenshot shows the "Elderly / frail pedestrians" answer paired with a sign that's actually **Pedestrians in road ahead** (TSRGD diagram 544). The correct elderly-people warning is diagram 544.1 (two hunched figures with a stick). So the `w-elderly` → `w-pedestrians` image mapping is swapped, and several crossing signs (zebra/pelican/puffin) are all reusing the same pedestrians image as a placeholder. This is the root cause of what you were shown, and it's the kind of thing I need to sweep out everywhere.

## Scope of the audit

Four data files drive every quiz, sign card and lesson. I'll audit each against GOV.UK "Know your traffic signs" + the current Highway Code (2022 revision) + DVSA theory bank language:

1. **`src/data/signs.ts`** — 60+ signs. Verify every `name`, `meaning`, `category`, and TSRGD-correct wording.
2. **`src/data/signImages.ts`** — Verify every sign id maps to the correct DfT SVG (this is where the elderly/pedestrians swap lives; also `c-zebra`, `c-pelican`, `c-puffin` all currently point at the pedestrians sign and need real artwork).
3. **`src/data/theory.ts` + `src/data/topicQuizzes.ts` + `src/data/homeTheoryQuiz.ts`** — Every question: correct answer, distractors, explanation wording, rule references. Check figures (stopping distances, speed limits, alcohol limits, fines/points, tyre tread 1.6mm, MOT age 3 yrs, etc.) match the current Highway Code and DVSA bank.
4. **`src/data/roadMarkings.ts` + `src/data/policeSignals.ts` + `src/data/drivingLessons.tsx`** — Rule references (e.g. Rule 170 give-way, Rule 103 signals), observation wording, and any legal claims.

## How I'll work

- **Verify against primary sources only**: GOV.UK Highway Code, "Know your traffic signs" PDF, DVSA Safe Driving for Life. No Wikipedia guesses.
- **Fix as I go** in one branch of edits per file, so each change is reviewable.
- **Replace missing sign artwork** (zebra, pelican, puffin, toucan variants) with the correct DfT SVGs from Wikimedia Commons (OGL, already how the rest are sourced) rather than reusing the pedestrians sign.
- **Add a short "source" comment** at the top of `signs.ts` and `signImages.ts` pointing at the exact GOV.UK page each entry came from, so future changes stay tied to the standard.
- **Run the existing `signs.quiz.test.ts`** after edits, and add a smoke test that asserts every quiz answer's sign id has a matching image.
- **Deliver a written summary** of every correction made (old vs new) so you can spot-check.

## What I will NOT touch

- The quiz engine, UI, LessonShell, routes — content only.
- Anything outside these data files unless a wording change forces it.

## Technical details

- Sign SVGs are already CDN-mirrored under `/__l5e/assets-v1/…`. New ones will be uploaded via the assets pipeline the same way, not hot-linked to Wikimedia at runtime.
- Attribution ("Crown copyright, OGL v3.0, via Wikimedia Commons") stays on the road-signs page — no change needed.
- Because this is content-only, no migrations, no auth, no schema changes.

## Estimated size

Roughly 40-60 line-level corrections across the four data files, plus 6-10 new sign SVGs. One test file update. No user-facing UI change beyond the correct content appearing.

## Before I start — one confirmation

This will change wording on questions you may have memorised. If you'd rather I do it in stages (signs first, then theory questions, then lessons) so you can review each batch, say so; otherwise I'll do the full sweep in one pass and give you the change list at the end.
