import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type ThemeTokens = {
  brand: {
    name: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
  };
  colors: Record<string, string>;
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: string;
    headingWeight: string;
  };
  buttons: {
    radius: string;
    weight: string;
    shadow: string;
    uppercase: boolean;
  };
  layout: {
    radius: string;
    containerMaxWidth: string;
    sectionSpacing: string;
    cardBorder: string;
    cardShadow: string;
  };
  header: {
    sticky: boolean;
    transparent: boolean;
    showTagline: boolean;
  };
  footer: {
    showSocial: boolean;
    showAreas: boolean;
    copyright: string;
  };
  mobile: {
    baseSize: string;
    sectionSpacing: string;
  };
};

export type ThemeSettings = {
  draft: Partial<ThemeTokens>;
  published: Partial<ThemeTokens>;
  updated_at: string;
};

// Public read of published theme — used by the site to apply live styling.
export const getPublishedTheme = createServerFn({ method: "GET" }).handler(
  async (): Promise<Partial<ThemeTokens>> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("theme_settings")
      .select("published")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return ((data?.published ?? {}) as Partial<ThemeTokens>);
  },
);

// Admin read — draft + published for the editor.
export const getThemeSettings = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }): Promise<ThemeSettings> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("theme_settings")
      .select("draft, published, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      draft: (row?.draft ?? {}) as Partial<ThemeTokens>,
      published: (row?.published ?? {}) as Partial<ThemeTokens>,
      updated_at: (row?.updated_at as string) ?? new Date().toISOString(),
    };
  });

export const saveThemeDraft = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ password: z.string(), draft: z.record(z.string(), z.any()) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("theme_settings")
      .update({ draft: data.draft })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const publishTheme = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Merge published <- published deep-merged with draft (draft wins where set).
    const { data: row } = await supabaseAdmin
      .from("theme_settings")
      .select("draft, published")
      .eq("id", 1)
      .maybeSingle();
    const draft = (row?.draft ?? {}) as Record<string, Record<string, unknown>>;
    const published = (row?.published ?? {}) as Record<string, Record<string, unknown>>;
    const merged: Record<string, unknown> = { ...published };
    for (const [k, v] of Object.entries(draft)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        merged[k] = { ...(published[k] ?? {}), ...(v as Record<string, unknown>) };
      } else {
        merged[k] = v as Record<string, unknown>;
      }
    }
    const { error } = await supabaseAdmin
      .from("theme_settings")
      .update({ published: merged as never, draft: {} })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true, published: merged as Partial<ThemeTokens> };
  });

export const resetThemeDraft = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("theme_settings")
      .update({ draft: {} })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Brand assets library ----------

export type BrandAsset = {
  id: string;
  name: string;
  url: string;
  kind: string;
  tags: string[];
  width: number | null;
  height: number | null;
  created_at: string;
};

export const listBrandAssets = createServerFn({ method: "GET" }).handler(
  async (): Promise<BrandAsset[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("brand_assets")
      .select("id, name, url, kind, tags, width, height, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      ...r,
      tags: (r.tags as string[] | null) ?? [],
    })) as BrandAsset[];
  },
);

export const uploadBrandAsset = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string(),
        name: z.string().trim().min(1).max(200),
        kind: z.string().trim().min(1).max(40).optional(),
        tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
        filename: z.string().min(1).max(200),
        content_type: z.string().min(1).max(80),
        base64: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<BrandAsset> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const b64 = data.base64.includes(",") ? data.base64.split(",", 2)[1] : data.base64;
    const buf = Buffer.from(b64, "base64");
    if (buf.length > 10 * 1024 * 1024) throw new Error("File too large (max 10 MB).");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `brand/${Date.now()}-${safe}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("content-images")
      .upload(path, buf, { contentType: data.content_type, upsert: true });
    if (upErr) throw new Error(upErr.message);
    // Sign URL with long TTL (~1 year).
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("content-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr) throw new Error(signErr.message);
    const url = signed?.signedUrl ?? "";
    const { data: row, error: insErr } = await supabaseAdmin
      .from("brand_assets")
      .insert({
        name: data.name,
        url,
        kind: data.kind ?? "image",
        tags: data.tags ?? [],
      })
      .select("id, name, url, kind, tags, width, height, created_at")
      .single();
    if (insErr) throw new Error(insErr.message);
    return { ...row, tags: (row.tags as string[] | null) ?? [] } as BrandAsset;
  });

export const deleteBrandAsset = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("brand_assets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateBrandAsset = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string(),
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(200).optional(),
        tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
        kind: z.string().trim().min(1).max(40).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { name?: string; tags?: string[]; kind?: string } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.tags !== undefined) patch.tags = data.tags;
    if (data.kind !== undefined) patch.kind = data.kind;
    const { error } = await supabaseAdmin.from("brand_assets").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });