import { Compass } from "lucide-react";

const principles = [
  "Stretch your vision.",
  "Plan to stop, look to go.",
  "Use the 15–70–15 scanning method.",
  "Keep traffic moving safely.",
  "Stay in your lane.",
  "Drive defensively.",
  "Look for other people's mistakes.",
  "Read the road early, not late.",
  "Good observation gives you more time to make better decisions.",
];

export function GeorgesPrinciples() {
  return (
    <section
      id="georges-principles"
      className="scroll-mt-24 border border-accent/40 bg-accent/5 p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
        <Compass className="h-4 w-4" />
        George's Driving Principles
      </div>
      <h3 className="mt-1 font-display text-2xl leading-tight">
        Nine rules that keep you safe for life
      </h3>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        The same principles George teaches on every lesson. Learn them, live
        them — they pass the test and outlast it.
      </p>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2">
        {principles.map((p, i) => (
          <li
            key={p}
            className="flex items-start gap-3 border border-border bg-background p-3 text-sm"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-accent/50 bg-accent/10 font-display text-xs font-semibold text-accent">
              {i + 1}
            </span>
            <span className="leading-relaxed">{p}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}