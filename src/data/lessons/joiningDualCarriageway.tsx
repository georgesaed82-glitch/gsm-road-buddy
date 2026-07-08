import type { Lesson } from "@/components/driving-clips/LessonShell";
import {
  Banner,
  Callout,
  Car,
  CentralReservation,
  CentreDashes,
  COLORS,
  DiagramCanvas,
  EdgeLine,
  GapMarker,
  GrassVerge,
  HatchPolygon,
  MirrorPulse,
  NightSky,
  PathArrow,
  Road,
  SpeedPanel,
  easeInOut,
} from "@/components/diagram/primitives";

// ─────────────────────────────────────────────────────────────
// Joining a Dual Carriageway — GSM full-length lesson.
//
// Correct UK layout (top-down, traffic flowing → east):
//
//   ═════════════════════════════════════════════════   central reservation
//   ─────────  Lane 2 (overtaking)  ────────────────
//     traffic →                                   →
//   ─────── (dashed centre)  Lane 1 (normal)  ─────
//     traffic →                                   →
//   ═══════════════  solid edge line  ══════════════
//         ╱▲▲▲▲▲▲▲▲▲ hatched taper (DO NOT DRIVE) ▲╲
//     ── (broken white — merge here) ── ── ── ── ─
//        Acceleration lane ─── tapers away
//   ╲___ slip road curves in from bottom-left
//
// Sequence:
//   A 0.00–0.16  slip road → acceleration lane
//   B 0.16–0.32  build speed to match traffic on main carriageway
//   C 0.32–0.44  mirror + right-shoulder blind-spot pulse
//   ▶ Q at 0.44  decision: what should you do BEFORE moving over?
//   D 0.44–0.62  indicator on, safe gap highlighted
//   E 0.62–0.80  smooth merge from accel lane into Lane 1
//   F 0.80–1.00  settled in Lane 1, cancel signal, matched speed
// ─────────────────────────────────────────────────────────────

const LANE2_Y = 130; // overtaking lane centre
const LANE1_Y = 170; // normal driving lane centre
const ACCEL_Y = 220; // acceleration lane centre
const LANE_H = 34;   // lane height
const MERGE_START_X = 180;
const MERGE_END_X = 460;   // where broken-line merge zone ends
const HATCH_START_X = 460; // taper starts
const HATCH_END_X = 600;   // taper reaches the edge line

function slipRoadPos(k: number) {
  // Curved slip road: starts bottom-left (x=-30, y=310) and lands
  // on the acceleration lane (x=180, y=ACCEL_Y).
  const e = easeInOut(k);
  const startX = -30, startY = 310, endX = MERGE_START_X, endY = ACCEL_Y;
  const cpX = 70, cpY = 300;                 // curve control point
  const x = (1 - e) * (1 - e) * startX + 2 * (1 - e) * e * cpX + e * e * endX;
  const y = (1 - e) * (1 - e) * startY + 2 * (1 - e) * e * cpY + e * e * endY;
  const dx = 2 * (1 - e) * (cpX - startX) + 2 * e * (endX - cpX);
  const dy = 2 * (1 - e) * (cpY - startY) + 2 * e * (endY - cpY);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { x, y, angle };
}

