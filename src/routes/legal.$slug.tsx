import { createFileRoute, notFound } from "@tanstack/react-router";
import { Markdown } from "@/components/Markdown";
import { getLegalPage } from "@/lib/legal-pages.functions";

export const Route = createFileRoute("/legal/$slug")({
  loader: async ({ params }) => {
    const page = await getLegalPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.page;
    const title = p.seo_title ?? `${p.title} | GSM Driving School`;
    const description = p.seo_description ?? `${p.title} for GSM Driving School.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LegalPage,
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p className="mt-2 text-muted-foreground">This legal page hasn't been published yet.</p>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
    </main>
  ),
});

function LegalPage() {
  const { page } = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <article className="prose prose-slate max-w-none">
        <h1 className="font-display text-3xl md:text-4xl">{page.title}</h1>
        <p className="text-xs text-muted-foreground">
          Last updated {new Date(page.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <Markdown>{page.body_markdown}</Markdown>
      </article>
    </main>
  );
}