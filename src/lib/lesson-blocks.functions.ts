import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { AiVideoRow } from "./ai-videos.functions";

type BlockRow = Database["public"]["Tables"]["lesson_blocks"]["Row"];
type BlockKind = Database["public"]["Enums"]["lesson_block_kind"];

export type LessonBlockRow = BlockRow & { video_count: number };

const BLOCK_COLS =
  "id, lesson_id, kind, order_index, payload, asset_id, created_at, updated_at";

const BLOCK_KINDS = [
  "text", "image", "diagram", "animation", "video", "voice", "quiz",
  "instructor_note", "homework", "reference_point", "gsm_method_callout",
  "ai_video", "interactive_animation", "quiz_true_false", "drag_drop",
  "hotspot", "scenario_challenge", "callout", "highway_code_rule",
  "road_sign", "road_marking", "vehicle_controls", "hazard_clip",
  "driving_test_tip", "summary", "progress_check", "downloadable_pdf",
] as const;

async function assertEditor(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = new Set((data ?? []).map((r) => r.role as string));
  if (!roles.has("admin") && !roles.has("senior_instructor"))
    throw new Error("Forbidden: admin or senior instructor required");
}

// -------------------- BLOCKS --------------------

export const listLessonBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ lesson_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<LessonBlockRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("lesson_blocks")
      .select(BLOCK_COLS)
      .eq("lesson_id", data.lesson_id)
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    const blocks = (rows ?? []) as BlockRow[];
    if (blocks.length === 0) return [];
    const { data: counts } = await supabaseAdmin
      .from("lesson_block_videos")
      .select("block_id")
      .in("block_id", blocks.map((b) => b.id));
    const map = new Map<string, number>();
    for (const r of counts ?? []) map.set(r.block_id, (map.get(r.block_id) ?? 0) + 1);
    return blocks.map((b) => ({ ...b, video_count: map.get(b.id) ?? 0 }));
  });

export const createLessonBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        lesson_id: z.string().uuid(),
        kind: z.enum(BLOCK_KINDS),
        title: z.string().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<LessonBlockRow> => {
    await assertEditor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: maxRow } = await supabaseAdmin
      .from("lesson_blocks")
      .select("order_index")
      .eq("lesson_id", data.lesson_id)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextIndex = ((maxRow?.order_index ?? 0) + 10);
    const payload = data.title ? { title: data.title } : {};
    const { data: row, error } = await supabaseAdmin
      .from("lesson_blocks")
      .insert({
        lesson_id: data.lesson_id,
        kind: data.kind as BlockKind,
        order_index: nextIndex,
        payload,
      } as never)
      .select(BLOCK_COLS)
      .single();
    if (error) throw new Error(error.message);
    return { ...(row as BlockRow), video_count: 0 };
  });

export const updateLessonBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        patch: z
          .object({
            kind: z.enum(BLOCK_KINDS).optional(),
            payload: z.record(z.string(), z.unknown()).optional(),
          })
          .default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<BlockRow> => {
    await assertEditor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {};
    if (data.patch.kind) patch.kind = data.patch.kind;
    if (data.patch.payload) patch.payload = data.patch.payload;
    const { data: row, error } = await supabaseAdmin
      .from("lesson_blocks")
      .update(patch as never)
      .eq("id", data.id)
      .select(BLOCK_COLS)
      .single();
    if (error) throw new Error(error.message);
    return row as BlockRow;
  });

