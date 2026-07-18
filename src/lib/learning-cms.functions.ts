import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type ModuleRow = {
  id: string;
  slug: string;
  module_number: number;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  updated_at: string;
};

export type TopicRow = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  order_index: number;
  estimated_minutes: number | null;
  is_published: boolean;
  teaching_method_tags: string[] | null;
  updated_at: string;
};

export type LessonRow = {
  id: string;
  topic_id: string;
  slug: string;
  title: string;
  order_index: number;
  is_published: boolean;
  updated_at: string;
};

const MODULE_COLS =
  "id, slug, module_number, title, description, order_index, is_published, updated_at";
const TOPIC_COLS =
  "id, module_id, slug, title, summary, category, order_index, estimated_minutes, is_published, teaching_method_tags, updated_at";
const LESSON_COLS = "id, topic_id, slug, title, order_index, is_published, updated_at";

async function requireAdmin() {
  if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
}

// ------------------------- MODULES -------------------------

export const listModules = createServerFn({ method: "GET" }).handler(
  async (): Promise<ModuleRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("learning_modules")
      .select(MODULE_COLS)
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ModuleRow[];
  },
);

const moduleInput = z.object({
  slug: z.string().min(1).max(80),
  module_number: z.number().int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().nullable().default(null),
  order_index: z.number().int().default(0),
  is_published: z.boolean().default(true),
});

export const createModule = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ module: moduleInput }).parse(d))
  .handler(async ({ data }): Promise<ModuleRow> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("learning_modules")
      .insert(data.module as never)
      .select(MODULE_COLS)
      .single();
    if (error) throw new Error(error.message);
    return row as ModuleRow;
  });

export const updateModule = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), patch: moduleInput.partial() }).parse(d),
  )
  .handler(async ({ data }): Promise<ModuleRow> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("learning_modules")
      .update(data.patch as never)
      .eq("id", data.id)
      .select(MODULE_COLS)
      .single();
    if (error) throw new Error(error.message);
    return row as ModuleRow;
  });

export const deleteModule = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("learning_modules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

export const reorderModules = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < data.ids.length; i++) {
      const { error } = await supabaseAdmin
        .from("learning_modules")
        .update({ order_index: (i + 1) * 10 } as never)
        .eq("id", data.ids[i]);
      if (error) throw new Error(error.message);
    }
    return { ok: true } as const;
  });

// ------------------------- TOPICS -------------------------

export const listTopics = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ module_id: z.string().uuid().optional() }).parse(d ?? {}))
  .handler(async ({ data }): Promise<TopicRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("learning_topics")
      .select(TOPIC_COLS)
      .order("order_index", { ascending: true });
    if (data.module_id) q = q.eq("module_id", data.module_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as TopicRow[];
  });

const topicInput = z.object({
  module_id: z.string().uuid(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  summary: z.string().nullable().default(null),
  category: z.string().nullable().default(null),
  order_index: z.number().int().default(0),
  estimated_minutes: z.number().int().nullable().default(null),
  is_published: z.boolean().default(true),
  teaching_method_tags: z.array(z.string()).nullable().default(null),
});

export const createTopic = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ topic: topicInput }).parse(d))
  .handler(async ({ data }): Promise<TopicRow> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("learning_topics")
      .insert(data.topic as never)
      .select(TOPIC_COLS)
      .single();
    if (error) throw new Error(error.message);
    return row as TopicRow;
  });

export const updateTopic = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), patch: topicInput.partial() }).parse(d),
  )
  .handler(async ({ data }): Promise<TopicRow> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("learning_topics")
      .update(data.patch as never)
      .eq("id", data.id)
      .select(TOPIC_COLS)
      .single();
    if (error) throw new Error(error.message);
    return row as TopicRow;
  });

export const deleteTopic = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("learning_topics").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

export const reorderTopics = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ module_id: z.string().uuid(), ids: z.array(z.string().uuid()).min(1) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < data.ids.length; i++) {
      const { error } = await supabaseAdmin
        .from("learning_topics")
        .update({ order_index: (i + 1) * 10 } as never)
        .eq("id", data.ids[i])
        .eq("module_id", data.module_id);
      if (error) throw new Error(error.message);
    }
    return { ok: true } as const;
  });

// ------------------------- LESSONS -------------------------

export const listLessons = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ topic_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<LessonRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("learning_lessons")
      .select(LESSON_COLS)
      .eq("topic_id", data.topic_id)
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as LessonRow[];
  });

const lessonInput = z.object({
  topic_id: z.string().uuid(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  order_index: z.number().int().default(0),
  is_published: z.boolean().default(true),
});

export const createLesson = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ lesson: lessonInput }).parse(d))
  .handler(async ({ data }): Promise<LessonRow> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("learning_lessons")
      .insert(data.lesson as never)
      .select(LESSON_COLS)
      .single();
    if (error) throw new Error(error.message);
    return row as LessonRow;
  });

export const updateLesson = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), patch: lessonInput.partial() }).parse(d),
  )
  .handler(async ({ data }): Promise<LessonRow> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("learning_lessons")
      .update(data.patch as never)
      .eq("id", data.id)
      .select(LESSON_COLS)
      .single();
    if (error) throw new Error(error.message);
    return row as LessonRow;
  });

export const deleteLesson = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("learning_lessons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });