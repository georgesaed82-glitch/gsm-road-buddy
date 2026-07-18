import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Loader2, Lock, PlayCircle,
  BookOpen, ClipboardCheck, Video as VideoIcon,
} from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getLessonViewer, saveLessonProgress, markLessonComplete,
  type LessonBlockView, type LessonViewerData,
} from "@/lib/lesson-viewer.functions";
import type { AiVideoRow } from "@/lib/ai-videos.functions";

export const Route = createFileRoute("/_authenticated/gsm-plus/lesson/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson · GSM Plus" }] }),
  component: LessonViewerPage,
});

function LessonViewerPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(getLessonViewer);
  const saveFn = useServerFn(saveLessonProgress);
  const completeFn = useServerFn(markLessonComplete);

  const q = useQuery({
    queryKey: ["lesson-viewer", lessonId],
    queryFn: () => getFn({ data: { lesson_id: lessonId } }),
  });

  const save = useMutation({
    mutationFn: (v: { last_block_id?: string | null; progress_pct?: number; quiz_state?: Record<string, string | number | boolean | null> }) =>
      saveFn({ data: { lesson_id: lessonId, ...v } }),
  });

  const complete = useMutation({
    mutationFn: () => completeFn({ data: { lesson_id: lessonId } }),
    onSuccess: () => {
      toast.success("Lesson marked complete");
      qc.invalidateQueries({ queryKey: ["lesson-viewer", lessonId] });
      qc.invalidateQueries({ queryKey: ["portal-lessons"] });
      qc.invalidateQueries({ queryKey: ["portal-progress"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to mark complete"),
  });

  if (q.isLoading || !q.data) {
    return (
      <PortalShell title="Loading lesson…" eyebrow="GSM Plus">
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading lesson…
        </div>
      </PortalShell>
    );
  }
  return <LessonContent data={q.data} save={save} complete={complete} onNext={(id) => navigate({ to: "/gsm-plus/lesson/$lessonId", params: { lessonId: id } })} />;
}

function LessonContent({
  data,
  save,
  complete,
  onNext,
}: {
  data: LessonViewerData;
  save: ReturnType<typeof useMutation<unknown, unknown, { last_block_id?: string | null; progress_pct?: number; quiz_state?: Record<string, string | number | boolean | null> }>>;
  complete: ReturnType<typeof useMutation<unknown, unknown, void>>;
  onNext: (id: string) => void;
}) {
  const { lesson, topic, module: mod, blocks, progress, prev, next } = data;
  const isCompleted = progress?.status === "completed";

  // Auto-scroll to last-visited block on load
  const containerRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  useEffect(() => {
    if (!progress?.last_block_id) return;
    const el = blockRefs.current.get(progress.last_block_id);
    if (el) {
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  // Run once when data loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track "seen" blocks via intersection observer for auto-save
  const [seen, setSeen] = useState<Set<string>>(new Set(progress?.last_block_id ? [progress.last_block_id] : []));
  const seenIdsRef = useRef<Set<string>>(seen);
  seenIdsRef.current = seen;
  const savedPctRef = useRef<number>(progress?.progress_pct ?? 0);
  const total = blocks.length;

  useEffect(() => {
    if (blocks.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        let latestVisible: string | null = null;
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.blockId;
            if (id) {
              if (!seenIdsRef.current.has(id)) {
                seenIdsRef.current.add(id);
                setSeen(new Set(seenIdsRef.current));
              }
              latestVisible = id;
            }
          }
        }
        if (latestVisible && !isCompleted) {
          const pct = Math.min(100, Math.round((seenIdsRef.current.size / total) * 100));
          // Only auto-save when % advances by at least 5 to avoid chattiness
          if (pct >= savedPctRef.current + 5 || pct === 100) {
            savedPctRef.current = pct;
            save.mutate({ last_block_id: latestVisible, progress_pct: pct });
          } else {
            // Still update last_block_id occasionally (debounced by mutation queue)
            save.mutate({ last_block_id: latestVisible });
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 },
    );
    for (const el of blockRefs.current.values()) io.observe(el);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length]);

  const registerRef = (id: string) => (el: HTMLElement | null) => {
    if (el) blockRefs.current.set(id, el);
    else blockRefs.current.delete(id);
  };

  const readingPct = useMemo(
    () => Math.min(100, Math.round(((seen.size || (progress?.progress_pct ? total * (progress.progress_pct / 100) : 0)) / Math.max(total, 1)) * 100)),
    [seen, total, progress?.progress_pct],
  );

  // Quiz state (in-memory + auto-save on submit)
  const initialQuiz = (progress?.quiz_state ?? {}) as Record<string, string | number | boolean | null>;
  const [quiz, setQuiz] = useState<Record<string, string | number | boolean | null>>(initialQuiz);
  const submitQuiz = (blockId: string, correct: boolean, choice: number) => {
    const next = { ...quiz, [blockId]: correct ? "correct" : "wrong", [`${blockId}__choice`]: choice };
    setQuiz(next);
    save.mutate({ quiz_state: next });
  };

  return (
    <PortalShell title={lesson.title} eyebrow={`Module ${mod.module_number} · ${topic.title}`}>
      {/* Header actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild size="sm" variant="ghost" className="gap-1">
          <Link to="/gsm-plus">
            <ArrowLeft className="h-4 w-4" /> Back to GSM Plus
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Badge className="gap-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Circle className="h-3.5 w-3.5" /> {readingPct}% read
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Reading progress</span>
          <span>
            {seen.size} / {total} sections
          </span>
        </div>
        <Progress value={readingPct} className="mt-2" />
      </div>

      {/* Blocks */}
      <div ref={containerRef} className="space-y-6">
        {blocks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            This lesson has no content yet. Please check back soon.
          </div>
        )}
        {blocks.map((b, i) => (
          <BlockRenderer
            key={b.id}
            block={b}
            index={i + 1}
            registerRef={registerRef(b.id)}
            quiz={quiz}
            onQuizSubmit={submitQuiz}
          />
        ))}
      </div>

      {/* Footer: complete + prev/next */}
      <div className="mt-8 grid gap-3 rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-5 sm:grid-cols-3 sm:items-center">
        <div>
          {prev ? (
            <Button asChild variant="outline" className="w-full gap-1">
              <Link to="/gsm-plus/lesson/$lessonId" params={{ lessonId: prev.id }}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>

        <div className="sm:text-center">
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-900">
              <CheckCircle2 className="h-4 w-4" /> Lesson complete
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full gap-2 sm:w-auto"
              disabled={complete.isPending}
              onClick={() => complete.mutate()}
            >
              {complete.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )}
              Mark as complete
            </Button>
          )}
        </div>

        <div>
          {next ? (
            next.unlocked ? (
              <Button
                className="w-full gap-1"
                onClick={() => onNext(next.id)}
              >
                Next lesson <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="w-full gap-1" variant="secondary" disabled title="Complete this lesson to unlock the next one">
                <Lock className="h-4 w-4" /> Next locked
              </Button>
            )
          ) : (
            <div className="text-center text-xs text-muted-foreground sm:text-right">
              🎉 Last lesson in this topic
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

/* ------------------------------ Blocks ------------------------------ */

type PayloadObj = Record<string, unknown>;
function asObj(v: unknown): PayloadObj {
  return v && typeof v === "object" ? (v as PayloadObj) : {};
}
function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function BlockRenderer({
  block, index, registerRef, quiz, onQuizSubmit,
}: {
  block: LessonBlockView;
  index: number;
  registerRef: (el: HTMLElement | null) => void;
  quiz: Record<string, string | number | boolean | null>;
  onQuizSubmit: (blockId: string, correct: boolean, choice: number) => void;
}) {
  const payload = asObj(block.payload);
  const title = asStr(payload.title) ?? undefined;
  const body = asStr(payload.body) ?? asStr(payload.content) ?? asStr(payload.text) ?? null;

  const isVideo = block.kind === "ai_video" || block.kind === "video";
  const isQuiz = block.kind === "quiz" || block.kind === "quiz_true_false";
  const isCallout =
    block.kind === "callout" || block.kind === "gsm_method_callout" ||
    block.kind === "instructor_note" || block.kind === "driving_test_tip" ||
    block.kind === "highway_code_rule" || block.kind === "summary";

  return (
    <section
      ref={registerRef}
      data-block-id={block.id}
      className="scroll-mt-24 rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-6"
    >
      <header className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-widest text-accent">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {index}
        </span>
        <KindIcon kind={block.kind} />
        <span>{prettyKind(block.kind)}</span>
      </header>

      {title && (
        <h3 className="font-display text-xl font-semibold text-primary sm:text-2xl">{title}</h3>
      )}

      {/* Attached videos come first inside a video block, so students watch before reading */}
      {isVideo && block.videos.length > 0 && (
        <div className="mt-3 space-y-4">
          {block.videos.map((v) => (
            <VideoPlayer key={v.id} v={v} />
          ))}
        </div>
      )}

      {isCallout ? (
        <div className="mt-3 rounded-2xl border border-accent/40 bg-accent/5 p-4 text-sm leading-relaxed text-foreground">
          {body ?? "—"}
        </div>
      ) : body ? (
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
          {body}
        </div>
      ) : null}

      {/* Image / diagram / animation payload with an image URL */}
      {(block.kind === "image" || block.kind === "diagram" || block.kind === "animation") && (
        <BlockImage payload={payload} />
      )}

      {/* Any non-video block can still have attached videos as supplementary */}
      {!isVideo && block.videos.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent">
            Watch
          </div>
          {block.videos.map((v) => (
            <VideoPlayer key={v.id} v={v} />
          ))}
        </div>
      )}

      {isQuiz && (
        <QuizBlock
          blockId={block.id}
          payload={payload}
          answer={quiz[block.id]}
          choice={typeof quiz[`${block.id}__choice`] === "number" ? (quiz[`${block.id}__choice`] as number) : null}
          onSubmit={(correct, choiceIdx) => onQuizSubmit(block.id, correct, choiceIdx)}
        />
      )}
    </section>
  );
}

function VideoPlayer({ v }: { v: AiVideoRow }) {
  const url = v.video_url;
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        Video unavailable
      </div>
    );
  }
  const isYouTube = v.provider === "youtube";
  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <div className="aspect-video">
        {isYouTube ? (
          <iframe
            src={url}
            title={v.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            controls
            playsInline
            className="h-full w-full"
            preload="metadata"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-primary-foreground">
        <span className="truncate font-semibold">{v.title}</span>
        <span className="shrink-0 text-primary-foreground/70">
          {v.difficulty ? String(v.difficulty) : ""}
        </span>
      </div>
    </div>
  );
}

function BlockImage({ payload }: { payload: PayloadObj }) {
  const url = asStr(payload.url) ?? asStr(payload.image_url) ?? asStr(payload.src);
  const caption = asStr(payload.caption) ?? asStr(payload.alt);
  if (!url) return null;
  return (
    <figure className="mt-3">
      <img
        src={url}
        alt={caption ?? ""}
        className="w-full rounded-xl border border-border/60 object-contain"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

function QuizBlock({
  blockId, payload, answer, choice, onSubmit,
}: {
  blockId: string;
  payload: PayloadObj;
  answer: string | number | boolean | null | undefined;
  choice: number | null;
  onSubmit: (correct: boolean, choiceIdx: number) => void;
}) {
  const question = asStr(payload.question) ?? asStr(payload.prompt);
  const rawOptions = payload.options;
  const options: string[] = Array.isArray(rawOptions)
    ? rawOptions.map((o) => (typeof o === "string" ? o : String(o)))
    : [];
  const correctIndex =
    typeof payload.correct_index === "number"
      ? payload.correct_index
      : typeof payload.correctIndex === "number"
        ? payload.correctIndex
        : typeof payload.answer === "number"
          ? payload.answer
          : null;
  const explanation = asStr(payload.explanation);

  const [selected, setSelected] = useState<number | null>(choice);
  const submitted = answer === "correct" || answer === "wrong";

  if (!question || options.length === 0 || correctIndex === null) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
        Quiz not configured yet.
      </div>
    );
  }
  const submit = () => {
    if (selected === null) return;
    onSubmit(selected === correctIndex, selected);
  };
  return (
    <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="text-sm font-semibold text-primary">{question}</div>
      <div className="mt-3 space-y-2">
        {options.map((opt, idx) => {
          const isSel = selected === idx;
          const isCorrect = submitted && idx === correctIndex;
          const isWrongPick = submitted && isSel && idx !== correctIndex;
          return (
            <button
              key={idx}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(idx)}
              className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-all disabled:cursor-default
                ${isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : ""}
                ${isWrongPick ? "border-red-400 bg-red-50 text-red-900" : ""}
                ${!submitted && isSel ? "border-accent bg-accent/10" : ""}
                ${!submitted && !isSel ? "border-border/60 bg-background hover:bg-muted/40" : ""}
              `}
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[10px] font-bold">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <div className="mt-3">
          <Button size="sm" disabled={selected === null} onClick={submit}>
            Submit answer
          </Button>
        </div>
      ) : (
        <div className={`mt-3 rounded-lg p-3 text-xs ${answer === "correct" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
          <div className="font-semibold">
            {answer === "correct" ? "Correct" : "Not quite"}
          </div>
          {explanation && <div className="mt-1">{explanation}</div>}
        </div>
      )}
      {/* Prevent unused var warning */}
      <span className="hidden">{blockId}</span>
    </div>
  );
}

function prettyKind(kind: string): string {
  return kind.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function KindIcon({ kind }: { kind: string }) {
  if (kind === "ai_video" || kind === "video") return <VideoIcon className="h-3.5 w-3.5" />;
  if (kind === "quiz" || kind === "quiz_true_false") return <ClipboardCheck className="h-3.5 w-3.5" />;
  if (kind === "animation" || kind === "interactive_animation") return <PlayCircle className="h-3.5 w-3.5" />;
  return <BookOpen className="h-3.5 w-3.5" />;
}