export const deleteLessonBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertEditor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lesson_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderLessonBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ lesson_id: z.string().uuid(), ids: z.array(z.string().uuid()).min(1) })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertEditor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < data.ids.length; i++) {
      const { error } = await supabaseAdmin
        .from("lesson_blocks")
        .update({ order_index: (i + 1) * 10 } as never)
        .eq("id", data.ids[i])
        .eq("lesson_id", data.lesson_id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// -------------------- BLOCK <-> VIDEO ATTACHMENTS --------------------

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

export const listBlockVideos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        block_id: z.string().uuid().optional(),
        block_ids: z.array(z.string().uuid()).optional(),
        approvedOnly: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(
    async ({ data }): Promise<
      Array<{ block_id: string; position: number; video: AiVideoRow }>
    > => {
      const ids = data.block_id ? [data.block_id] : data.block_ids ?? [];
      if (ids.length === 0) return [];
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: links, error } = await supabaseAdmin
        .from("lesson_block_videos")
        .select("block_id, video_id, position")
        .in("block_id", ids)
        .order("position", { ascending: true });
      if (error) throw new Error(error.message);
      if (!links || links.length === 0) return [];
      const videoIds = Array.from(new Set(links.map((l) => l.video_id)));
      let vq = supabaseAdmin.from("ai_videos").select("*").in("id", videoIds);
      if (data.approvedOnly) vq = vq.eq("status", "approved");
      const { data: videos, error: vErr } = await vq;
      if (vErr) throw new Error(vErr.message);
      const byId = new Map(videos?.map((v) => [v.id, v]) ?? []);
      const enriched: Array<{ block_id: string; position: number; video: AiVideoRow }> = [];
      for (const l of links) {
        const v = byId.get(l.video_id);
        if (!v) continue;
        const url = await signIfNeeded(v);
        enriched.push({
          block_id: l.block_id,
          position: l.position,
          video: { ...v, video_url: url } as AiVideoRow,
        });
      }
      return enriched;
    },
  );

export const attachVideoToBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ block_id: z.string().uuid(), video_id: z.string().uuid() })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertEditor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: maxRow } = await supabaseAdmin
      .from("lesson_block_videos")
      .select("position")
      .eq("block_id", data.block_id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPos = (maxRow?.position ?? -1) + 1;
    const { error } = await supabaseAdmin
      .from("lesson_block_videos")
      .upsert(
        { block_id: data.block_id, video_id: data.video_id, position: nextPos } as never,
        { onConflict: "block_id,video_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const detachVideoFromBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ block_id: z.string().uuid(), video_id: z.string().uuid() })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertEditor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("lesson_block_videos")
      .delete()
      .eq("block_id", data.block_id)
      .eq("video_id", data.video_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderBlockVideos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        block_id: z.string().uuid(),
        video_ids: z.array(z.string().uuid()).min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertEditor(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < data.video_ids.length; i++) {
      const { error } = await supabaseAdmin
        .from("lesson_block_videos")
        .update({ position: i } as never)
        .eq("block_id", data.block_id)
        .eq("video_id", data.video_ids[i]);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// -------------------- STUDENT-FACING: LESSON → APPROVED VIDEOS --------------------

export const listLessonVideos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ lesson_id: z.string().uuid() }).parse(d))
  .handler(
    async ({
      data,
    }): Promise<Array<{ block_id: string; block_kind: BlockKind; position: number; video: AiVideoRow }>> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: blocks, error: bErr } = await supabaseAdmin
        .from("lesson_blocks")
        .select("id, kind, order_index")
        .eq("lesson_id", data.lesson_id)
        .order("order_index", { ascending: true });
      if (bErr) throw new Error(bErr.message);
      if (!blocks || blocks.length === 0) return [];
      const blockMap = new Map(blocks.map((b) => [b.id, b]));
      const { data: links, error: lErr } = await supabaseAdmin
        .from("lesson_block_videos")
        .select("block_id, video_id, position")
        .in("block_id", blocks.map((b) => b.id))
        .order("position", { ascending: true });
      if (lErr) throw new Error(lErr.message);
      if (!links || links.length === 0) return [];
      const videoIds = Array.from(new Set(links.map((l) => l.video_id)));
      const { data: videos, error: vErr } = await supabaseAdmin
        .from("ai_videos")
        .select("*")
        .in("id", videoIds)
        .eq("status", "approved");
      if (vErr) throw new Error(vErr.message);
      const byId = new Map(videos?.map((v) => [v.id, v]) ?? []);
      const out: Array<{ block_id: string; block_kind: BlockKind; position: number; video: AiVideoRow }> = [];
      for (const l of links) {
        const v = byId.get(l.video_id);
        const b = blockMap.get(l.block_id);
        if (!v || !b) continue;
        const url = await signIfNeeded(v);
        out.push({
          block_id: l.block_id,
          block_kind: b.kind as BlockKind,
          position: l.position,
          video: { ...v, video_url: url } as AiVideoRow,
        });
      }
      // Sort by block order first, then attachment position
      const blockOrder = new Map(blocks.map((b, i) => [b.id, b.order_index ?? i]));
      out.sort((a, b) => {
        const oa = blockOrder.get(a.block_id) ?? 0;
        const ob = blockOrder.get(b.block_id) ?? 0;
        if (oa !== ob) return oa - ob;
        return a.position - b.position;
      });
      return out;
    },
  );