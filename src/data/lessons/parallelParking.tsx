import type { Lesson } from "@/components/driving-clips/LessonShell";
import cameraAsset from "@/assets/parallel-parking-45-camera.jpeg.asset.json";

// ─────────────────────────────────────────────────────────────
// Parallel Parking — built around George's real reversing-camera
// reference point from the GSM training vehicle. The animation
// pairs a top-down view of the manoeuvre with the actual camera
// frame the learner sees at the 45° "apply full lock right" moment.
// ─────────────────────────────────────────────────────────────

const PAINT = "#f5f5f0";
const KERB = "#8b8f95";
const ROAD = "#2b2b2e";
const BAY_LINE = "#f7c948";

const CAMERA_URL = cameraAsset.url;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Draw a simple top-down car body.
function CarTop({
  cx,
  cy,
  angle,
  color,
  reversing,
}: {
  cx: number;
  cy: number;
  angle: number; // degrees, 0 = pointing right
  color: string;
  reversing?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect x={-30} y={-13} width={60} height={26} rx={5} fill={color} stroke="#111" strokeWidth={1} />
      {/* Windscreen (front) */}
      <rect x={12} y={-9} width={10} height={18} rx={2} fill="#a8c7e6" opacity={0.85} />
      {/* Rear window */}
      <rect x={-22} y={-9} width={8} height={18} rx={2} fill="#a8c7e6" opacity={0.55} />
      {/* Wheels */}
      <rect x={-24} y={-15} width={8} height={4} fill="#111" />
      <rect x={-24} y={11} width={8} height={4} fill="#111" />
      <rect x={16} y={-15} width={8} height={4} fill="#111" />
      <rect x={16} y={11} width={8} height={4} fill="#111" />
      {/* Reversing lights */}
      {reversing && (
        <>
          <circle cx={-30} cy={-7} r={2.5} fill="#fff8c8" />
          <circle cx={-30} cy={7} r={2.5} fill="#fff8c8" />
        </>
      )}
    </g>
  );
}

// Camera-frame overlay: circle + arrow highlighting the 45° reference point
// when the animation reaches the pivot moment.
function CameraFrame({ highlight, t }: { highlight: boolean; t: number }) {
  // Fade the highlight ring in around t≈0.38
  const alpha = highlight ? Math.min(1, (t - 0.36) / 0.08) : 0;
  return (
    <g>
      {/* actual camera image */}
      <image
        href={CAMERA_URL}
        x={330}
        y={30}
        width={290}
        height={200}
        preserveAspectRatio="xMidYMid slice"
      />
      <rect x={330} y={30} width={290} height={200} fill="none" stroke="#f5f5f0" strokeOpacity={0.25} strokeWidth={1} />
      <text x={335} y={22} fontSize={9} fill="#fff" opacity={0.75} fontFamily="sans-serif" letterSpacing="1.5">
        REVERSING CAMERA · GSM VEHICLE
      </text>

      {/* Highlight overlay when at the 45° reference point */}
      {alpha > 0 && (
        <g opacity={alpha}>
          {/* Focus ring on the near-side yellow guideline meeting the kerb */}
          <circle cx={440} cy={168} r={26} fill="none" stroke="#C97845" strokeWidth={3} />
          <circle cx={440} cy={168} r={26} fill="none" stroke="#fff" strokeWidth={1} strokeDasharray="2 3" />
          {/* Arrow */}
          <line x1={510} y1={90} x2={462} y2={155} stroke="#C97845" strokeWidth={2.5} />
          <polygon points="462,155 472,148 470,160" fill="#C97845" />
          {/* Label pill */}
          <g transform="translate(345 60)">
            <rect width={210} height={30} rx={4} fill="#111" opacity={0.82} />
            <text x={10} y={13} fontSize={9} fill="#C97845" fontWeight={700} fontFamily="sans-serif" letterSpacing="1.5">
              45° REFERENCE POINT
            </text>
            <text x={10} y={24} fontSize={9} fill="#fff" fontFamily="sans-serif">
              Apply FULL LOCK RIGHT now
            </text>
          </g>
          <text x={335} y={216} fontSize={8.5} fill="#fff" opacity={0.85} fontFamily="sans-serif">
            Yellow guideline sits close to the kerb → pivot moment.
          </text>
        </g>
      )}
    </g>
  );
}