function JoiningScene(t: number) {
  // Phases
  const phaseA = t < 0.16;
  const phaseB = t >= 0.16 && t < 0.32;
  const phaseC = t >= 0.32 && t < 0.44;
  const phaseD = t >= 0.44 && t < 0.62;
  const phaseE = t >= 0.62 && t < 0.80;
  const phaseF = t >= 0.80;

  // Ego position + angle
  let egoX = 0, egoY = 0, egoAngle = 0;
  if (phaseA) {
    const k = t / 0.16;
    const p = slipRoadPos(k);
    egoX = p.x; egoY = p.y; egoAngle = p.angle;
  } else if (phaseB || phaseC) {
    // travel along acceleration lane
    const k = phaseB ? (t - 0.16) / 0.16 : 1;
    egoX = MERGE_START_X + easeInOut(k) * 90;
    egoY = ACCEL_Y;
    egoAngle = 0;
  } else if (phaseD) {
    const k = easeInOut((t - 0.44) / 0.18);
    egoX = 270 + k * 60;
    egoY = ACCEL_Y;
    egoAngle = 0;
  } else if (phaseE) {
    // smooth merge curve into lane 1
    const k = easeInOut((t - 0.62) / 0.18);
    egoX = 330 + k * 80;
    egoY = ACCEL_Y + k * (LANE1_Y - ACCEL_Y);
    egoAngle = k * -6; // slight nose-left visual
  } else {
    // continue in Lane 1
    const k = easeInOut((t - 0.80) / 0.20);
    egoX = 410 + k * 220;
    egoY = LANE1_Y;
    egoAngle = 0;
  }

  // Traffic on main carriageway (steady, left-to-right)
  const trafficLane1 = [
    { baseX: -40, speed: 240, color: COLORS.other },
    { baseX: 180, speed: 240, color: COLORS.otherAlt },
    { baseX: 460, speed: 240, color: COLORS.other },
  ].map((c) => ({
    x: ((c.baseX + t * c.speed) % 800) - 60,
    y: LANE1_Y,
    color: c.color,
  }));
  const trafficLane2 = [
    { baseX: 40, speed: 300, color: COLORS.otherAlt },
    { baseX: 340, speed: 300, color: COLORS.other },
  ].map((c) => ({
    x: ((c.baseX + t * c.speed) % 800) - 60,
    y: LANE2_Y,
    color: c.color,
  }));

  const egoSpeed =
    phaseA ? 25 + easeInOut(t / 0.16) * 15 :   // 25→40 on slip road
    phaseB ? 40 + easeInOut((t - 0.16) / 0.16) * 25 : // 40→65
    phaseC ? 65 :
    phaseD ? 68 :
    phaseE ? 68 :
             68;

  const banner =
    phaseA ? "1 · SLIP ROAD — build speed as you approach" :
    phaseB ? "2 · ACCELERATION LANE — match the traffic speed" :
    phaseC ? "3 · MIRROR + BLIND SPOT — check right" :
    phaseD ? "4 · INDICATE + PICK YOUR GAP" :
    phaseE ? "5 · MERGE smoothly into Lane 1" :
             "6 · SETTLED — cancel signal, keep left";

  // Hatched taper polygon: rectangle-ish wedge at the end of accel lane.
  // Top edge is the solid line under Lane 1 (y = LANE1_Y + LANE_H/2 + 3),
  // bottom edge is the kerb line (y = ACCEL_Y + LANE_H/2 + 3).
  const topY = LANE1_Y + LANE_H / 2 + 3;
  const botY = ACCEL_Y + LANE_H / 2 + 3;
  const hatchPts = `${HATCH_START_X},${botY} ${HATCH_END_X},${topY} ${HATCH_END_X},${botY}`;

  // Safe gap in Lane 1 for phase D
  const showGap = phaseD || phaseE;

  return (
    <DiagramCanvas>
      <NightSky id="sky-jdc" />

      {/* Verges */}
      <GrassVerge y={70} height={30} />
      <GrassVerge y={ACCEL_Y + LANE_H / 2 + 6} height={80} />

      {/* Central reservation */}
      <CentralReservation y={100} height={12} />

      {/* Main carriageway — two lanes */}
      <Road y={LANE2_Y - LANE_H / 2} height={LANE_H * 2 + 6} />

      {/* Lane 1/2 divider dashes */}
      <CentreDashes x1={0} x2={640} y={LANE2_Y + LANE_H / 2 + 3} t={t} />

      {/* Solid outer edge of the main carriageway (top of hard shoulder / accel area) */}
      <EdgeLine x1={0} x2={MERGE_START_X} y={topY} />
      {/* Dashed merge zone — the ONLY place you may cross into Lane 1 */}
      <EdgeLine x1={MERGE_START_X} x2={HATCH_START_X} y={topY} dashed />
      {/* Solid edge continues after the merge zone */}
      <EdgeLine x1={HATCH_START_X} x2={640} y={topY} />

      {/* Acceleration lane (paved) */}
      <Road x={MERGE_START_X - 20} y={topY} width={HATCH_END_X - MERGE_START_X + 20} height={botY - topY} />

      {/* Slip road (curved paved area from bottom-left) */}
      <path
        d={`M-10 300 Q 40 300 90 285 Q 140 270 ${MERGE_START_X - 10} ${topY + 6} L${MERGE_START_X - 10} ${botY} L-10 ${botY} Z`}
        fill={COLORS.road}
      />

      {/* Hatched taper at end of accel lane (DO NOT drive here) */}
      <HatchPolygon points={hatchPts} label="HATCHED — NOT A LANE" labelX={(HATCH_START_X + HATCH_END_X) / 2} labelY={topY - 6} />

      {/* Solid outer edge of accel lane / kerb line */}
      <EdgeLine x1={0} x2={HATCH_END_X} y={botY} />

      {/* Main carriageway edge line on the top side (against reservation) */}
      <EdgeLine x1={0} x2={640} y={LANE2_Y - LANE_H / 2 - 1} />

      {/* Direction-of-travel arrow on the carriageway */}
      <PathArrow d={`M40 ${LANE2_Y - LANE_H / 2 - 12} L120 ${LANE2_Y - LANE_H / 2 - 12}`} color={COLORS.paint} dashed={false} id="dir-arrow" />

      {/* Safe gap in Lane 1 (highlighted after decision) */}
      {showGap && (
        <GapMarker x={370} y={LANE1_Y - LANE_H / 2} width={90} height={LANE_H} label="SAFE GAP" />
      )}

      {/* Suggested learner path (dashed accent line during phases D/E) */}
      {(phaseC || phaseD || phaseE) && (
        <PathArrow d={`M${egoX + 20} ${ACCEL_Y - 2} Q ${egoX + 80} ${ACCEL_Y - 14} ${egoX + 130} ${LANE1_Y}`} color={COLORS.accent} id="ego-path" />
      )}

      {/* Mirror + blind-spot pulses in phase C */}
      {phaseC && (
        <>
          <MirrorPulse x={egoX - 14} y={egoY - 14} label="MIRROR" />
          <MirrorPulse x={egoX + 4} y={egoY - 22} label="BLIND SPOT" color={COLORS.accent} />
        </>
      )}

      {/* Traffic already on the carriageway */}
      {trafficLane2.map((c, i) => (
        <Car key={`l2-${i}`} x={c.x} y={c.y} color={c.color} size="md" />
      ))}
      {trafficLane1.map((c, i) => (
        <Car key={`l1-${i}`} x={c.x} y={c.y} color={c.color} size="md" />
      ))}

      {/* Ego (learner) */}
      <Car
        x={egoX}
        y={egoY}
        angle={egoAngle}
        color={COLORS.ego}
        size="md"
        indicator={phaseD || phaseE ? "right" : null}
        braking={false}
      />

      {/* Callout on the hatched area */}
      {(phaseD || phaseE || phaseF) && (
        <Callout x={(HATCH_START_X + HATCH_END_X) / 2} y={botY + 22} text="Never drive on the hatched area" tone="bad" />
      )}

      {/* Banner + speed */}
      <Banner eyebrow="GSM · JOINING A DUAL CARRIAGEWAY" title={banner} />
      <SpeedPanel speed={egoSpeed} target={68} />
    </DiagramCanvas>
  );
}

