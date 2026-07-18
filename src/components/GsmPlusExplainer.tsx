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
  ArrowRight,
  ClipboardList,
  PlaySquare,
  Target,
  Gauge,
  Award as AwardIcon,
  Rocket,
} from "lucide-react";
import { GsmPlus } from "@/components/GsmPlus";

type Feature = { icon: typeof BookOpen; title: string; body: string };

const FREE_FEATURES: Feature[] = [
  { icon: Scroll, title: "Highway Code", body: "Study-friendly summaries with mini-quizzes." },
  { icon: Signpost, title: "Road Signs & Markings", body: "Every UK sign, searchable and grouped." },
  { icon: BookOpen, title: "Theory Learning", body: "DVSA-style theory practice, question by question." },
  { icon: RouteIcon, title: "Basic Progress Tracking", body: "See topics covered and where to revisit." },
  { icon: History, title: "Basic Lesson History", body: "A record of your recent lessons in one place." },
  { icon: Trophy, title: "Free Learning Resources", body: "Guides, tips and quick refreshers — no signup fee." },
];

const PREMIUM_FEATURES: Feature[] = [
  { icon: Sparkles, title: "Complete GSM Training System", body: "The full GSM method: BGO, MSPSL, POM, reference points." },
  { icon: Wand2, title: "AI Lesson Summaries", body: "After every lesson: strengths, focus areas, next steps." },
  { icon: Gauge, title: "Personalised Progress Tracking", body: "7-stage skill tracking across every driving topic." },
  { icon: PlaySquare, title: "Interactive Training Modules", body: "Animated walk-throughs of every manoeuvre and situation." },
  { icon: Eye, title: "Hazard Perception Library", body: "Realistic UK clips with instant developing-hazard feedback." },
  { icon: PlaySquare, title: "AI Video Library", body: "Structured video lessons organised by module and topic." },
  { icon: Compass, title: "Vehicle Reference Points", body: "Manoeuvres by reference, not guesswork." },
  { icon: Trophy, title: "Mock Tests", body: "DVSA-style mock tests with pass probability and review." },
  { icon: ClipboardList, title: "Homework Tracking", body: "Weekly targets set by your instructor, tracked for you." },
  { icon: MessageSquareText, title: "Instructor Feedback", body: "Personalised notes and next objectives after every lesson." },
  { icon: CalendarClock, title: "Lesson Planner & Calendar", body: "Book, reschedule and sync lessons to your calendar." },
  { icon: Rocket, title: "Priority Updates", body: "Early access to new modules and premium content." },
];

const BENEFITS = [
  { icon: Target, title: "Learn the GSM way", body: "One structured method taught the same way in every lesson." },
  { icon: Gauge, title: "Track real progress", body: "See exactly what to work on before your next lesson." },
  { icon: AwardIcon, title: "Pass with confidence", body: "Test readiness score built from mocks, hazards and skills." },
];

export function GsmPlusExplainer() {
  return (
    <section id="gsm-plus" className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-secondary/40 py-16 sm:py-24">
      {/* Decorative glow */}
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-6xl lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            The GSM Learning Platform
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl">
            Meet{" "}
            <GsmPlus
              className="text-4xl sm:text-5xl"
              gsmClassName="text-primary"
              plusClassName="text-accent"
            />
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            GSM Plus is a complete online learning platform built around the GSM Teaching Method —
            from your very first lesson to the day you pass your driving test. Study theory, master
            every manoeuvre, review AI-powered lesson summaries and track real progress, all in one
            place.
          </p>

          {/* Who it's for */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            {["Absolute beginners", "Current GSM students", "Refresher & pass-plus learners", "Theory-only learners"].map((w) => (
              <span
                key={w}
                className="rounded-full border border-border/60 bg-card px-3 py-1 font-medium text-muted-foreground shadow-sm"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits strip */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="mt-4 font-display text-lg font-semibold text-primary">{b.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            );
          })}
        </div>

        {/* Free vs Premium */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Free tier */}
          <div className="relative flex flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-success">
                  Free — forever
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
                  GSM Plus Free
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Everything you need to start studying — no signup fee, no card required.
                </p>
              </div>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                £0
              </span>
            </div>

            <ul className="mt-6 grid flex-1 gap-3 sm:grid-cols-2">
              {FREE_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.title} className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/60 p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-primary">{f.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              to="/auth"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-6 py-3 font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              Start learning for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Premium tier */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-accent/60 bg-gradient-to-br from-primary to-primary/90 p-6 text-primary-foreground shadow-xl sm:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl" aria-hidden />
            <div className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground shadow">
              Recommended
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Premium
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                GSM Plus Premium
              </h3>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Unlocked automatically when you book practical lessons with GSM. The complete
                platform, AI-powered, personalised to you.
              </p>
            </div>

            <ul className="relative mt-6 grid flex-1 gap-2 sm:grid-cols-2">
              {PREMIUM_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.title} className="flex items-start gap-3 rounded-xl bg-primary-foreground/10 p-3 backdrop-blur-sm">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground shadow">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{f.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/75">{f.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Book lessons to unlock Premium
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-foreground/30 bg-primary-foreground/5 px-6 py-3 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/15"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-success" /> Free tier — no card required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-success" /> Premium included with GSM lessons
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-success" /> Learn anywhere — mobile & desktop
          </span>
        </div>
      </div>
    </section>
  );
}