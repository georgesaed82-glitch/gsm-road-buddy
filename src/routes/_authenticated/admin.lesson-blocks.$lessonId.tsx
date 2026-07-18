import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Loader2, Video, Film, ArrowLeft, X,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  listLessonBlocks, createLessonBlock, deleteLessonBlock, reorderLessonBlocks,
  updateLessonBlock, listBlockVideos, attachVideoToBlock, detachVideoFromBlock,
  reorderBlockVideos, type LessonBlockRow,
} from "@/lib/lesson-blocks.functions";
import { listAiVideos, type AiVideoRow } from "@/lib/ai-videos.functions";

export const Route = createFileRoute("/_authenticated/admin/lesson-blocks/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson blocks · Admin" }] }),
  component: LessonBlocksAdmin,
});

const BLOCK_KIND_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  diagram: "Diagram",
  animation: "Animation",
  video: "Video (URL)",
  ai_video: "AI video",
  voice: "Voice note",
  quiz: "Quiz",
  quiz_true_false: "True / False",
  drag_drop: "Drag & drop",
  hotspot: "Hotspot",
  scenario_challenge: "Scenario",
  callout: "Callout",
  gsm_method_callout: "GSM callout",
  instructor_note: "Instructor note",
  homework: "Homework",
  reference_point: "Reference point",
  highway_code_rule: "Highway Code",
  road_sign: "Road sign",
  road_marking: "Road marking",
  vehicle_controls: "Vehicle controls",
  hazard_clip: "Hazard clip",
  driving_test_tip: "Test tip",
  summary: "Summary",
  progress_check: "Progress check",
  downloadable_pdf: "PDF",
  interactive_animation: "Interactive",
};

