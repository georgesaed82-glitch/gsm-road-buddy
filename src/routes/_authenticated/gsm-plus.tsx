import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, Sparkles, Trophy, Layers, PlayCircle, Lock } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Badge } from "@/components/ui/badge";
import {
  getPortalCatalog,
  getMyProgress,
  setMyTopicStage,
  STAGES,
  STAGE_LABEL,
  type ProgressStage,
  type PortalTopic,
  type PortalModule,
  type StudentProgressRow,
} from "@/lib/learning-portal.functions";
import {
  listAllPortalLessons,
  type LessonListItem,
} from "@/lib/lesson-viewer.functions";

export const Route = createFileRoute("/_authenticated/gsm-plus")({
  head: () => ({ meta: [{ title: "GSM Plus · The complete GSM Learning Platform" }] }),
  component: GsmPlusHome,
});

const STAGE_COLOUR: Record<ProgressStage, string> = {
  not_started: "bg-muted text-muted-foreground",
  introduced: "bg-amber-100 text-amber-900",
  practised: "bg-amber-200 text-amber-900",
  developing: "bg-orange-200 text-orange-900",
  independent: "bg-emerald-100 text-emerald-900",
  test_standard: "bg-emerald-200 text-emerald-900",
  completed: "bg-primary text-primary-foreground",
};

const STAGE_INDEX: Record<ProgressStage, number> = Object.fromEntries(
  STAGES.map((s, i) => [s, i]),
) as Record<ProgressStage, number>;

function GsmPlusHome() {
  const qc = useQueryClient();
  const catalogFn = useServerFn(getPortalCatalog);
  const progressFn = useServerFn(getMyProgress);
  const setStageFn = useServerFn(setMyTopicStage);

  const catalogQ = useQuery({ queryKey: ["portal-catalog"], queryFn: () => catalogFn() });
  const progressQ = useQuery({ queryKey: ["portal-progress"], queryFn: () => progressFn() });
  const lessonsFn = useServerFn(listAllPortalLessons);
  const lessonsQ = useQuery({ queryKey: ["portal-lessons"], queryFn: () => lessonsFn() });

  const setStage = useMutation({
    mutationFn: (v: { topic_id: string; stage: ProgressStage }) => setStageFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal-progress"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const progressByTopic = useMemo(() => {
    const m = new Map<string, StudentProgressRow>();
    for (const p of progressQ.data ?? []) m.set(p.topic_id, p);
    return m;
  }, [progressQ.data]);

  const lessonsByTopic = useMemo(() => {
    const m = new Map<string, LessonListItem[]>();
    for (const l of lessonsQ.data ?? []) {
      const arr = m.get(l.topic_id) ?? [];
      arr.push(l);
      m.set(l.topic_id, arr);
    }
    return m;
  }, [lessonsQ.data]);

  const modules = catalogQ.data?.modules ?? [];
  const topics = catalogQ.data?.topics ?? [];

  // Overall readiness = mean stage index across all topics
  const totalTopics = topics.length;
  const readiness = useMemo(() => {
    if (!totalTopics) return 0;
    let sum = 0;
    for (const t of topics) {
      const p = progressByTopic.get(t.id);
      sum += p ? STAGE_INDEX[p.stage] : 0;
    }
    return Math.round((sum / (totalTopics * (STAGES.length - 1))) * 100);
  }, [topics, progressByTopic, totalTopics]);

  const completedCount = useMemo(() => {
    let n = 0;
    for (const t of topics) {
      const p = progressByTopic.get(t.id);
      if (p && (p.stage === "completed" || p.stage === "test_standard")) n++;
    }
    return n;
  }, [topics, progressByTopic]);

  return (
    <PortalShell title="GSM Plus" eyebrow="The complete GSM Learning Platform">
      {/* Readiness hero */}
      <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary to-primary/90 p-6 text-primary-foreground shadow-lg sm:p-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Your GSM journey
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Test-readiness · {readiness}%
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
          Progress is tracked across every topic in the GSM syllabus using the 7-stage system
          (Introduced → Test standard → Completed). Update each topic as you master it — your
          instructor sees the same view.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Layers className="h-4 w-4" />}
            label="Modules"
            value={`${modules.length}`}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Topics in syllabus"
            value={`${totalTopics}`}
          />
          <StatCard
            icon={<Trophy className="h-4 w-4" />}
            label="Topics test-ready"
            value={`${completedCount}`}
          />
        </div>
      </section>

      {/* Modules */}
      <div className="mt-8 space-y-6">
        {catalogQ.isLoading && (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Loading syllabus…
          </div>
        )}
        {!catalogQ.isLoading && modules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No modules published yet. Ask your instructor to publish content in the admin.
          </div>
        )}
        {modules.map((m) => {
          const moduleTopics = topics.filter((t) => t.module_id === m.id);
          return (
            <ModuleBlock
              key={m.id}
              module={m}
              topics={moduleTopics}
              progressByTopic={progressByTopic}
              lessonsByTopic={lessonsByTopic}
              onSetStage={(topic_id, stage) => setStage.mutate({ topic_id, stage })}
              pending={setStage.isPending}
            />
          );
        })}
      </div>

      <p className="mt-10 rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Coming next in GSM Plus: interactive topic pages with diagrams, animations, AI videos and
        quizzes; DVSA-style mock tests with pass probability; AI lesson summaries; and downloadable
        certificates. This dashboard is already wired to your live progress in the database.
      </p>
    </PortalShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-accent">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{value}</div>
    </div>
  );
}

