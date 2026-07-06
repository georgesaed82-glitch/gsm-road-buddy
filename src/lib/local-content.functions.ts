import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

// ---------- Types ----------

export type AreaRow = {
  id: string;
  slug: string;
  area: string;
  postcode: string;
  nearby_postcodes: string[];
  intro: string;
  highlights: string[];
  routes_text: string;
  faqs: { q: string; a: string }[];
  order_index: number;
  enabled: boolean;
};

export type ReviewRow = {
  id: string;
  name: string;
  note: string;
  quote: string;
  rating: number;
  order_index: number;
  enabled: boolean;
};

export type HazardClipRow = {
  id: string;
  slug: string;
  title: string;
  scenario: string;
  difficulty: string;
  duration_seconds: number;
  developing_hazard: string;
  order_index: number;
  enabled: boolean;
};

async function requireAdmin(password: string) {
  if (!(await verifyAdminPasswordServer(password))) throw new Error("Unauthorized");
}

// ---------- Areas ----------

export const listAreas = createServerFn({ method: "GET" }).handler(async (): Promise<AreaRow[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("areas")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...r,
    nearby_postcodes: (r.nearby_postcodes as string[]) ?? [],
    highlights: (r.highlights as string[]) ?? [],
    faqs: (r.faqs as { q: string; a: string }[]) ?? [],
  })) as AreaRow[];
});

const areaInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  area: z.string().trim().min(1).max(120),
  postcode: z.string().trim().min(1).max(20),
  nearby_postcodes: z.array(z.string().max(20)).max(20),
  intro: z.string().max(2000),
  highlights: z.array(z.string().max(400)).max(20),
  routes_text: z.string().max(2000),
  faqs: z.array(z.object({ q: z.string().max(300), a: z.string().max(2000) })).max(20),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertArea = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: areaInput }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin.from("areas").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("areas")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteArea = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("areas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderAreas = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        order: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int() })).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const it of data.order) {
      const { error } = await supabaseAdmin
        .from("areas")
        .update({ order_index: it.order_index })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Reviews ----------

export const listReviews = createServerFn({ method: "GET" }).handler(async (): Promise<ReviewRow[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRow[];
});

const reviewInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  note: z.string().max(200),
  quote: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertReview = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: reviewInput }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin.from("reviews").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("reviews")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderReviews = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        order: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int() })).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const it of data.order) {
      const { error } = await supabaseAdmin
        .from("reviews")
        .update({ order_index: it.order_index })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Hazard clips ----------

export const listHazardClips = createServerFn({ method: "GET" }).handler(
  async (): Promise<HazardClipRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("hazard_clips")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as HazardClipRow[];
  },
);

const hazardInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(200),
  scenario: z.string().max(500),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  duration_seconds: z.number().int().min(1).max(600),
  developing_hazard: z.string().max(500),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertHazardClip = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: hazardInput }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin.from("hazard_clips").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("hazard_clips")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteHazardClip = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("hazard_clips").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderHazardClips = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        order: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int() })).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const it of data.order) {
      const { error } = await supabaseAdmin
        .from("hazard_clips")
        .update({ order_index: it.order_index })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Seed defaults from static data files ----------

export const seedLocalContent = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        target: z.enum(["areas", "reviews", "hazard_clips", "all"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const results: Record<string, number> = {};

    if (data.target === "areas" || data.target === "all") {
      const { areas } = await import("@/data/areas");
      const { count } = await supabaseAdmin
        .from("areas")
        .select("id", { count: "exact", head: true });
      if (!count) {
        const rows = areas.map((a, i) => ({
          slug: a.slug,
          area: a.area,
          postcode: a.postcode,
          nearby_postcodes: a.nearbyPostcodes,
          intro: a.intro,
          highlights: a.highlights,
          routes_text: a.routes,
          faqs: a.faqs,
          order_index: i,
          enabled: true,
        }));
        const { error } = await supabaseAdmin.from("areas").insert(rows);
        if (error) throw new Error("Areas seed: " + error.message);
        results.areas = rows.length;
      } else {
        results.areas = 0;
      }
    }

    if (data.target === "reviews" || data.target === "all") {
      const { reviews } = await import("@/data/reviews");
      const { count } = await supabaseAdmin
        .from("reviews")
        .select("id", { count: "exact", head: true });
      if (!count) {
        const rows = reviews.map((r, i) => ({
          name: r.name,
          note: r.note,
          quote: r.quote,
          rating: 5,
          order_index: i,
          enabled: true,
        }));
        const { error } = await supabaseAdmin.from("reviews").insert(rows);
        if (error) throw new Error("Reviews seed: " + error.message);
        results.reviews = rows.length;
      } else {
        results.reviews = 0;
      }
    }

    if (data.target === "hazard_clips" || data.target === "all") {
      const { hazardClips } = await import("@/data/hazardClips");
      const { count } = await supabaseAdmin
        .from("hazard_clips")
        .select("id", { count: "exact", head: true });
      if (!count) {
        const rows = hazardClips.map((c, i) => ({
          slug: c.slug,
          title: c.title,
          scenario: c.scenario,
          difficulty: c.difficulty,
          duration_seconds: c.durationSeconds,
          developing_hazard: c.developingHazard,
          order_index: i,
          enabled: true,
        }));
        const { error } = await supabaseAdmin.from("hazard_clips").insert(rows);
        if (error) throw new Error("Hazard clips seed: " + error.message);
        results.hazard_clips = rows.length;
      } else {
        results.hazard_clips = 0;
      }
    }

    return { ok: true, inserted: results };
  });