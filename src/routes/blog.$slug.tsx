import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@/components/Markdown";
import { getPostBySlug, listPublishedPosts, type BlogPostRow } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const post = await context.queryClient.fetchQuery({
      queryKey: ["blog-post", params.slug],
      queryFn: () => getPostBySlug({ data: { slug: params.slug } }),
    });
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const title = post.seo_title || `${post.title} | GSM Driving School`;
    const desc = post.seo_description || post.excerpt;
    const url = `https://www.gsmdrivingschool.com/blog/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(post.cover_image_url
          ? [{ property: "og:image", content: post.cover_image_url }]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: desc,
            author: post.author_name || undefined,
            datePublished: post.published_at || undefined,
            image: post.cover_image_url || undefined,
          }),
        },
      ],
    };
  },
  component: PostPage,
  notFoundComponent: NotFoundPost,
  errorComponent: PostError,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const listFn = useServerFn(listPublishedPosts);
  const { data: all = [] } = useQuery({
    queryKey: ["blog-posts-public"],
    queryFn: () => listFn(),
  });

  const related: BlogPostRow[] = (() => {
    if (post.related_slugs.length) {
      return all.filter((p) => post.related_slugs.includes(p.slug));
    }
    return all
      .filter((p) => p.slug !== post.slug && p.category_id === post.category_id)
      .slice(0, 3);
  })();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/blog" className="hover:text-foreground">Blog</Link>
        {post.category_slug && post.category_name && (
          <>
            <span className="mx-2">/</span>
            <Link
              to="/blog"
              search={{ category: post.category_slug }}
              className="hover:text-foreground"
            >
              {post.category_name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{post.title}</span>
      </nav>

      {post.category_name && (
        <div className="text-[10px] uppercase tracking-[0.2em] text-accent">
          {post.category_name}
        </div>
      )}
      <h1 className="mt-1 font-display text-3xl md:text-4xl">{post.title}</h1>
      <div className="mt-3 text-sm text-muted-foreground">
        {post.author_name && <span>{post.author_name} · </span>}
        {post.published_at && (
          <time dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mt-6 aspect-[16/9] w-full border border-border object-cover"
        />
      )}

      {post.excerpt && (
        <p className="mt-6 text-lg text-foreground/80">{post.excerpt}</p>
      )}

      <div className="mt-6">
        <Markdown>{post.body_md}</Markdown>
      </div>

      {related.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl">Related articles</h2>
          <ul className="mt-4 space-y-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  className="text-primary hover:underline"
                >
                  {r.title}
                </Link>
                {r.excerpt && (
                  <p className="text-sm text-muted-foreground">{r.excerpt}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function NotFoundPost() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl">Article not found</h1>
      <p className="mt-2 text-muted-foreground">
        The article you're looking for doesn't exist or has been unpublished.
      </p>
      <Link to="/blog" className="mt-6 inline-block text-primary hover:underline">
        ← Back to the blog
      </Link>
    </div>
  );
}

function PostError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">We couldn't load this article.</p>
      <button onClick={reset} className="mt-4 border border-border px-4 py-2 text-sm">
        Try again
      </button>
    </div>
  );
}