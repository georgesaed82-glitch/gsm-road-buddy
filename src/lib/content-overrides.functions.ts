import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type ContentKind = "sign" | "marking" | "signal";

export type ContentOverrideRow = {
  kind: ContentKind;
  item_id: string;
  name: string | null;
  description: string | null;
  group_slug: string | null;
  image_path: string | null;
  image_url: string | null;
  updated_at: string;
};

// Long-lived signed URL so overrides stay valid across a session; the hook
// re-fetches after edits.
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

export const listContentOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentOverrideRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("content_overrides")
      .select("kind, item_id, name, description, group_slug, image_path, updated_at");
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Array<Omit<ContentOverrideRow, "image_url">>;

    // Batch-sign every image_path in one pass.
    const paths = rows.map((r) => r.image_path).filter((p): p is string => !!p);
    const signedMap = new Map<string, string>();
    if (paths.length) {
      const { data: signed } = await supabaseAdmin.storage
        .from("content-images")
        .createSignedUrls(paths, SIGNED_URL_TTL);
      for (const s of signed ?? []) {
        if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl);
      }
    }

    return rows.map((r) => ({
      ...r,
      image_url: r.image_path ? signedMap.get(r.image_path) ?? null : null,
    }));
  },
);

const upsertSchema = z.object({
  password: z.string(),
  kind: z.enum(["sign", "marking", "signal"]),
  item_id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(300).nullable().optional(),
  description: z.string().trim().min(1).max(4000).nullable().optional(),
  group_slug: z.string().trim().min(1).max(60).nullable().optional(),
  image_path: z.string().trim().max(400).nullable().optional(),
});

export const upsertContentOverride = createServerFn({ method: "POST" })
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row: Record<string, unknown> = { kind: data.kind, item_id: data.item_id };
    if (data.name !== undefined) row.name = data.name;
    if (data.description !== undefined) row.description = data.description;
    if (data.group_slug !== undefined) row.group_slug = data.group_slug;
    if (data.image_path !== undefined) row.image_path = data.image_path;
    const { error } = await supabaseAdmin
      .from("content_overrides")
      .upsert(row, { onConflict: "kind,item_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteContentOverride = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      kind: z.enum(["sign", "marking", "signal"]),
      item_id: z.string(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Remove any stored image too.
    const { data: existing } = await supabaseAdmin
      .from("content_overrides")
      .select("image_path")
      .eq("kind", data.kind)
      .eq("item_id", data.item_id)
      .maybeSingle();
    if (existing?.image_path) {
      await supabaseAdmin.storage.from("content-images").remove([existing.image_path]);
    }

    const { error } = await supabaseAdmin
      .from("content_overrides")
      .delete()
      .eq("kind", data.kind)
      .eq("item_id", data.item_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Accepts a base64-encoded image (data URL or plain base64) and stores it.
// Returns the storage path so the caller can upsert it onto the override.
const uploadSchema = z.object({
  password: z.string(),
  kind: z.enum(["sign", "marking", "signal"]),
  item_id: z.string().min(1).max(120),
  filename: z.string().min(1).max(200),
  content_type: z.string().min(1).max(80),
  base64: z.string().min(1),
});

export const uploadContentImage = createServerFn({ method: "POST" })
  .inputValidator((d) => uploadSchema.parse(d))
  .handler(async ({ data }): Promise<{ image_path: string; image_url: string }> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Strip a possible data-URL prefix.
    const b64 = data.base64.includes(",") ? data.base64.split(",", 2)[1] : data.base64;
    const buf = Buffer.from(b64, "base64");
    if (buf.length > 5 * 1024 * 1024) throw new Error("Image too large (max 5 MB).");

    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `${data.kind}/${data.item_id}/${Date.now()}-${safeName}`;

    const { error } = await supabaseAdmin.storage
      .from("content-images")
      .upload(path, buf, { contentType: data.content_type, upsert: true });
    if (error) throw new Error(error.message);

    // Delete any previous image on this item so storage doesn't grow forever.
    const { data: existing } = await supabaseAdmin
      .from("content_overrides")
      .select("image_path")
      .eq("kind", data.kind)
      .eq("item_id", data.item_id)
      .maybeSingle();
    if (existing?.image_path && existing.image_path !== path) {
      await supabaseAdmin.storage.from("content-images").remove([existing.image_path]);
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("content-images")
      .createSignedUrl(path, SIGNED_URL_TTL);
    if (signErr) throw new Error(signErr.message);
    return { image_path: path, image_url: signed?.signedUrl ?? "" };
  });