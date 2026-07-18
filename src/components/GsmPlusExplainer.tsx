import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
  Route as RouteIcon,
  Trophy,
  Eye,
  Signpost,
  Scroll,
  History,
  Compass,
  MessageSquareText,
  CalendarClock,
  Wand2,
  Check,
  Lock,
  ArrowRight,
} from "lucide-react";
import { GsmPlus } from "@/components/GsmPlus";

type Feature = {
  icon: typeof BookOpen;
  title: string;
  body: string;
  tier: "free" | "premium" | "soon";
};

const FEATURES: Feature[] = [
  { icon: BookOpen, title: "Interactive Driving Lessons", body: "Animated walk-throughs of every manoeuvre and situation.", tier: "free" },
  { icon: Eye, title: "Hazard Perception", body: "Practice clips with instant feedback.", tier: "free" },
  { icon: Signpost, title: "Road Signs & Markings", body: "Every UK sign, searchable and grouped.", tier: "free" },
  { icon: Scroll, title: "Highway Code", body: "Study-friendly summaries with mini-quizzes.", tier: "free" },
  { icon: Trophy, title: "Mock Tests", body: "DVSA-style tests with detailed review.", tier: "free" },
  { icon: RouteIcon, title: "Progress Tracking", body: "See exactly where you're strong and what to revisit.", tier: "premium" },
  { icon: Compass, title: "Vehicle Reference Points", body: "The GSM way: manoeuvres by reference, not guesswork.", tier: "premium" },
  { icon: History, title: "Lesson History", body: "Every lesson, notes and homework in one place.", tier: "premium" },
  { icon: MessageSquareText, title: "Instructor Feedback", body: "Personalised notes after each lesson.", tier: "premium" },
  { icon: Wand2, title: "AI Lesson Notes", body: "Voice-to-report summaries from your instructor.", tier: "soon" },
  { icon: CalendarClock, title: "Future Lesson Planner", body: "Book, reschedule and add lessons to your calendar.", tier: "soon" },
];

export function GsmPlusExplainer() {
  return (
    <section id="gsm-plus" className="bg-gradient-to-b from-background to-secondary/30 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-6xl lg:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-accent" />
          Included with every GSM student
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl lg:text-4xl">
            What is <GsmPlus className="text-4xl sm:text-5xl lg:text-4xl" gsmClassName="text-primary" plusClassName="text-accent" />?
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            GSM Plus is our online learner portal. Every practical student gets free access — theory
            training, hazard perception, mock tests and interactive lessons — with premium tools
            unlocked when you book lessons with us.
          </p>
        </div>

        {/* Who it's for */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { title: "Absolute beginners", body: "Everything you need to pass theory and start driving with confidence." },
            { title: "Current GSM students", body: "Lesson history, instructor feedback and reference points tailored to your journey." },
            { title: "Refresher learners", body: "Fast-track revision on the topics you're rusty on — no wasted time." },
          ].map((w) => (
            <div key={w.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Who it&apos;s for</div>
              <div className="mt-2 font-display text-lg font-semibold text-primary">{w.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const tierLabel =
              f.tier === "free" ? "Free" : f.tier === "premium" ? "Premium" : "Coming soon";
            const tierClass =
              f.tier === "free"
                ? "bg-success/15 text-success"
                : f.tier === "premium"
                  ? "bg-accent/15 text-accent"
                  : "bg-muted text-muted-foreground";
            return (
              <div
                key={f.title}
                className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-display text-sm font-semibold text-primary">{f.title}</div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tierClass}`}>
                      {f.tier === "soon" ? <Lock className="mr-1 inline h-3 w-3" /> : null}
                      {tierLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {f.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits + CTA */}
        <div className="mt-10 grid gap-6 rounded-3xl border border-border/60 bg-card p-6 shadow-lg sm:p-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Why students upgrade
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold text-primary sm:text-3xl">
              Learn faster. Pass with confidence.
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground sm:text-base">
              {[
                "One place for lessons, theory and hazard practice",
                "Personalised progress from your GSM instructor",
                "Reference points that turn every manoeuvre into a system",
                "Free lifetime access to core theory training",
                "Premium unlocks the moment you book your first lesson",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Open GSM Plus
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent bg-accent/10 px-6 py-4 font-semibold text-accent transition-all hover:-translate-y-0.5 hover:bg-accent/20"
            >
              Book lessons to unlock Premium
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              Free access is included for every practical student.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}