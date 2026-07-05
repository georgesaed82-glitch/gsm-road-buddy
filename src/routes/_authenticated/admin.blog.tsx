import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2, Upload, X, Eye, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Markdown } from "@/components/Markdown";
import {
  listPosts,
  listCategories,
  upsertPost,
  deletePost,
  uploadPostCover,
  upsertCategory,
  deleteCategory,
  type BlogPostRow,
  type BlogCategoryRow,
} from "@/lib/blog.functions";
import { getAdminPassword } from "@/lib/admin-gate";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({ meta: [{ title: "Blog · Admin" }] }),
  component: BlogAdmin,
});

type Draft = Omit<BlogPostRow, "cover_image_url" | "category_slug" | "category_name" | "related_slugs"> & {
  relatedText: string;
};

function toDraft(r: BlogPostRow): Draft {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body_md: r.body_md,
    cover_image_path: r.cover_image_path,
    category_id: r.category_id,
    author_name: r.author_name,
    published: r.published,
    published_at: r.published_at,
    seo_title: r.seo_title,
    seo_description: r.seo_description,
    order_index: r.order_index,
    updated_at: r.updated_at,
    relatedText: (r.related_slugs ?? []).join(", "),
  };
}

const EMPTY: Draft = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body_md: "",
  cover_image_path: null,
  category_id: null,
  author_name: "",
  published: false,
  published_at: null,
  seo_title: null,
  seo_description: null,
  order_index: 0,
  updated_at: "",
  relatedText: "",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 200);
}

