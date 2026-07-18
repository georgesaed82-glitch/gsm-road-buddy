import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type TheoryDifficulty = "easy" | "medium" | "hard";

export type TheoryQuestionRow = {
  id: string;
  source_id: string | null;
  category: string;
  tags: string[];
  difficulty: TheoryDifficulty;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  option_explanations: string[];
  image_path: string | null;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
  updated_at: string;
};

const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

type RawRow = Omit<TheoryQuestionRow, "image_url" | "difficulty" | "tags"> & {
  difficulty: string;
  tags: string[] | null;
};

async function withSignedUrls(rows: RawRow[]): Promise<TheoryQuestionRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const paths = rows.map((r) => r.image_path).filter((p): p is string => !!p);
  const map = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabaseAdmin.storage
      .from("content-images")
      .createSignedUrls(paths, SIGNED_URL_TTL);
    for (const s of data ?? []) if (s.path && s.signedUrl) map.set(s.path, s.signedUrl);
  }
  return rows.map((r) => ({
    ...r,
    tags: r.tags ?? [],
    difficulty: (r.difficulty as TheoryDifficulty) ?? "medium",
    image_url: r.image_path ? (map.get(r.image_path) ?? null) : null,
  }));
}

export const listTheoryQuestionsCms = createServerFn({ method: "GET" }).handler(
  async (): Promise<TheoryQuestionRow[]> => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("theory_questions")
      .select(
        "id, source_id, category, tags, difficulty, question, options, correct_index, explanation, option_explanations, image_path, is_published, sort_order, updated_at",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return withSignedUrls((data ?? []) as RawRow[]);
  },
);

// Public read: only published rows (used by the public site hook).
export const listPublicTheoryQuestions = createServerFn({ method: "GET" }).handler(
  async (): Promise<TheoryQuestionRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("theory_questions")
      .select(
        "id, source_id, category, tags, difficulty, question, options, correct_index, explanation, option_explanations, image_path, is_published, sort_order, updated_at",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return withSignedUrls((data ?? []) as RawRow[]);
  },
);

const questionInput = z.object({
  source_id: z.string().trim().min(1).max(120).nullable().optional(),
  category: z.string().trim().min(1).max(80),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  question: z.string().trim().min(1).max(4000),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
  correct_index: z.number().int().min(0).max(5),
  explanation: z.string().trim().max(4000).optional(),
  option_explanations: z.array(z.string().trim().max(2000)).max(6).optional(),
  image_path: z.string().trim().max(400).nullable().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const createTheoryQuestion = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({}).merge(questionInput).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.correct_index >= data.options.length) throw new Error("Correct index out of range.");
    const { error, data: row } = await supabaseAdmin
      .from("theory_questions")
      .insert({
        source_id: data.source_id ?? null,
        category: data.category,
        tags: data.tags ?? [],
        difficulty: data.difficulty ?? "medium",
        question: data.question,
        options: data.options,
        correct_index: data.correct_index,
        explanation: data.explanation ?? "",
        option_explanations: data.option_explanations ?? [],
        image_path: data.image_path ?? null,
        is_published: data.is_published ?? true,
        sort_order: data.sort_order ?? 0,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updateTheoryQuestion = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ id: z.string().uuid() }).merge(questionInput.partial()).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("theory_questions").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTheoryQuestions = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("theory_questions")
      .select("image_path")
      .in("id", data.ids);
    const paths = (existing ?? [])
      .map((r) => r.image_path as string | null)
      .filter((p): p is string => !!p);
    if (paths.length) await supabaseAdmin.storage.from("content-images").remove(paths);
    const { error } = await supabaseAdmin.from("theory_questions").delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const bulkUpdateTheoryQuestions = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1).max(500),
        patch: z.object({
          category: z.string().trim().min(1).max(80).optional(),
          difficulty: z.enum(["easy", "medium", "hard"]).optional(),
          is_published: z.boolean().optional(),
          tags_add: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
          tags_remove: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const simple: { category?: string; difficulty?: TheoryDifficulty; is_published?: boolean } = {};
    if (data.patch.category !== undefined) simple.category = data.patch.category;
    if (data.patch.difficulty !== undefined) simple.difficulty = data.patch.difficulty;
    if (data.patch.is_published !== undefined) simple.is_published = data.patch.is_published;
    if (Object.keys(simple).length) {
      const { error } = await supabaseAdmin
        .from("theory_questions")
        .update(simple)
        .in("id", data.ids);
      if (error) throw new Error(error.message);
    }
    if (data.patch.tags_add?.length || data.patch.tags_remove?.length) {
      const { data: rows, error } = await supabaseAdmin
        .from("theory_questions")
        .select("id, tags")
        .in("id", data.ids);
      if (error) throw new Error(error.message);
      const add = new Set(data.patch.tags_add ?? []);
      const rem = new Set(data.patch.tags_remove ?? []);
      for (const r of rows ?? []) {
        const tags = new Set(((r.tags as string[] | null) ?? []).filter((t) => !rem.has(t)));
        for (const t of add) tags.add(t);
        await supabaseAdmin
          .from("theory_questions")
          .update({ tags: [...tags] })
          .eq("id", r.id);
      }
    }
    return { ok: true };
  });