export const joiningDualCarriageway: Lesson = {
  slug: "motorway-joining",
  title: "Joining a dual carriageway",
  category: "Highway Code • Motorways & Dual Carriageways",
  rule: "Rules 259–260, 130",
  objective:
    "Join a dual carriageway or motorway safely from a slip road — build speed on the acceleration lane, use mirrors and a blind-spot check, pick a safe gap, indicate and merge smoothly into Lane 1 without slowing the traffic already there.",
  think: [
    "How fast is the traffic already on the carriageway — can I match it?",
    "Which lane am I joining — where is the safe gap?",
    "Have I checked my mirrors AND my right-shoulder blind spot?",
    "Is my indicator on early enough for the driver in Lane 1 to see it?",
    "Am I still on the acceleration lane — or drifting into the hatched area?",
  ],
  ruleHeadline: "Match the speed. Pick a gap. Merge — never force.",
  ruleBullets: [
    "Use the FULL length of the acceleration lane to build speed",
    "Match the speed of the traffic already in Lane 1 before you move over",
    "Mirrors → right-shoulder blind-spot check → indicate right",
    "Merge across the broken white line only — never across the hatched taper",
    "Give way to traffic already on the carriageway; adjust your speed if needed",
    "Once in Lane 1, cancel your signal, keep a two-second gap, stay left",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>
        Joining a dual carriageway or motorway is one of the highest-risk manoeuvres a new driver makes. Every year drivers cause avoidable collisions by joining too slowly, cutting across hatched markings, or forcing traffic in Lane 1 to brake. Done properly it should feel like slotting into a moving conveyor — matched speed, clear signal, smooth curve, no drama.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Use the whole acceleration lane</p>
      <p>
        The acceleration lane exists for one reason: so you can reach carriageway speed <em>before</em> you merge. Use every metre of it. Joining at 45&nbsp;mph into 70&nbsp;mph traffic forces the driver behind you to brake sharply and every car behind them does the same — that's how motorway pile-ups start.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Mirrors, then the blind spot</p>
      <p>
        Interior mirror to see what's on the whole carriageway, right door mirror to see Lane 1 close in, then a <strong>quick right-shoulder glance</strong> — the door pillar hides a whole car in your blind spot. Only when all three agree do you move.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">The hatched taper is NOT a lane</p>
      <p>
        Where the acceleration lane ends you'll see red-bordered white chevrons (or diagonal hatching). These are surrounded by a solid white line — that means you must not enter unless it is unavoidable in an emergency (Highway Code Rule&nbsp;130). Merge into Lane 1 <em>before</em> the hatched area starts, using the broken white line as your last window to move across.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Give way — but don't stop</p>
      <p>
        Traffic already on the carriageway has priority (Rule&nbsp;259). If Lane 1 is full, ease your speed slightly to slot in behind the next car — never brake to a halt on the acceleration lane, and never stop at the end of the taper.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Settle down</p>
      <p>
        Once you're in Lane 1, cancel your indicator, settle to the traffic speed and open a proper two-second following distance. That's your new normal — Lane 1 is home. Overtaking comes later, only when you need to.
      </p>
    </>
  ),
  georgeExplains:
    "The acceleration lane is your runway — use all of it. Look far ahead down Lane 1, mirror, right-shoulder blind-spot, indicator on. Pick a gap and match its speed exactly. If you're doing 40 and the traffic's doing 70, no gap will ever appear — you have to be part of the flow before you join it. Cross the dashed line only. Those chevrons at the end aren't a lane, they're a warning that your lane's about to disappear. Settle in Lane 1, cancel your signal, and open the two-second gap. Job done — smoothly.",
  commonMistakes: [
    "Joining at slip-road speed — forcing Lane 1 traffic to brake",
    "Reaching the end of the acceleration lane still trying to find a gap",
    "Cutting the corner across the hatched taper into Lane 1",
    "Skipping the right-shoulder blind-spot check — motorbike-killer",
    "Stopping at the end of the acceleration lane instead of easing in behind",
    "Signalling too late — the driver in Lane 1 has no time to react",
    "Merging into Lane 2 directly instead of joining Lane 1 first",
  ],
  gsmTips: [
    "Match the speed BEFORE you move — always",
    "Mirror → blind spot → indicator → merge",
    "Cross the dashed line — never the hatched taper",
    "If Lane 1 is full: ease speed, slot in behind, don't stop",
    "Once in Lane 1: signal off, two-second gap, keep left",
  ],
  keyTakeaway:
    "Use the whole acceleration lane, match the traffic speed, mirror + blind-spot check, indicate, and merge across the dashed line — never across the hatched area.",
  durationMs: 26000,
  captions: [
    { at: 0.0,  label: "SLIP ROAD — plan the join", detail: "Look far ahead into Lane 1 as you approach the acceleration lane." },
    { at: 0.18, label: "BUILD SPEED — match the traffic", detail: "Use the full length of the acceleration lane." },
    { at: 0.34, label: "MIRRORS + right-shoulder blind spot", detail: "Interior mirror, right door mirror, quick shoulder glance." },
    { at: 0.46, label: "INDICATE + pick the gap", detail: "Signal right early so the driver in Lane 1 has time to react." },
    { at: 0.64, label: "MERGE across the dashed line", detail: "Smooth curve into Lane 1 — never cut across the hatched taper." },
    { at: 0.84, label: "SETTLED in Lane 1", detail: "Cancel signal, two-second gap, keep left." },
  ],
  questions: [
    {
      at: 0.44,
      prompt: "You're near the end of the acceleration lane, matching the speed of traffic in Lane 1. What should you do next?",
      options: [
        {
          label: "Slow down and wait for a very large gap before moving",
          explain:
            "No — slowing down means you'll never match the traffic and you may run out of acceleration lane. Watch what happens next: match the speed, indicate, and slot in.",
        },
        {
          label: "Mirrors, right-shoulder blind-spot check, indicate right, then merge across the dashed line",
          correct: true,
          explain:
            "Correct. Mirror → blind spot → indicator → merge. Watch how the car crosses the broken white line into the safe gap in Lane 1, skirting the hatched taper (which is not a lane).",
        },
        {
          label: "Cut across the hatched chevrons — it's the shortest line into Lane 1",
          explain:
            "No — the hatched area is bordered by a solid line and must not be driven on (Rule 130). Watch the correct path: merge across the dashed line before the hatching begins.",
        },
      ],
    },
  ],
  render: JoiningScene,
};
