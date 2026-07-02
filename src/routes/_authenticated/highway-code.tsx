import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { theoryCategories } from "@/data/theory";
import { BookOpen, Bookmark, BookmarkCheck, Check, CheckCircle2 } from "lucide-react";
import { HighwayCodeEssentials } from "@/components/HighwayCodeEssentials";
import { useTopicProgress } from "@/hooks/useTopicProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/highway-code")({
  head: () => ({ meta: [{ title: "Highway Code · GSM" }] }),
  component: HighwayCodePage,
});

function HighwayCodePage() {
  const { studied, bookmarked, toggleStudied, toggleBookmark, isStudied, isBookmarked } =
    useTopicProgress();
  const [filter, setFilter] = useState<"all" | "bookmarks" | "unstudied">("all");

  const visible = useMemo(() => {
    if (filter === "bookmarks") return theoryCategories.filter((c) => bookmarked.has(c.slug));
    if (filter === "unstudied") return theoryCategories.filter((c) => !studied.has(c.slug));
    return theoryCategories;
  }, [filter, bookmarked, studied]);

  const studiedCount = studied.size;
  const total = theoryCategories.length;
  const pct = Math.round((studiedCount / total) * 100);

  return (
    <PortalShell eyebrow="Reference" title="The Highway Code — key points">
      <p className="max-w-2xl text-sm text-muted-foreground">
        The essentials from all 14 DVSA topics, distilled into the things you
        actually need to remember. Skim before a lesson, revise before a test.
      </p>

      <div className="mt-8">
        <HighwayCodeEssentials />
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent">The 14 DVSA topics</div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl">All topics — key points</h2>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{studiedCount}</span> of {total} studied · {pct}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>

        {/* Filter chips */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {(
            [
              { id: "all", label: `All (${total})` },
              { id: "bookmarks", label: `Bookmarked (${bookmarked.size})` },
              { id: "unstudied", label: `Not yet studied (${total - studiedCount})` },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "border px-3 py-1.5 transition-colors",
                filter === f.id
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.map((c) => {
          const done = isStudied(c.slug);
          const marked = isBookmarked(c.slug);
          return (
            <div
              key={c.slug}
              className={cn(
                "relative border bg-card p-6 transition-colors",
                done ? "border-accent/60" : "border-border",
              )}
            >
              {done && (
                <div className="absolute right-0 top-0 flex items-center gap-1 bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                  <Check className="h-3 w-3" /> Studied
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-accent" />
                  {c.topics.join(" · ")}
                </div>
                <button
                  type="button"
                  onClick={() => toggleBookmark(c.slug)}
                  aria-pressed={marked}
                  aria-label={marked ? `Remove bookmark from ${c.title}` : `Bookmark ${c.title}`}
                  title={marked ? "Remove bookmark" : "Bookmark this topic"}
                  className={cn(
                    "shrink-0 rounded-sm p-1 transition-colors",
                    marked ? "text-accent" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {marked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
              <h3 className="mt-2 font-display text-xl">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {c.keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-border pt-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleStudied(c.slug)}
                    className="h-4 w-4 accent-[color:var(--accent)]"
                  />
                  <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>
                    {done ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-accent" /> Marked as studied
                      </span>
                    ) : (
                      "Mark as studied"
                    )}
                  </span>
                </label>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="col-span-full border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {filter === "bookmarks"
              ? "No bookmarks yet. Tap the bookmark icon on a topic to save it here."
              : "Nothing to show — you've studied every topic. 🎉"}
          </div>
        )}
      </div>
    </PortalShell>
  );
}