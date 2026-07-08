import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type LegalPageRow = {
  slug: string;
  title: string;
  body_markdown: string;
  seo_title: string | null;
  seo_description: string | null;
  enabled: boolean;
  sort_order: number;
  updated_at: string;
};

export const listLegalPages = createServerFn({ method: "GET" }).handler(
  async (): Promise<LegalPageRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("legal_pages")
      .select(
        "slug, title, body_markdown, seo_title, seo_description, enabled, sort_order, updated_at",
      )
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as LegalPageRow[];
  },
);

export const getLegalPage = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(60) }).parse(d))
  .handler(async ({ data }): Promise<LegalPageRow | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("legal_pages")
      .select(
        "slug, title, body_markdown, seo_title, seo_description, enabled, sort_order, updated_at",
      )
      .eq("slug", data.slug)
      .eq("enabled", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as LegalPageRow | null;
  });

const upsertInput = z.object({
  item: z.object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .regex(/^[a-z0-9-]+$/),
    title: z.string().trim().min(1).max(160),
    body_markdown: z.string().max(200_000),
    seo_title: z.string().max(200).nullable().optional(),
    seo_description: z.string().max(400).nullable().optional(),
    enabled: z.boolean().default(true),
    sort_order: z.number().int().min(0).max(9999).default(0),
  }),
});

export const upsertLegalPage = createServerFn({ method: "POST" })
  .inputValidator((d) => upsertInput.parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("legal_pages")
      .upsert(data.item, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLegalPage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(60) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("legal_pages").delete().eq("slug", data.slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
