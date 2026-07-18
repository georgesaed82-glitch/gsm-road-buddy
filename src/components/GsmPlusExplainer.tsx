import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
  Trophy,
  Eye,
  Signpost,
  Scroll,
  History,
  MessageSquareText,
  CalendarClock,
  Wand2,
  Check,
  ArrowRight,
  PlaySquare,
  Target,
  Gauge,
  Award as AwardIcon,
  Rocket,
  Bot,
  Languages,
  BarChart3,
  ShieldCheck,
  CalendarCheck,
  UserPlus,
  GraduationCap,
  MonitorPlay,
  Lock,
  Star,
} from "lucide-react";
import { GsmPlus } from "@/components/GsmPlus";

type Feature = { icon: typeof BookOpen; title: string; body: string };

const FREE_FEATURES: Feature[] = [
  { icon: Gauge, title: "Lesson progress tracker", body: "See every topic covered and what's next — free forever." },
  { icon: MonitorPlay, title: "Student dashboard", body: "One clean home for your lessons, notes and progress." },
  { icon: Scroll, title: "Lesson notes", body: "Short recap of every lesson so nothing is forgotten." },
  { icon: BookOpen, title: "Basic learning resources", body: "Highway Code, road signs and starter theory practice." },
  { icon: Signpost, title: "Road signs library", body: "Every UK sign, grouped and searchable." },
  { icon: History, title: "Lesson history", body: "A simple record of your recent lessons in one place." },
];

const PREMIUM_FEATURES: Feature[] = [
  { icon: Bot, title: "AI Driving Coach", body: "Ask anything, any time — instant answers in your language." },
  { icon: PlaySquare, title: "Animated tutorials", body: "Every manoeuvre and junction, animated step-by-step." },
  { icon: Sparkles, title: "Complete GSM system", body: "BGO, MSPSL, POM, reference points — the full method." },
  { icon: Eye, title: "Hazard Perception", body: "Realistic UK clips with live developing-hazard feedback." },
  { icon: BookOpen, title: "DVSA theory practice", body: "The full theory bank, categorised and quizzed properly." },
  { icon: Trophy, title: "Mock tests", body: "Full DVSA-style mocks with pass probability and review." },
  { icon: Wand2, title: "Personalised revision", body: "AI targets your weakest topics — no wasted time." },
  { icon: Target, title: "Driving test prep", body: "Show-me / tell-me, test routes and day-of playbook." },
  { icon: BarChart3, title: "Progress analytics", body: "7-stage skill tracking across every driving topic." },
  { icon: MessageSquareText, title: "Instructor feedback", body: "Personal notes and next objectives after every lesson." },
  { icon: Languages, title: "Multi-language support", body: "Learn in 30+ languages — read, listen, translate." },
  { icon: CalendarClock, title: "Lesson planner", body: "Book, reschedule and sync lessons to your calendar." },
];

const BENEFITS = [
  { icon: Rocket, title: "Pass faster", body: "Prepared before you arrive, revised after you leave — fewer wasted lessons." },
  { icon: ShieldCheck, title: "Drive safer", body: "The GSM method builds real hazard awareness, not just test tricks." },
  { icon: AwardIcon, title: "Pass with confidence", body: "Test readiness score built from mocks, hazards and skill data." },
];

const HOW_IT_WORKS = [
  { icon: CalendarCheck, title: "Book your lessons", body: "Reserve your first driving lesson with a GSM instructor." },
  { icon: UserPlus, title: "Get your GSM Plus account", body: "Personal login — free forever, Premium the moment you book." },
  { icon: BookOpen, title: "Learn before every lesson", body: "Watch the animation, read the notes, arrive prepared." },
  { icon: GraduationCap, title: "Practise on the road", body: "Your instructor teaches the exact topic you studied." },
  { icon: BarChart3, title: "Track your progress", body: "See every skill move through the 7 stages to test standard." },
  { icon: Trophy, title: "Pass theory + practical", body: "Mocks, hazard clips and test-day prep until you're ready." },
];

const DIFFERENTIATORS = [
  { icon: Sparkles, title: "Built around one method", body: "Every lesson, animation and quiz teaches the same GSM system — no contradictions." },
  { icon: Bot, title: "Your own AI coach", body: "Ask a driving question at 11pm and get a real answer — in plain English or your own language." },
  { icon: MonitorPlay, title: "Learn between lessons", body: "Most schools stop teaching when the car stops. GSM Plus keeps going, every day." },
  { icon: BarChart3, title: "Real progress data", body: "Not vibes — a live map of what you've mastered and what still needs work." },
];

