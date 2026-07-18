import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Tables"]["ai_videos"]["Row"];
export type AiVideoStatus = Row["status"];
export type AiVideoProvider = Row["provider"];
export type AiVideoTransmission = Row["transmission"];
export type AiVideoDifficulty = Row["difficulty"];

export type AiVideoRow = Row & {
  uploader_name?: string | null;
  approver_name?: string | null;
  video_url?: string | null;
};

const BUCKET = "ai-videos";

async function loadRole(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = new Set((data ?? []).map((r) => r.role as string));
  return {
    isAdmin: roles.has("admin"),
    isSenior: roles.has("senior_instructor"),
  };
}

async function signIfNeeded(row: Row): Promise<string | null> {
  if (row.provider === "youtube" && row.youtube_id)
    return `https://www.youtube.com/embed/${row.youtube_id}`;
  if (row.provider === "external" && row.external_url) return row.external_url;
  if (row.provider === "upload" && row.storage_path) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(row.storage_path, 60 * 60);
    return data?.signedUrl ?? null;
  }
  return null;
}

async function enrich(rows: Row[]): Promise<AiVideoRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ids = Array.from(
    new Set(
      rows.flatMap((r) => [r.uploaded_by, r.approved_by].filter(Boolean) as string[]),
    ),
  );
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, username")
      .in("id", ids);
    for (const p of profs ?? [])
      names.set(p.id, (p.full_name || p.username || "") as string);
  }
  return Promise.all(
    rows.map(async (r) => ({
      ...r,
      uploader_name: r.uploaded_by ? names.get(r.uploaded_by) ?? null : null,
      approver_name: r.approved_by ? names.get(r.approved_by) ?? null : null,
      video_url: await signIfNeeded(r),
    })),
  );
}

// -------------------- LIST --------------------

const listInput = z
  .object({
    status: z.enum(["draft", "pending_review", "approved", "rejected", "archived"]).optional(),
    scope: z.enum(["all", "mine", "public"]).default("public"),
    search: z.string().max(200).optional(),
    transmission: z.enum(["any", "manual", "automatic"]).optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced", "test_ready"]).optional(),
    provider: z.enum(["youtube", "upload", "external"]).optional(),
    topic_id: z.string().uuid().optional(),
    lesson_id: z.string().uuid().optional(),
    tag: z.string().max(60).optional(),
    uploader_id: z.string().uuid().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    limit: z.number().int().min(1).max(200).default(60),
  })
  .default({ scope: "public", limit: 60 });

export const listAiVideos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => listInput.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<AiVideoRow[]> => {
    const role = await loadRole(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("ai_videos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.scope === "public") q = q.eq("status", "approved");
    else if (data.scope === "mine") q = q.eq("uploaded_by", context.userId);
    else {
      if (!role.isAdmin && !role.isSenior) q = q.eq("status", "approved");
    }

    if (data.status) q = q.eq("status", data.status);
    if (data.transmission) q = q.eq("transmission", data.transmission);
    if (data.difficulty) q = q.eq("difficulty", data.difficulty);
    if (data.provider) q = q.eq("provider", data.provider);
    if (data.uploader_id) q = q.eq("uploaded_by", data.uploader_id);
    if (data.topic_id) q = q.contains("topic_ids", [data.topic_id]);
    if (data.lesson_id) q = q.contains("lesson_ids", [data.lesson_id]);
    if (data.tag) q = q.contains("tags", [data.tag]);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    if (data.search) {
      const s = data.search.replace(/[%_]/g, "");
      q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return enrich((rows ?? []) as Row[]);
  });

// -------------------- GET (auto-signs video URL) --------------------

export const getAiVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<AiVideoRow | null> => {
    const role = await loadRole(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("ai_videos")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    if (
      row.status !== "approved" &&
      row.uploaded_by !== context.userId &&
      !role.isAdmin
    ) {
      throw new Error("Forbidden");
    }
    const [enriched] = await enrich([row as Row]);
    return enriched;
  });

// -------------------- UPSERT --------------------

const upsertInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(4000).nullable().default(null),
  provider: z.enum(["youtube", "upload", "external"]),
  youtube_id: z.string().max(64).nullable().default(null),
  external_url: z.string().url().max(1000).nullable().default(null),
  storage_path: z.string().max(500).nullable().default(null),
  poster_url: z.string().max(1000).nullable().default(null),
  duration_seconds: z.number().int().min(0).max(60 * 60 * 8).nullable().default(null),
  transmission: z.enum(["any", "manual", "automatic"]).default("any"),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced", "test_ready"])
    .default("beginner"),
  tags: z.array(z.string().max(60)).max(30).default([]),
  topic_ids: z.array(z.string().uuid()).max(50).default([]),
  lesson_ids: z.array(z.string().uuid()).max(50).default([]),
  is_premium: z.boolean().default(true),
});

