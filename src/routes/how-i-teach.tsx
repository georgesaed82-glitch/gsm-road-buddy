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

const QUESTIONS = [
  ["What?", "What are you learning, and what are you trying to achieve?"],
  ["Why?", "Why does it matter, and how does it help keep people safe?"],
  ["Where?", "Where does the skill apply, and what should you notice about the road and surroundings?"],
  ["When?", "When should you observe, prepare, decide and act?"],
  ["How?", "How do you carry out the skill safely, step by step?"],
  ["Who?", "Who else could be affected, and how can you take their needs into account?"],
] as const;

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
  "If you have had an unsuccessful test, we begin by reviewing your test report and any examiner feedback with you. We explain the recorded faults, the driving skills being assessed and how to work on them.",
  "We check the relevant foundations in a suitable, quiet setting so you feel comfortable before tackling the difficulty. Whether it involves a roundabout, junction, observations or another skill, we break it down into manageable steps.",
  "We explain and guide you first, then use questions and prompts, gradually reducing support as your confidence and understanding improve. You practise applying the skill independently under supervision and in different suitable situations.",
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
          Patient teaching that helps you understand every step
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          At George’s School of Motoring (GSM), we take time to explain what you are learning,
          why it matters, where and when to use it, and how to do it safely. We also help you
          understand who else could be affected by your decisions, including pedestrians,
          cyclists and other drivers.
        </p>
      </header>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <HeartHandshake className="h-6 w-6" /> The questions behind every driving skill
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUESTIONS.map(([question, explanation]) => (
            <li key={question} className="rounded-xl border bg-background p-4 text-base leading-relaxed text-foreground">
              <strong className="block text-primary">{question}</strong>{explanation}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-2xl font-semibold text-primary">Starting with a novice learner</h2>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-foreground">
          <p>
            We build strong foundations from the beginning. For a novice learner, this means starting
            somewhere quiet and suitable, becoming comfortable with the car and developing the basic
            skills at a manageable pace. We explain clearly, check understanding and give you time to ask questions.
          </p>
          <p>
            We guide you through each skill, demonstrate where appropriate, and help you practise.
            As your understanding develops, we use gentle questions and prompts to encourage you
            to think ahead and make your own decisions. We gradually reduce our help until you can
            carry out the task independently, with your instructor still supervising.
          </p>
          <p>
            We recognise your progress, praise what you do well and explain your next step clearly.
            Our aim is to help you become a safe, confident and considerate driver.
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
          “Don’t worry—we can work through this together. Let’s understand what happened and try again when it’s safe.”
        </blockquote>
        <p className="mt-4 text-base leading-relaxed text-foreground">
          If you make a mistake, we stay calm and help you learn from it. We explain what happened,
          identify what to improve and practise again when it is safe.
        </p>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <RotateCcw className="h-6 w-6" /> Support after an unsuccessful driving test
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
