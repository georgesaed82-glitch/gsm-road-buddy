import type { Lesson } from "@/components/driving-clips/LessonShell";

// ─────────────────────────────────────────────────────────────
// Lesson 1 · DSSSM Cockpit Drill
// A single continuous ~55s animation choreographed as nine
// cinematic scenes. Every scene is drawn in SVG using the GSM
// palette (black, gold/terracotta, cream, white) with a stylised
// right-hand-drive UK cockpit and a consistent instructor figure.
//
//   Scene 1 (0.00–0.10) — Intro (logo + title)
//   Scene 2 (0.10–0.19) — Door (close, shake, tick)
//   Scene 3 (0.19–0.34) — Seat (height, distance, backrest, head restraint)
//   Scene 4 (0.34–0.44) — Steering wheel (rake + reach)
//   Scene 5 (0.44–0.55) — Seatbelt (pull, click, sit)
//   Scene 6 (0.55–0.68) — Mirrors (interior, then door mirrors)
//   Scene 7 (0.68–0.80) — Quiz (auto-pause at 0.72)
//   Scene 8 (0.80–0.92) — Summary D S S S M
//   Scene 9 (0.92–1.00) — Ending (thumbs up + tagline + logo)
// ─────────────────────────────────────────────────────────────

const CREAM = "#F7F3E8";
const GOLD = "#C97845";
const INK = "#1D2A22";
const CARBON = "#101012";
const CARBON2 = "#1a1a1c";
const GOOD = "#22c55e";
const GLASS = "#8fb8d8";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// ─── Reusable pieces ─────────────────────────────────────────

function SkyRoad({ pan = 0 }: { pan?: number }) {
  const shift = (pan * 200) % 200;
  return (
    <g>
      <defs>
        <linearGradient id="sky-cd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9c8e0" />
          <stop offset="1" stopColor="#e6eaec" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={640} height={220} fill="url(#sky-cd)" />
      <path
        d="M0 200 Q120 160 240 195 T480 190 T720 205 L720 220 L0 220 Z"
        fill="#8fa792"
        opacity={0.6}
        transform={`translate(${-shift * 0.2} 0)`}
      />
      <rect x={0} y={200} width={640} height={100} fill="#2b2b2e" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect
          key={i}
          x={i * 80 - shift}
          y={244}
          width={40}
          height={4}
          fill={CREAM}
          opacity={0.85}
        />
      ))}
      <g transform={`translate(${420 - shift * 0.4} 150)`}>
        <rect width={70} height={50} fill="#e6c9a8" />
        <polygon points="0,0 35,-22 70,0" fill="#7a3a2a" />
        <rect x={12} y={18} width={14} height={20} fill={GLASS} />
        <rect x={42} y={18} width={14} height={20} fill={GLASS} />
      </g>
    </g>
  );
}

function Windscreen({
  children,
  cameraPan = 0,
}: {
  children?: React.ReactNode;
  cameraPan?: number;
}) {
  return (
    <g>
      <defs>
        <clipPath id="ws-clip">
          <path d="M40 60 Q320 30 600 60 L600 240 L40 240 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#ws-clip)">
        <g transform={`translate(${-cameraPan * 20} 0)`}>
          <SkyRoad pan={cameraPan} />
        </g>
        {children}
      </g>
      <path
        d="M40 60 Q320 30 600 60 L600 240 L40 240 Z"
        fill="none"
        stroke={CARBON}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <g>
        <rect x={296} y={40} width={70} height={22} rx={4} fill="#0a0a0a" />
        <rect x={300} y={44} width={62} height={14} rx={2} fill={GLASS} opacity={0.55} />
      </g>
      <path d="M40 60 L40 240 L20 240 L20 90 Z" fill={CARBON} />
      <path d="M600 60 L600 240 L620 240 L620 90 Z" fill={CARBON} />
      <path d="M0 240 L640 240 L640 360 L0 360 Z" fill={CARBON2} />
      <rect x={0} y={240} width={640} height={4} fill="#000" opacity={0.6} />
      <g transform="translate(430 258)">
        <rect width={170} height={82} rx={10} fill="#050505" stroke={CARBON} strokeWidth={2} />
        <circle cx={45} cy={41} r={26} fill="none" stroke="#2a2a2c" strokeWidth={3} />
        <circle cx={125} cy={41} r={26} fill="none" stroke="#2a2a2c" strokeWidth={3} />
        <circle cx={45} cy={41} r={2} fill={GOLD} />
        <circle cx={125} cy={41} r={2} fill={GOLD} />
      </g>
    </g>
  );
}

