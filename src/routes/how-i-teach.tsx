import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, HeartHandshake, RotateCcw, ShieldCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BUSINESS } from "@/lib/business";

const TITLE = "How George Teaches | Patient Driving Instructor in Kensington & West London";
const DESC =
  "George's gentle, patient and structured way of teaching: driving lessons for nervous beginners in West London, calm help with mistakes and support after an unsuccessful test.";
const URL = `${BUSINESS.url}/how-i-teach`;

export const Route = createFileRoute("/how-i-teach")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: HowITeachPage,
});

const VALUES = [
  "I am gentle, kind, patient and encouraging.",
  "I explain things carefully and give you time to understand.",
  "I teach the foundations to a high standard.",
  "I explain why a skill matters, where and when to use it, and how to do it safely.",
  "I adapt each lesson to your experience, understanding and confidence.",
  "I give specific, honest praise and help you recognise your progress.",
  "My aim is safe, confident, independent driving.",
];

const STEPS = [
  "Assess understanding and agree on the goal.",
  "Explain the skill and the reasons behind it.",
  "Demonstrate or talk through it where appropriate.",
  "Practise with clear guidance.",
  "Use prompts and questions to check understanding.",
  "Gradually reduce help as the learner becomes ready.",
  "Let the learner perform the task independently, under appropriate instructor supervision.",
  "Review what went well and what to practise next.",
];

const AFTER_TEST = [
  "Review your actual test report, the examiner's feedback and your own account of the drive.",
  "Explain the recorded faults in plain English, the driving standard being assessed and the skills that need improving.",
  "Separate what the report confirms from anything that needs further assessment — I never guess at an examiner's reasoning.",
  "Begin with a check of the basics in a quiet, safe setting so you feel comfortable again.",
  "Work through the specific difficulty in manageable stages.",
  "Practise until you can apply the skill confidently and safely.",
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`box-3d rounded-3xl bg-card p-6 sm:p-8 ${className}`}>{children}</section>;
}

function HowITeachPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:py-14">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How I teach</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Patient, structured lessons that build real confidence
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          I'm George, and I've been teaching West London learners since 2005. Here is how I help
          people become safe, confident and independent drivers.
        </p>
      </header>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <HeartHandshake className="h-6 w-6" /> What you can expect from me
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {VALUES.map((v) => (
            <li key={v} className="rounded-xl border bg-background p-4 text-foreground">{v}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-2xl font-semibold text-primary">Starting with a novice learner</h2>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-foreground">
          <p>
            With a novice learner, we first talk about their experience, any concerns and their goals.
            Together we agree a manageable objective for the lesson and begin somewhere quiet and
            suitable for their ability.
          </p>
          <p>
            We cover the foundations: seating position, mirrors, the controls, observations, moving
            off, stopping, steering, speed control and awareness of other road users. Instruction
            always matches the car — automatic or manual.
          </p>
          <p>
            Unfamiliar terms are explained in plain English. Detailed explanations happen while we
            are safely stopped; while driving, guidance is short and timely.
          </p>
        </div>
        <h3 className="mt-6 font-display text-xl font-semibold">How each skill is taught</h3>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 rounded-xl border bg-background p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-foreground">{s}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <ShieldCheck className="h-6 w-6" /> When mistakes happen
        </h2>
        <blockquote className="mt-4 rounded-xl border-l-4 border-accent bg-background p-4 text-lg italic text-foreground">
          "It's okay to need another attempt. Let's look at what happened, choose one thing to
          improve and practise it again when it's safe."
        </blockquote>
        <p className="mt-4 text-base leading-relaxed text-foreground">
          Mistakes are handled calmly. First we keep the situation safe. Then I explain what
          happened, we identify the cause and practise the relevant skill again. I'll reassure you —
          but I won't brush aside anything that matters for safety.
        </p>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <RotateCcw className="h-6 w-6" /> After an unsuccessful driving test
        </h2>
        <p className="mt-3 text-base text-foreground">
          Failing a test can knock your confidence. This is how I help you get back on track:
        </p>
        <ol className="mt-4 space-y-3">
          {AFTER_TEST.map((s, i) => (
            <li key={s} className="flex gap-3 rounded-xl border bg-background p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {i + 1}
              </span>
              <span className="text-foreground">{s}</span>
            </li>
          ))}
        </ol>
        <h3 className="mt-6 font-display text-xl font-semibold">Example: roundabouts</h3>
        <p className="mt-2 text-base leading-relaxed text-foreground">
          If roundabouts were the difficulty, I first identify exactly what went wrong — perhaps
          observations, approach speed, lane choice, positioning, signalling or judgement. Where
          suitable, we discuss the layout while safely stopped and practise on a familiar,
          appropriate roundabout. I guide you, use prompts and questions, gradually reduce my
          support, then assess your independent driving under supervision. We then apply the same
          skills to other suitable layouts — memorising one roundabout or test route is never a
          substitute for understanding.
        </p>
      </Card>

      <section className="box-3d rounded-3xl bg-primary p-6 text-center text-primary-foreground sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Talk to George about lessons</h2>
        <p className="mt-2 opacity-90">Tell me your area, automatic or manual, your experience and preferred times.</p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`tel:+${BUSINESS.phoneIntl}`}
            data-track-location="how_i_teach"
            className="btn-3d inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-6 py-3 font-bold text-primary"
          >
            <Phone className="h-5 w-5" /> Call George
          </a>
          <a
            href={`https://wa.me/${BUSINESS.phoneIntl}`}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="how_i_teach"
            className="btn-3d inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-3 font-bold text-accent-foreground"
          >
            <WhatsAppIcon className="h-5 w-5" /> WhatsApp George
          </a>
        </div>
        <p className="mt-5 text-sm">
          <Link to="/pricing" className="underline underline-offset-4">See George's prices</Link>
        </p>
      </section>
    </main>
  );
}
