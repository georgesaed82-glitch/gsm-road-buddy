import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import {
  ArrowUp,
  Eye,
  ArrowDown,
  Compass,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/gsm-method")({
  head: () => ({
    meta: [
      { title: "The GSM Driving Method · GSM" },
      {
        name: "description",
        content:
          "George's driving principles, the 15–70–15 Vision Formula, funnel vision and the golden rules that keep GSM learners safe for life.",
      },
    ],
  }),
  component: GSMMethodPage,
});

const principles = [
  {
    title: "Stretch your vision",
    body: "Always look as far ahead as possible. The earlier you see a hazard, the more time you have to make a safe decision.",
  },
  {
    title: "Plan to stop, look to go",
    body: "Always prepare to stop, but constantly look for a safe opportunity to keep the traffic flowing safely.",
  },
  {
    title: "Keep traffic moving safely",
    body: "The purpose of driving is to keep traffic moving safely and smoothly — not to rush and not to hesitate unnecessarily.",
  },
  {
    title: "Stay in your lane",
    body: "Use the correct lane, avoid straddling lanes and position your vehicle clearly.",
  },
  {
    title: "Drive defensively",
    body: "Never assume another road user will do the right thing. Expect mistakes and always have a backup plan.",
  },
  {
    title: "Look for other people's mistakes",
    body: "Good drivers don't just watch what people are doing — they predict what they might do next.",
  },
];

const vision = [
  {
    pct: "15%",
    label: "UP",
    icon: ArrowUp,
    look: [
      "Road signs",
      "Traffic lights",
      "Speed limits",
      "Junctions",
      "Roundabouts",
      "Pedestrian crossings",
      "Developing hazards",
    ],
    ask: ["What information is coming next?"],
  },
  {
    pct: "70%",
    label: "AHEAD",
    icon: Eye,
    look: [
      "Stretch your vision as far as possible.",
      "Read the traffic flow.",
      "Plan your next move.",
    ],
    ask: [
      "Can I keep moving?",
      "Do I need to slow down?",
      "What could happen next?",
    ],
  },
  {
    pct: "15%",
    label: "DOWN",
    icon: ArrowDown,
    look: [
      "Lane arrows",
      "STOP lines",
      "Give Way markings",
      "Yellow box junctions",
      "Cycle lanes",
      "Bus lanes",
      "Road studs",
      "Road surface",
    ],
    ask: ["The road often tells you what to do before the signs do."],
  },
];

const developingHazards = [
  "Ball in the road",
  "Children near a school",
  "Cyclist looking over their shoulder",
  "Pedestrian turning towards the road",
  "Vehicle about to pull away",
];

const goldenRules = [
  "Stretch your vision.",
  "Plan to stop, look to go.",
  "Use the 15–70–15 Vision Formula.",
  "Use funnel vision, never tunnel vision.",
  "Watch shoulders, not feet.",
  "Read the road before the signs.",
  "Keep traffic moving safely.",
  "Stay in your lane.",
  "Drive defensively.",
  "Expect other people to make mistakes.",
  "Look early.",
  "Think early.",
  "Act smoothly.",
];

function GSMMethodPage() {
  return (
    <PortalShell eyebrow="How George teaches" title="The GSM Driving Method">
      <p className="max-w-2xl text-sm text-muted-foreground">
        The principles, vision system and golden rules George teaches on every
        lesson. Learn them, live them — they pass the test and outlast it.
      </p>

      {/* Principles */}
      <section id="principles" className="mt-10 scroll-mt-24">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
          <Compass className="h-4 w-4" />
          George's Driving Principles
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">
          Six rules that shape every decision
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {principles.map((p, i) => (
            <li
              key={p.title}
              className="border border-border bg-card p-4"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xs font-semibold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base leading-tight">
                  {p.title}
                </h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vision Formula */}
      <section id="vision-formula" className="mt-12 scroll-mt-24">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent">
          GSM Vision Formula
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">
          The 15–70–15 scanning method
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Not an exact scientific percentage — a simple observation system to
          train your eyes.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {vision.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.label} className="border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-border bg-secondary text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-2xl leading-none">
                      {v.pct}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {v.label}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Look for
                </div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {v.look.map((l) => (
                    <li key={l} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-border pt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Ask yourself
                </div>
                <ul className="mt-2 space-y-1.5 text-sm italic text-foreground">
                  {v.ask.map((a) => (
                    <li key={a}>“{a}”</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Funnel + shoulders */}
      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div
          id="funnel-vision"
          className="scroll-mt-24 border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
            <Eye className="h-4 w-4" /> Funnel vision
          </div>
          <h3 className="mt-1 font-display text-xl leading-tight">
            Never get tunnel vision
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Use funnel vision by scanning constantly:
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {[
              "The road ahead",
              "Both pavements",
              "Mirrors",
              "Junctions",
              "Road markings",
              "Signs",
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          id="watch-shoulders"
          className="scroll-mt-24 border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
            <Users className="h-4 w-4" /> Watch shoulders, not feet
          </div>
          <h3 className="mt-1 font-display text-xl leading-tight">
            Read the person, not the step
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't wait for pedestrians' feet to move.{" "}
            <span className="text-foreground font-medium">
              Watch their shoulders.
            </span>{" "}
            Shoulders usually turn before a person steps into the road — giving
            you more time to react.
          </p>
        </div>
      </section>

      {/* Developing hazards */}
      <section
        id="developing-hazards"
        className="mt-12 scroll-mt-24 border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
          <AlertTriangle className="h-4 w-4" /> Developing hazards
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">
          Keep asking: “What could happen next?”
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {developingHazards.map((h) => (
            <li
              key={h}
              className="flex items-start gap-2 border border-border bg-background p-3 text-sm"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Golden rules */}
      <section
        id="golden-rules"
        className="mt-12 scroll-mt-24 border border-accent/40 bg-accent/5 p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          <CheckCircle2 className="h-4 w-4" /> George's Golden Rules
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">
          Live by these, drive by these
        </h2>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {goldenRules.map((r, i) => (
            <li
              key={r}
              className="flex items-start gap-3 border border-border bg-background p-3 text-sm"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-accent/50 bg-accent/10 font-display text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ol>
      </section>
    </PortalShell>
  );
}