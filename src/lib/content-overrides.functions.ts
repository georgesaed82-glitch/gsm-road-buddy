import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type OverrideBlock = {
  title?: string;
  body?: string;
  aid?: string;
  rule?: string;
  note?: string;
  image_path?: string;
  image_url?: string;
};
export type OverrideData = {
  blocks?: OverrideBlock[];
  strings?: string[];
};

export type ContentKind =
  | "sign"
  | "marking"
  | "signal"
  | "highway"
  | "georges-tip"
  | "georges-principle"
  | "memory-tip"
  | "common-fail"
  | "review";

const KIND_VALUES = [
  "sign",
  "marking",
  "signal",
  "highway",
  "georges-tip",
  "georges-principle",
  "memory-tip",
  "common-fail",
  "review",
] as const;

export type ContentOverrideRow = {
  kind: ContentKind;
  item_id: string;
  name: string | null;
  description: string | null;
  group_slug: string | null;
  image_path: string | null;
  image_url: string | null;
  key_points: string[] | null;
  topics: string[] | null;
  data: OverrideData | null;
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
      .select(
        "kind, item_id, name, description, group_slug, image_path, key_points, topics, data, updated_at",
      );
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Array<Omit<ContentOverrideRow, "image_url">>;

    // Batch-sign every image_path in one pass — row-level AND block-level.
    const paths = new Set<string>();
    for (const r of rows) {
      if (r.image_path) paths.add(r.image_path);
      const blocks = (r.data as OverrideData | null)?.blocks;
      if (blocks) for (const b of blocks) if (b.image_path) paths.add(b.image_path);
    }
    const signedMap = new Map<string, string>();
    if (paths.size) {
      const { data: signed } = await supabaseAdmin.storage
        .from("content-images")
        .createSignedUrls([...paths], SIGNED_URL_TTL);
      for (const s of signed ?? []) {
        if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl);
      }
    }

    return rows.map((r) => {
      const data = r.data as OverrideData | null;
      const nextData: OverrideData | null = data?.blocks
        ? {
            ...data,
            blocks: data.blocks.map((b) => ({
              ...b,
              image_url: b.image_path ? signedMap.get(b.image_path) ?? null : b.image_url ?? null,
            })),
          }
        : data;
      return {
        ...r,
        data: nextData,
        image_url: r.image_path ? signedMap.get(r.image_path) ?? null : null,
      };
    });
  },
);

const upsertSchema = z.object({
  password: z.string(),
  kind: z.enum(KIND_VALUES),
  item_id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(300).nullable().optional(),
  description: z.string().trim().min(1).max(8000).nullable().optional(),
  group_slug: z.string().trim().min(1).max(60).nullable().optional(),
  image_path: z.string().trim().max(400).nullable().optional(),
  key_points: z.array(z.string().trim().min(1).max(1000)).max(40).nullable().optional(),
  topics: z.array(z.string().trim().min(1).max(120)).max(20).nullable().optional(),
  data: z.any().nullable().optional(),
});

export const upsertContentOverride = createServerFn({ method: "POST" })
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      kind: data.kind,
      item_id: data.item_id,
      name: data.name ?? null,
      description: data.description ?? null,
      group_slug: data.group_slug ?? null,
      image_path: data.image_path ?? null,
      key_points: data.key_points ?? null,
      topics: data.topics ?? null,
      data: data.data ?? null,
    };
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
      kind: z.enum(KIND_VALUES),
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
  kind: z.enum(KIND_VALUES),
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