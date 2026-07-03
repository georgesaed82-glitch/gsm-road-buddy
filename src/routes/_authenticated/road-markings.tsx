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
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <rect width="60" height="60" fill="#3f3f46" />
          <rect x="28" y="4" width="4" height="52" fill="#f8fafc" />
          <path d="M30 12 L22 22 L27 22 L27 50 L33 50 L33 22 L38 22 Z" fill="#f8fafc" />
        </svg>
      ),
      title: "Normal driving lane (left)",
      body: "Straight-ahead arrows in the left-hand lane. Under rule 137 you should drive in the left-hand lane on any road with more than one lane in your direction.",
    },
    {
      swatch: (
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <rect width="60" height="60" fill="#3f3f46" />
          {[0, 12, 24, 36, 48].map((y) => (
            <rect key={y} x="4" y={y} width="3" height="6" fill="#f8fafc" />
          ))}
          <path d="M30 12 L22 22 L27 22 L27 50 L33 50 L33 22 L38 22 Z" fill="#f8fafc" />
        </svg>
      ),
      title: "Overtaking lane (right)",
      body: "The right-hand lane is only for overtaking or turning right (rule 137). Return to the left lane as soon as you have safely passed.",
    },
    {
      swatch: (
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <rect width="60" height="60" fill="#3f3f46" />
          <g transform="rotate(-20 30 60)">
            {[6, 18, 30, 42, 54].map((y) => (
              <rect key={y} x="26" y={y} width="4" height="6" fill="#f8fafc" />
            ))}
          </g>
        </svg>
      ),
      title: "Joining / merging",
      body: "Short broken white line where a slip road joins the main carriageway. Give priority to traffic already on the road (rule 259) and adjust speed to fit into a gap.",
    },
    {
      swatch: (
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <rect width="60" height="60" fill="#3f3f46" />
          <path d="M18 8 L42 8 L46 30 L42 52 L18 52 L14 30 Z" fill="none" stroke="#f8fafc" strokeWidth="2" />
          <g clipPath="url(#legend-hatch)">
            {[-10, -2, 6, 14, 22, 30, 38, 46, 54].map((y) => (
              <line key={y} x1="10" y1={y} x2="50" y2={y + 14} stroke="#f8fafc" strokeWidth="2" />
            ))}
          </g>
          <defs>
            <clipPath id="legend-hatch">
              <path d="M18 8 L42 8 L46 30 L42 52 L18 52 L14 30 Z" />
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
              <div className="h-14 w-14 shrink-0 overflow-hidden border border-border">
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