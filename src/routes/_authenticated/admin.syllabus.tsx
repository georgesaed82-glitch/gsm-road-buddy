import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { resolveSyllabus, syllabusCoverage } from "@/data/syllabus";

export const Route = createFileRoute("/_authenticated/admin/syllabus")({
  head: () => ({ meta: [{ title: "Syllabus coverage — GSM Admin" }] }),
  component: SyllabusPage,
});

function SyllabusPage() {
  const items = useMemo(() => resolveSyllabus(), []);
  const stats = useMemo(() => syllabusCoverage(), []);

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <AdminShell title="Syllabus coverage" eyebrow="Master curriculum">
      <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent">Overall</div>
            <div className="mt-1 font-display text-2xl">
              {stats.ready} of {stats.total} lessons built
            </div>
          </div>
          <div className="text-3xl font-semibold tabular-nums text-accent">{stats.pct}%</div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-accent transition-all" style={{ width: `${stats.pct}%` }} />
        </div>
      </div>

      <div className="space-y-6">
        {byCategory.map(([cat, list]) => {
          const ready = list.filter((i) => i.status === "ready").length;
          return (
            <section key={cat} className="rounded-xl border border-border bg-card shadow-sm">
              <header className="flex items-baseline justify-between gap-3 border-b border-border p-4">
                <h2 className="font-display text-lg">{cat}</h2>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {ready} / {list.length} built
                </div>
              </header>
              <ul className="divide-y divide-border">
                {list.map((item) => {
                  const ready = item.status === "ready";
                  const content = (
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {ready ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{item.title}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {item.key}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-[11px] uppercase tracking-wider">
                        {ready ? (
                          <span className="text-emerald-600">Built</span>
                        ) : (
                          <span className="text-muted-foreground">Planned</span>
                        )}
                      </div>
                    </div>
                  );
                  return (
                    <li key={item.key}>
                      {ready && item.lessonSlug ? (
                        <Link
                          to="/driving-clips/$slug"
                          params={{ slug: item.lessonSlug }}
                          className="block transition-colors hover:bg-secondary/40"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}