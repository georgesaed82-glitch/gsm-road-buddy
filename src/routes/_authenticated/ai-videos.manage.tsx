import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  Pencil,
  Play,
  Send,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listAiVideos,
  upsertAiVideo,
  moderateAiVideo,
  createAiVideoUploadUrl,
  uploadAiVideoPoster,
  getAiVideoRole,
  type AiVideoRow,
  type AiVideoStatus,
} from "@/lib/ai-videos.functions";

export const Route = createFileRoute("/_authenticated/ai-videos/manage")({
  head: () => ({ meta: [{ title: "AI Video Library — Review & Publish" }] }),
  component: ManagePage,
});

type TabKey = "pending_review" | "approved" | "rejected" | "archived" | "mine";

function ManagePage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAiVideos);
  const upsertFn = useServerFn(upsertAiVideo);
  const moderateFn = useServerFn(moderateAiVideo);
  const uploadUrlFn = useServerFn(createAiVideoUploadUrl);
  const posterFn = useServerFn(uploadAiVideoPoster);
  const roleFn = useServerFn(getAiVideoRole);

  const { data: role } = useQuery({ queryKey: ["ai-video-role"], queryFn: () => roleFn() });

  const [tab, setTab] = useState<TabKey>("pending_review");
  const [search, setSearch] = useState("");
  const [transmission, setTransmission] = useState<string>("any");
  const [difficulty, setDifficulty] = useState<string>("any");
  const [provider, setProvider] = useState<string>("any");
  const [tag, setTag] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AiVideoRow | null>(null);
  const [player, setPlayer] = useState<AiVideoRow | null>(null);

  const query = useMemo(
    () => ({
      status: tab === "mine" ? undefined : (tab as AiVideoStatus),
      scope: tab === "mine" ? ("mine" as const) : ("all" as const),
      search: search.trim() || undefined,
      transmission: transmission === "any" ? undefined : (transmission as "any"),
      difficulty: difficulty === "any" ? undefined : (difficulty as "beginner"),
      provider: provider === "any" ? undefined : (provider as "youtube"),
      tag: tag.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [tab, search, transmission, difficulty, provider, tag, from, to],
  );

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["ai-videos", query],
    queryFn: () => listFn({ data: query }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["ai-videos"] });

  const canModerate = role?.isAdmin;
  const canUpload = role?.isAdmin || role?.isSenior;

  const handleModerate = async (id: string, action: Parameters<typeof moderateFn>[0]["data"]["action"], reason?: string) => {
    try {
      await moderateFn({ data: { id, action, reason } });
      toast.success("Updated");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <PortalShell eyebrow="GSM PLUS+" title="AI Video Library — Review & Publish">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {role?.isAdmin
              ? "Admin console — approve, reject, archive, and curate all AI videos."
              : role?.isSenior
                ? "Senior instructor — upload and edit your own videos. Approval is admin-only."
                : "You do not have upload permissions."}
          </p>
        </div>
        {canUpload && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> New video
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-5">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Search
            </Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Title or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="test_ready">Test-ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Transmission</Label>
            <Select value={transmission} onValueChange={setTransmission}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="upload">Uploaded</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tag</Label>
            <Input className="mt-1" placeholder="e.g. roundabouts" value={tag} onChange={(e) => setTag(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">From</Label>
            <Input className="mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">To</Label>
            <Input className="mt-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="pending_review">Pending review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="mine">My uploads</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
              No videos match this filter.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((v) => (
                <VideoCard
                  key={v.id}
                  v={v}
                  canModerate={!!canModerate}
                  currentUserId={role?.userId ?? null}
                  onPlay={() => setPlayer(v)}
                  onEdit={() => {
                    setEditing(v);
                    setDialogOpen(true);
                  }}
                  onModerate={handleModerate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => {
          setDialogOpen(false);
          invalidate();
        }}
        upsertFn={upsertFn}
        uploadUrlFn={uploadUrlFn}
        posterFn={posterFn}
      />

      <PlayerDialog v={player} onClose={() => setPlayer(null)} />
    </PortalShell>
  );
}

function VideoCard({
  v,
  canModerate,
  currentUserId,
  onPlay,
  onEdit,
  onModerate,
}: {
  v: AiVideoRow;
  canModerate: boolean;
  currentUserId: string | null;
  onPlay: () => void;
  onEdit: () => void;
  onModerate: (id: string, action: "submit" | "approve" | "reject" | "archive" | "unarchive" | "delete", reason?: string) => void;
}) {
  const isOwner = v.uploaded_by === currentUserId;
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onPlay}
        className="group relative aspect-video w-full overflow-hidden bg-muted"
      >
        {v.poster_url ? (
          <img src={v.poster_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Play className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
          <Play className="h-10 w-10 text-white opacity-0 transition group-hover:opacity-100" />
        </div>
        <div className="absolute left-2 top-2 flex gap-1">
          <StatusBadge status={v.status} />
          <Badge variant="outline" className="bg-black/40 text-white">{v.provider}</Badge>
        </div>
      </button>
      <CardContent className="space-y-3 pt-4">
        <div>
          <div className="line-clamp-2 font-medium">{v.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {v.uploader_name ?? "—"} · {v.transmission} · {v.difficulty}
            {v.view_count ? ` · ${v.view_count} views` : ""}
          </div>
          {v.status === "rejected" && v.rejection_reason && (
            <p className="mt-2 text-xs text-red-500">Reason: {v.rejection_reason}</p>
          )}
          {v.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {v.tags.slice(0, 6).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t pt-3">
          {(canModerate || isOwner) && (v.status === "draft" || v.status === "rejected") && (
            <Button size="sm" variant="secondary" onClick={() => onModerate(v.id, "submit")}>
              <Send className="mr-1 h-3 w-3" /> Submit
            </Button>
          )}
          {canModerate && v.status === "pending_review" && (
            <>
              <Button size="sm" onClick={() => onModerate(v.id, "approve")}>
                <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  const reason = window.prompt("Reason for rejection?") ?? undefined;
                  if (reason === undefined) return;
                  onModerate(v.id, "reject", reason);
                }}
              >
                <XCircle className="mr-1 h-3 w-3" /> Reject
              </Button>
            </>
          )}
          {canModerate && v.status === "approved" && (
            <Button size="sm" variant="outline" onClick={() => onModerate(v.id, "archive")}>
              <Archive className="mr-1 h-3 w-3" /> Archive
            </Button>
          )}
          {canModerate && v.status === "archived" && (
            <Button size="sm" variant="outline" onClick={() => onModerate(v.id, "unarchive")}>
              <RotateCcw className="mr-1 h-3 w-3" /> Reinstate
            </Button>
          )}
          {(canModerate || (isOwner && v.status !== "approved")) && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Button>
          )}
          {canModerate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm("Delete this video permanently?"))
                  onModerate(v.id, "delete");
              }}
            >
              <Trash2 className="mr-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: AiVideoStatus }) {
  const map: Record<AiVideoStatus, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "bg-slate-500 text-white" },
    pending_review: { label: "Pending", cls: "bg-amber-500 text-white" },
    approved: { label: "Approved", cls: "bg-emerald-600 text-white" },
    rejected: { label: "Rejected", cls: "bg-rose-600 text-white" },
    archived: { label: "Archived", cls: "bg-zinc-600 text-white" },
  };
  const m = map[status];
  return <Badge className={m.cls}>{m.label}</Badge>;
}

function PlayerDialog({ v, onClose }: { v: AiVideoRow | null; onClose: () => void }) {
  return (
    <Dialog open={!!v} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{v?.title}</DialogTitle>
        </DialogHeader>
        {v && (
          <div className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
              {v.provider === "youtube" && v.youtube_id ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${v.youtube_id}`}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : v.video_url ? (
                <video src={v.video_url} controls className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-white">
                  Video unavailable
                </div>
              )}
            </div>
            {v.description && (
              <p className="text-sm text-muted-foreground">{v.description}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
  upsertFn,
  uploadUrlFn,
  posterFn,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: AiVideoRow | null;
  onSaved: () => void;
  upsertFn: ReturnType<typeof useServerFn<typeof upsertAiVideo>>;
  uploadUrlFn: ReturnType<typeof useServerFn<typeof createAiVideoUploadUrl>>;
  posterFn: ReturnType<typeof useServerFn<typeof uploadAiVideoPoster>>;
}) {
  const [form, setForm] = useState(() => defaults(editing));
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const posterRef = useRef<HTMLInputElement | null>(null);

  // Reset when opening
  useMemo(() => {
    if (open) setForm(defaults(editing));
  }, [open, editing]);

  const handleFile = async (file: File) => {
    try {
      setProgress(0);
      const { path, signedUrl } = await uploadUrlFn({
        data: { filename: file.name, content_type: file.type, size: file.size },
      });
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
        xhr.onerror = () => reject(new Error("Upload error"));
        xhr.send(file);
      });
      setForm((f) => ({ ...f, provider: "upload", storage_path: path }));
      toast.success("Video uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  const handlePoster = async (file: File) => {
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(r.error);
        r.readAsDataURL(file);
      });
      const out = await posterFn({
        data: { filename: file.name, content_type: file.type, base64: b64 },
      });
      setForm((f) => ({ ...f, poster_url: out.url ?? f.poster_url }));
      toast.success("Thumbnail uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thumbnail failed");
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await upsertFn({
        data: {
          id: editing?.id,
          title: form.title,
          description: form.description || null,
          provider: form.provider,
          youtube_id: form.youtube_id || null,
          external_url: form.external_url || null,
          storage_path: form.storage_path || null,
          poster_url: form.poster_url || null,
          duration_seconds: form.duration_seconds || null,
          transmission: form.transmission,
          difficulty: form.difficulty,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          topic_ids: [],
          lesson_ids: [],
          is_premium: form.is_premium,
        },
      });
      toast.success("Saved — submitted for review");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit video" : "New video"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Source</Label>
              <Select value={form.provider} onValueChange={(v) => setForm({ ...form, provider: v as "youtube" | "upload" | "external" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="upload">Upload</SelectItem>
                  <SelectItem value="external">External URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transmission</Label>
              <Select value={form.transmission} onValueChange={(v) => setForm({ ...form, transmission: v as "any" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as "beginner" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="test_ready">Test-ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.provider === "youtube" && (
            <div>
              <Label>YouTube ID</Label>
              <Input className="mt-1" placeholder="dQw4w9WgXcQ" value={form.youtube_id} onChange={(e) => setForm({ ...form, youtube_id: e.target.value })} />
            </div>
          )}
          {form.provider === "external" && (
            <div>
              <Label>Video URL</Label>
              <Input className="mt-1" placeholder="https://…" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} />
            </div>
          )}
          {form.provider === "upload" && (
            <div className="rounded-md border border-dashed border-border/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {form.storage_path ? "Video ready to save." : "Choose a video file to upload."}
                </div>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1 h-4 w-4" /> Choose file
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
              {progress !== null && (
                <div className="mt-3">
                  <Progress value={progress} />
                  <p className="mt-1 text-xs text-muted-foreground">{progress}%</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-md border border-dashed border-border/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {form.poster_url ? "Thumbnail set." : "Optional thumbnail image."}
              </div>
              <Button variant="outline" size="sm" onClick={() => posterRef.current?.click()}>
                <Upload className="mr-1 h-4 w-4" /> Thumbnail
              </Button>
              <input
                ref={posterRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePoster(f);
                }}
              />
            </div>
            {form.poster_url && (
              <img src={form.poster_url} alt="" className="mt-3 max-h-32 rounded" />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input className="mt-1" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="roundabout, mspsl" />
            </div>
            <div>
              <Label>Duration (seconds)</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.duration_seconds || ""}
                onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.title.trim()}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function defaults(v: AiVideoRow | null) {
  return {
    title: v?.title ?? "",
    description: v?.description ?? "",
    provider: (v?.provider ?? "youtube") as "youtube" | "upload" | "external",
    youtube_id: v?.youtube_id ?? "",
    external_url: v?.external_url ?? "",
    storage_path: v?.storage_path ?? "",
    poster_url: v?.poster_url ?? "",
    duration_seconds: v?.duration_seconds ?? 0,
    transmission: (v?.transmission ?? "any") as "any" | "manual" | "automatic",
    difficulty: (v?.difficulty ?? "beginner") as "beginner" | "intermediate" | "advanced" | "test_ready",
    tags: (v?.tags ?? []).join(", "),
    is_premium: v?.is_premium ?? true,
  };
}