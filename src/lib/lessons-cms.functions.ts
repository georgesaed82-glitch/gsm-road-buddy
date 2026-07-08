import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type LessonStatus = "draft" | "published" | "hidden";

export type LessonRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tags: string[];
  image_url: string;
  video_url: string;
  pdf_url: string;
  duration_minutes: number | null;
  status: LessonStatus;
  show_web: boolean;
  show_app: boolean;
  sort_order: number;
  updated_at: string;
};

const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

function toRow(r: Record<string, unknown>): LessonRow {
  return {
    id: r.id as string,
    slug: (r.slug as string) ?? "",
    title: (r.title as string) ?? "",
    subtitle: (r.subtitle as string) ?? "",
    description: (r.description as string) ?? "",
    category: (r.category as string) ?? "General",
    tags: ((r.tags as string[] | null) ?? []) as string[],
    image_url: (r.image_url as string) ?? "",
    video_url: (r.video_url as string) ?? "",
    pdf_url: (r.pdf_url as string) ?? "",
    duration_minutes: (r.duration_minutes as number | null) ?? null,
    status: ((r.status as string) ?? "draft") as LessonStatus,
    show_web: (r.show_web as boolean) ?? true,
    show_app: (r.show_app as boolean) ?? true,
    sort_order: (r.sort_order as number) ?? 0,
    updated_at: (r.updated_at as string) ?? new Date().toISOString(),
  };
}

// Admin: list every lesson
export const listLessonsAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({}).parse(d))
  .handler(async ({ data }): Promise<LessonRow[]> => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("lessons")
      .select(
        "id, slug, title, subtitle, description, category, tags, image_url, video_url, pdf_url, duration_minutes, status, show_web, show_app, sort_order, updated_at",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => toRow(r as Record<string, unknown>));
  });

// Public: list lessons for a given surface (website or mobile app)
export const listPublicLessons = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ surface: z.enum(["web", "app"]).optional() }).parse(d ?? {}))
  .handler(async ({ data }): Promise<LessonRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const column = data.surface === "app" ? "show_app" : "show_web";
    const { data: rows, error } = await supabaseAdmin
      .from("lessons")
      .select(
        "id, slug, title, subtitle, description, category, tags, image_url, video_url, pdf_url, duration_minutes, status, show_web, show_app, sort_order, updated_at",
      )
      .eq("status", "published")
      .eq(column, true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => toRow(r as Record<string, unknown>));
  });