export const upsertAiVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertInput.parse(d))
  .handler(async ({ data, context }): Promise<AiVideoRow> => {
    const role = await loadRole(context.userId);
    if (!role.isAdmin && !role.isSenior) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.provider === "youtube" && !data.youtube_id)
      throw new Error("YouTube ID required");
    if (data.provider === "external" && !data.external_url)
      throw new Error("External URL required");
    if (data.provider === "upload" && !data.storage_path)
      throw new Error("Uploaded file required");

    const payload: Database["public"]["Tables"]["ai_videos"]["Insert"] = {
      title: data.title,
      description: data.description,
      provider: data.provider,
      youtube_id: data.youtube_id,
      external_url: data.external_url,
      storage_path: data.storage_path,
      poster_url: data.poster_url,
      duration_seconds: data.duration_seconds,
      transmission: data.transmission,
      difficulty: data.difficulty,
      tags: data.tags,
      topic_ids: data.topic_ids,
      lesson_ids: data.lesson_ids,
      is_premium: data.is_premium,
      uploaded_by: data.id ? undefined : context.userId,
      // Non-admins: force pending_review on any write (also enforced by DB trigger)
      status: role.isAdmin ? undefined : ("pending_review" as AiVideoStatus),
    };

    let row: Row | null = null;
    if (data.id) {
      const { data: updated, error } = await supabaseAdmin
        .from("ai_videos")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = updated as Row;
    } else {
      const { data: created, error } = await supabaseAdmin
        .from("ai_videos")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = created as Row;
    }
    const [enriched] = await enrich([row!]);
    return enriched;
  });

// -------------------- MODERATION --------------------

const moderateInput = z.object({
  id: z.string().uuid(),
  action: z.enum(["submit", "approve", "reject", "archive", "unarchive", "delete"]),
  reason: z.string().max(500).optional(),
});

export const moderateAiVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => moderateInput.parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const role = await loadRole(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("ai_videos")
      .select("id, uploaded_by, status")
      .eq("id", data.id)
      .maybeSingle();
    if (!existing) throw new Error("Not found");

    if (data.action === "submit") {
      if (existing.uploaded_by !== context.userId && !role.isAdmin)
        throw new Error("Forbidden");
      const { error } = await supabaseAdmin
        .from("ai_videos")
        .update({ status: "pending_review" })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (!role.isAdmin) throw new Error("Forbidden: admin only");
    // Admins cannot approve their own uploads (four-eyes principle)
    if (data.action === "approve" && existing.uploaded_by === context.userId)
      throw new Error("You cannot approve your own upload");

    if (data.action === "delete") {
      const { error } = await supabaseAdmin.from("ai_videos").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const patch: Partial<Row> = {};
    if (data.action === "approve") {
      patch.status = "approved";
      patch.rejection_reason = null;
    } else if (data.action === "reject") {
      patch.status = "rejected";
      patch.rejection_reason = data.reason ?? null;
    } else if (data.action === "archive") {
      patch.status = "archived";
    } else if (data.action === "unarchive") {
      patch.status = "pending_review";
    }
    const { error } = await supabaseAdmin
      .from("ai_videos")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------------------- UPLOAD (signed URL) --------------------

const uploadInput = z.object({
  filename: z.string().min(1).max(200),
  content_type: z.string().min(1).max(120),
  size: z.number().int().min(1).max(2 * 1024 * 1024 * 1024), // 2 GB cap
});

export const createAiVideoUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => uploadInput.parse(d))
  .handler(async ({ data, context }) => {
    const role = await loadRole(context.userId);
    if (!role.isAdmin && !role.isSenior) throw new Error("Forbidden");
    if (!/^video\//.test(data.content_type)) throw new Error("Only video files allowed");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `${context.userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safe}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

// -------------------- POSTER upload (small image) --------------------

const posterInput = z.object({
  filename: z.string().min(1).max(200),
  content_type: z.string().max(120),
  base64: z.string().min(20),
});

export const uploadAiVideoPoster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => posterInput.parse(d))
  .handler(async ({ data, context }) => {
    const role = await loadRole(context.userId);
    if (!role.isAdmin && !role.isSenior) throw new Error("Forbidden");
    if (!/^image\//.test(data.content_type)) throw new Error("Only images allowed");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const b64 = data.base64.includes(",") ? data.base64.split(",")[1] : data.base64;
    const buffer = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    if (buffer.byteLength > 4 * 1024 * 1024) throw new Error("Poster too large (max 4 MB)");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `${context.userId}/posters/${Date.now()}-${safe}`;
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: data.content_type, upsert: false });
    if (error) throw new Error(error.message);
    const { data: signed } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    return { path, url: signed?.signedUrl ?? null };
  });

// -------------------- VIEW COUNT --------------------

export const recordAiVideoView = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("increment_ai_video_view", { _video_id: data.id });
    return { ok: true };
  });

// -------------------- ROLE CONTEXT --------------------

export const getAiVideoRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await loadRole(context.userId);
    return { userId: context.userId, ...role };
  });