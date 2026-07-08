import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

export type BlogCategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order_index: number;
};

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  cover_image_path: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  category_slug: string | null;
  category_name: string | null;
  author_name: string;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  related_slugs: string[];
  order_index: number;
  updated_at: string;
};

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number;
  enabled: boolean;
};

export type DownloadRow = {
  id: string;
  title: string;
  description: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  category: string | null;
  order_index: number;
  enabled: boolean;
  url: string | null;
};

async function signCover(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("content-images")
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

async function signDownload(path: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("downloads")
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

// =============== CATEGORIES ===============
export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<BlogCategoryRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_categories")
      .select("id, slug, name, description, order_index")
      .order("order_index");
    if (error) throw new Error(error.message);
    return (data ?? []) as BlogCategoryRow[];
  },
);

const categoryInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "lowercase, digits, hyphens only"),
  name: z.string().trim().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  order_index: z.number().int().min(0).max(9999),
});

export const upsertCategory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: categoryInput }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin.from("blog_categories").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: ins, error } = await supabaseAdmin
      .from("blog_categories")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =============== POSTS ===============
async function shapePost(r: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  cover_image_path: string | null;
  category_id: string | null;
  author_name: string;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  related_slugs: string[] | null;
  order_index: number;
  updated_at: string;
  blog_categories?: { slug: string; name: string } | null;
}): Promise<BlogPostRow> {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    body_md: r.body_md ?? "",
    cover_image_path: r.cover_image_path,
    cover_image_url: await signCover(r.cover_image_path),
    category_id: r.category_id,
    category_slug: r.blog_categories?.slug ?? null,
    category_name: r.blog_categories?.name ?? null,
    author_name: r.author_name ?? "",
    published: r.published,
    published_at: r.published_at,
    seo_title: r.seo_title,
    seo_description: r.seo_description,
    related_slugs: r.related_slugs ?? [],
    order_index: r.order_index,
    updated_at: r.updated_at,
  };
}

const POST_SELECT =
  "id, slug, title, excerpt, body_md, cover_image_path, category_id, author_name, published, published_at, seo_title, seo_description, related_slugs, order_index, updated_at, blog_categories(slug, name)";

export const listPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<BlogPostRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select(POST_SELECT)
      .order("order_index")
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((r) => shapePost(r as never)));
  },
);

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<BlogPostRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select(POST_SELECT)
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((r) => shapePost(r as never)));
  },
);

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }): Promise<BlogPostRow | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("blog_posts")
      .select(POST_SELECT)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? shapePost(row as never) : null;
  });

const postInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "lowercase, digits, hyphens only"),
  title: z.string().trim().min(1).max(300),
  excerpt: z.string().max(500),
  body_md: z.string().max(200_000),
  category_id: z.string().uuid().nullable().optional(),
  author_name: z.string().max(120),
  published: z.boolean(),
  published_at: z.string().datetime().nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  related_slugs: z.array(z.string().max(200)).max(12),
  order_index: z.number().int().min(0).max(9999),
});