export const duplicateTheoryQuestion = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src, error: e1 } = await supabaseAdmin
      .from("theory_questions")
      .select(
        "category, tags, difficulty, question, options, correct_index, explanation, option_explanations, is_published, sort_order",
      )
      .eq("id", data.id)
      .single();
    if (e1) throw new Error(e1.message);
    const { error, data: row } = await supabaseAdmin
      .from("theory_questions")
      .insert({
        ...src,
        source_id: null,
        question: `${src.question} (copy)`,
        is_published: false,
        sort_order: (src.sort_order ?? 0) + 1,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const reorderTheoryQuestion = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), direction: z.enum(["up", "down"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cur, error } = await supabaseAdmin
      .from("theory_questions")
      .select("id, category, sort_order")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const asc = data.direction === "up";
    const { data: neighbours } = await supabaseAdmin
      .from("theory_questions")
      .select("id, sort_order")
      .eq("category", cur.category)
      .order("sort_order", { ascending: asc ? false : true })
      .limit(50);
    const neighbour = (neighbours ?? []).find((n) =>
      asc
        ? (n.sort_order as number) < (cur.sort_order as number)
        : (n.sort_order as number) > (cur.sort_order as number),
    );
    if (!neighbour) return { ok: true };
    await supabaseAdmin
      .from("theory_questions")
      .update({ sort_order: neighbour.sort_order })
      .eq("id", cur.id);
    await supabaseAdmin
      .from("theory_questions")
      .update({ sort_order: cur.sort_order })
      .eq("id", neighbour.id);
    return { ok: true };
  });

// Base64 image upload for a question.
export const uploadTheoryQuestionImage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        question_id: z.string().uuid(),
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
    const path = `theory/${data.question_id}/${Date.now()}-${safe}`;
    const { error } = await supabaseAdmin.storage
      .from("content-images")
      .upload(path, buf, { contentType: data.content_type, upsert: true });
    if (error) throw new Error(error.message);
    const { data: existing } = await supabaseAdmin
      .from("theory_questions")
      .select("image_path")
      .eq("id", data.question_id)
      .maybeSingle();
    if (existing?.image_path && existing.image_path !== path) {
      await supabaseAdmin.storage.from("content-images").remove([existing.image_path]);
    }
    await supabaseAdmin
      .from("theory_questions")
      .update({ image_path: path })
      .eq("id", data.question_id);
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("content-images")
      .createSignedUrl(path, SIGNED_URL_TTL);
    if (signErr) throw new Error(signErr.message);
    return { image_path: path, image_url: signed?.signedUrl ?? "" };
  });

// Bulk import — accepts an array of validated question rows from the client.
const importRow = questionInput.extend({ password: z.string().optional() }).omit({});
export const importTheoryQuestions = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ rows: z.array(importRow).min(1).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = data.rows.map((r) => ({
      source_id: r.source_id ?? null,
      category: r.category,
      tags: r.tags ?? [],
      difficulty: r.difficulty ?? "medium",
      question: r.question,
      options: r.options,
      correct_index: r.correct_index,
      explanation: r.explanation ?? "",
      option_explanations: r.option_explanations ?? [],
      is_published: r.is_published ?? true,
      sort_order: r.sort_order ?? 0,
    }));
    // Upsert on source_id when present, otherwise plain insert.
    const withSource = rows.filter((r) => r.source_id);
    const withoutSource = rows.filter((r) => !r.source_id);
    if (withSource.length) {
      const { error } = await supabaseAdmin
        .from("theory_questions")
        .upsert(withSource, { onConflict: "source_id" });
      if (error) throw new Error(error.message);
    }
    if (withoutSource.length) {
      const { error } = await supabaseAdmin.from("theory_questions").insert(withoutSource);
      if (error) throw new Error(error.message);
    }
    return { inserted: rows.length };
  });
