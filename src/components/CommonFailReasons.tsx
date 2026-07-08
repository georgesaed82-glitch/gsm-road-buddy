import { AlertTriangle, Eye, Route, Timer, Gauge, Compass } from "lucide-react";
import { useContentOverrides } from "@/hooks/useContentOverrides";

const defaultReasons = [
  {
    icon: Eye,
    title: "Not checking mirrors properly",
    body: "Especially before signalling, changing lane, or slowing down. Examiners want to see MSM every single time — mirrors first, then signal, then manoeuvre.",
    rule: "Rules 159, 161",
  },
  {
    icon: AlertTriangle,
    title: "Missing blind spots",
    body: "Before moving off, changing lane, or leaving a parked position, turn your head — the mirrors alone will not cover the blind spot over your shoulder.",
    rule: "Rules 159, 161, 267",
  },
  {
    icon: Route,
    title: "Incorrect positioning",
    body: "Drifting into another lane on roundabouts, cutting corners on right turns, or sitting too close to the kerb / centre line. Hold a clear, deliberate lane position.",
    rule: "Rules 160, 179, 186",
  },
  {
    icon: Timer,
    title: "Hesitation",
    body: "Waiting when the road is clearly clear (roundabouts, T-junctions, traffic lights turning green) is marked the same as failing to give way. If it's safe, go.",
    rule: "Rules 170–172, 185",
  },
  {
    icon: Gauge,
    title: "Speed — too fast or too slow",
    body: "Going 15mph in a 30 for no reason is as much a fault as speeding. Drive at a speed that suits the road, weather, traffic and the limit.",
    rule: "Rules 124–125",
  },
  {
    icon: Compass,
    title: "Poor observation at junctions",
    body: "Look right, left, right again — and again if the view is restricted. Emerging without a full, effective look is one of the single biggest fail reasons every year.",
    rule: "Rules 170–172, 211",
  },
];

export function CommonFailReasons() {
  const { getBlocks } = useContentOverrides();
  const override = getBlocks("common-fail", "default");
  const reasons = override
    ? override.map((b, i) => ({
        icon: defaultReasons[i % defaultReasons.length].icon,
        title: b.title ?? "",
        body: b.body ?? "",
        rule: b.rule ?? "",
      }))
    : defaultReasons;
  return (
    <section
      id="common-fail-reasons"
      className="scroll-mt-24 border border-border bg-card p-5 sm:p-6"
    >
      <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Practical test</div>
      <h3 className="mt-1 font-display text-2xl leading-tight">Common reasons people fail</h3>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Six skills that appear again and again on DVSA's fault sheets. Fix these and you fix most of
        what stops learners passing.
      </p>
      <ol className="mt-5 grid gap-3 md:grid-cols-2">
        {reasons.map((r, i) => {
          const Icon = r.icon;
          return (
            <li key={r.title} className="flex gap-3 border border-border bg-background p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-secondary text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="font-display text-base leading-tight">{r.title}</div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                <div className="mt-2 text-[10px] uppercase tracking-wider text-accent">
                  {r.rule}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
