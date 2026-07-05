import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type HomeSectionStatus = "draft" | "published" | "hidden";

export type HomeSectionRow = {
  id: string;
  section_key: string;
  section_type: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  background: string;
  layout: string;
  extra: Record<string, unknown>;
  status: HomeSectionStatus;
  show_web: boolean;
  show_app: boolean;
  sort_order: number;
  updated_at: string;
};

const SELECT_COLS =
  "id, section_key, section_type, eyebrow, title, subtitle, body, image_url, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background, layout, extra, status, show_web, show_app, sort_order, updated_at";

function toRow(r: Record<string, unknown>): HomeSectionRow {
  return {
    id: r.id as string,
    section_key: (r.section_key as string) ?? "",
    section_type: (r.section_type as string) ?? "custom",
    eyebrow: (r.eyebrow as string) ?? "",
    title: (r.title as string) ?? "",
    subtitle: (r.subtitle as string) ?? "",
    body: (r.body as string) ?? "",
    image_url: (r.image_url as string) ?? "",
    cta_primary_label: (r.cta_primary_label as string) ?? "",
    cta_primary_href: (r.cta_primary_href as string) ?? "",
    cta_secondary_label: (r.cta_secondary_label as string) ?? "",
    cta_secondary_href: (r.cta_secondary_href as string) ?? "",
    background: (r.background as string) ?? "default",
    layout: (r.layout as string) ?? "default",
    extra: ((r.extra as Record<string, unknown> | null) ?? {}) as Record<string, unknown>,
    status: ((r.status as string) ?? "published") as HomeSectionStatus,
    show_web: (r.show_web as boolean) ?? true,
    show_app: (r.show_app as boolean) ?? true,
    sort_order: (r.sort_order as number) ?? 0,
    updated_at: (r.updated_at as string) ?? new Date().toISOString(),
  };
}

// Public: list sections for a surface
export const listPublicHomeSections = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ surface: z.enum(["web", "app"]).optional() }).parse(d ?? {}))
  .handler(async ({ data }): Promise<HomeSectionRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const column = data.surface === "app" ? "show_app" : "show_web";
    const { data: rows, error } = await supabaseAdmin
      .from("home_sections")
      .select(SELECT_COLS)
      .eq("status", "published")
      .eq(column, true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => toRow(r as Record<string, unknown>));
  });

// Admin: list all
export const listHomeSectionsAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }): Promise<HomeSectionRow[]> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("home_sections")
      .select(SELECT_COLS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => toRow(r as Record<string, unknown>));
  });

const sectionInput = z.object({
  section_key: z.string().min(1).max(80),
  section_type: z.string().min(1).max(40).default("custom"),
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  body: z.string().default(""),
  image_url: z.string().default(""),
  cta_primary_label: z.string().default(""),
  cta_primary_href: z.string().default(""),
  cta_secondary_label: z.string().default(""),
  cta_secondary_href: z.string().default(""),
  background: z.string().default("default"),
  layout: z.string().default("default"),
  extra: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(["draft", "published", "hidden"]).default("draft"),
  show_web: z.boolean().default(true),
  show_app: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const createHomeSection = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), section: sectionInput }).parse(d))
  .handler(async ({ data }): Promise<HomeSectionRow> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("home_sections")
      .insert(data.section)
      .select(SELECT_COLS)
      .single();
    if (error) throw new Error(error.message);
    return toRow(row as Record<string, unknown>);
  });

export const updateHomeSection = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ password: z.string(), id: z.string().uuid(), patch: sectionInput.partial() }).parse(d),
  )
  .handler(async ({ data }): Promise<HomeSectionRow> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("home_sections")
      .update(data.patch)
      .eq("id", data.id)
      .select(SELECT_COLS)
      .single();
    if (error) throw new Error(error.message);
    return toRow(row as Record<string, unknown>);
  });

export const deleteHomeSection = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("home_sections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

export const duplicateHomeSection = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<HomeSectionRow> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src, error: e1 } = await supabaseAdmin
      .from("home_sections")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .single();
    if (e1 || !src) throw new Error(e1?.message ?? "Not found");
    const s = toRow(src as Record<string, unknown>);
    const suffix = Math.random().toString(36).slice(2, 7);
    const { data: row, error } = await supabaseAdmin
      .from("home_sections")
      .insert({
        section_key: `${s.section_key}-copy-${suffix}`,
        section_type: s.section_type,
        eyebrow: s.eyebrow,
        title: `${s.title} (copy)`,
        subtitle: s.subtitle,
        body: s.body,
        image_url: s.image_url,
        cta_primary_label: s.cta_primary_label,
        cta_primary_href: s.cta_primary_href,
        cta_secondary_label: s.cta_secondary_label,
        cta_secondary_href: s.cta_secondary_href,
        background: s.background,
        layout: s.layout,
        extra: s.extra as never,
        status: "draft",
        show_web: s.show_web,
        show_app: s.show_app,
        sort_order: s.sort_order + 1,
      })
      .select(SELECT_COLS)
      .single();
    if (error) throw new Error(error.message);
    return toRow(row as Record<string, unknown>);
  });

// Reorder: swap sort_order with neighbour (arrow up/down)
export const reorderHomeSection = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ password: z.string(), id: z.string().uuid(), direction: z.enum(["up", "down"]) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("home_sections")
      .select("id, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as Array<{ id: string; sort_order: number }>;
    const idx = list.findIndex((r) => r.id === data.id);
    if (idx === -1) throw new Error("Not found");
    const swapIdx = data.direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return { ok: true } as const;
    const a = list[idx];
    const b = list[swapIdx];
    // ensure distinct sort_order values
    const aOrder = a.sort_order;
    const bOrder = b.sort_order === a.sort_order ? a.sort_order + 1 : b.sort_order;
    const { error: e1 } = await supabaseAdmin
      .from("home_sections")
      .update({ sort_order: bOrder })
      .eq("id", a.id);
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await supabaseAdmin
      .from("home_sections")
      .update({ sort_order: aOrder })
      .eq("id", b.id);
    if (e2) throw new Error(e2.message);
    return { ok: true } as const;
  });

// Upload media into content-images bucket (shared with lessons CMS)
export const uploadHomeSectionMedia = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string(),
        filename: z.string(),
        content_type: z.string(),
        base64: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ url: string }> => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 20 * 1024 * 1024) throw new Error("File too large (max 20MB)");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `home-sections/${Date.now()}-${safe}`;
    const { error } = await supabaseAdmin.storage
      .from("content-images")
      .upload(path, bytes, { contentType: data.content_type, upsert: false });
    if (error) throw new Error(error.message);
    const { data: signed, error: e2 } = await supabaseAdmin.storage
      .from("content-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (e2 || !signed) throw new Error(e2?.message ?? "Failed to sign URL");
    return { url: signed.signedUrl };
  });