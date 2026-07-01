import { sampleTheoryQuestions, type TheoryQuestion } from "@/data/theory";

export type Difficulty = "easy" | "medium" | "hard";

// Deterministic difficulty assignment based on the question's position
// within its DVSA category. First third = easy, middle = medium, last = hard.
const byCategory = new Map<string, TheoryQuestion[]>();
for (const q of sampleTheoryQuestions) {
  const list = byCategory.get(q.category) ?? [];
  list.push(q);
  byCategory.set(q.category, list);
}

const difficultyMap = new Map<string, Difficulty>();
for (const [, list] of byCategory) {
  const third = Math.max(1, Math.ceil(list.length / 3));
  list.forEach((q, i) => {
    const d: Difficulty = i < third ? "easy" : i < third * 2 ? "medium" : "hard";
    difficultyMap.set(q.id, d);
  });
}

export function difficultyOf(q: TheoryQuestion): Difficulty {
  return difficultyMap.get(q.id) ?? "medium";
}

export function questionsByDifficulty(d: Difficulty): TheoryQuestion[] {
  return sampleTheoryQuestions.filter((q) => difficultyOf(q) === d);
}

export const difficultyMeta: Record<Difficulty, { label: string; blurb: string; color: string }> = {
  easy: { label: "Easy", blurb: "Warm-up questions covering the essentials of each topic.", color: "bg-emerald-600" },
  medium: { label: "Medium", blurb: "Standard DVSA-style questions — the bulk of the real theory test.", color: "bg-amber-500" },
  hard: { label: "Hard", blurb: "Trickier scenarios, edge cases and the questions candidates most often get wrong.", color: "bg-rose-600" },
};