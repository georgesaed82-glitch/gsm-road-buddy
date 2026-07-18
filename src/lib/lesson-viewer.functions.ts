import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { AiVideoRow } from "./ai-videos.functions";

type BlockRow = Database["public"]["Tables"]["lesson_blocks"]["Row"];
type LessonRow = Database["public"]["Tables"]["learning_lessons"]["Row"];

export type LessonListItem = {
  id: string;
  topic_id: string;
  slug: string;
  title: string;
  order_index: number;
  status: "not_started" | "in_progress" | "completed";
  progress_pct: number;
};

export type LessonBlockView = BlockRow & {
  videos: AiVideoRow[];
};

export type LessonProgress = {
  lesson_id: string;
  status: "in_progress" | "completed";
  last_block_id: string | null;
  progress_pct: number;
  quiz_state: Record<string, unknown>;
  completed_at: string | null;
  updated_at: string;
};

export type LessonViewerData = {
  lesson: LessonRow;
  topic: { id: string; title: string; slug: string; module_id: string };
  module: { id: string; title: string; module_number: number; slug: string };
  blocks: LessonBlockView[];
  progress: LessonProgress | null;
  prev: { id: string; title: string; unlocked: boolean } | null;
  next: { id: string; title: string; unlocked: boolean } | null;
};

async function signIfNeeded(row: Database["public"]["Tables"]["ai_videos"]["Row"]) {
  if (row.provider === "youtube" && row.youtube_id)
    return `https://www.youtube.com/embed/${row.youtube_id}`;
  if (row.provider === "external" && row.external_url) return row.external_url;
  if (row.provider === "upload" && row.storage_path) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage
      .from("ai-videos")
      .createSignedUrl(row.storage_path, 60 * 60);
    return data?.signedUrl ?? null;
  }
  return null;
}

// -------- List lessons for a topic (with the student's progress) --------
export const listLessonsForTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ topic_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<LessonListItem[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lessons, error } = await supabaseAdmin
      .from("learning_lessons")
      .select("id, topic_id, slug, title, order_index, is_published")
      .eq("topic_id", data.topic_id)
      .eq("is_published", true)
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    const rows = (lessons ?? []) as Array<Pick<LessonRow, "id" | "topic_id" | "slug" | "title" | "order_index">>;
    if (rows.length === 0) return [];
    const { data: progress } = await (context.supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (col: string, val: string) => {
            in: (col: string, vals: string[]) => Promise<{ data: Array<{ lesson_id: string; status: string; progress_pct: number }> | null }>;
          };
        };
      };
    })
      .from("progress_learning_lessons")
      .select("lesson_id, status, progress_pct")
      .eq("student_id", context.userId)
      .in("lesson_id", rows.map((r) => r.id));
    const pmap = new Map((progress ?? []).map((p) => [p.lesson_id, p]));
    return rows.map((r) => {
      const p = pmap.get(r.id);
      return {
        id: r.id,
        topic_id: r.topic_id,
        slug: r.slug,
        title: r.title,
        order_index: r.order_index,
        status: (p?.status as LessonListItem["status"]) ?? "not_started",
        progress_pct: p?.progress_pct ?? 0,
      };
    });
  });