export function GsmPlusExplainer() {
  return (
    <section
      id="gsm-plus"
      className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-secondary/40 py-16 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-6xl lg:px-8">
        {/* ============ HERO ============ */}
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              The GSM Learning Platform
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Meet{" "}
              <GsmPlus
                className="text-4xl sm:text-5xl lg:text-6xl"
                gsmClassName="text-primary"
                plusClassName="text-accent"
              />
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              GSM Plus is our complete digital learning platform — professional driving lessons
              combined with structured online learning, an AI driving coach, animated tutorials,
              hazard perception, DVSA-style theory, mock tests, lesson notes and real progress
              tracking. Everything you need to pass faster and drive safer, in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent bg-accent/10 px-6 py-3 font-semibold text-accent transition-all hover:-translate-y-0.5 hover:bg-accent/15"
              >
                Book lessons — unlock Premium
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> Free forever tier
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> No card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-accent" /> Trusted by GSM learners
              </span>
            </div>
          </div>

          {/* Platform preview card */}
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 translate-x-2 translate-y-2 rounded-3xl bg-accent/20"
              aria-hidden
            />
            <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-xl sm:p-6">
              <div className="flex items-center justify-between">
                <GsmPlus variant="pill" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your dashboard
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary to-primary/90 p-4 text-primary-foreground">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  Test readiness
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold">78%</span>
                  <span className="text-xs text-primary-foreground/70">on track for pass</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary-foreground/15">
                  <div className="h-full w-[78%] rounded-full bg-accent" />
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {[
                  { label: "Roundabouts", pct: 92, tone: "text-success" },
                  { label: "Bay parking", pct: 74, tone: "text-accent" },
                  { label: "Meeting traffic", pct: 58, tone: "text-primary" },
                ].map((s) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-muted-foreground">{s.label}</span>
                    <span className="flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${s.pct}%` }}
                      />
                    </span>
                    <span className={`w-10 text-right text-xs font-semibold ${s.tone}`}>
                      {s.pct}%
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-primary">AI Coach</div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    "How do I judge a mini roundabout?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ WHO IS IT FOR ============ */}
        <div className="mt-16 rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Who it's for
              </div>
              <h3 className="mt-1 font-display text-2xl font-semibold text-primary sm:text-3xl">
                Built for every kind of learner
              </h3>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Whether you're picking up the keys for the first time or brushing up before your test,
              GSM Plus meets you where you are.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Absolute beginners", body: "Never driven before? Start here." },
              { label: "Current GSM students", body: "Prepare and revise between lessons." },
              { label: "Theory-only learners", body: "Free DVSA-style theory practice." },
              { label: "Refresher & Pass Plus", body: "Rebuild confidence after a break." },
            ].map((w) => (
              <div
                key={w.label}
                className="rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
              >
                <div className="text-sm font-semibold text-primary">{w.label}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============ WHY DIFFERENT ============ */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Why we're different
          </div>
          <h3 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Not just another driving school
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Most schools give you an hour in a car and a wave goodbye. GSM Plus is a full learning
            platform behind every lesson.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="mt-4 font-display text-lg font-semibold text-primary">
                  {d.title}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              </div>
            );
          })}
        </div>

        {/* ============ HOW IT WORKS ============ */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            How it works
          </div>
          <h3 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Your journey to a full licence
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Six simple steps from your first booking to passing your practical test.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="absolute right-3 top-3 font-display text-4xl font-bold text-primary/10 sm:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="mt-4 font-display text-lg font-semibold text-primary">
                  {step.title}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            );
          })}
        </ol>

        {/* ============ BENEFITS ============ */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
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

        {/* ============ FREE vs PREMIUM ============ */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            What's included
          </div>
          <h3 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Free forever. Premium included with lessons.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Anyone can start learning for free. Book driving lessons with GSM and every Premium
            feature unlocks automatically — no extra fee.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
                  <li
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/60 p-3"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-primary">{f.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
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
            <div
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl"
              aria-hidden
            />
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
                  <li
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl bg-primary-foreground/10 p-3 backdrop-blur-sm"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground shadow">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{f.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/75">
                        {f.body}
                      </p>
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

        {/* ============ FINAL CTA ============ */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-br from-accent/10 via-card to-primary/5 p-6 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                <Lock className="h-3.5 w-3.5" />
                Ready when you are
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                Learn free today. Pass faster tomorrow.
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Create your free GSM Plus account in seconds. Book lessons whenever you're ready
                and Premium unlocks the same day.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Book lessons
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
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