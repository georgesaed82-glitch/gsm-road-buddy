import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type StudentPassPhoto = {
  id: string;
  image_path: string | null;
  image_url: string | null;
  caption: string;
  order_index: number;
  enabled: boolean;
  created_at: string;
};

const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

async function resolveUrl(row: {
  image_url: string | null;
  image_path: string | null;
}): Promise<string | null> {
  if (row.image_url && row.image_url.trim().length > 0) return row.image_url;
  if (!row.image_path) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("content-images")
    .createSignedUrl(row.image_path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

type Row = {
  id: string;
  image_path: string | null;
  image_url: string | null;
  caption: string;
  order_index: number;
  enabled: boolean;
  created_at: string;
};

async function hydrate(rows: Row[]): Promise<StudentPassPhoto[]> {
  return Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      image_path: r.image_path,
      image_url: await resolveUrl(r),
      caption: r.caption,
      order_index: r.order_index,
      enabled: r.enabled,
      created_at: r.created_at,
    })),
  );
}

// Public list — enabled only, newest first (lower order_index wins,
// then most recently created).
export const listStudentPassPhotosPublic = createServerFn({ method: "GET" }).handler(
  async (): Promise<StudentPassPhoto[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("student_pass_photos")
      .select("id,image_path,image_url,caption,order_index,enabled,created_at")
      .eq("enabled", true)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return hydrate((data ?? []) as Row[]);
  },
);

// Admin list — everything, including hidden rows.
export const listStudentPassPhotosAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<StudentPassPhoto[]> => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("student_pass_photos")
      .select("id,image_path,image_url,caption,order_index,enabled,created_at")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return hydrate((data ?? []) as Row[]);
  },
);

const upsertInput = z.object({
  id: z.string().uuid().optional(),
  caption: z.string().max(200).default(""),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertStudentPassPhoto = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: upsertInput }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin
        .from("student_pass_photos")
        .update(rest)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("student_pass_photos")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteStudentPassPhoto = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("student_pass_photos")
      .select("image_path")
      .eq("id", data.id)
      .maybeSingle();
    if (existing?.image_path) {
      await supabaseAdmin.storage
        .from("content-images")
        .remove([existing.image_path]);
    }
    const { error } = await supabaseAdmin
      .from("student_pass_photos")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderStudentPassPhotos = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        order: z
          .array(z.object({ id: z.string().uuid(), order_index: z.number().int() }))
          .max(500),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const it of data.order) {
      const { error } = await supabaseAdmin
        .from("student_pass_photos")
        .update({ order_index: it.order_index })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const uploadStudentPassPhotoImage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        filename: z.string().min(1).max(200),
        content_type: z.string().min(1).max(80),
        base64: z.string().min(1),
      })
      .parse(d),
  )
  .handler(
    async ({ data }): Promise<{ image_path: string; image_url: string }> => {
      if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const b64 = data.base64.includes(",") ? data.base64.split(",", 2)[1] : data.base64;
      const buf = Buffer.from(b64, "base64");
      if (buf.length > 10 * 1024 * 1024) throw new Error("Image too large (max 10 MB).");
      const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const path = `student-pass/${data.id}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("content-images")
        .upload(path, buf, { contentType: data.content_type, upsert: true });
      if (upErr) throw new Error(upErr.message);
      const { data: existing } = await supabaseAdmin
        .from("student_pass_photos")
        .select("image_path")
        .eq("id", data.id)
        .maybeSingle();
      if (existing?.image_path && existing.image_path !== path) {
        await supabaseAdmin.storage.from("content-images").remove([existing.image_path]);
      }
      // When a fresh photo replaces an old CDN URL, clear it so image_path wins.
      const { error: updErr } = await supabaseAdmin
        .from("student_pass_photos")
        .update({ image_path: path, image_url: null })
        .eq("id", data.id);
      if (updErr) throw new Error(updErr.message);
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from("content-images")
        .createSignedUrl(path, SIGNED_URL_TTL);
      if (signErr) throw new Error(signErr.message);
      return { image_path: path, image_url: signed?.signedUrl ?? "" };
    },
  );