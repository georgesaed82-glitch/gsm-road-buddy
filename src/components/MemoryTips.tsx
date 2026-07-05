import { Lightbulb } from "lucide-react";
import { useContentOverrides } from "@/hooks/useContentOverrides";

const defaultTips = [
  { title: "Road studs — which colour, where?", aid: "Red = Left · Amber = Right · White = Middle · Green = sliP road", body: "Red on the left edge, Amber next to the central reservation on the right, White between lanes, Green where a slip road meets the main carriageway. Green + yellow = temporary works." },
  { title: "Sign shapes — what they do", aid: "Circles Order · Triangles Warn · Rectangles Inform · Octagon = STOP · ▽ = GIVE WAY", body: "Blue circle = must do. Red-ringed circle = must not. Red triangle (point up) = warning. Downward triangle = give way. Octagon is only ever STOP." },
  { title: "Sign background colours", aid: "Blue Motorway · Green Primary (A-road) · White Local · Brown Tourist · Yellow Diversion", body: "You can tell the type of road from the sign colour before you can read a single word on it." },
  { title: "Before every manoeuvre — MSM / MSPSL", aid: "Mirror · Signal · Manoeuvre — for junctions add Position · Speed · Look", body: "MSM for a routine change of lane or speed. MSPSL when approaching a junction, roundabout or hazard." },
  { title: "Stopping distances (dry road)", aid: "Double the mph, take away 20 (from 40mph up) — gives you feet", body: "30 mph ≈ 75ft, 40 = 120, 50 = 175, 60 = 240, 70 = 315. Wet: double it. Ice: up to ten times." },
  { title: "Following distance", aid: "'Only a fool breaks the two-second rule' — 4s wet, 10s ice", body: "Pick a fixed point ahead; when the car in front passes it, you should be able to say the whole sentence before you reach it." },
  { title: "Daily check before driving", aid: "POWDERY — Petrol · Oil · Water · Damage · Electrics · Rubber · Yourself", body: "A 30-second walk-round covers the legal MUSTs (tyres, lights) and the common breakdown causes." },
  { title: "First aid at a scene", aid: "DR ABC — Danger · Response · Airway · Breathing · Circulation", body: "Check for danger first (traffic, fire). Only then approach and follow ABC." },
];

export function MemoryTips() {
  const { getBlocks } = useContentOverrides();
  const override = getBlocks("memory-tip", "default");
  const tips = override
    ? override.map((b) => ({ title: b.title ?? "", aid: b.aid ?? "", body: b.body ?? "" }))
    : defaultTips;
  return (
    <section id="memory-tips" className="scroll-mt-24 border border-border bg-card p-5 sm:p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Memory aids</div>
      <h3 className="mt-1 font-display text-2xl leading-tight">Quick memory tips</h3>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Little mnemonics that stick. Once you've learned these, half the theory test looks after itself.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {tips.map((t) => (
          <div key={t.title} className="flex gap-3 border border-border bg-background p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-secondary text-accent">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-base leading-tight">{t.title}</div>
              <div className="mt-1 text-sm font-semibold text-accent">{t.aid}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}