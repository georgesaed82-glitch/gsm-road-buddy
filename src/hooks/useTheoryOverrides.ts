import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTheoryOverrides, type TheoryOverrideRow } from "@/lib/theory-overrides.functions";
import type { TheoryQuestion } from "@/data/theory";

export function useTheoryOverrides() {
  const fn = useServerFn(listTheoryOverrides);
  const q = useQuery({
    queryKey: ["theory-overrides"],
    queryFn: () => fn(),
    staleTime: 60_000,
  });
  const map = new Map<string, TheoryOverrideRow>();
  for (const row of q.data ?? []) map.set(row.question_id, row);
  return {
    isLoading: q.isLoading,
    apply: (questions: TheoryQuestion[]): TheoryQuestion[] =>
      questions.map((qu) => {
        const o = map.get(qu.id);
        if (!o) return qu;
        return {
          ...qu,
          question: o.question,
          options: o.options,
          correctIndex: o.correct_index,
          explanation: o.explanation,
          optionExplanations: o.option_explanations,
        };
      }),
    getOverride: (id: string) => map.get(id),
  };
}