function BlogAdmin() {
  const qc = useQueryClient();
  const listPostsFn = useServerFn(listPosts);
  const listCatsFn = useServerFn(listCategories);
  const saveFn = useServerFn(upsertPost);
  const delFn = useServerFn(deletePost);
  const uploadFn = useServerFn(uploadPostCover);
  const saveCatFn = useServerFn(upsertCategory);
  const delCatFn = useServerFn(deleteCategory);

  const { data: posts = [] } = useQuery({ queryKey: ["blog-admin-posts"], queryFn: () => listPostsFn() });
  const { data: categories = [] } = useQuery({ queryKey: ["blog-admin-categories"], queryFn: () => listCatsFn() });

  const [editing, setEditing] = useState<Draft | null>(null);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["blog-admin-posts"] });
    qc.invalidateQueries({ queryKey: ["blog-admin-categories"] });
    qc.invalidateQueries({ queryKey: ["blog-posts-public"] });
    qc.invalidateQueries({ queryKey: ["blog-categories"] });
  };

  const openNew = () => {
    const max = posts.reduce((a, p) => Math.max(a, p.order_index ?? 0), 0);
    setEditing({ ...EMPTY, order_index: max + 1 });
  };

  const save = async () => {
    if (!editing) return;
    const password = getAdminPassword();
    if (!password) return toast.error("Admin password missing. Sign in via /auth?admin=1.");
    if (!editing.slug) editing.slug = slugify(editing.title);
    try {
      const related = editing.relatedText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await saveFn({
        data: {
          password,
          item: {
            id: editing.id || undefined,
            slug: editing.slug,
            title: editing.title,
            excerpt: editing.excerpt,
            body_md: editing.body_md,
            category_id: editing.category_id,
            author_name: editing.author_name,
            published: editing.published,
            published_at: editing.published_at,
            seo_title: editing.seo_title,
            seo_description: editing.seo_description,
            related_slugs: related,
            order_index: editing.order_index,
          },
        },
      });
      toast.success("Saved");
      setEditing((cur) => (cur ? { ...cur, id: res.id } : cur));
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    const password = getAdminPassword();
    if (!password) return toast.error("Admin password missing.");
    if (!confirm("Delete this post permanently?")) return;
    try {
      await delFn({ data: { password, id } });
      toast.success("Deleted");
      if (editing?.id === id) setEditing(null);
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const upload = async (file: File) => {
    if (!editing?.id) return toast.error("Save the post first, then upload a cover.");
    const password = getAdminPassword();
    if (!password) return toast.error("Admin password missing.");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await uploadFn({
          data: {
            password,
            id: editing.id,
            filename: file.name,
            content_type: file.type || "application/octet-stream",
            base64: (reader.result as string).split(",", 2)[1] ?? "",
          },
        });
        toast.success("Cover uploaded");
        setEditing((cur) => (cur ? { ...cur, cover_image_path: res.cover_image_path } : cur));
        invalidate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AdminShell title="Blog" eyebrow="Content">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: post list + categories */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div className="font-display text-lg">Posts</div>
              <Button size="sm" onClick={openNew}>
                <Plus className="mr-1 h-4 w-4" />
                New
              </Button>
            </CardHeader>
            <CardContent className="p-2">
              {posts.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">No posts yet.</p>
              )}
              <ul className="space-y-1">
                {posts.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setEditing(toDraft(p));
                        setPreview(false);
                      }}
                      className={`flex w-full items-start justify-between gap-2 border border-transparent px-3 py-2 text-left text-sm hover:bg-secondary ${editing?.id === p.id ? "border-primary bg-secondary" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.title || "(untitled)"}</div>
                        <div className="truncate text-xs text-muted-foreground">/{p.slug}</div>
                      </div>
                      <span
                        className={`shrink-0 border border-border px-1.5 py-0.5 text-[10px] uppercase ${p.published ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                      >
                        {p.published ? "Live" : "Draft"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <CategoryEditor
            categories={categories}
            onSave={async (item) => {
              const password = getAdminPassword();
              if (!password) return toast.error("Admin password missing.");
              try {
                await saveCatFn({ data: { password, item } });
                toast.success("Category saved");
                invalidate();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Save failed");
              }
            }}
            onDelete={async (id) => {
              const password = getAdminPassword();
              if (!password) return toast.error("Admin password missing.");
              if (!confirm("Delete category? Posts keep their content but lose the category link.")) return;
              try {
                await delCatFn({ data: { password, id } });
                toast.success("Deleted");
                invalidate();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Delete failed");
              }
            }}
          />
        </div>

        {/* Right: editor */}
        <div>
          {!editing && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select a post to edit or click <strong>New</strong> to create one.
              </CardContent>
            </Card>
          )}

          {editing && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
                <div className="font-display text-lg">
                  {editing.id ? "Edit post" : "New post"}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreview((v) => !v)}>
                    <Eye className="mr-1 h-4 w-4" />
                    {preview ? "Edit" : "Preview"}
                  </Button>
                  {editing.id && editing.published && (
                    <Link
                      to="/blog/$slug"
                      params={{ slug: editing.slug }}
                      target="_blank"
                      className="inline-flex items-center border border-border px-3 py-1.5 text-sm"
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      View
                    </Link>
                  )}
                  <Button size="sm" onClick={save}>
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                  {editing.id && (
                    <Button variant="destructive" size="sm" onClick={() => remove(editing.id)}>
                      <Trash2 className="mr-1 h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editing.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditing((cur) =>
                          cur
                            ? { ...cur, title, slug: cur.slug || slugify(title) }
                            : cur,
                        );
                      }}
                    />
                  </div>
                  <div>
                    <Label>URL slug</Label>
                    <Input
                      value={editing.slug}
                      onChange={(e) =>
                        setEditing((cur) => (cur ? { ...cur, slug: slugify(e.target.value) } : cur))
                      }
                    />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input
                      value={editing.author_name}
                      onChange={(e) =>
                        setEditing((cur) => (cur ? { ...cur, author_name: e.target.value } : cur))
                      }
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      className="mt-1 h-9 w-full border border-border bg-background px-2 text-sm"
                      value={editing.category_id ?? ""}
                      onChange={(e) =>
                        setEditing((cur) =>
                          cur ? { ...cur, category_id: e.target.value || null } : cur,
                        )
                      }
                    >
                      <option value="">(none)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Publish date</Label>
                    <Input
                      type="datetime-local"
                      value={
                        editing.published_at
                          ? new Date(editing.published_at).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditing((cur) =>
                          cur
                            ? {
                                ...cur,
                                published_at: e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : null,
                              }
                            : cur,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={editing.order_index}
                      onChange={(e) =>
                        setEditing((cur) =>
                          cur ? { ...cur, order_index: Number(e.target.value) || 0 } : cur,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={editing.published}
                    onCheckedChange={(v) =>
                      setEditing((cur) => (cur ? { ...cur, published: v } : cur))
                    }
                  />
                  <span className="text-sm">Published</span>
                </div>

                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    rows={2}
                    value={editing.excerpt}
                    onChange={(e) =>
                      setEditing((cur) => (cur ? { ...cur, excerpt: e.target.value } : cur))
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Body (Markdown)</Label>
                    <span className="text-xs text-muted-foreground">
                      Supports **bold**, ## headings, [links](url), lists, images ![alt](url), tables
                    </span>
                  </div>
                  {preview ? (
                    <div className="mt-1 min-h-[300px] border border-border p-4">
                      <Markdown>{editing.body_md || "*Nothing to preview.*"}</Markdown>
                    </div>
                  ) : (
                    <Textarea
                      rows={18}
                      className="font-mono text-sm"
                      value={editing.body_md}
                      onChange={(e) =>
                        setEditing((cur) => (cur ? { ...cur, body_md: e.target.value } : cur))
                      }
                    />
                  )}
                </div>

                <div>
                  <Label>Cover image</Label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload(f);
                        e.currentTarget.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                      disabled={!editing.id}
                    >
                      <Upload className="mr-1 h-4 w-4" />
                      {editing.cover_image_path ? "Replace" : "Upload"}
                    </Button>
                    {editing.cover_image_path && (
                      <span className="truncate text-xs text-muted-foreground">
                        {editing.cover_image_path}
                      </span>
                    )}
                    {!editing.id && (
                      <span className="text-xs text-muted-foreground">Save first, then upload.</span>
                    )}
                  </div>
                </div>

                <fieldset className="border border-border p-3">
                  <legend className="px-2 text-xs uppercase tracking-wider text-muted-foreground">
                    SEO
                  </legend>
                  <div className="space-y-2">
                    <div>
                      <Label>SEO title</Label>
                      <Input
                        value={editing.seo_title ?? ""}
                        onChange={(e) =>
                          setEditing((cur) =>
                            cur ? { ...cur, seo_title: e.target.value || null } : cur,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Meta description</Label>
                      <Textarea
                        rows={2}
                        value={editing.seo_description ?? ""}
                        onChange={(e) =>
                          setEditing((cur) =>
                            cur ? { ...cur, seo_description: e.target.value || null } : cur,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Related post slugs (comma-separated)</Label>
                      <Input
                        placeholder="how-to-pass-first-time, my-first-lesson"
                        value={editing.relatedText}
                        onChange={(e) =>
                          setEditing((cur) =>
                            cur ? { ...cur, relatedText: e.target.value } : cur,
                          )
                        }
                      />
                    </div>
                  </div>
                </fieldset>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function CategoryEditor({
  categories,
  onSave,
  onDelete,
}: {
  categories: BlogCategoryRow[];
  onSave: (item: { id?: string; slug: string; name: string; description: string | null; order_index: number }) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const [rows, setRows] = useState<BlogCategoryRow[]>(categories);
  const [newCat, setNewCat] = useState({ name: "", slug: "" });

  useEffect(() => setRows(categories), [categories]);

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="font-display text-lg">Categories</div>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {rows.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2">
            <Input
              value={c.name}
              onChange={(e) =>
                setRows((r) => r.map((x, j) => (i === j ? { ...x, name: e.target.value } : x)))
              }
            />
            <Input
              className="max-w-[140px]"
              value={c.slug}
              onChange={(e) =>
                setRows((r) => r.map((x, j) => (i === j ? { ...x, slug: e.target.value } : x)))
              }
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onSave({
                  id: c.id,
                  slug: c.slug,
                  name: c.name,
                  description: c.description ?? null,
                  order_index: c.order_index,
                })
              }
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2 border-t border-border pt-2">
          <Input
            placeholder="New category name"
            value={newCat.name}
            onChange={(e) =>
              setNewCat((n) => ({ ...n, name: e.target.value, slug: n.slug || slugify(e.target.value) }))
            }
          />
          <Input
            className="max-w-[140px]"
            placeholder="slug"
            value={newCat.slug}
            onChange={(e) => setNewCat((n) => ({ ...n, slug: slugify(e.target.value) }))}
          />
          <Button
            size="sm"
            onClick={async () => {
              if (!newCat.name || !newCat.slug) return;
              await onSave({
                slug: newCat.slug,
                name: newCat.name,
                description: null,
                order_index: rows.length,
              });
              setNewCat({ name: "", slug: "" });
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}