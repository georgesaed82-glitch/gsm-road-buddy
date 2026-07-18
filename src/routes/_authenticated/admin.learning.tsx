import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  GraduationCap,
  Layers,
  ChevronRight,
  Pencil,
  Blocks,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  type ModuleRow,
  type TopicRow,
  type LessonRow,
} from "@/lib/learning-cms.functions";

export const Route = createFileRoute("/_authenticated/admin/learning")({
  head: () => ({ meta: [{ title: "Learning content CMS · Admin" }] }),
  component: AdminLearningPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function AdminLearningPage() {
  const qc = useQueryClient();
  const listModulesFn = useServerFn(listModules);
  const listTopicsFn = useServerFn(listTopics);

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const modulesQ = useQuery({
    queryKey: ["admin-learning-modules"],
    queryFn: () => listModulesFn(),
  });

  const topicsQ = useQuery({
    queryKey: ["admin-learning-topics", selectedModuleId],
    queryFn: () =>
      selectedModuleId ? listTopicsFn({ data: { module_id: selectedModuleId } }) : [],
    enabled: !!selectedModuleId,
  });

  const activeModule = useMemo(
    () => modulesQ.data?.find((m) => m.id === selectedModuleId) ?? null,
    [modulesQ.data, selectedModuleId],
  );

  return (
    <AdminShell title="Learning content" eyebrow="Modules, topics & lessons">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <ModulesPanel
          modules={modulesQ.data ?? []}
          selectedId={selectedModuleId}
          onSelect={(id) => {
            setSelectedModuleId(id);
            setSelectedTopicId(null);
          }}
          onChanged={() => qc.invalidateQueries({ queryKey: ["admin-learning-modules"] })}
          isLoading={modulesQ.isLoading}
        />
        <div>
          {activeModule ? (
            <TopicsPanel
              module={activeModule}
              topics={topicsQ.data ?? []}
              selectedTopicId={selectedTopicId}
              onSelectTopic={setSelectedTopicId}
              onChanged={() =>
                qc.invalidateQueries({ queryKey: ["admin-learning-topics", selectedModuleId] })
              }
              isLoading={topicsQ.isLoading}
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 text-sm text-muted-foreground">
              Select a module on the left to manage its topics.
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

// -------------------- Modules Panel --------------------

function ModulesPanel({
  modules,
  selectedId,
  onSelect,
  onChanged,
  isLoading,
}: {
  modules: ModuleRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChanged: () => void;
  isLoading: boolean;
}) {
  const createFn = useServerFn(createModule);
  const updateFn = useServerFn(updateModule);
  const deleteFn = useServerFn(deleteModule);
  const reorderFn = useServerFn(reorderModules);

  const [editing, setEditing] = useState<ModuleRow | null>(null);
  const [creating, setCreating] = useState(false);

  async function move(id: string, dir: "up" | "down") {
    const ids = modules.map((m) => m.id);
    const i = ids.indexOf(id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await reorderFn({ data: { ids } });
    onChanged();
  }

  async function handleDelete(m: ModuleRow) {
    if (!confirm(`Delete module "${m.title}"? This also deletes all its topics and lessons.`))
      return;
    try {
      await deleteFn({ data: { id: m.id } });
      toast.success("Module deleted");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <Layers className="h-5 w-5 text-accent" /> Modules
        </div>
        <Button size="sm" onClick={() => setCreating(true)} className="gap-1">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && modules.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
            No modules yet. Click <b>New</b> to add one.
          </div>
        )}
        {modules.map((m, idx) => {
          const selected = m.id === selectedId;
          return (
            <div
              key={m.id}
              className={`group rounded-xl border transition-colors ${
                selected ? "border-accent bg-accent/5" : "border-border/60 bg-background"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                className="flex w-full items-start gap-3 p-3 text-left"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {m.module_number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-primary">{m.title}</span>
                    {!m.is_published && (
                      <Badge variant="outline" className="text-[10px]">
                        Draft
                      </Badge>
                    )}
                  </span>
                  {m.description && (
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                      {m.description}
                    </span>
                  )}
                </span>
                <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center justify-end gap-1 border-t border-border/40 px-2 py-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  disabled={idx === 0}
                  onClick={() => move(m.id, "up")}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  disabled={idx === modules.length - 1}
                  onClick={() => move(m.id, "down")}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setEditing(m)}
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(m)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {(creating || editing) && (
        <ModuleDialog
          module={editing}
          nextNumber={
            (modules.reduce((max, m) => Math.max(max, m.module_number), 0) || 0) + 1
          }
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={async (values, id) => {
            try {
              if (id) {
                await updateFn({ data: { id, patch: values } });
                toast.success("Module updated");
              } else {
                await createFn({ data: { module: values } });
                toast.success("Module created");
              }
              onChanged();
              setCreating(false);
              setEditing(null);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Save failed");
            }
          }}
        />
      )}
    </div>
  );
}

function ModuleDialog({
  module: m,
  nextNumber,
  onClose,
  onSave,
}: {
  module: ModuleRow | null;
  nextNumber: number;
  onClose: () => void;
  onSave: (
    values: {
      slug: string;
      module_number: number;
      title: string;
      description: string | null;
      order_index: number;
      is_published: boolean;
    },
    id?: string,
  ) => void;
}) {
  const [title, setTitle] = useState(m?.title ?? "");
  const [slug, setSlug] = useState(m?.slug ?? "");
  const [description, setDescription] = useState(m?.description ?? "");
  const [moduleNumber, setModuleNumber] = useState(m?.module_number ?? nextNumber);
  const [orderIndex, setOrderIndex] = useState(m?.order_index ?? nextNumber * 10);
  const [isPublished, setIsPublished] = useState(m?.is_published ?? true);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{m ? "Edit module" : "New module"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!m) setSlug(slugify(e.target.value));
              }}
              placeholder="Module 1 · Beginner Basics"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </div>
            <div>
              <Label>Number</Label>
              <Input
                type="number"
                min={1}
                value={moduleNumber}
                onChange={(e) => setModuleNumber(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label>Order index</Label>
              <Input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              <span className="text-sm">Published</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            onClick={() =>
              onSave(
                {
                  slug: slug || slugify(title),
                  module_number: moduleNumber,
                  title,
                  description: description || null,
                  order_index: orderIndex,
                  is_published: isPublished,
                },
                m?.id,
              )
            }
            className="gap-1"
          >
            <Save className="h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -------------------- Topics Panel --------------------

function TopicsPanel({
  module: m,
  topics,
  selectedTopicId,
  onSelectTopic,
  onChanged,
  isLoading,
}: {
  module: ModuleRow;
  topics: TopicRow[];
  selectedTopicId: string | null;
  onSelectTopic: (id: string | null) => void;
  onChanged: () => void;
  isLoading: boolean;
}) {
  const createFn = useServerFn(createTopic);
  const updateFn = useServerFn(updateTopic);
  const deleteFn = useServerFn(deleteTopic);
  const reorderFn = useServerFn(reorderTopics);

  const [editing, setEditing] = useState<TopicRow | null>(null);
  const [creating, setCreating] = useState(false);

  async function move(id: string, dir: "up" | "down") {
    const ids = topics.map((t) => t.id);
    const i = ids.indexOf(id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await reorderFn({ data: { module_id: m.id, ids } });
    onChanged();
  }

  async function handleDelete(t: TopicRow) {
    if (!confirm(`Delete topic "${t.title}"? This also deletes all its lessons and blocks.`))
      return;
    try {
      await deleteFn({ data: { id: t.id } });
      toast.success("Topic deleted");
      onChanged();
      if (selectedTopicId === t.id) onSelectTopic(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const activeTopic = topics.find((t) => t.id === selectedTopicId) ?? null;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Module {m.module_number}
            </div>
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
              <GraduationCap className="h-5 w-5 text-accent" /> {m.title}
            </div>
          </div>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Topic
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {isLoading && <div className="text-sm text-muted-foreground">Loading topics…</div>}
          {!isLoading && topics.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
              No topics in this module yet.
            </div>
          )}
          {topics.map((t, idx) => {
            const selected = t.id === selectedTopicId;
            return (
              <div
                key={t.id}
                className={`rounded-xl border transition-colors ${
                  selected ? "border-accent bg-accent/5" : "border-border/60 bg-background"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectTopic(t.id)}
                  className="flex w-full items-start gap-3 p-3 text-left"
                >
                  <span className="mt-0.5 text-xs font-mono text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium text-primary">{t.title}</span>
                      {t.is_published ? (
                        <Eye className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </span>
                    {t.summary && (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                        {t.summary}
                      </span>
                    )}
                  </span>
                </button>
                <div className="flex items-center justify-end gap-1 border-t border-border/40 px-2 py-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    disabled={idx === 0}
                    onClick={() => move(t.id, "up")}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    disabled={idx === topics.length - 1}
                    onClick={() => move(t.id, "down")}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditing(t)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(t)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        {activeTopic ? (
          <LessonsPanel topic={activeTopic} />
        ) : (
          <div className="flex h-full min-h-[16rem] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-sm text-muted-foreground">
            Select a topic to manage its lessons.
          </div>
        )}
      </div>

      {(creating || editing) && (
        <TopicDialog
          topic={editing}
          moduleId={m.id}
          nextOrder={(topics.length + 1) * 10}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={async (values, id) => {
            try {
              if (id) {
                await updateFn({ data: { id, patch: values } });
                toast.success("Topic updated");
              } else {
                await createFn({ data: { topic: values } });
                toast.success("Topic created");
              }
              onChanged();
              setCreating(false);
              setEditing(null);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Save failed");
            }
          }}
        />
      )}
    </div>
  );
}

function TopicDialog({
  topic,
  moduleId,
  nextOrder,
  onClose,
  onSave,
}: {
  topic: TopicRow | null;
  moduleId: string;
  nextOrder: number;
  onClose: () => void;
  onSave: (
    values: {
      module_id: string;
      slug: string;
      title: string;
      summary: string | null;
      category: string | null;
      order_index: number;
      estimated_minutes: number | null;
      is_published: boolean;
      teaching_method_tags: string[] | null;
    },
    id?: string,
  ) => void;
}) {
  const [title, setTitle] = useState(topic?.title ?? "");
  const [slug, setSlug] = useState(topic?.slug ?? "");
  const [summary, setSummary] = useState(topic?.summary ?? "");
  const [category, setCategory] = useState(topic?.category ?? "");
  const [orderIndex, setOrderIndex] = useState(topic?.order_index ?? nextOrder);
  const [minutes, setMinutes] = useState(topic?.estimated_minutes ?? 15);
  const [isPublished, setIsPublished] = useState(topic?.is_published ?? true);
  const [tags, setTags] = useState((topic?.teaching_method_tags ?? []).join(", "));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{topic ? "Edit topic" : "New topic"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!topic) setSlug(slugify(e.target.value));
              }}
              placeholder="Meeting Traffic"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={category ?? ""}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="junctions, manoeuvre…"
              />
            </div>
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea value={summary ?? ""} onChange={(e) => setSummary(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Order index</Label>
              <Input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div>
              <Label>Estimated minutes</Label>
              <Input
                type="number"
                value={minutes ?? 0}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
          <div>
            <Label>Teaching-method tags (comma separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="BGO, MSPSL, POM"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <span className="text-sm">Published</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            onClick={() =>
              onSave(
                {
                  module_id: moduleId,
                  slug: slug || slugify(title),
                  title,
                  summary: summary || null,
                  category: category || null,
                  order_index: orderIndex,
                  estimated_minutes: minutes || null,
                  is_published: isPublished,
                  teaching_method_tags:
                    tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean).length > 0
                      ? tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      : null,
                },
                topic?.id,
              )
            }
            className="gap-1"
          >
            <Save className="h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -------------------- Lessons Panel --------------------

function LessonsPanel({ topic }: { topic: TopicRow }) {
  const qc = useQueryClient();
  const listLessonsFn = useServerFn(listLessons);
  const createFn = useServerFn(createLesson);
  const updateFn = useServerFn(updateLesson);
  const deleteFn = useServerFn(deleteLesson);

  const q = useQuery({
    queryKey: ["admin-learning-lessons", topic.id],
    queryFn: () => listLessonsFn({ data: { topic_id: topic.id } }),
  });

  const [newTitle, setNewTitle] = useState("");

  async function addLesson() {
    if (!newTitle.trim()) return;
    try {
      await createFn({
        data: {
          lesson: {
            topic_id: topic.id,
            slug: slugify(newTitle),
            title: newTitle.trim(),
            order_index: ((q.data?.length ?? 0) + 1) * 10,
            is_published: true,
          },
        },
      });
      setNewTitle("");
      qc.invalidateQueries({ queryKey: ["admin-learning-lessons", topic.id] });
      toast.success("Lesson created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function toggle(lesson: LessonRow) {
    await updateFn({ data: { id: lesson.id, patch: { is_published: !lesson.is_published } } });
    qc.invalidateQueries({ queryKey: ["admin-learning-lessons", topic.id] });
  }

  async function remove(lesson: LessonRow) {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    await deleteFn({ data: { id: lesson.id } });
    qc.invalidateQueries({ queryKey: ["admin-learning-lessons", topic.id] });
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Lessons in</div>
      <div className="font-display text-lg font-semibold text-primary">{topic.title}</div>

      <div className="mt-4 flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New lesson title…"
          onKeyDown={(e) => e.key === "Enter" && addLesson()}
        />
        <Button onClick={addLesson} className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {q.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!q.isLoading && (q.data ?? []).length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
            No lessons yet.
          </div>
        )}
        {(q.data ?? []).map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-primary">{l.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{l.slug}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-xs"
                asChild
              >
                <Link
                  to="/admin/lesson-blocks/$lessonId"
                  params={{ lessonId: l.id }}
                >
                  <Blocks className="h-3.5 w-3.5" /> Blocks
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => toggle(l)}
                aria-label={l.is_published ? "Unpublish" : "Publish"}
              >
                {l.is_published ? (
                  <Eye className="h-4 w-4 text-success" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => remove(l)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-dashed border-accent/40 bg-accent/5 p-3 text-xs leading-relaxed text-muted-foreground">
        Full block editor (text, diagrams, animations, videos, quizzes, GSM teaching elements) ships
        in the next phase drop. This screen already lets you structure the syllabus end-to-end.
      </p>
    </div>
  );
}