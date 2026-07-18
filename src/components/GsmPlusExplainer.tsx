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
import { Reveal } from "@/components/Reveal";

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
      className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/15 to-secondary/30 py-20 sm:py-28 lg:py-36 scroll-smooth"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:max-w-6xl lg:px-8">
        {/* ============ HERO ============ */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              The GSM Learning Platform
            </div>
            <h2 className="mt-7 font-display text-[2.5rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Meet{" "}
              <GsmPlus
                className="text-[2.5rem] sm:text-6xl lg:text-7xl"
                gsmClassName="text-primary"
                plusClassName="text-accent"
              />
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              The complete digital learning platform behind every GSM lesson. AI coach, animated
              tutorials, hazard clips, DVSA theory, mocks and real progress tracking —{" "}
              <span className="text-foreground">all in one place.</span>
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_rgba(35,75,54,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgba(35,75,54,0.65)] sm:w-auto"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/70 bg-card/80 px-7 py-3.5 text-[15px] font-semibold text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent sm:w-auto"
              >
                Book lessons — unlock Premium
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
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
        </Reveal>

        {/* ============ HERO DASHBOARD SCREENSHOT ============ */}
        <Reveal delay={120} className="mt-14 sm:mt-20">
          <div className="relative mx-auto max-w-4xl">
            <div
              aria-hidden
              className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-b from-accent/20 via-primary/10 to-transparent blur-2xl"
            />
            <div className="rounded-[2rem] border border-border/50 bg-card/95 p-4 shadow-[0_30px_80px_-30px_rgba(29,42,34,0.35)] backdrop-blur-sm sm:p-6 lg:p-8">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 pb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 flex-1 truncate rounded-md bg-secondary/50 px-3 py-1 text-[11px] text-muted-foreground">
                  gsmdrivingschool.com / plus / dashboard
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr] sm:gap-5">
                {/* Big readiness gauge */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/85 p-6 text-primary-foreground sm:p-8">
                  <div
                    aria-hidden
                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-2xl"
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <GsmPlus variant="pill" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/70">
                        Your dashboard
                      </span>
                    </div>
                    <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                      Test readiness
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-5xl font-bold sm:text-6xl">78%</span>
                      <span className="text-sm text-primary-foreground/75">on track for pass</span>
                    </div>
                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-primary-foreground/15">
                      <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-accent to-accent/80" />
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                      {[
                        { k: "Skills", v: "42/64" },
                        { k: "Mocks", v: "8 passed" },
                        { k: "Hazards", v: "91%" },
                      ].map((s) => (
                        <div key={s.k} className="rounded-xl bg-primary-foreground/10 p-2.5">
                          <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">
                            {s.k}
                          </div>
                          <div className="mt-0.5 text-sm font-semibold">{s.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Skill progress
                    </div>
                    <ul className="mt-3 space-y-3 text-sm">
                      {[
                        { label: "Roundabouts", pct: 92, tone: "text-success" },
                        { label: "Bay parking", pct: 74, tone: "text-accent" },
                        { label: "Meeting traffic", pct: 58, tone: "text-primary" },
                      ].map((s) => (
                        <li key={s.label}>
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="truncate text-foreground">{s.label}</span>
                            <span className={`font-semibold ${s.tone}`}>{s.pct}%</span>
                          </div>
                          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-secondary/70">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${s.pct}%` }}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/8 to-transparent p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground shadow-md">
                        <Bot className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-accent">
                          AI Coach
                        </div>
                        <p className="mt-0.5 text-sm leading-snug text-foreground">
                          "How do I judge a mini roundabout?"
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Answers in 30+ languages, 24/7.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ============ WHO IS IT FOR ============ */}
        <Reveal className="mt-24 sm:mt-32">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              Who it's for
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built for every kind of learner
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              Whether you're picking up the keys for the first time or brushing up before your test,
              GSM Plus meets you where you are.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[
              { label: "Absolute beginners", body: "Never driven before? Start here." },
              { label: "Current GSM students", body: "Prepare and revise between lessons." },
              { label: "Theory-only learners", body: "Free DVSA-style theory practice." },
              { label: "Refresher & Pass Plus", body: "Rebuild confidence after a break." },
            ].map((w, i) => (
              <Reveal key={w.label} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border/50 bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_-16px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_2px_4px_rgba(0,0,0,0.03),0_18px_40px_-20px_rgba(0,0,0,0.25)]">
                  <div className="text-[15px] font-semibold text-foreground">{w.label}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* ============ WHY DIFFERENT ============ */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
              Why we're different
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Not just another driving school
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Most schools give you an hour in a car and a wave goodbye. GSM Plus is a full
              learning platform behind every lesson.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = d.icon;
              return (
                <Reveal key={d.title} delay={i * 80}>
                  <div className="group h-full rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_12px_32px_-20px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_2px_4px_rgba(0,0,0,0.03),0_24px_48px_-24px_rgba(0,0,0,0.3)]">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="mt-5 font-display text-lg font-semibold text-foreground">
                      {d.title}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Reveal>

        {/* ============ HOW IT WORKS ============ */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              How it works
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Your journey to a full licence
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Six simple steps from your first booking to passing your practical test.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal as="li" key={step.title} delay={i * 70}>
                  <div className="relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_12px_28px_-18px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_2px_4px_rgba(0,0,0,0.03),0_22px_44px_-22px_rgba(0,0,0,0.28)]">
                    <span className="pointer-events-none absolute right-4 top-3 font-display text-5xl font-bold text-primary/8 sm:text-6xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/12 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="mt-5 font-display text-lg font-semibold text-foreground">
                      {step.title}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </Reveal>

        {/* ============ BENEFITS ============ */}
        <Reveal className="mt-24 sm:mt-28">
          <div className="grid gap-4 sm:grid-cols-3">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <Reveal key={b.title} delay={i * 80}>
                  <div className="group h-full rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_12px_28px_-18px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_2px_4px_rgba(0,0,0,0.03),0_22px_44px_-22px_rgba(0,0,0,0.28)]">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="mt-5 font-display text-lg font-semibold text-foreground">
                      {b.title}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Reveal>

        {/* ============ FREE vs PREMIUM ============ */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
              What's included
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Free forever. Premium included with lessons.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Anyone can start learning for free. Book driving lessons with GSM and every Premium
              feature unlocks automatically — no extra fee.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Free tier */}
          <div className="relative flex flex-col rounded-3xl border border-border/50 bg-card p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_20px_50px_-28px_rgba(0,0,0,0.2)] sm:p-9">
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
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              Start learning for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Premium tier */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-accent/50 bg-gradient-to-br from-primary via-primary to-primary/85 p-7 text-primary-foreground shadow-[0_25px_60px_-25px_rgba(35,75,54,0.6)] sm:p-9">
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

            <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Book lessons to unlock Premium
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/5 px-6 py-3 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/15"
              >
                See pricing
              </Link>
            </div>
          </div>
          </div>
        </Reveal>

        {/* ============ FINAL CTA ============ */}
        <Reveal className="mt-24 sm:mt-32">
          <div className="overflow-hidden rounded-[2rem] border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/5 p-8 shadow-[0_20px_60px_-30px_rgba(201,120,69,0.35)] sm:p-12">
            <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                  <Lock className="h-3.5 w-3.5" />
                  Ready when you are
                </div>
                <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Learn free today. Pass faster tomorrow.
                </h3>
                <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                  Create your free GSM Plus account in seconds. Book lessons whenever you're ready
                  and Premium unlocks the same day.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_rgba(35,75,54,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgba(35,75,54,0.65)]"
                >
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-accent px-7 py-3.5 font-semibold text-accent-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Book lessons
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

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