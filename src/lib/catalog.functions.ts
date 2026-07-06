import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type InstructorRow = {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
  rating: number | null;
  reviews: number | null;
  location: string | null;
  badges: string[];
  cta_href: string;
  image_path: string | null;
  image_url: string | null;
  order_index: number;
  enabled: boolean;
};

export type PackageRow = {
  id: string;
  name: string;
  duration: string;
  description: string;
  features: string[];
  cta_label: string;
  popular: boolean;
  order_index: number;
  enabled: boolean;
};

const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

async function signImage(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("content-images")
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

// ---------- Instructors ----------

export const listInstructors = createServerFn({ method: "GET" }).handler(
  async (): Promise<InstructorRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("instructors")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    const rows = await Promise.all(
      (data ?? []).map(async (r) => ({
        ...r,
        badges: r.badges ?? [],
        image_url: await signImage(r.image_path),
      })),
    );
    return rows as InstructorRow[];
  },
);

const instructorInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().max(80),
  bio: z.string().max(1000),
  initials: z.string().max(4),
  color: z.string().max(80),
  rating: z.number().min(0).max(5).nullable().optional(),
  reviews: z.number().int().min(0).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  badges: z.array(z.string().max(40)).max(10),
  cta_href: z.string().max(300),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertInstructor = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: instructorInput }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin.from("instructors").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("instructors")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteInstructor = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("instructors")
      .select("image_path")
      .eq("id", data.id)
      .maybeSingle();
    if (existing?.image_path) {
      await supabaseAdmin.storage.from("content-images").remove([existing.image_path]);
    }
    const { error } = await supabaseAdmin.from("instructors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderInstructors = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        order: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int() })).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const it of data.order) {
      const { error } = await supabaseAdmin
        .from("instructors")
        .update({ order_index: it.order_index })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const uploadInstructorImage = createServerFn({ method: "POST" })
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
  .handler(async ({ data }): Promise<{ image_path: string; image_url: string }> => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const b64 = data.base64.includes(",") ? data.base64.split(",", 2)[1] : data.base64;
    const buf = Buffer.from(b64, "base64");
    if (buf.length > 5 * 1024 * 1024) throw new Error("Image too large (max 5 MB).");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `instructor/${data.id}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("content-images")
      .upload(path, buf, { contentType: data.content_type, upsert: true });
    if (upErr) throw new Error(upErr.message);
    const { data: existing } = await supabaseAdmin
      .from("instructors")
      .select("image_path")
      .eq("id", data.id)
      .maybeSingle();
    if (existing?.image_path && existing.image_path !== path) {
      await supabaseAdmin.storage.from("content-images").remove([existing.image_path]);
    }
    const { error: updErr } = await supabaseAdmin
      .from("instructors")
      .update({ image_path: path })
      .eq("id", data.id);
    if (updErr) throw new Error(updErr.message);
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("content-images")
      .createSignedUrl(path, SIGNED_URL_TTL);
    if (signErr) throw new Error(signErr.message);
    return { image_path: path, image_url: signed?.signedUrl ?? "" };
  });

// ---------- Packages ----------

export const listPackages = createServerFn({ method: "GET" }).handler(
  async (): Promise<PackageRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("packages")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ ...r, features: r.features ?? [] })) as PackageRow[];
  },
);

const packageInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  duration: z.string().max(80),
  description: z.string().max(1000),
  features: z.array(z.string().max(200)).max(20),
  cta_label: z.string().max(80),
  popular: z.boolean(),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertPackage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: packageInput }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin.from("packages").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("packages")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderPackages = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        order: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int() })).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const it of data.order) {
      const { error } = await supabaseAdmin
        .from("packages")
        .update({ order_index: it.order_index })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });