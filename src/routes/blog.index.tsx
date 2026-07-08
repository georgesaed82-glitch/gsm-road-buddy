import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listPublishedPosts, listCategories } from "@/lib/blog.functions";

const searchSchema = z.object({
  q: z.string().optional().catch(""),
  category: z.string().optional().catch(""),
});

export const Route = createFileRoute("/blog/")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Blog & Driving Tips | GSM Driving School" },
      {
        name: "description",
        content:
          "Advice, tips and news from GSM Driving School — practical guides to help you pass and drive with confidence.",
      },
      { property: "og:title", content: "Blog & Driving Tips | GSM Driving School" },
      {
        property: "og:description",
        content: "Practical driving guides, tips and news from GSM Driving School.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.gsmdrivingschool.com/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const navigate = useNavigate({ from: "/blog/" });
  const { q = "", category = "" } = useSearch({ from: "/blog/" });
  const listPostsFn = useServerFn(listPublishedPosts);
  const listCatsFn = useServerFn(listCategories);
  const { data: posts = [] } = useQuery({
    queryKey: ["blog-posts-public"],
    queryFn: () => listPostsFn(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => listCatsFn(),
  });

  const [search, setSearch] = useState(q);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (category && p.category_slug !== category) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.excerpt.toLowerCase().includes(needle) ||
        p.body_md.toLowerCase().includes(needle)
      );
    });
  }, [posts, q, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Blog</span>
      </nav>
      <h1 className="font-display text-3xl md:text-4xl">Blog & driving tips</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Advice, guides and news from the GSM team.
      </p>

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({
            search: (prev: { q?: string; category?: string }) => ({
              ...prev,
              q: search || undefined,
            }),
          });
        }}
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles…"
          className="sm:max-w-sm"
        />
        <button
          type="submit"
          className="border border-border bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Search
        </button>
        {(q || category) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              navigate({ search: {} });
            }}
            className="border border-border px-4 py-2 text-sm"
          >
            Clear
          </button>
        )}
      </form>

      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/blog"
            search={{ q: q || undefined }}
            className={`border border-border px-3 py-1 text-xs uppercase tracking-wider ${!category ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/blog"
              search={{ q: q || undefined, category: c.slug }}
              className={`border border-border px-3 py-1 text-xs uppercase tracking-wider ${category === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full text-muted-foreground">No articles found.</p>
        )}
        {filtered.map((p) => (
          <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group">
            <Card className="h-full overflow-hidden border-border bg-card transition-colors group-hover:border-primary">
              {p.cover_image_url && (
                <img
                  src={p.cover_image_url}
                  alt={p.title}
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
              )}
              <CardContent className="p-5">
                {p.category_name && (
                  <div className="text-[10px] uppercase tracking-[0.2em] text-accent">
                    {p.category_name}
                  </div>
                )}
                <h2 className="mt-1 font-display text-lg text-foreground group-hover:text-primary">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  {p.author_name && <span>{p.author_name} · </span>}
                  {p.published_at && (
                    <time dateTime={p.published_at}>
                      {new Date(p.published_at).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
