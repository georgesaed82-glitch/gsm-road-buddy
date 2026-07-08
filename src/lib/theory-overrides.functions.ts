import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type TheoryOverrideRow = {
  question_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  option_explanations: string[];
  updated_at: string;
};

export const listTheoryOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<TheoryOverrideRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("theory_question_overrides")
      .select(
        "question_id, question, options, correct_index, explanation, option_explanations, updated_at",
      );
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      question_id: r.question_id as string,
      question: r.question as string,
      options: r.options as string[],
      correct_index: r.correct_index as number,
      explanation: r.explanation as string,
      option_explanations: r.option_explanations as string[],
      updated_at: r.updated_at as string,
    }));
  },
);

const upsertSchema = z.object({
  question_id: z.string().min(1).max(120),
  question: z.string().trim().min(1).max(2000),
  options: z.array(z.string().trim().min(1).max(500)).length(4),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(1).max(4000),
  option_explanations: z.array(z.string().trim().min(1).max(2000)).length(4),
});

export const upsertTheoryOverride = createServerFn({ method: "POST" })
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) {
      throw new Error("Unauthorized");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("theory_question_overrides").upsert(
      {
        question_id: data.question_id,
        question: data.question,
        options: data.options,
        correct_index: data.correct_index,
        explanation: data.explanation,
        option_explanations: data.option_explanations,
      },
      { onConflict: "question_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTheoryOverride = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ question_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) {
      throw new Error("Unauthorized");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("theory_question_overrides")
      .delete()
      .eq("question_id", data.question_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
