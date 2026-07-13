import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type MediaAsset = {
  path: string;
  name: string;
  size: number;
  mime: string | null;
  updated_at: string | null;
  created_at: string | null;
  url: string;
};

const BUCKET = "content-images";
const SIGN_TTL = 60 * 60 * 24 * 365; // 1 year

async function requireAdmin() {
  if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// Recursively walk a bucket prefix and return every file.
async function walk(
  sb: Awaited<ReturnType<typeof requireAdmin>>,
  prefix: string,
  out: Array<{ path: string; obj: Record<string, unknown> }>,
  depth = 0,
): Promise<void> {
  if (depth > 4) return;
  const { data, error } = await sb.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) throw new Error(error.message);
  for (const entry of data ?? []) {
    const isFile = (entry as { id: string | null }).id !== null;
    const p = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (isFile) {
      out.push({ path: p, obj: entry as unknown as Record<string, unknown> });
    } else {
      await walk(sb, p, out, depth + 1);
    }
  }
}

export const listMediaAssets = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({}).parse(d ?? {}))
  .handler(async (): Promise<MediaAsset[]> => {
    const sb = await requireAdmin();
    const files: Array<{ path: string; obj: Record<string, unknown> }> = [];
    await walk(sb, "", files);
    // sign urls in batches
    const paths = files.map((f) => f.path);
    const signed: Record<string, string> = {};
    // signBatch supports many paths at once
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      const { data, error } = await sb.storage.from(BUCKET).createSignedUrls(chunk, SIGN_TTL);
      if (error) throw new Error(error.message);
      for (const s of data ?? []) if (s.path && s.signedUrl) signed[s.path] = s.signedUrl;
    }
    return files
      .map((f) => {
        const meta = (f.obj.metadata as Record<string, unknown> | null) ?? {};
        return {
          path: f.path,
          name: (f.obj.name as string) ?? f.path,
          size: typeof meta.size === "number" ? meta.size : 0,
          mime: (meta.mimetype as string) ?? null,
          updated_at: (f.obj.updated_at as string | null) ?? null,
          created_at: (f.obj.created_at as string | null) ?? null,
          url: signed[f.path] ?? "",
        } satisfies MediaAsset;
      })
      .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  });

export const uploadMediaAsset = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        filename: z.string().min(1).max(200),
        content_type: z.string().min(1).max(120),
        base64: z.string().min(1),
        folder: z.string().max(80).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<MediaAsset> => {
    const sb = await requireAdmin();
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 20 * 1024 * 1024) throw new Error("File too large (max 20MB)");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const folder = (data.folder ?? "media-library").replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${folder}/${Date.now()}-${safe}`;
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: data.content_type, upsert: false });
    if (error) throw new Error(error.message);
    const { data: signed, error: e2 } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGN_TTL);
    if (e2 || !signed) throw new Error(e2?.message ?? "Failed to sign URL");
    return {
      path,
      name: safe,
      size: bytes.byteLength,
      mime: data.content_type,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      url: signed.signedUrl,
    };
  });

export const deleteMediaAsset = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ path: z.string().min(1) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sb = await requireAdmin();
    const { error } = await sb.storage.from(BUCKET).remove([data.path]);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

export const renameMediaAsset = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ path: z.string().min(1), new_name: z.string().min(1).max(200) })
      .parse(d),
  )
  .handler(async ({ data }): Promise<MediaAsset> => {
    const sb = await requireAdmin();
    const safe = data.new_name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const dir = data.path.includes("/") ? data.path.slice(0, data.path.lastIndexOf("/")) : "";
    const newPath = dir ? `${dir}/${safe}` : safe;
    if (newPath === data.path) {
      const { data: signed } = await sb.storage.from(BUCKET).createSignedUrl(newPath, SIGN_TTL);
      return {
        path: newPath,
        name: safe,
        size: 0,
        mime: null,
        updated_at: null,
        created_at: null,
        url: signed?.signedUrl ?? "",
      };
    }
    const { error } = await sb.storage.from(BUCKET).move(data.path, newPath);
    if (error) throw new Error(error.message);
    const { data: signed, error: e2 } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(newPath, SIGN_TTL);
    if (e2 || !signed) throw new Error(e2?.message ?? "Failed to sign URL");
    return {
      path: newPath,
      name: safe,
      size: 0,
      mime: null,
      updated_at: new Date().toISOString(),
      created_at: null,
      url: signed.signedUrl,
    };
  });