function ParallelParkingScene(t: number) {
  // Phases of the manoeuvre (learner side ↓ kerb below):
  //  0.00–0.10 pull alongside lead car
  //  0.10–0.22 stop, check mirrors + blind spot
  //  0.22–0.55 reverse slowly, LEFT LOCK on. Reach 45° at ~0.45
  //  0.55–0.85 straighten wheels, keep reversing
  //  0.85–1.00 RIGHT LOCK to swing tail in, straighten in bay
  //
  // We use a stylised top-down of the left half of the frame; the right
  // half shows the real reversing-camera view from George's car.

  const kerbY = 210;
  const leadX = 210;
  const leadY = kerbY - 40; // parked
  const bayX = 100;         // target bay centre
  const bayY = kerbY - 40;

  // Ego position + rotation across phases.
  let ex = leadX + 90;
  let ey = leadY;
  let ang = 0;
  let reversing = false;
  let phase = "Positioning";

  if (t < 0.1) {
    // pull alongside
    const k = t / 0.1;
    ex = leadX + 140 - 50 * easeInOut(k);
    ey = leadY;
    ang = 0;
    phase = "Pull alongside — 2 doors' gap";
  } else if (t < 0.22) {
    ex = leadX + 90;
    ey = leadY;
    ang = 0;
    phase = "Full check — mirrors + blind spot";
  } else if (t < 0.55) {
    // reverse with LEFT lock — swing tail toward kerb
    const k = (t - 0.22) / 0.33; // 0..1
    ang = 45 * easeInOut(k); // rotate down to 45°
    // Pivot around a virtual point; approximate arc.
    const arcR = 55;
    const theta = (ang * Math.PI) / 180;
    ex = leadX + 90 - Math.sin(theta) * arcR;
    ey = leadY + (1 - Math.cos(theta)) * arcR;
    reversing = true;
    phase = "Reverse LEFT LOCK — swing to 45°";
  } else if (t < 0.85) {
    // straighten wheels, keep reversing at 45°
    const k = (t - 0.55) / 0.3;
    ang = 45 - 5 * easeInOut(k);
    ex = leadX + 90 - Math.sin((ang * Math.PI) / 180) * 55 - 60 * easeInOut(k);
    ey = leadY + (1 - Math.cos((45 * Math.PI) / 180)) * 55 + 20 * easeInOut(k);
    reversing = true;
    phase = "Straighten wheels — keep reversing";
  } else {
    // right full lock swings nose in
    const k = (t - 0.85) / 0.15;
    ang = 40 - 40 * easeInOut(k);
    ex = bayX + 20 - 20 * easeInOut(k);
    ey = bayY;
    reversing = true;
    phase = "Full lock RIGHT — straighten in the bay";
  }

  const at45 = t >= 0.36 && t <= 0.58;

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <defs>
        <linearGradient id="sky-pp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#161618" />
          <stop offset="1" stopColor="#0e0e10" />
        </linearGradient>
      </defs>
      <rect width={640} height={360} fill="url(#sky-pp)" />

      {/* Split label */}
      <text x={16} y={20} fontSize={9} fill="#fff" opacity={0.7} fontFamily="sans-serif" letterSpacing="1.5">
        TOP-DOWN VIEW
      </text>

      {/* Road */}
      <rect x={0} y={130} width={320} height={130} fill={ROAD} />
      {/* Kerb */}
      <rect x={0} y={kerbY + 20} width={320} height={6} fill={KERB} />
      <rect x={0} y={kerbY + 26} width={320} height={30} fill="#3a5a2c" />
      {/* Centre road lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={i * 40} y={148} width={22} height={3} fill={PAINT} opacity={0.6} />
      ))}

      {/* Target bay outline */}
      <g>
        <rect x={bayX - 35} y={bayY - 22} width={70} height={44} fill="none" stroke={BAY_LINE} strokeWidth={2} strokeDasharray="4 3" />
        <text x={bayX} y={bayY + 42} fontSize={9} fill={BAY_LINE} textAnchor="middle" fontFamily="sans-serif" letterSpacing="1.5">
          TARGET BAY
        </text>
      </g>

      {/* Lead parked car */}
      <CarTop cx={leadX} cy={leadY} angle={0} color="#8a8a8f" />
      {/* Ego (learner) car */}
      <CarTop cx={ex} cy={ey} angle={ang} color="#2f6bf0" reversing={reversing} />

      {/* 45° indicator when active */}
      {at45 && (
        <g>
          <line x1={ex} y1={ey} x2={ex + 40} y2={ey} stroke="#C97845" strokeWidth={1.5} strokeDasharray="3 3" />
          <path
            d={`M ${ex + 35} ${ey} A 35 35 0 0 1 ${ex + Math.cos((-ang * Math.PI) / 180) * 35} ${ey - Math.sin((-ang * Math.PI) / 180) * 35}`}
            fill="none"
            stroke="#C97845"
            strokeWidth={1.5}
          />
          <text x={ex + 44} y={ey - 10} fontSize={10} fill="#C97845" fontWeight={700} fontFamily="sans-serif">
            45°
          </text>
        </g>
      )}

      {/* Phase HUD */}
      <g transform="translate(16 300)">
        <rect width={300} height={44} rx={6} fill="#000" opacity={0.6} />
        <text x={12} y={18} fontSize={9} fill="#9ca3af" fontFamily="sans-serif" letterSpacing="1.5">
          PHASE
        </text>
        <text x={12} y={35} fontSize={13} fill="#fff" fontWeight={700} fontFamily="sans-serif">
          {phase}
        </text>
      </g>

      {/* Divider */}
      <line x1={325} y1={0} x2={325} y2={360} stroke="#fff" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="4 4" />

      {/* Right pane: real reversing-camera view */}
      <CameraFrame highlight={at45} t={t} />

      {/* George says (camera side, bottom) */}
      <g transform="translate(330 260)">
        <rect width={290} height={78} rx={6} fill="#111" opacity={0.75} />
        <text x={12} y={16} fontSize={9} fill="#C97845" fontWeight={700} fontFamily="sans-serif" letterSpacing="1.5">
          GEORGE'S REFERENCE POINT
        </text>
        <text x={12} y={34} fontSize={10} fill="#fff" fontFamily="sans-serif">
          When the yellow guideline touches the kerb line,
        </text>
        <text x={12} y={49} fontSize={10} fill="#fff" fontFamily="sans-serif">
          the car is at 45°.
        </text>
        <text x={12} y={68} fontSize={10} fill="#f7c948" fontFamily="sans-serif" fontWeight={700}>
          → Steering wheel: FULL LOCK RIGHT.
        </text>
      </g>
    </svg>
  );
}

