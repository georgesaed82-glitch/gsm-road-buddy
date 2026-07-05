import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type SiteSettingsRow = { key: string; value: { [key: string]: JsonValue }; updated_at: string };
export type NavItemRow = {
  id: string;
  location: "header" | "footer-primary" | "footer-secondary" | "portal";
  label: string;
  href: string;
  order_index: number;
  enabled: boolean;
  icon: string | null;
  updated_at: string;
};
export type PageSeoRow = {
  route: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_path: string | null;
  canonical_override: string | null;
  noindex: boolean;
  updated_at: string;
};

// ---------- site_settings ----------
export const listSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettingsRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("key, value, updated_at");
    if (error) throw new Error(error.message);
    return (data ?? []) as SiteSettingsRow[];
  },
);

export type SiteRatingValue = { rating: number; review_count: number; show: boolean };
export const getSiteRating = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteRatingValue> => {
    const fallback: SiteRatingValue = { rating: 5.0, review_count: 143, show: true };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "site_rating")
        .maybeSingle();
      const v = (data?.value ?? {}) as Partial<SiteRatingValue>;
      return {
        rating: typeof v.rating === "number" ? v.rating : fallback.rating,
        review_count: typeof v.review_count === "number" ? v.review_count : fallback.review_count,
        show: v.show !== false,
      };
    } catch {
      return fallback;
    }
  },
);

export const upsertSiteSetting = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string(),
        key: z.string().min(1).max(60),
        value: z.record(z.string(), z.any()) as z.ZodType<{ [key: string]: JsonValue }>,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- nav_items ----------
export const listNavItems = createServerFn({ method: "GET" }).handler(
  async (): Promise<NavItemRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("nav_items")
      .select("id, location, label, href, order_index, enabled, icon, updated_at")
      .order("location")
      .order("order_index");
    if (error) throw new Error(error.message);
    return (data ?? []) as NavItemRow[];
  },
);

const navItemInput = z.object({
  id: z.string().uuid().optional(),
  location: z.enum(["header", "footer-primary", "footer-secondary", "portal"]),
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().min(1).max(300),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
  icon: z.string().trim().max(60).nullable().optional(),
});

export const saveNavItems = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string(),
        items: z.array(navItemInput).max(60),
        delete_ids: z.array(z.string().uuid()).max(60).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.delete_ids?.length) {
      const { error } = await supabaseAdmin.from("nav_items").delete().in("id", data.delete_ids);
      if (error) throw new Error(error.message);
    }
    for (const it of data.items) {
      const payload = {
        location: it.location,
        label: it.label,
        href: it.href,
        order_index: it.order_index,
        enabled: it.enabled,
        icon: it.icon ?? null,
      };
      if (it.id) {
        const { error } = await supabaseAdmin.from("nav_items").update(payload).eq("id", it.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabaseAdmin.from("nav_items").insert(payload);
        if (error) throw new Error(error.message);
      }
    }
    return { ok: true };
  });

// ---------- page_seo ----------
export const listPageSeo = createServerFn({ method: "GET" }).handler(
  async (): Promise<PageSeoRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("page_seo")
      .select("route, title, description, og_title, og_description, og_image_path, canonical_override, noindex, updated_at");
    if (error) throw new Error(error.message);
    return (data ?? []) as PageSeoRow[];
  },
);

export const upsertPageSeo = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string(),
        route: z.string().trim().min(1).max(200),
        title: z.string().trim().max(200).nullable().optional(),
        description: z.string().trim().max(400).nullable().optional(),
        og_title: z.string().trim().max(200).nullable().optional(),
        og_description: z.string().trim().max(400).nullable().optional(),
        og_image_path: z.string().trim().max(400).nullable().optional(),
        canonical_override: z.string().trim().max(400).nullable().optional(),
        noindex: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { password: _p, ...row } = data;
    const { error } = await supabaseAdmin.from("page_seo").upsert(row, { onConflict: "route" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePageSeo = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), route: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("page_seo").delete().eq("route", data.route);
    if (error) throw new Error(error.message);
    return { ok: true };
  });