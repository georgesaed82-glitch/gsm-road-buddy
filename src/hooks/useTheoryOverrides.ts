import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicTheoryQuestions, type TheoryQuestionRow } from "@/lib/theory-cms.functions";
import type { TheoryQuestion } from "@/data/theory";

// Backwards-compatible hook: applies CMS edits to built-in questions by matching source_id.
export function useTheoryOverrides() {
  const fn = useServerFn(listPublicTheoryQuestions);
  const q = useQuery({
    queryKey: ["theory-questions-public"],
    queryFn: () => fn(),
    staleTime: 60_000,
  });
  const map = new Map<string, TheoryQuestionRow>();
  for (const row of q.data ?? []) if (row.source_id) map.set(row.source_id, row);
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