function SteeringWheel({
  x,
  y,
  r = 60,
  angle = 0,
  opacity = 1,
  tilt = 0,
}: {
  x: number;
  y: number;
  r?: number;
  angle?: number;
  opacity?: number;
  tilt?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle}) scale(1 ${1 - Math.abs(tilt) * 0.05})`}
      opacity={opacity}
    >
      <circle r={r} fill="none" stroke="#0a0a0a" strokeWidth={12} />
      <circle r={r - 8} fill="none" stroke="#1a1a1c" strokeWidth={2} />
      <circle r={12} fill={GOLD} />
      <text
        textAnchor="middle"
        y={4}
        fontSize={9}
        fontWeight={900}
        fill={INK}
        fontFamily="sans-serif"
      >
        GSM
      </text>
      <line x1={-r + 12} y1={0} x2={-12} y2={0} stroke="#0a0a0a" strokeWidth={8} />
      <line x1={12} y1={0} x2={r - 12} y2={0} stroke="#0a0a0a" strokeWidth={8} />
      <line x1={0} y1={12} x2={0} y2={r - 12} stroke="#0a0a0a" strokeWidth={8} />
    </g>
  );
}

function Instructor({
  x,
  y,
  scale = 1,
  thumb = false,
  smile = 0.5,
  look = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  thumb?: boolean;
  smile?: number;
  look?: number;
}) {
  const s = scale;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-52} y={-6} width={104} height={140} rx={14} fill="#151517" />
      <rect x={-46} y={-4} width={92} height={130} rx={12} fill="#242427" />
      <path d="M-38 40 Q0 20 38 40 L34 130 L-34 130 Z" fill={INK} />
      <rect x={-10} y={70} width={20} height={8} rx={2} fill={GOLD} />
      <text
        x={0}
        y={77}
        textAnchor="middle"
        fontSize={6}
        fontWeight={800}
        fill={INK}
        fontFamily="sans-serif"
      >
        GSM
      </text>
      <rect x={-8} y={14} width={16} height={18} fill="#c8a084" />
      <g transform={`translate(${look * 3} 0)`}>
        <ellipse cx={0} cy={-2} rx={26} ry={30} fill="#e2b699" />
        <path
          d="M-28 -12 Q-30 -34 0 -36 Q30 -34 28 -12 Q28 -22 20 -28 Q0 -32 -20 -28 Q-28 -22 -28 -12 Z"
          fill="#3b2a20"
        />
        <ellipse cx={26} cy={12} rx={6} ry={16} fill="#3b2a20" />
        <ellipse cx={-8 + look * 1.5} cy={-2} rx={2} ry={2.4} fill={INK} />
        <ellipse cx={8 + look * 1.5} cy={-2} rx={2} ry={2.4} fill={INK} />
        <line
          x1={-12}
          y1={-10}
          x2={-4}
          y2={-11}
          stroke={INK}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
        <line
          x1={4}
          y1={-11}
          x2={12}
          y2={-10}
          stroke={INK}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
        <path
          d={`M-6 ${10 - smile * 2} Q0 ${12 + smile * 4} 6 ${10 - smile * 2}`}
          stroke={INK}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {thumb ? (
        <g>
          <path
            d="M-30 60 Q-20 40 -8 30"
            stroke={INK}
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={-6} cy={28} r={7} fill="#e2b699" />
          <rect x={-9} y={12} width={6} height={14} rx={2} fill="#e2b699" />
        </g>
      ) : (
        <g>
          <path
            d="M-30 60 Q-24 90 -10 108"
            stroke={INK}
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M30 60 Q24 90 10 108"
            stroke={INK}
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={-10} cy={108} r={7} fill="#e2b699" />
          <circle cx={10} cy={108} r={7} fill="#e2b699" />
        </g>
      )}
    </g>
  );
}

function Tick({ x, y, r = 22, appear }: { x: number; y: number; r?: number; appear: number }) {
  const scale = easeInOut(appear);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={appear}>
      <circle r={r} fill={GOOD} />
      <circle r={r} fill="none" stroke="#fff" strokeWidth={2} opacity={0.9} />
      <path
        d={`M${-r * 0.45} 0 L${-r * 0.1} ${r * 0.4} L${r * 0.55} ${-r * 0.4}`}
        stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  );
}

function StageChip({ n, label }: { n: number; label: string }) {
  return (
    <g transform="translate(20 20)">
      <rect width={220} height={42} rx={8} fill="#000" opacity={0.72} />
      <rect x={0} y={0} width={40} height={42} rx={8} fill={GOLD} />
      <text
        x={20}
        y={28}
        textAnchor="middle"
        fontSize={20}
        fontWeight={900}
        fill={INK}
        fontFamily="sans-serif"
      >
        {n}
      </text>
      <text
        x={54}
        y={27}
        fontSize={13}
        fontWeight={800}
        fill="#fff"
        fontFamily="sans-serif"
        letterSpacing={1.4}
      >
        {label}
      </text>
    </g>
  );
}

function Callout({ x, y, w, lines }: { x: number; y: number; w: number; lines: string[] }) {
  const h = 22 + lines.length * 20;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={8} fill={CREAM} stroke={INK} strokeWidth={2} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={14}
          y={26 + i * 20}
          fontSize={13}
          fontWeight={700}
          fill={INK}
          fontFamily="sans-serif"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function ProgressBar({ t }: { t: number }) {
  return (
    <g>
      <rect x={20} y={334} width={600} height={6} rx={3} fill="#000" opacity={0.55} />
      <rect x={20} y={334} width={600 * t} height={6} rx={3} fill={GOLD} />
    </g>
  );
}

// ─── Scenes ─────────────────────────────────────────────────

function SceneIntro(k: number) {
  const fade = easeInOut(clamp01(k * 2));
  const out = 1 - easeInOut(clamp01((k - 0.7) / 0.3));
  return (
    <g opacity={out}>
      <rect width={640} height={360} fill={INK} />
      <g opacity={0.15}>
        <Windscreen cameraPan={k * 0.3} />
      </g>
      <g transform="translate(210 150)" opacity={fade}>
        <circle r={28} fill={GOLD} />
        <circle r={20} fill="none" stroke={INK} strokeWidth={3} />
        <line x1={-14} y1={0} x2={14} y2={0} stroke={INK} strokeWidth={3} />
        <line x1={0} y1={-14} x2={0} y2={14} stroke={INK} strokeWidth={3} />
        <text x={44} y={6} fontSize={30} fontWeight={900} fill={CREAM} fontFamily="sans-serif">
          GSM
        </text>
        <text
          x={122}
          y={6}
          fontSize={18}
          fontWeight={700}
          fill={GOLD}
          letterSpacing={2}
          fontFamily="sans-serif"
        >
          PLUS
        </text>
        <text
          x={44}
          y={26}
          fontSize={9}
          fontWeight={700}
          fill={CREAM}
          opacity={0.7}
          letterSpacing={2}
          fontFamily="sans-serif"
        >
          PROFESSIONAL DRIVER TRAINING
        </text>
      </g>
      <text
        x={320}
        y={230}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill={GOLD}
        letterSpacing={5}
        fontFamily="sans-serif"
        opacity={fade}
      >
        LESSON 1
      </text>
      <text
        x={320}
        y={272}
        textAnchor="middle"
        fontSize={44}
        fontWeight={900}
        fill={CREAM}
        letterSpacing={4}
        fontFamily="sans-serif"
        opacity={fade}
      >
        DSSSM
      </text>
      <text
        x={320}
        y={300}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill={CREAM}
        opacity={fade * 0.8}
        letterSpacing={4}
        fontFamily="sans-serif"
      >
        COCKPIT DRILL
      </text>
    </g>
  );
}

function SceneWithCockpit(k: number, stage: number, label: string, panel: React.ReactNode) {
  return (
    <g>
      <Windscreen cameraPan={k * 0.4} />
      <Instructor x={470} y={140} scale={0.85} smile={0.5} />
      <StageChip n={stage} label={label} />
      {panel}
    </g>
  );
}

function SceneDoor(k: number) {
  const close = easeInOut(clamp01(k * 1.6));
  const shake = k > 0.65 && k < 0.8 ? Math.sin((k - 0.65) * 90) * 3 : 0;
  const tick = clamp01((k - 0.8) / 0.15);
  const doorAngle = -60 * (1 - close) + shake;
  const textIn = easeInOut(clamp01((k - 0.15) / 0.3));
  return SceneWithCockpit(
    k,
    2,
    "DOOR",
    <g>
      <g transform={`translate(600 200) rotate(${doorAngle})`}>
        <rect x={-120} y={-70} width={120} height={150} rx={6} fill="#0a0a0a" />
        <rect x={-115} y={-30} width={80} height={30} rx={4} fill={GLASS} opacity={0.5} />
        <rect x={-40} y={30} width={30} height={10} rx={2} fill={GOLD} />
      </g>
      <g transform="translate(20 130)" opacity={textIn}>
        <Callout
          x={0}
          y={0}
          w={230}
          lines={["Check the door is fully", "closed. Give it a firm", "pull to make sure."]}
        />
      </g>
      <Tick x={560} y={200} appear={tick} />
    </g>,
  );
}

function SceneSeat(k: number) {
  const sub = k * 4;
  const active = Math.min(3, Math.floor(sub));
  const labels = ["HEIGHT", "DISTANCE", "BACKREST", "HEAD RESTRAINT"];
  const details: string[][] = [
    ["Eyes in the middle of", "the windscreen."],
    ["Press the accelerator —", "slight bend in the knee."],
    ["Hold the wheel — slight", "bend in the elbows."],
    ["Top of the head restraint", "level with your eyes."],
  ];
  const detail = details[active];
  const seatLift = active >= 0 ? 4 : 0;
  const backAngle = active >= 2 ? -6 + easeInOut(clamp01(sub - 2)) * 6 : -6;
  const hrOffset = active >= 3 ? easeInOut(clamp01(sub - 3)) * 12 - 6 : 0;
  const slide = active >= 1 ? easeInOut(clamp01(sub - 1)) * 8 : 0;
  return SceneWithCockpit(
    k,
    3,
    "SEAT",
    <g>
      <g transform="translate(30 90)">
        <rect
          width={260}
          height={200}
          rx={12}
          fill={CREAM}
          opacity={0.95}
          stroke={INK}
          strokeWidth={2}
        />
        <text
          x={130}
          y={26}
          textAnchor="middle"
          fontSize={12}
          fontWeight={900}
          letterSpacing={2}
          fill={GOLD}
          fontFamily="sans-serif"
        >
          {labels[active]}
        </text>
        <g transform={`translate(${130 + slide} ${120 - seatLift})`}>
          <rect x={-16} y={-84 + hrOffset} width={32} height={20} rx={4} fill={INK} />
          <g transform={`rotate(${backAngle})`}>
            <rect x={-20} y={-64} width={40} height={64} rx={6} fill={INK} />
          </g>
          <rect x={-30} y={0} width={60} height={14} rx={4} fill={INK} />
          <rect x={-26} y={14} width={52} height={6} fill="#000" opacity={0.7} />
          {active === 0 && (
            <g stroke={GOLD} strokeWidth={2.5} fill="none">
              <line x1={40} y1={-30} x2={40} y2={-6} markerEnd="url(#ar)" />
              <line x1={40} y1={-70} x2={40} y2={-90} markerEnd="url(#ar)" />
            </g>
          )}
          {active === 1 && (
            <g stroke={GOLD} strokeWidth={2.5} fill="none">
              <line x1={-46} y1={6} x2={-26} y2={6} markerEnd="url(#ar)" />
              <line x1={46} y1={6} x2={26} y2={6} markerEnd="url(#ar)" />
            </g>
          )}
          {active === 2 && (
            <path
              d="M18 -60 Q40 -40 24 -14"
              stroke={GOLD}
              strokeWidth={2.5}
              fill="none"
              markerEnd="url(#ar)"
            />
          )}
          {active === 3 && (
            <g stroke={GOLD} strokeWidth={2.5} fill="none">
              <line x1={30} y1={-84 + hrOffset} x2={50} y2={-90 + hrOffset} markerEnd="url(#ar)" />
            </g>
          )}
          <defs>
            <marker
              id="ar"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill={GOLD} />
            </marker>
          </defs>
        </g>
        <text
          x={130}
          y={180}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={INK}
          fontFamily="sans-serif"
        >
          {detail[0]}
        </text>
        <text
          x={130}
          y={194}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={INK}
          fontFamily="sans-serif"
        >
          {detail[1]}
        </text>
        <g transform="translate(96 42)">
          {labels.map((_, i) => (
            <circle key={i} cx={i * 16} cy={0} r={4} fill={i <= active ? GOOD : "#c8c1a8"} />
          ))}
        </g>
      </g>
      {[0, 1, 2, 3].map((i) => {
        const localT = clamp01(sub - (i + 0.9));
        if (localT <= 0) return null;
        return <Tick key={i} x={560} y={100 + i * 36} r={12} appear={localT} />;
      })}
    </g>,
  );
}

function SceneSteering(k: number) {
  const rake = easeInOut(clamp01(k / 0.4)) * 6 - 3;
  const reach = easeInOut(clamp01((k - 0.4) / 0.4)) * 12;
  const tick = clamp01((k - 0.85) / 0.15);
  return SceneWithCockpit(
    k,
    4,
    "STEERING WHEEL",
    <g>
      <SteeringWheel x={220 + reach * 0.4} y={230 - rake * 2} r={72} tilt={rake / 30} />
      {k < 0.42 && (
        <g stroke={GOLD} strokeWidth={3} fill="none">
          <line x1={220} y1={150} x2={220} y2={130} markerEnd="url(#ars2)" />
          <line x1={220} y1={310} x2={220} y2={330} markerEnd="url(#ars2)" />
        </g>
      )}
      {k >= 0.4 && k < 0.85 && (
        <g stroke={GOLD} strokeWidth={3} fill="none">
          <line x1={140} y1={230} x2={120} y2={230} markerEnd="url(#ars2)" />
          <line x1={300} y1={230} x2={320} y2={230} markerEnd="url(#ars2)" />
        </g>
      )}
      <defs>
        <marker
          id="ars2"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={GOLD} />
        </marker>
      </defs>
      <g opacity={easeInOut(clamp01((k - 0.1) / 0.3))}>
        <Callout
          x={20}
          y={90}
          w={230}
          lines={[
            "Adjust height so you see",
            "the dashboard clearly.",
            "Slight bend in the elbows.",
          ]}
        />
      </g>
      <Tick x={360} y={200} appear={tick} />
    </g>,
  );
}

function SceneSeatbelt(k: number) {
  const pull = easeInOut(clamp01(k / 0.4));
  const click = k > 0.42 && k < 0.55;
  const settled = clamp01((k - 0.55) / 0.3);
  const tick = clamp01((k - 0.85) / 0.15);
  const beltX2 = 430 - pull * 130;
  const beltY2 = 210 + pull * 50;
  return SceneWithCockpit(
    k,
    5,
    "SEATBELT",
    <g>
      <line
        x1={520}
        y1={110}
        x2={beltX2}
        y2={beltY2}
        stroke={INK}
        strokeWidth={9}
        strokeLinecap="round"
      />
      <line
        x1={520}
        y1={110}
        x2={beltX2}
        y2={beltY2}
        stroke={GOLD}
        strokeWidth={2}
        strokeDasharray="3 4"
      />
      <g transform="translate(300 260)">
        <rect x={-16} y={-10} width={32} height={20} rx={4} fill="#0a0a0a" />
        <rect x={-6} y={-14} width={14} height={12} rx={2} fill={click ? "#ff5a3a" : "#e6b800"} />
        {click && (
          <circle r={22} fill="none" stroke={GOOD} strokeWidth={2}>
            <animate attributeName="r" values="6;26;6" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
      {settled > 0 && (
        <line
          x1={520}
          y1={110}
          x2={300}
          y2={260}
          stroke={INK}
          strokeWidth={9}
          opacity={settled}
          strokeLinecap="round"
        />
      )}
      <g opacity={easeInOut(clamp01((k - 0.1) / 0.25))}>
        <Callout
          x={20}
          y={90}
          w={230}
          lines={["Reach up, draw the belt", "across, click it in.", "Not twisted. Lap on hips."]}
        />
      </g>
      <Tick x={360} y={200} appear={tick} />
    </g>,
  );
}

function SceneMirrors(k: number) {
  const interior = clamp01(k / 0.4);
  const door = clamp01((k - 0.4) / 0.5);
  const tick = clamp01((k - 0.9) / 0.1);
  return (
    <g>
      <Windscreen cameraPan={0.2 + k * 0.2} />
      <Instructor x={470} y={140} scale={0.85} look={k < 0.4 ? -0.5 : 0.6} />
      <StageChip n={6} label="MIRRORS" />
      {k < 0.5 && (
        <g opacity={interior}>
          <rect
            x={286}
            y={30}
            width={90}
            height={42}
            rx={6}
            fill="none"
            stroke={GOLD}
            strokeWidth={3}
          />
          <text
            x={331}
            y={90}
            textAnchor="middle"
            fontSize={11}
            fontWeight={800}
            fill={GOLD}
            fontFamily="sans-serif"
          >
            INTERIOR MIRROR
          </text>
        </g>
      )}
      {k >= 0.35 && (
        <g opacity={door}>
          <g transform="translate(30 90)">
            <rect width={240} height={170} rx={10} fill={CREAM} stroke={INK} strokeWidth={2} />
            <text
              x={120}
              y={26}
              textAnchor="middle"
              fontSize={12}
              fontWeight={900}
              letterSpacing={2}
              fill={GOLD}
              fontFamily="sans-serif"
            >
              DOOR MIRROR
            </text>
            <g transform="translate(20 40)">
              <rect width={200} height={110} rx={6} fill={GLASS} />
              <line
                x1={0}
                y1={55}
                x2={200}
                y2={55}
                stroke={CREAM}
                strokeWidth={2}
                strokeDasharray="5 4"
              />
              <rect x={0} y={0} width={20} height={110} fill="#0a0a0a" opacity={0.75} />
              <text
                x={10}
                y={62}
                textAnchor="middle"
                fontSize={9}
                fontWeight={800}
                fill={GOLD}
                fontFamily="sans-serif"
                transform="rotate(-90 10 62)"
              >
                10% CAR
              </text>
              <text
                x={110}
                y={30}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill={INK}
                fontFamily="sans-serif"
              >
                HALF SKY
              </text>
              <text
                x={110}
                y={85}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill={INK}
                fontFamily="sans-serif"
              >
                HALF ROAD
              </text>
            </g>
          </g>
        </g>
      )}
      <Tick x={560} y={200} appear={tick} />
    </g>
  );
}

function SceneQuiz(k: number) {
  const fadeIn = easeInOut(clamp01(k / 0.15));
  const options = [
    { letter: "A", label: "To look taller" },
    { letter: "B", label: "For the best view of the road" },
    { letter: "C", label: "To reach the steering wheel" },
  ];
  return (
    <g>
      <rect width={640} height={360} fill={INK} />
      <StageChip n={7} label="QUICK CHECK" />
      <g opacity={fadeIn}>
        <text x={40} y={130} fontSize={20} fontWeight={800} fill={CREAM} fontFamily="sans-serif">
          Why should your eyes be in
        </text>
        <text x={40} y={158} fontSize={20} fontWeight={800} fill={CREAM} fontFamily="sans-serif">
          the middle of the windscreen?
        </text>
        {options.map((o, i) => (
          <g key={i} transform={`translate(40 ${200 + i * 42})`}>
            <rect width={560} height={34} rx={8} fill={CREAM} opacity={0.95} />
            <rect x={0} y={0} width={34} height={34} rx={8} fill={GOLD} />
            <text
              x={17}
              y={22}
              textAnchor="middle"
              fontSize={16}
              fontWeight={900}
              fill={INK}
              fontFamily="sans-serif"
            >
              {o.letter}
            </text>
            <text x={50} y={22} fontSize={14} fontWeight={700} fill={INK} fontFamily="sans-serif">
              {o.label}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

function SceneSummary(k: number) {
  const letters = ["D", "S", "S", "S", "M"];
  const words = ["DOOR", "SEAT", "STEERING", "SEATBELT", "MIRRORS"];
  const bannerIn = easeInOut(clamp01((k - 0.7) / 0.3));
  return (
    <g>
      <rect width={640} height={360} fill={INK} />
      <StageChip n={8} label="SUMMARY" />
      {letters.map((L, i) => {
        const appear = clamp01((k - i * 0.12) / 0.12);
        return (
          <g key={i} transform={`translate(${90 + i * 110} 180)`} opacity={appear}>
            <text
              textAnchor="middle"
              fontSize={72}
              fontWeight={900}
              fill={GOLD}
              fontFamily="sans-serif"
            >
              {L}
            </text>
            <circle cy={40} r={22} fill="none" stroke={CREAM} strokeWidth={2} opacity={0.4} />
            <text
              y={45}
              textAnchor="middle"
              fontSize={16}
              fontWeight={900}
              fill={CREAM}
              fontFamily="sans-serif"
            >
              {L}
            </text>
            <text
              y={90}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={CREAM}
              letterSpacing={1.5}
              fontFamily="sans-serif"
            >
              {words[i]}
            </text>
          </g>
        );
      })}
      <g opacity={bannerIn} transform="translate(80 290)">
        <rect width={480} height={40} rx={8} fill={GOLD} />
        <text
          x={240}
          y={26}
          textAnchor="middle"
          fontSize={13}
          fontWeight={900}
          letterSpacing={2}
          fill={INK}
          fontFamily="sans-serif"
        >
          COMPLETE THIS CHECK EVERY TIME BEFORE DRIVING
        </text>
      </g>
    </g>
  );
}

function SceneEnding(k: number) {
  const fadeIn = easeInOut(clamp01(k / 0.3));
  const tagIn = easeInOut(clamp01((k - 0.35) / 0.3));
  const logoIn = easeInOut(clamp01((k - 0.7) / 0.3));
  return (
    <g>
      <rect width={640} height={360} fill={INK} />
      <g opacity={fadeIn}>
        <Instructor x={470} y={110} scale={1.05} thumb smile={1} />
      </g>
      <g opacity={tagIn}>
        <text
          x={40}
          y={170}
          fontSize={28}
          fontWeight={900}
          fill={CREAM}
          letterSpacing={2}
          fontFamily="sans-serif"
        >
          SAFE POSITION.
        </text>
        <text
          x={40}
          y={206}
          fontSize={28}
          fontWeight={900}
          fill={GOLD}
          letterSpacing={2}
          fontFamily="sans-serif"
        >
          SAFE JOURNEY.
        </text>
      </g>
      <g opacity={logoIn} transform="translate(40 280)">
        <circle cx={16} cy={0} r={14} fill={GOLD} />
        <line x1={4} y1={0} x2={28} y2={0} stroke={INK} strokeWidth={2} />
        <line x1={16} y1={-12} x2={16} y2={12} stroke={INK} strokeWidth={2} />
        <text x={40} y={6} fontSize={20} fontWeight={900} fill={CREAM} fontFamily="sans-serif">
          GSM
        </text>
        <text
          x={90}
          y={6}
          fontSize={14}
          fontWeight={700}
          fill={GOLD}
          letterSpacing={2}
          fontFamily="sans-serif"
        >
          PLUS
        </text>
      </g>
    </g>
  );
}

// ─── Master render ──────────────────────────────────────────

function Render(t: number) {
  const scenes: [number, number, (k: number) => React.ReactNode][] = [
    [0.0, 0.1, SceneIntro],
    [0.1, 0.19, SceneDoor],
    [0.19, 0.34, SceneSeat],
    [0.34, 0.44, SceneSteering],
    [0.44, 0.55, SceneSeatbelt],
    [0.55, 0.68, SceneMirrors],
    [0.68, 0.8, SceneQuiz],
    [0.8, 0.92, SceneSummary],
    [0.92, 1.001, SceneEnding],
  ];
  let active = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (t >= scenes[i][0]) active = i;
  }
  const [a, b, fn] = scenes[active];
  const k = clamp01((t - a) / (b - a));
  const fade = clamp01(k / 0.08);
  const outFade = 1 - clamp01((k - 0.92) / 0.08);
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full">
      <rect width={640} height={360} fill={CARBON} />
      <g opacity={fade * outFade}>{fn(k)}</g>
      <ProgressBar t={t} />
    </svg>
  );
}

// ─── Lesson export ──────────────────────────────────────────

export const dsssmCockpitDrill: Lesson = {
  slug: "dsssm-cockpit-drill",
  title: "DSSSM Cockpit Drill",
  category: "GSM Method • Before You Drive",
  rule: "Rules 97, 99",
  objective:
    "Set up your driving position for safety, comfort and control every time you get in the car — Door, Seat, Steering, Seatbelt, Mirrors.",
  think: [
    "Is the door fully closed and secure?",
    "Can I comfortably reach and press every pedal?",
    "Are my elbows and knees slightly bent, never straight?",
    "Is my head restraint level with the top of my head?",
    "Do all three mirrors show what I need — half road, half sky, 10% car in the door mirrors?",
  ],
  ruleHeadline: "Every drive starts the same way — D · S · S · S · M.",
  ruleBullets: [
    "DOOR — closed, latched and checked with a firm pull",
    "SEAT — height, distance, backrest, head restraint",
    "STEERING — height and reach set with slight bend in the elbows",
    "SEATBELT — on, not twisted, chest and hips",
    "MIRRORS — interior first, then both door mirrors",
  ],
  why: (
    <>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">Why we do it</p>
      <p>
        A safe drive starts before the wheels turn. If your seat, wheel, belt and mirrors aren't
        right, every input you make afterwards is compromised — you'll struggle with visibility,
        control and comfort, and a small emergency becomes a big one.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">When we do it</p>
      <p>
        Every single time you get in — even if you're the only driver. Seats, mirrors and steering
        columns get knocked, belts twist, doors don't always latch first time.
      </p>
      <p className="font-semibold uppercase tracking-wider text-accent text-xs">
        The order matters
      </p>
      <p>
        Do it in the DSSSM order. Adjusting the seat AFTER the belt or mirrors means starting again
        — the belt won't fit, and the mirrors will be wrong for your new eye position.
      </p>
    </>
  ),
  georgeExplains:
    "DSSSM is your before-you-drive routine. Door closed and pulled to check. Seat set so your knee has a slight bend on the clutch, back supported, head restraint level with the top of your head, hips squared to the wheel. Steering column adjusted so your elbows are softly bent — never straight-arm. Seatbelt on, not twisted, across the chest and low on the hips. Then, and only then, the mirrors — interior first showing the full rear window, then both door mirrors set to half road, half sky, with about ten per cent of your own car in view. Do it in that order, every single time, and you start every drive from the safest possible position.",
  commonMistakes: [
    "Skipping the door check and setting off with a door not fully latched",
    "Sitting too close to the wheel with straight arms — no control, airbag hazard",
    "Sitting too far back so the pedals need a stretch — legs lock, panic-braking is worse",
    "Head restraint too low — a rear shunt then loads the neck instead of the head",
    "Twisted seatbelt or the lap belt sitting on the stomach instead of the hips",
    "Adjusting mirrors before the seat — they'll be wrong the moment you move",
  ],
  gsmTips: [
    "Same order, every time — D · S · S · S · M",
    "Elbows and knees soft — never straight",
    "Belt: chest and hips, never neck and stomach",
    "Mirrors: half road, half sky, 10% car",
    "If someone else has driven your car — assume every setting has moved",
  ],
  keyTakeaway:
    "DSSSM is the cockpit drill — Door, Seat, Steering, Seatbelt, Mirrors. Complete it in that order every single time before you turn the key.",
  durationMs: 55000,
  captions: [
    {
      at: 0.0,
      label: "Lesson 1 · DSSSM",
      detail: "Set up your driving position for safety, comfort and control.",
    },
    { at: 0.1, label: "1 · DOOR", detail: "Close it fully and give it a firm pull to check." },
    {
      at: 0.19,
      label: "2 · SEAT",
      detail: "Height, distance, backrest, head restraint — in that order.",
    },
    {
      at: 0.34,
      label: "3 · STEERING",
      detail: "Height and reach set — slight bend in the elbows.",
    },
    { at: 0.44, label: "4 · SEATBELT", detail: "On, not twisted, chest and hips." },
    {
      at: 0.55,
      label: "5 · MIRRORS",
      detail: "Interior first, then door mirrors — half road, half sky, 10% car.",
    },
    { at: 0.68, label: "Quick check", detail: "Answer to continue and see the correct technique." },
    { at: 0.8, label: "Summary", detail: "D · S · S · S · M — every time, in that order." },
    { at: 0.92, label: "Safe position. Safe journey.", detail: "You're ready to drive." },
  ],
  questions: [
    {
      at: 0.72,
      prompt: "Why should your eyes be in the middle of the windscreen?",
      options: [
        {
          label: "To look taller in the driver's seat",
          explain: "No — your seat height is about visibility and reach, not appearance.",
        },
        {
          label: "For the best view of the road ahead",
          correct: true,
          explain:
            "Correct. Eyes in the middle of the windscreen give you the widest, most balanced view of the road so you spot hazards early.",
        },
        {
          label: "So you can reach the steering wheel",
          explain:
            "No — reach is set separately with the seat distance and steering column adjustments.",
        },
      ],
    },
  ],
  render: Render,
};