function ModuleBlock({
  module: m,
  topics,
  progressByTopic,
  lessonsByTopic,
  onSetStage,
  pending,
}: {
  module: PortalModule;
  topics: PortalTopic[];
  progressByTopic: Map<string, StudentProgressRow>;
  lessonsByTopic: Map<string, LessonListItem[]>;
  onSetStage: (topic_id: string, stage: ProgressStage) => void;
  pending: boolean;
}) {
  const doneCount = topics.filter((t) => {
    const s = progressByTopic.get(t.id)?.stage;
    return s === "completed" || s === "test_standard";
  }).length;

  return (
    <section className="rounded-3xl border border-border/60 bg-card shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/40 p-5 sm:p-6">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-accent">
            Module {m.module_number}
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold text-primary">{m.title}</h2>
          {m.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{m.description}</p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0">
          {doneCount} / {topics.length} test-ready
        </Badge>
      </header>

      <ul className="divide-y divide-border/40">
        {topics.map((t, i) => (
          <TopicRow
            key={t.id}
            index={i + 1}
            topic={t}
            progress={progressByTopic.get(t.id)}
            lessons={lessonsByTopic.get(t.id) ?? []}
            onSetStage={(stage) => onSetStage(t.id, stage)}
            disabled={pending}
          />
        ))}
      </ul>
    </section>
  );
}

function TopicRow({
  index,
  topic,
  progress,
  lessons,
  onSetStage,
  disabled,
}: {
  index: number;
  topic: PortalTopic;
  progress: StudentProgressRow | undefined;
  lessons: LessonListItem[];
  onSetStage: (stage: ProgressStage) => void;
  disabled: boolean;
}) {
  const stage: ProgressStage = progress?.stage ?? "not_started";
  const done = stage === "completed" || stage === "test_standard";

  return (
    <li className="grid gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div className="flex items-start gap-3 min-w-0">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {index}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate font-semibold text-primary">{topic.title}</span>
          </div>
          {topic.summary && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
              {topic.summary}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
            {topic.estimated_minutes && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-0.5">
                <Clock className="h-3 w-3" /> {topic.estimated_minutes} min
              </span>
            )}
            {(topic.teaching_method_tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STAGES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onSetStage(s)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all disabled:opacity-50 sm:text-[11px] ${
              stage === s
                ? STAGE_COLOUR[s] + " ring-2 ring-accent ring-offset-1"
                : "bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}
            title={STAGE_LABEL[s]}
          >
            {STAGE_LABEL[s]}
          </button>
        ))}
      </div>
      </div>

      {lessons.length > 0 && (
        <ul className="mt-1 space-y-1.5 rounded-2xl border border-border/40 bg-muted/20 p-2 sm:ml-10">
          {lessons.map((l, li) => {
            const prevLesson = li > 0 ? lessons[li - 1] : null;
            // Unlock rule: first lesson always unlocked; else previous must be completed.
            const unlocked = li === 0 || prevLesson?.status === "completed";
            const complete = l.status === "completed";
            return (
              <li key={l.id}>
                {unlocked ? (
                  <Link
                    to="/gsm-plus/lesson/$lessonId"
                    params={{ lessonId: l.id }}
                    className="group flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent/5"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {complete ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                      )}
                      <span className="truncate font-medium text-foreground group-hover:text-primary">
                        {l.title}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {complete
                        ? "Complete"
                        : l.progress_pct > 0
                          ? `${l.progress_pct}% · Resume`
                          : "Start"}
                    </span>
                  </Link>
                ) : (
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl bg-background/60 px-3 py-2 text-sm text-muted-foreground"
                    title="Complete the previous lesson to unlock"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Lock className="h-4 w-4 shrink-0" />
                      <span className="truncate">{l.title}</span>
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest">
                      Locked
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}