function LessonBlocksAdmin() {
  const { lessonId } = Route.useParams();
  const qc = useQueryClient();
  const listFn = useServerFn(listLessonBlocks);
  const createFn = useServerFn(createLessonBlock);
  const deleteFn = useServerFn(deleteLessonBlock);
  const reorderFn = useServerFn(reorderLessonBlocks);
  const updateFn = useServerFn(updateLessonBlock);
  const linksFn = useServerFn(listBlockVideos);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["admin-lesson-blocks", lessonId],
    queryFn: () => listFn({ data: { lesson_id: lessonId } }),
  });

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);
  const { data: attachments = [] } = useQuery({
    queryKey: ["admin-block-videos", blockIds],
    queryFn: () =>
      blockIds.length ? linksFn({ data: { block_ids: blockIds } }) : Promise.resolve([]),
  });
  const attachmentsByBlock = useMemo(() => {
    const m = new Map<string, typeof attachments>();
    for (const a of attachments) {
      if (!m.has(a.block_id)) m.set(a.block_id, []);
      m.get(a.block_id)!.push(a);
    }
    return m;
  }, [attachments]);

  const [newKind, setNewKind] = useState<string>("ai_video");
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerBlock, setPickerBlock] = useState<LessonBlockRow | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-lesson-blocks", lessonId] });
    qc.invalidateQueries({ queryKey: ["admin-block-videos"] });
  };

  const addBlock = async () => {
    setSaving(true);
    try {
      await createFn({
        data: {
          lesson_id: lessonId,
          kind: newKind as never,
          title: newTitle.trim() || undefined,
        },
      });
      setNewTitle("");
      invalidate();
      toast.success("Block added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const move = async (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= blocks.length) return;
    const ids = blocks.map((b) => b.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await reorderFn({ data: { lesson_id: lessonId, ids } });
    invalidate();
  };

  const remove = async (b: LessonBlockRow) => {
    if (!confirm("Delete this block and its video attachments?")) return;
    await deleteFn({ data: { id: b.id } });
    invalidate();
  };

  const renameBlock = async (b: LessonBlockRow, title: string) => {
    const payload = { ...(b.payload as Record<string, unknown>), title };
    await updateFn({ data: { id: b.id, patch: { payload } } });
    invalidate();
  };

  return (
    <AdminShell eyebrow="Admin" title="Lesson blocks">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/admin/learning"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to lessons
        </Link>
        <div className="text-xs text-muted-foreground">Lesson · {lessonId.slice(0, 8)}…</div>
      </div>

      <Card className="mb-6">
        <CardHeader className="text-sm font-medium">Add a block</CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[220px_1fr_auto]">
          <div>
            <Label className="text-xs">Kind</Label>
            <Select value={newKind} onValueChange={setNewKind}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {Object.entries(BLOCK_KIND_LABELS).map(([k, l]) => (
                  <SelectItem key={k} value={k}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Title (optional)</Label>
            <Input
              className="mt-1"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Mirror check demo"
            />
          </div>
          <Button className="self-end" onClick={addBlock} disabled={saving}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading blocks…
        </div>
      )}

      {!isLoading && blocks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
          No blocks yet. Add your first block above — pick <b>AI video</b> to attach approved
          videos from the library.
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((b, i) => {
          const attached = attachmentsByBlock.get(b.id) ?? [];
          const title = ((b.payload as { title?: string })?.title ?? "").toString();
          return (
            <Card key={b.id}>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Badge variant="outline" className="uppercase">
                  {BLOCK_KIND_LABELS[b.kind] ?? b.kind}
                </Badge>
                <div className="flex-1">
                  <Input
                    defaultValue={title}
                    placeholder="Block title (optional)"
                    onBlur={(e) => {
                      if (e.target.value !== title) renameBlock(b, e.target.value);
                    }}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  onClick={() => move(i, 1)}
                  disabled={i >= blocks.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(b)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Attached videos ({attached.length})
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setPickerBlock(b)}>
                    <Video className="mr-1 h-4 w-4" /> Attach video
                  </Button>
                </div>
                {attached.length === 0 ? (
                  <div className="rounded border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                    No videos attached. Students will not see any AI video for this block.
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {attached.map((a) => (
                      <AttachedVideoRow
                        key={a.video.id}
                        block={b}
                        entry={a}
                        allVideoIdsInBlock={attached.map((x) => x.video.id)}
                        onChanged={invalidate}
                      />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pickerBlock && (
        <AttachVideoDialog
          block={pickerBlock}
          onClose={() => setPickerBlock(null)}
          onAttached={() => {
            invalidate();
            setPickerBlock(null);
          }}
        />
      )}
    </AdminShell>
  );
}

function AttachedVideoRow({
  block,
  entry,
  allVideoIdsInBlock,
  onChanged,
}: {
  block: LessonBlockRow;
  entry: { block_id: string; position: number; video: AiVideoRow };
  allVideoIdsInBlock: string[];
  onChanged: () => void;
}) {
  const detachFn = useServerFn(detachVideoFromBlock);
  const reorderFn = useServerFn(reorderBlockVideos);
  const idx = allVideoIdsInBlock.indexOf(entry.video.id);

  const move = async (delta: number) => {
    const j = idx + delta;
    if (j < 0 || j >= allVideoIdsInBlock.length) return;
    const ids = allVideoIdsInBlock.slice();
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    await reorderFn({ data: { block_id: block.id, video_ids: ids } });
    onChanged();
  };

  const detach = async () => {
    if (!confirm("Detach this video from the block?")) return;
    await detachFn({ data: { block_id: block.id, video_id: entry.video.id } });
    onChanged();
  };

  return (
    <li className="flex items-center gap-2 rounded border border-border/60 bg-background p-2">
      {entry.video.poster_url ? (
        <img
          src={entry.video.poster_url}
          alt=""
          className="h-10 w-16 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
          <Film className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{entry.video.title}</div>
        <div className="text-[11px] text-muted-foreground">
          {entry.video.status} · {entry.video.transmission} · {entry.video.difficulty}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => move(-1)} disabled={idx === 0}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost" size="icon"
        onClick={() => move(1)}
        disabled={idx >= allVideoIdsInBlock.length - 1}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={detach}>
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </li>
  );
}

function AttachVideoDialog({
  block,
  onClose,
  onAttached,
}: {
  block: LessonBlockRow;
  onClose: () => void;
  onAttached: () => void;
}) {
  const listFn = useServerFn(listAiVideos);
  const attachFn = useServerFn(attachVideoToBlock);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "public">("all");
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["ai-videos-picker", scope, search],
    queryFn: () =>
      listFn({
        data: {
          scope,
          search: search.trim() || undefined,
          status: scope === "public" ? undefined : undefined,
          limit: 50,
        },
      }),
  });

  const attach = async (v: AiVideoRow) => {
    try {
      await attachFn({ data: { block_id: block.id, video_id: v.id } });
      toast.success(`Attached "${v.title}"`);
      onAttached();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Attach failed");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attach a video to this block</DialogTitle>
        </DialogHeader>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Search videos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={scope} onValueChange={(v) => setScope(v as never)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="public">Approved only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
            No videos match.
          </div>
        ) : (
          <ul className="max-h-[60vh] space-y-1 overflow-auto">
            {videos.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 rounded border border-border/60 bg-background p-2"
              >
                {v.poster_url ? (
                  <img src={v.poster_url} alt="" className="h-10 w-16 rounded object-cover" />
                ) : (
                  <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
                    <Film className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{v.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {v.status} · {v.transmission} · {v.difficulty}
                  </div>
                </div>
                <Button size="sm" onClick={() => attach(v)}>Attach</Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}