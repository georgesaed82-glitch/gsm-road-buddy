import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfficialSignImage } from "@/components/OfficialSignImage";
import { signs, type Sign } from "@/data/signs";
import { cn } from "@/lib/utils";

// Curated pool: 40 signs across every category, weighted to the most-tested.
const POOL_IDS = [
  // Warning
  "w-bend-right", "w-roundabout", "w-crossroads", "w-t-junction", "w-slippery",
  "w-narrows", "w-school", "w-cyclists", "w-horse", "w-roadworks",
  "w-signals", "w-level", "w-lowbridge", "w-hump", "w-pedestrians",
  // Prohibitory
  "p-no-entry", "p-no-vehicles", "p-no-right", "p-no-left", "p-no-uturn",
  "p-no-overtake", "p-no-hgv", "p-no-bikes", "p-giveway", "p-stop",
  // Mandatory
  "m-turn-left", "m-turn-right", "m-ahead", "m-keep-left", "m-mini-r",
  // Speed
  "s-20", "s-30", "s-40", "s-50", "s-national",
  // Info / direction / signals / crossings
  "i-parking", "i-hospital", "d-primary", "t-red", "t-green",
  "c-zebra", "c-pelican",
];

const QUIZ_LENGTH = 10;

function pickPool(): Sign[] {
  const byId = new Map(signs.map((s) => [s.id, s]));
  return POOL_IDS.map((id) => byId.get(id)).filter(Boolean) as Sign[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Round = { sign: Sign; options: string[]; correctIndex: number };

function buildRounds(pool: Sign[]): Round[] {
  const chosen = shuffle(pool).slice(0, QUIZ_LENGTH);
  return chosen.map((sign) => {
    const distractors = shuffle(pool.filter((s) => s.id !== sign.id)).slice(0, 2);
    const options = shuffle([sign.name, ...distractors.map((d) => d.name)]);
    return { sign, options, correctIndex: options.indexOf(sign.name) };
  });
}

export function HomeSignsQuiz() {
  const pool = useMemo(pickPool, []);
  const [rounds, setRounds] = useState<Round[]>(() => buildRounds(pool));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const restart = () => {
    setRounds(buildRounds(pool));
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / QUIZ_LENGTH) * 100);
    return (
      <div className="border border-border bg-card p-6 sm:p-10">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Result</div>
        <h3 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
          {score} / {QUIZ_LENGTH}{" "}
          <span className="italic text-accent">({pct}%)</span>
        </h3>
        <p className="mt-3 max-w-lg text-muted-foreground">
          {pct >= 86 ? "Test-ready on signs — brilliant." : pct >= 60 ? "Solid start — a bit more practice and you're there." : "Keep going — sign knowledge is worth easy marks on the theory test."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={restart} className="h-11 rounded-none">
            <RotateCcw className="mr-2 h-4 w-4" /> Play again
          </Button>
        </div>
      </div>
    );
  }

  const round = rounds[i];
  const revealed = picked !== null;
  const gotIt = picked === round.correctIndex;

  const next = () => {
    if (i + 1 >= rounds.length) {
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  return (
    <div className="border border-border bg-card p-5 sm:p-8">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>Sign {i + 1} of {QUIZ_LENGTH}</span>
        <span>Score {score}</span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="mx-auto sm:mx-0">
          <OfficialSignImage sign={round.sign} variant="detail" />
        </div>
        <div>
          <h3 className="font-display text-2xl leading-tight sm:text-3xl">What does this sign mean?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Tap the correct answer.</p>

          <div className="mt-5 grid gap-2">
            {round.options.map((opt, idx) => {
              const isPicked = picked === idx;
              const isCorrect = idx === round.correctIndex;
              let cls = "border-border bg-background hover:bg-secondary";
              if (revealed) {
                if (isCorrect) cls = "border-emerald-600 bg-emerald-600/10";
                else if (isPicked) cls = "border-destructive bg-destructive/10";
                else cls = "border-border bg-background opacity-70";
              }
              return (
                <button
                  key={opt}
                  disabled={revealed}
                  onClick={() => {
                    setPicked(idx);
                    if (idx === round.correctIndex) setScore((s) => s + 1);
                  }}
                  className={cn(
                    "flex items-center gap-2 border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default",
                    cls,
                  )}
                >
                  <span className="flex-1">{opt}</span>
                  {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {revealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {revealed && (
        <div className={cn(
          "mt-6 border p-4 text-sm sm:p-5",
          gotIt ? "border-emerald-600 bg-emerald-600/10" : "border-destructive bg-destructive/10",
        )}>
          <div className="font-medium">
            {gotIt ? "Correct" : "Not quite"} — the sign means{" "}
            <span className="underline">{round.sign.name}</span>.
          </div>
          <p className="mt-2 leading-relaxed">
            <span className="font-semibold">Why:</span> {round.sign.meaning}
          </p>
          <div className="mt-4 flex justify-end">
            <Button onClick={next} className="h-10 rounded-none">
              {i + 1 >= rounds.length ? "See result" : "Next sign"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}