Big scope — I want to lock this in before I build so nothing gets skipped and we don't blow through credits on the wrong thing. Splitting into 4 phases you can approve/skip individually.

## Phase 1 — Legal wording + Rule numbers (safest, ship first)

**File: `src/data/theory.ts` + `src/components/HighwayCodeEssentials.tsx`**

Edits to Highway Code content:
- H2 rewrite: "If braking suddenly would create an immediate danger to you or other road users, continue cautiously if the pedestrian has not begun crossing."
- Zebra crossing rewrite: "Approach prepared to stop and normally give way to pedestrians waiting to cross."
- Sweep every "must" → check against the actual Highway Code; downgrade to "should" where it's guidance, not law. Add a small MUST / SHOULD legend at the top of the Highway Code page explaining the distinction (MUST = law, SHOULD = strong guidance).
- Terminology sweep: "lane one" → "left-hand lane (lane 1)"; verify hard shoulder / central reservation / main carriageway usage.
- Add Rule numbers to every section that's missing them (target: Rules 126, 132, 174, 181, 258 and any others referenced).

## Phase 2 — Search bar

New component `src/components/PortalSearch.tsx` mounted in the portal header (or as a `⌘K`-style dialog).

Indexes at build time:
- Highway Code essentials sections (with rule numbers + slugs)
- All 14 DVSA topics (`src/data/theory.ts`)
- Road signs (`src/data/signs.ts`) — name + meaning
- Road markings (`src/data/roadMarkings.ts`) — name + meaning
- Police signals (`src/data/policeSignals.ts`)

Simple client-side substring/token match, ranked. Result click = navigate to route + scroll to anchor. Includes the examples you listed: roundabouts, amber light, bus lane, stopping distance, zebra.

## Phase 3 — Content additions

Three new blocks, all on `/highway-code` (and referenced from `/dashboard`):

1. **"Common reasons people fail"** — new section component with the 6 points you listed (mirrors, blind spots, positioning, hesitation, speed, junction observation), each with a 1-sentence practical explanation.
2. **Memory tips** — reusable `<MemoryTip>` component. Ship with:
   - Road studs: Red = Left, Amber = Right (central reservation), White = Middle (lane dividers), Green = Slip roads
   - Sign shapes: Circle orders, Triangle warns, Rectangle informs, Octagon stops
   - Mirror sequence: MSM (Mirror-Signal-Manoeuvre), MSPSL for junctions
   - A couple more where they naturally fit
3. **George's Tips boxes** — reusable `<GeorgesTip>` component with a subtle GSM-branded style (accent border, small badge). I'll draft plausible instructor-style tips inline in the Highway Code sections (pedestrians, roundabouts, mirrors, dual carriageway joins, hazard perception). You edit/rewrite in your voice later.

## Phase 4 — Mini quizzes after every topic

Every card in the "All topics — key points" grid on `/highway-code` gets a "Test yourself (5 questions)" expandable panel. Questions live in a new `src/data/topicQuizzes.ts` keyed by topic slug. 5–8 questions each × 14 topics ≈ 80–100 new questions. Uses the existing quiz-attempt tracking so results feed into "My attempts".

I'll write these based on the DVSA topic content — they're plausible practice questions, not real DVSA questions (which are copyrighted).

## Phase 5 — 8 animated driving clips

New route `/_authenticated/driving-clips.tsx` with cards for:
- Turning right at a junction
- Meeting oncoming traffic on a narrow road
- Zebra crossings
- Spiral (multi-lane) roundabouts
- Yellow box junctions
- Smart motorways (all lanes running)
- Lane discipline on dual carriageways
- Dual carriageway slip road joining

Approach: **SVG + CSS/Framer Motion animations**, not video files. Each clip is a top-down animated diagram (~30s loop) with a car token moving through the scenario, arrows/labels highlighting key checks, and a caption strip explaining what's happening at each beat. Reasons:
- Renders instantly, no bandwidth cost, works offline (PWA).
- Editable — you can tweak wording without re-rendering video.
- Consistent visual style with the existing road-markings/signs illustrations.
- Videogen text-to-video would produce cinematic footage, not diagram-style instruction, and can't reliably show correct UK left-hand-drive positioning. Not the right tool for teaching.

Each clip has: play/pause, a step timeline (e.g. "1. Approach in lane 1 — 2. Mirror-signal — 3. Position — 4. Give way"), and a linked Highway Code rule.

## Order of execution

I'll ship 1 → 2 → 3 → 4 → 5 as separate commits so you can review as we go. Phase 5 (animated clips) is the biggest — probably an afternoon of work on its own. If you want to defer it and I do 1–4 now, just say so.

## Not in scope

- Rewriting existing DVSA licensed content.
- Server-side changes (all client-side additions, no schema changes).
- Auth/security changes.

Approve and I'll start with Phase 1.