export const parallelParking: Lesson = {
  slug: "parallel-parking",
  title: "Parallel Parking — the GSM way",
  category: "Highway Code • Manoeuvres • Parallel Parking",
  rule: "Rule 239",
  objective:
    "Learn George's exact reference-point method for parallel parking using the reversing camera view from a real GSM lesson car. You'll know precisely when to apply full lock right — the 45° pivot moment — so the car finishes parallel to the kerb every time.",
  think: [
    "Have I stopped level with the parked car with a two-door gap between us?",
    "Are my mirrors set for the kerb and have I done a full 360° observation?",
    "As I reverse, is the yellow camera guideline getting closer to the kerb?",
    "The moment the guideline meets the kerb — am I ready to lock full right?",
    "Once tucked in — have I straightened the wheels before pulling forward?",
  ],
  ruleHeadline: "Reverse to 45°, then full lock right",
  ruleBullets: [
    "Pull up 2 doors' width from the parked car, side by side, indicating left.",
    "Full 360° observation before you release the brake.",
    "Reverse slowly with full left lock — clutch just biting, brake covering.",
    "Watch the reversing camera: when the yellow guideline touches the kerb, you're at 45°.",
    "At 45°: steering wheel full lock RIGHT while reversing under clutch control.",
    "Straighten as the car aligns with the kerb — final position within 30 cm of the kerb.",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When</p>
      <p>
        Any time you park behind another vehicle on the kerb — and on your practical
        driving test if the examiner asks for it. Parallel parking is one of the four
        set manoeuvres in the current DVSA test.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why the 45° point matters</p>
      <p>
        Every parallel park is the same shape: an S-curve. The 45° point is the exact
        halfway moment of that S. If you turn full lock right too early, the nose swings
        wide into the road; too late, and the tail hits the kerb. Using the reversing
        camera guideline as George teaches removes the guesswork — you park by
        reference, not by feel.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">The GSM sequence</p>
      <ol className="list-decimal pl-5 space-y-1">
        <li>Position two doors alongside, handbrake, select reverse.</li>
        <li>Full observation (right blind spot last — cyclists live there).</li>
        <li>Clutch biting, reverse straight for one car length.</li>
        <li>Left lock on while creeping back — watch the camera.</li>
        <li>Yellow guideline touches kerb → full lock RIGHT.</li>
        <li>Nose swings in, straighten wheels, gently brake.</li>
      </ol>
    </>
  ),
  georgeExplains:
    "This is the exact camera view my learners see in the GSM car. Forget counting seconds or trying to feel the angle — trust the yellow line. When that line kisses the kerb you're perfectly at 45°, and that's your cue: steering wheel spins full right and the car tucks itself in. Do this three times in a row and you'll never fail parallel parking again.",
  commonMistakes: [
    "Turning right too early — car ends up too far out from the kerb.",
    "Turning right too late — back wheel hits or mounts the kerb.",
    "Reversing too fast — you lose the reference point before you can react.",
    "Staring only at the camera — you must still shoulder-check for pedestrians.",
    "Forgetting to straighten the wheels before pulling forward.",
  ],
  mistakes: [
    {
      wrong: "Applying full lock right the moment you start reversing.",
      why: "You haven't reached 45° yet, so the nose swings out and blocks the road while your rear stays too far from the kerb.",
      right: "Reverse with left lock first. Wait for the yellow camera line to touch the kerb — that's 45°. Only then, full lock right.",
    },
    {
      wrong: "Waiting until the car is almost parallel before turning right.",
      why: "By then the back wheel is already on the kerb line — it will scuff, mount the kerb, or trigger an immediate fault on test.",
      right: "Trust the reference point. Guideline on kerb = full lock right. Not a second later.",
    },
    {
      wrong: "Only watching the reversing camera.",
      why: "Pedestrians, cyclists and other traffic don't appear on the camera in time. Failing to observe = serious fault.",
      right: "Camera for the reference point, mirrors and shoulder checks for safety. Alternate constantly.",
    },
  ],
  gsmTips: [
    "Clutch bite + gentle brake = the slowest, most controllable reverse speed.",
    "If you miss the 45° point, stop — pull forward and reset. Never guess.",
    "Two doors' gap alongside the parked car is the golden starting position.",
    "In the GSM car the yellow guideline is your friend — memorise how it moves.",
    "Straighten the wheels the moment the car is parallel — it saves your tyres and looks professional.",
  ],
  keyTakeaway:
    "Yellow line touches the kerb → full lock right. That single reference point is what turns parallel parking from luck into a technique you can repeat every time.",
  durationMs: 16000,
  captions: [
    { at: 0.0, label: "Positioning", detail: "Pull alongside the parked car with a two-door gap. Indicate left." },
    { at: 0.12, label: "Full 360° observation", detail: "Mirrors, over both shoulders, blind spots. Then select reverse." },
    { at: 0.24, label: "Reverse with left lock", detail: "Clutch just biting, brake covering. Watch the yellow guideline on the camera." },
    { at: 0.42, label: "45° reference point", detail: "Yellow guideline touches the kerb — this is George's cue. Steering wheel goes full lock RIGHT." },
    { at: 0.6, label: "Straighten & keep reversing", detail: "Wheels straight, keep the same slow reverse speed, keep observing." },
    { at: 0.88, label: "Final adjustment", detail: "Small right-lock swing tucks the nose in — straighten within 30 cm of the kerb." },
  ],
  questions: [
    {
      at: 0.42,
      prompt: "The yellow camera guideline has just touched the kerb. What do you do?",
      options: [
        {
          label: "Keep left lock on and reverse a little more",
          explain: "Too late — the back of the car will hit the kerb because you're already at 45°.",
        },
        {
          label: "Full lock RIGHT while still slowly reversing",
          correct: true,
          explain: "Exactly right. Guideline on the kerb = 45° pivot moment. Steering wheel full right, keep the slow reverse going, and the car tucks itself in.",
        },
        {
          label: "Straighten the wheels and stop",
          explain: "The car is only halfway through the S-curve — stopping now leaves you sticking out into the road.",
        },
      ],
    },
    {
      at: 0.88,
      prompt: "You're now nearly parallel to the kerb. What's the last thing to do before applying the handbrake?",
      options: [
        {
          label: "Straighten the front wheels",
          correct: true,
          explain: "Correct. Straight wheels means you'll pull away smoothly and your tyres won't scrub — the mark of a professional finish.",
        },
        {
          label: "Leave the wheels on full right lock",
          explain: "Bad for the tyres and you'll swerve into the road the moment you pull away.",
        },
        {
          label: "Pull forward immediately",
          explain: "You haven't secured the car yet — handbrake and neutral before anything else.",
        },
      ],
    },
  ],
  render: ParallelParkingScene,
};
