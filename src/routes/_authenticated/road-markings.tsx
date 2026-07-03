import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { roadMarkings, markingGroups } from "@/data/roadMarkings";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";

export const Route = createFileRoute("/_authenticated/road-markings")({
  head: () => ({
    meta: [
      { title: "Road markings — GSM Learner Portal" },
      { name: "description", content: "Every UK road marking explained — centre lines, hazard lines, double whites, zig-zags, yellow lines and red routes." },
    ],
  }),
  component: RoadMarkingsPage,
});

function RoadMarkingsPage() {
  return (
    <PortalShell eyebrow="Highway Code" title="Road markings">
      <p className="max-w-2xl text-muted-foreground">
        Painted markings carry the same authority as signs. Get every one of these on sight — they are worth easy marks on theory and confidence on your practical.
      </p>

      <OfflineDownloadButton
        className="mt-6"
        sectionKey="road-markings"
        label="road markings guide"
        urls={["/road-markings"]}
      />

      <LaneLegend />

      <DualCarriagewayJoin />

      <div className="mt-10 space-y-14">
        {markingGroups.map((group) => {
          const items = roadMarkings.filter((m) => m.group === group.slug);
          return (
            <section key={group.slug}>
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-2xl leading-tight sm:text-3xl">{group.title}</h2>
                <span className="text-sm text-muted-foreground">{items.length}</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{group.blurb}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((m) => {
                  const Visual = m.Visual;
                  return (
                    <article key={m.id} className="border border-border bg-card p-4">
                      <div className="mx-auto w-40 max-w-full">
                        <div className="aspect-square overflow-hidden border border-border">
                          <Visual />
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-lg leading-tight">{m.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{m.meaning}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PortalShell>
  );
}

function LaneLegend() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const saved = window.localStorage.getItem("road-markings-legend-open");
    if (saved !== null) setOpen(saved === "1");
  }, []);
  useEffect(() => {
    window.localStorage.setItem("road-markings-legend-open", open ? "1" : "0");
  }, [open]);

  const items: { swatch: ReactNode; title: string; body: string }[] = [
    {
      swatch: (
        <svg viewBox="0 0 60 60" className="h-full w-full" preserveAspectRatio="xMidYMid meet" shapeRendering="geometricPrecision" aria-hidden>
          {/* Tarmac */}
          <rect width="60" height="60" fill="#2b2b2e" />
          {/* Solid outer edges */}
          <rect x="3" y="0" width="2" height="60" fill="#f8fafc" />
          <rect x="55" y="0" width="2" height="60" fill="#f8fafc" />
          {/* Long broken lane line — Diagram 1004 (4m mark : 2m gap ≈ 2:1) */}
          {[-2, 16, 34, 52].map((y) => (
            <rect key={y} x="29" y={y} width="2" height="12" fill="#f8fafc" />
          ))}
          {/* Straight-ahead arrow in LEFT lane */}
          <path d="M18 14 L13 22 L16.4 22 L16.4 48 L19.6 48 L19.6 22 L23 22 Z" fill="#f8fafc" />
        </svg>
      ),
      title: "Normal driving lane (left)",
      body: "Straight-ahead arrows in the left-hand lane. Under rule 137 you should drive in the left-hand lane on any road with more than one lane in your direction.",
    },
    {
      swatch: (
        <svg viewBox="0 0 60 60" className="h-full w-full" preserveAspectRatio="xMidYMid meet" shapeRendering="geometricPrecision" aria-hidden>
          <rect width="60" height="60" fill="#2b2b2e" />
          <rect x="3" y="0" width="2" height="60" fill="#f8fafc" />
          <rect x="55" y="0" width="2" height="60" fill="#f8fafc" />
          {/* Long broken lane line — Diagram 1004 (4:2 ratio) */}
          {[-2, 16, 34, 52].map((y) => (
            <rect key={y} x="29" y={y} width="2" height="12" fill="#f8fafc" />
          ))}
          {/* Straight-ahead arrow in RIGHT lane */}
          <path d="M42 14 L37 22 L40.4 22 L40.4 48 L43.6 48 L43.6 22 L47 22 Z" fill="#f8fafc" />
        </svg>
      ),
      title: "Overtaking lane (right)",
      body: "The right-hand lane is only for overtaking or turning right (rule 137). Return to the left lane as soon as you have safely passed.",
    },
    {
      swatch: (
        <svg viewBox="0 0 60 60" className="h-full w-full" preserveAspectRatio="xMidYMid meet" shapeRendering="geometricPrecision" aria-hidden>
          {/* Tarmac + grass verge to the left of the slip road */}
          <rect width="60" height="60" fill="#2b2b2e" />
          <path d="M0 0 L18 0 C 10 22 6 42 4 60 L0 60 Z" fill="#3a5a2a" opacity="0.6" />
          {/* Solid kerbside edge curving in */}
          <path
            d="M4 60 C 6 42 10 22 18 0"
            stroke="#f8fafc"
            strokeWidth="2"
            fill="none"
          />
          {/* Give-way merge line — Diagram 1010 (short 1m mark : 5m gap ≈ 1:5) */}
          <path
            d="M14 60 C 16 42 20 22 28 0"
            stroke="#f8fafc"
            strokeWidth="2"
            fill="none"
            strokeDasharray="3 15"
            strokeLinecap="butt"
          />
          {/* Straight-ahead arrow in the through lane */}
          <path d="M42 14 L37 22 L40.4 22 L40.4 48 L43.6 48 L43.6 22 L47 22 Z" fill="#f8fafc" />
        </svg>
      ),
      title: "Joining / merging",
      body: "Short broken white line where a slip road joins the main carriageway. Give priority to traffic already on the road (rule 259) and adjust speed to fit into a gap.",
    },
    {
      swatch: (
        <svg viewBox="0 0 60 60" className="h-full w-full" preserveAspectRatio="xMidYMid meet" shapeRendering="geometricPrecision" aria-hidden>
          <rect width="60" height="60" fill="#2b2b2e" />
          {/* Solid outer edges */}
          <rect x="3" y="0" width="2" height="60" fill="#f8fafc" />
          <rect x="55" y="0" width="2" height="60" fill="#f8fafc" />
          {/* Solid-bordered lozenge island */}
          <path
            d="M30 6 L44 20 L44 40 L30 54 L16 40 L16 20 Z"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="1.8"
          />
          {/* Diagonal chevron stripes — Diagram 1041, 45° across the island */}
          <g clipPath="url(#legend-hatch)">
            {[-36, -30, -24, -18, -12, -6, 0, 6, 12, 18, 24, 30, 36, 42, 48, 54].map((v) => (
              <line
                key={v}
                x1={v}
                y1={0}
                x2={v + 60}
                y2={60}
                stroke="#f8fafc"
                strokeWidth="1.4"
              />
            ))}
          </g>
          <defs>
            <clipPath id="legend-hatch">
              <path d="M30 6 L44 20 L44 40 L30 54 L16 40 L16 20 Z" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Hatched area",
      body: "Diagonal chevrons bordered by a solid white line — rule 130: you MUST NOT enter it except in an emergency. If the border is broken, don't enter unless it is necessary and safe.",
    },
  ];

  return (
    <section
      aria-label="Road-marking legend"
      className="mt-8 border border-border bg-card p-5"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="road-markings-legend-body"
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <h2 className="font-display text-lg leading-tight">On-screen legend</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {open ? "What each painted lane and area means at a glance." : "Tap to show the legend."}
          </p>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="sr-only">{open ? "Hide legend" : "Show legend"}</span>
        </span>
      </button>
      {open && (
        <ul id="road-markings-legend-body" className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <li key={it.title} className="flex gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-border bg-neutral-900">
                {it.swatch}
              </div>
              <div>
                <p className="font-display text-sm leading-tight">{it.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{it.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DualCarriagewayJoin() {
  return (
    <section className="mt-8 border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg leading-tight text-primary">
          Joining a dual carriageway — the join-in lane and hatch area
        </h2>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            When joining a dual carriageway, use the <span className="font-medium text-foreground">join-in lane</span> to build up your speed and match the speed of the traffic already using the road.
          </p>
          <p>
            Look for a safe gap in the traffic, move into the running lane and continue without slowing down.
          </p>
          <p>
            The <span className="font-medium text-foreground">hatched area</span> is there to keep traffic apart. You <span className="font-semibold text-foreground">must not</span> drive or stop on the hatch.
          </p>
        </div>

        <div className="overflow-hidden rounded-sm border border-border bg-neutral-900">
          <svg
            viewBox="0 0 600 340"
            className="h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            aria-label="Diagram of a slip road joining a dual carriageway with a triangular hatched island"
          >
            {/* Grass verges */}
            <rect width="600" height="340" fill="#3a5a2a" />
            {/* Main carriageway tarmac */}
            <path d="M0 90 L600 60 L600 250 L0 260 Z" fill="#2b2b2e" />
            {/* Slip road tarmac curving in from bottom-left */}
            <path d="M0 340 L0 260 C 120 250 220 240 300 210 L360 190 L360 250 L120 340 Z" fill="#2b2b2e" />

            {/* Solid outer edges */}
            <path d="M0 90 L600 60" stroke="#f8fafc" strokeWidth="2" fill="none" />
            <path d="M0 260 L600 250" stroke="#f8fafc" strokeWidth="2" fill="none" opacity="0" />
            <path d="M0 260 C 120 250 220 240 300 210" stroke="#f8fafc" strokeWidth="2" fill="none" />
            <path d="M360 250 L600 250" stroke="#f8fafc" strokeWidth="2" fill="none" />

            {/* Long broken lane divider on the main carriageway (between 2 running lanes) */}
            {[40, 130, 220, 310, 400, 490].map((x) => (
              <rect key={x} x={x} y={143 - (x * 0.05)} width="34" height="3" fill="#f8fafc" transform={`rotate(${-2.8} ${x + 17} ${145})`} />
            ))}

            {/* Short broken merge line separating join-in lane from running lane */}
            <path
              d="M300 210 L360 190"
              stroke="#f8fafc"
              strokeWidth="3"
              fill="none"
              strokeDasharray="6 14"
            />

            {/* Triangular hatched island */}
            <g>
              <path
                d="M360 190 L470 175 L470 235 Z"
                fill="none"
                stroke="#f8fafc"
                strokeWidth="2.5"
              />
              <defs>
                <clipPath id="dc-hatch">
                  <path d="M360 190 L470 175 L470 235 Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#dc-hatch)">
                {Array.from({ length: 14 }).map((_, i) => {
                  const off = 340 + i * 14;
                  return (
                    <line
                      key={i}
                      x1={off}
                      y1={140}
                      x2={off - 90}
                      y2={260}
                      stroke="#f8fafc"
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            </g>

            {/* Green direction arrows on join-in lane */}
            {[
              { x: 90, y: 305, r: -8 },
              { x: 180, y: 285, r: -12 },
              { x: 260, y: 250, r: -20 },
              { x: 320, y: 215, r: -25 },
            ].map((a, i) => (
              <g key={i} transform={`translate(${a.x} ${a.y}) rotate(${a.r})`}>
                <path d="M0 0 L-6 10 L-2 10 L-2 22 L2 22 L2 10 L6 10 Z" fill="#22c55e" transform="scale(1.4) rotate(180)" />
              </g>
            ))}
            {/* Green arrows in running lane going straight */}
            {[400, 480, 550].map((x) => (
              <g key={x} transform={`translate(${x} 145) rotate(-3)`}>
                <path d="M0 -14 L-6 -4 L-2 -4 L-2 10 L2 10 L2 -4 L6 -4 Z" fill="#22c55e" transform="scale(1.4)" />
              </g>
            ))}

            {/* Labels */}
            <g fontFamily="Arial, sans-serif" fill="#f8fafc">
              <text x="150" y="240" fontSize="13" fontWeight="700">Join-in lane</text>
              <text x="150" y="256" fontSize="10" opacity="0.85">Build up speed to match the</text>
              <text x="150" y="268" fontSize="10" opacity="0.85">traffic on the dual carriageway.</text>

              <text x="380" y="270" fontSize="13" fontWeight="700">Hatched area</text>
              <text x="380" y="286" fontSize="10" opacity="0.85">Do not drive or stop on</text>
              <text x="380" y="298" fontSize="10" opacity="0.85">the hatch marked area.</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="mt-5 rounded-sm border border-primary/40 bg-primary/5 p-4">
        <p className="font-display text-sm text-primary">Key points</p>
        <ul className="mt-2 grid gap-1 text-sm text-foreground sm:grid-cols-2">
          <li>• Use the join-in lane to build up your speed.</li>
          <li>• Move into the running lane and continue without slowing.</li>
          <li>• Look for a safe gap in the traffic.</li>
          <li>• Do not drive or stop on the hatched area.</li>
        </ul>
      </div>
    </section>
  );
}