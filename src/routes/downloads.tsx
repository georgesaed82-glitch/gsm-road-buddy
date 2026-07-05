import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listPublishedDownloads } from "@/lib/blog.functions";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads | GSM Driving School" },
      {
        name: "description",
        content:
          "Free driving guides, cheat sheets and study PDFs from GSM Driving School.",
      },
      { property: "og:title", content: "Downloads | GSM Driving School" },
      {
        property: "og:description",
        content: "Free downloadable driving guides and study PDFs.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.gsmdrivingschool.com/downloads" }],
  }),
  component: DownloadsPage,
});

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DownloadsPage() {
  const listFn = useServerFn(listPublishedDownloads);
  const { data: items = [] } = useQuery({
    queryKey: ["downloads-public"],
    queryFn: () => listFn(),
  });

  const grouped = new Map<string, typeof items>();
  for (const it of items) {
    const key = it.category || "General";
    const arr = grouped.get(key) ?? [];
    arr.push(it);
    grouped.set(key, arr);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Downloads</span>
      </nav>
      <h1 className="font-display text-3xl md:text-4xl">Downloads</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Free study PDFs, guides and cheat sheets.
      </p>

      {items.length === 0 && (
        <p className="mt-8 text-muted-foreground">No downloads yet — check back soon.</p>
      )}

      {Array.from(grouped.entries()).map(([category, list]) => (
        <section key={category} className="mt-8">
          <h2 className="font-display text-xl">{category}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {list.map((d) => (
              <Card key={d.id} className="border-border bg-card">
                <CardContent className="flex items-start gap-3 p-4">
                  <FileDown className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{d.title}</div>
                    {d.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {d.mime_type ? `${d.mime_type.split("/").pop()?.toUpperCase()} · ` : ""}
                      {formatSize(d.size_bytes)}
                    </div>
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                        download
                      >
                        Download →
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}