const lessonInput = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/i, "Slug must be url-safe (letters, digits, hyphens)"),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(400).optional(),
  description: z.string().trim().max(20000).optional(),
  category: z.string().trim().min(1).max(80),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  image_url: z.string().trim().max(2000).optional(),
  video_url: z.string().trim().max(2000).optional(),
  pdf_url: z.string().trim().max(2000).optional(),
  duration_minutes: z.number().int().min(0).max(600).nullable().optional(),
  status: z.enum(["draft", "published", "hidden"]).optional(),
  show_web: z.boolean().optional(),
  show_app: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const createLesson = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({}).merge(lessonInput).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Auto-assign sort_order to end of list if not given
    let sort = data.sort_order;
    if (sort === undefined) {
      const { data: maxRow } = await supabaseAdmin
        .from("lessons")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      sort = ((maxRow?.sort_order as number | null) ?? 0) + 10;
    }
    const { data: row, error } = await supabaseAdmin
      .from("lessons")
      .insert({
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle ?? "",
        description: data.description ?? "",
        category: data.category,
        tags: data.tags ?? [],
        image_url: data.image_url ?? "",
        video_url: data.video_url ?? "",
        pdf_url: data.pdf_url ?? "",
        duration_minutes: data.duration_minutes ?? null,
        status: data.status ?? "draft",
        show_web: data.show_web ?? true,
        show_app: data.show_app ?? true,
        sort_order: sort,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updateLesson = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).merge(lessonInput.partial()).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("lessons").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLessons = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lessons").delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const bulkUpdateLessons = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1).max(500),
        patch: z.object({
          category: z.string().trim().min(1).max(80).optional(),
          status: z.enum(["draft", "published", "hidden"]).optional(),
          show_web: z.boolean().optional(),
          show_app: z.boolean().optional(),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: {
      category?: string;
      status?: LessonStatus;
      show_web?: boolean;
      show_app?: boolean;
    } = {};
    if (data.patch.category !== undefined) patch.category = data.patch.category;
    if (data.patch.status !== undefined) patch.status = data.patch.status;
    if (data.patch.show_web !== undefined) patch.show_web = data.patch.show_web;
    if (data.patch.show_app !== undefined) patch.show_app = data.patch.show_app;
    if (!Object.keys(patch).length) return { ok: true };
    const { error } = await supabaseAdmin.from("lessons").update(patch).in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateLesson = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src, error } = await supabaseAdmin
      .from("lessons")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const suffix = `-copy-${Math.random().toString(36).slice(2, 7)}`;
    const insert = {
      slug: `${src.slug}${suffix}`.slice(0, 160),
      title: `${src.title} (copy)`,
      subtitle: src.subtitle,
      description: src.description,
      category: src.category,
      tags: src.tags,
      image_url: src.image_url,
      video_url: src.video_url,
      pdf_url: src.pdf_url,
      duration_minutes: src.duration_minutes,
      status: "draft" as const,
      show_web: src.show_web,
      show_app: src.show_app,
      sort_order: (src.sort_order as number) + 1,
    };
    const { data: row, error: insErr } = await supabaseAdmin
      .from("lessons")
      .insert(insert)
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    return { id: row.id as string };
  });

export const reorderLesson = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), direction: z.enum(["up", "down"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("lessons")
      .select("id, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as { id: string; sort_order: number }[];
    const idx = list.findIndex((r) => r.id === data.id);
    if (idx === -1) throw new Error("Lesson not found");
    const swap = data.direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= list.length) return { ok: true };
    const a = list[idx];
    const b = list[swap];
    await supabaseAdmin.from("lessons").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabaseAdmin.from("lessons").update({ sort_order: a.sort_order }).eq("id", b.id);
    return { ok: true };
  });

// Media uploads — image/video/pdf all go to content-images bucket under lessons/{id}/...
export const uploadLessonMedia = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        lesson_id: z.string().uuid(),
        kind: z.enum(["image", "video", "pdf"]),
        filename: z.string().min(1).max(200),
        content_type: z.string().min(1).max(120),
        base64: z.string().min(1),
      })
      .parse(d),
  )
  .handler(
    async ({ data }): Promise<{ url: string; column: "image_url" | "video_url" | "pdf_url" }> => {
      if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const b64 = data.base64.includes(",") ? data.base64.split(",", 2)[1] : data.base64;
      const buf = Buffer.from(b64, "base64");
      const limits: Record<typeof data.kind, number> = {
        image: 8 * 1024 * 1024,
        video: 100 * 1024 * 1024,
        pdf: 20 * 1024 * 1024,
      };
      if (buf.length > limits[data.kind])
        throw new Error(`File too large (max ${Math.round(limits[data.kind] / 1024 / 1024)} MB).`);
      const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
      const path = `lessons/${data.lesson_id}/${data.kind}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("content-images")
        .upload(path, buf, { contentType: data.content_type, upsert: true });
      if (upErr) throw new Error(upErr.message);
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from("content-images")
        .createSignedUrl(path, SIGNED_URL_TTL);
      if (signErr) throw new Error(signErr.message);
      const url = signed?.signedUrl ?? "";
      const column: "image_url" | "video_url" | "pdf_url" =
        data.kind === "image" ? "image_url" : data.kind === "video" ? "video_url" : "pdf_url";
      const patch =
        column === "image_url"
          ? { image_url: url }
          : column === "video_url"
            ? { video_url: url }
            : { pdf_url: url };
      await supabaseAdmin.from("lessons").update(patch).eq("id", data.lesson_id);
      return { url, column };
    },
  );