export const upsertPost = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: postInput }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    const payload = {
      ...rest,
      category_id: rest.category_id ?? null,
      published_at:
        rest.published && !rest.published_at
          ? new Date().toISOString()
          : (rest.published_at ?? null),
    };
    if (id) {
      const { error } = await supabaseAdmin.from("blog_posts").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: ins, error } = await supabaseAdmin
      .from("blog_posts")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const deletePost = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("cover_image_path")
      .eq("id", data.id)
      .maybeSingle();
    if (existing?.cover_image_path) {
      await supabaseAdmin.storage.from("content-images").remove([existing.cover_image_path]);
    }
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadPostCover = createServerFn({ method: "POST" })
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
  .handler(async ({ data }): Promise<{ cover_image_path: string; cover_image_url: string }> => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const b64 = data.base64.includes(",") ? data.base64.split(",", 2)[1] : data.base64;
    const buf = Buffer.from(b64, "base64");
    if (buf.length > 5 * 1024 * 1024) throw new Error("Image too large (max 5 MB).");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `blog/${data.id}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("content-images")
      .upload(path, buf, { contentType: data.content_type, upsert: true });
    if (upErr) throw new Error(upErr.message);
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("cover_image_path")
      .eq("id", data.id)
      .maybeSingle();
    if (existing?.cover_image_path && existing.cover_image_path !== path) {
      await supabaseAdmin.storage.from("content-images").remove([existing.cover_image_path]);
    }
    const { error: updErr } = await supabaseAdmin
      .from("blog_posts")
      .update({ cover_image_path: path })
      .eq("id", data.id);
    if (updErr) throw new Error(updErr.message);
    const { data: signed } = await supabaseAdmin.storage
      .from("content-images")
      .createSignedUrl(path, SIGNED_URL_TTL);
    return { cover_image_path: path, cover_image_url: signed?.signedUrl ?? "" };
  });

// =============== FAQs ===============
export const listFaqs = createServerFn({ method: "GET" }).handler(async (): Promise<FaqRow[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("id, question, answer, category, order_index, enabled")
    .order("order_index");
  if (error) throw new Error(error.message);
  return (data ?? []) as FaqRow[];
});

export const listPublishedFaqs = createServerFn({ method: "GET" }).handler(
  async (): Promise<FaqRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("faqs")
      .select("id, question, answer, category, order_index, enabled")
      .eq("enabled", true)
      .order("order_index");
    if (error) throw new Error(error.message);
    return (data ?? []) as FaqRow[];
  },
);

const faqInput = z.object({
  id: z.string().uuid().optional(),
  question: z.string().trim().min(1).max(300),
  answer: z.string().max(10_000),
  category: z.string().max(80).nullable().optional(),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertFaq = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: faqInput }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (id) {
      const { error } = await supabaseAdmin.from("faqs").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: ins, error } = await supabaseAdmin
      .from("faqs")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("faqs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =============== DOWNLOADS ===============
async function shapeDownload(r: {
  id: string;
  title: string;
  description: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  category: string | null;
  order_index: number;
  enabled: boolean;
}): Promise<DownloadRow> {
  return { ...r, url: await signDownload(r.storage_path) };
}

export const listDownloads = createServerFn({ method: "GET" }).handler(
  async (): Promise<DownloadRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("downloads")
      .select(
        "id, title, description, storage_path, mime_type, size_bytes, category, order_index, enabled",
      )
      .order("order_index");
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((r) => shapeDownload(r)));
  },
);

export const listPublishedDownloads = createServerFn({ method: "GET" }).handler(
  async (): Promise<DownloadRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("downloads")
      .select(
        "id, title, description, storage_path, mime_type, size_bytes, category, order_index, enabled",
      )
      .eq("enabled", true)
      .order("order_index");
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((r) => shapeDownload(r)));
  },
);

const downloadMetaInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(1000),
  category: z.string().max(80).nullable().optional(),
  order_index: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export const upsertDownloadMeta = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ item: downloadMetaInput }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data.item;
    if (!id) throw new Error("Upload a file first, then edit metadata.");
    const { error } = await supabaseAdmin.from("downloads").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { id };
  });

export const uploadDownloadFile = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        title: z.string().trim().min(1).max(200),
        description: z.string().max(1000).optional(),
        category: z.string().max(80).optional(),
        filename: z.string().min(1).max(200),
        content_type: z.string().min(1).max(120),
        base64: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ id: string }> => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const b64 = data.base64.includes(",") ? data.base64.split(",", 2)[1] : data.base64;
    const buf = Buffer.from(b64, "base64");
    if (buf.length > 20 * 1024 * 1024) throw new Error("File too large (max 20 MB).");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const path = `${Date.now()}-${safe}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("downloads")
      .upload(path, buf, { contentType: data.content_type, upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { data: ins, error } = await supabaseAdmin
      .from("downloads")
      .insert({
        title: data.title,
        description: data.description ?? "",
        category: data.category ?? null,
        storage_path: path,
        mime_type: data.content_type,
        size_bytes: buf.length,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const deleteDownload = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("downloads")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (existing?.storage_path) {
      await supabaseAdmin.storage.from("downloads").remove([existing.storage_path]);
    }
    const { error } = await supabaseAdmin.from("downloads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Slug list for sitemap (fast, published only)
export const listPublishedPostSlugs = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ slug: string; updated_at: string }[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true);
    if (error) throw new Error(error.message);
    return (data ?? []) as { slug: string; updated_at: string }[];
  },
);