// -------- Full viewer payload for one lesson --------
export const getLessonViewer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ lesson_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<LessonViewerData> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: lesson, error: lErr } = await supabaseAdmin
      .from("learning_lessons")
      .select("*")
      .eq("id", data.lesson_id)
      .eq("is_published", true)
      .single();
    if (lErr || !lesson) throw new Error(lErr?.message ?? "Lesson not found");
    const lessonRow = lesson as LessonRow;

    const { data: topic, error: tErr } = await supabaseAdmin
      .from("learning_topics")
      .select("id, title, slug, module_id")
      .eq("id", lessonRow.topic_id)
      .single();
    if (tErr || !topic) throw new Error(tErr?.message ?? "Topic not found");

    const { data: mod, error: mErr } = await supabaseAdmin
      .from("learning_modules")
      .select("id, title, module_number, slug")
      .eq("id", topic.module_id)
      .single();
    if (mErr || !mod) throw new Error(mErr?.message ?? "Module not found");

    // Blocks
    const { data: blocks, error: bErr } = await supabaseAdmin
      .from("lesson_blocks")
      .select("*")
      .eq("lesson_id", data.lesson_id)
      .order("order_index", { ascending: true });
    if (bErr) throw new Error(bErr.message);
    const blockRows = (blocks ?? []) as BlockRow[];

    // Attached videos (approved only)
    let videosByBlock = new Map<string, AiVideoRow[]>();
    if (blockRows.length > 0) {
      const { data: links } = await supabaseAdmin
        .from("lesson_block_videos")
        .select("block_id, video_id, position")
        .in("block_id", blockRows.map((b) => b.id))
        .order("position", { ascending: true });
      if (links && links.length > 0) {
        const vids = Array.from(new Set(links.map((l) => l.video_id)));
        const { data: videos } = await supabaseAdmin
          .from("ai_videos")
          .select("*")
          .in("id", vids)
          .eq("status", "approved");
        const byId = new Map((videos ?? []).map((v) => [v.id, v]));
        for (const l of links) {
          const v = byId.get(l.video_id);
          if (!v) continue;
          const url = await signIfNeeded(v);
          const enriched = { ...v, video_url: url } as AiVideoRow;
          const arr = videosByBlock.get(l.block_id) ?? [];
          arr.push(enriched);
          videosByBlock.set(l.block_id, arr);
        }
      }
    }
    const viewBlocks: LessonBlockView[] = blockRows.map((b) => ({
      ...b,
      videos: videosByBlock.get(b.id) ?? [],
    }));

    // Progress (my row)
    const { data: prog } = await (context.supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              maybeSingle: () => Promise<{ data: LessonProgress | null }>;
            };
          };
        };
      };
    })
      .from("progress_learning_lessons")
      .select("lesson_id, status, last_block_id, progress_pct, quiz_state, completed_at, updated_at")
      .eq("student_id", context.userId)
      .eq("lesson_id", data.lesson_id)
      .maybeSingle();

    // Siblings within topic for prev/next + unlock
    const { data: siblings } = await supabaseAdmin
      .from("learning_lessons")
      .select("id, title, order_index")
      .eq("topic_id", lessonRow.topic_id)
      .eq("is_published", true)
      .order("order_index", { ascending: true });
    const sibs = (siblings ?? []) as Array<Pick<LessonRow, "id" | "title" | "order_index">>;
    const idx = sibs.findIndex((s) => s.id === lessonRow.id);
    const prevSib = idx > 0 ? sibs[idx - 1] : null;
    const nextSib = idx >= 0 && idx < sibs.length - 1 ? sibs[idx + 1] : null;

    // Unlock rule: next lesson requires this one completed.
    // Prev is always unlocked (already visited earlier in the sequence).
    const thisCompleted = prog?.status === "completed";
    return {
      lesson: lessonRow,
      topic: topic as LessonViewerData["topic"],
      module: mod as LessonViewerData["module"],
      blocks: viewBlocks,
      progress: (prog as LessonProgress | null) ?? null,
      prev: prevSib ? { id: prevSib.id, title: prevSib.title, unlocked: true } : null,
      next: nextSib ? { id: nextSib.id, title: nextSib.title, unlocked: thisCompleted } : null,
    };
  });

// -------- Auto-save progress (called on block scroll/quiz submit) --------
export const saveLessonProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        lesson_id: z.string().uuid(),
        last_block_id: z.string().uuid().nullable().optional(),
        progress_pct: z.number().int().min(0).max(100).optional(),
        quiz_state: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const payload: Record<string, unknown> = {
      student_id: context.userId,
      lesson_id: data.lesson_id,
      status: "in_progress",
    };
    if (data.last_block_id !== undefined) payload.last_block_id = data.last_block_id;
    if (data.progress_pct !== undefined) payload.progress_pct = data.progress_pct;
    if (data.quiz_state !== undefined) payload.quiz_state = data.quiz_state;
    const client = context.supabase as unknown as {
      from: (t: string) => {
        upsert: (
          row: Record<string, unknown>,
          opts: { onConflict: string },
        ) => Promise<{ error: { message: string } | null }>;
      };
    };
    const { error } = await client
      .from("progress_learning_lessons")
      .upsert(payload, { onConflict: "student_id,lesson_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Mark a lesson complete (unlocks the next lesson) --------
export const markLessonComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ lesson_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const client = context.supabase as unknown as {
      from: (t: string) => {
        upsert: (
          row: Record<string, unknown>,
          opts: { onConflict: string },
        ) => Promise<{ error: { message: string } | null }>;
      };
    };
    const { error } = await client.from("progress_learning_lessons").upsert(
      {
        student_id: context.userId,
        lesson_id: data.lesson_id,
        status: "completed",
        progress_pct: 100,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "student_id,lesson_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });