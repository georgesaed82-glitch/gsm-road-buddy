import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProgressStage =
  | "not_started"
  | "introduced"
  | "practised"
  | "developing"
  | "independent"
  | "test_standard"
  | "completed";

export const STAGES: ProgressStage[] = [
  "not_started",
  "introduced",
  "practised",
  "developing",
  "independent",
  "test_standard",
  "completed",
];

export const STAGE_LABEL: Record<ProgressStage, string> = {
  not_started: "Not started",
  introduced: "Introduced",
  practised: "Practised",
  developing: "Developing",
  independent: "Independent",
  test_standard: "Test standard",
  completed: "Completed",
};

export type PortalModule = {
  id: string;
  slug: string;
  module_number: number;
  title: string;
  description: string | null;
  order_index: number;
};

export type PortalTopic = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  order_index: number;
  estimated_minutes: number | null;
  teaching_method_tags: string[] | null;
};

export type PortalCatalog = {
  modules: PortalModule[];
  topics: PortalTopic[];
};

// Public catalog — anyone can browse the syllabus outline.
export const getPortalCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<PortalCatalog> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: modules, error: mErr }, { data: topics, error: tErr }] = await Promise.all([
      supabaseAdmin
        .from("learning_modules")
        .select("id, slug, module_number, title, description, order_index")
        .eq("is_published", true)
        .order("order_index", { ascending: true }),
      supabaseAdmin
        .from("learning_topics")
        .select(
          "id, module_id, slug, title, summary, category, order_index, estimated_minutes, teaching_method_tags",
        )
        .eq("is_published", true)
        .order("order_index", { ascending: true }),
    ]);
    if (mErr) throw new Error(mErr.message);
    if (tErr) throw new Error(tErr.message);
    return {
      modules: (modules ?? []) as PortalModule[],
      topics: (topics ?? []) as PortalTopic[],
    };
  },
);

export type StudentProgressRow = {
  topic_id: string;
  stage: ProgressStage;
  count: number;
  last_worked_at: string | null;
  notes: string | null;
};

export const getMyProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudentProgressRow[]> => {
    const { data, error } = await context.supabase
      .from("progress_student_topics")
      .select("topic_id, stage, count, last_worked_at, notes")
      .eq("student_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []) as StudentProgressRow[];
  });

export const setMyTopicStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        topic_id: z.string().uuid(),
        stage: z.enum([
          "not_started",
          "introduced",
          "practised",
          "developing",
          "independent",
          "test_standard",
          "completed",
        ]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<StudentProgressRow> => {
    const now = new Date().toISOString();
    const { data: row, error } = await context.supabase
      .from("progress_student_topics")
      .upsert(
        {
          student_id: context.userId,
          topic_id: data.topic_id,
          stage: data.stage,
          last_worked_at: now,
        },
        { onConflict: "student_id,topic_id" },
      )
      .select("topic_id, stage, count, last_worked_at, notes")
      .single();
    if (error) throw new Error(error.message);
    return row as StudentProgressRow;
  });