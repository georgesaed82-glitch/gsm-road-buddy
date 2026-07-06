import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search as SearchIcon,
  Trash2,
  Copy as CopyIcon,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ImagePlus,
  Video as VideoIcon,
  FileText,
  Globe,
  Smartphone,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  listLessonsAdmin,
  createLesson,
  updateLesson,
  deleteLessons,
  bulkUpdateLessons,
  duplicateLesson,
  reorderLesson,
  uploadLessonMedia,
  type LessonRow,
  type LessonStatus,
} from "@/lib/lessons-cms.functions";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  head: () => ({ meta: [{ title: "Lessons CMS · Admin" }] }),
  component: AdminLessonsCms,
});

const DEFAULT_CATEGORIES = [
  "Junctions",
  "Roundabouts",
  "Parking",
  "Manoeuvres",
  "Road Signs",
  "Theory",
  "Test Preparation",
  "General",
];

type Draft = {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tags: string[];
  image_url: string;
  video_url: string;
  pdf_url: string;
  duration_minutes: number | null;
  status: LessonStatus;
  show_web: boolean;
  show_app: boolean;
};

const EMPTY_DRAFT: Draft = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  category: "General",
  tags: [],
  image_url: "",
  video_url: "",
  pdf_url: "",
  duration_minutes: null,
  status: "draft",
  show_web: true,
  show_app: true,
};

function rowToDraft(r: LessonRow): Draft {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    category: r.category,
    tags: r.tags,
    image_url: r.image_url,
    video_url: r.video_url,
    pdf_url: r.pdf_url,
    duration_minutes: r.duration_minutes,
    status: r.status,
    show_web: r.show_web,
    show_app: r.show_app,
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

function AdminLessonsCms() {
const qc = useQueryClient();
  const listFn = useServerFn(listLessonsAdmin);
  const createFn = useServerFn(createLesson);
  const updateFn = useServerFn(updateLesson);
  const deleteFn = useServerFn(deleteLessons);
  const bulkFn = useServerFn(bulkUpdateLessons);
  const duplicateFn = useServerFn(duplicateLesson);
  const reorderFn = useServerFn(reorderLesson);
  const uploadFn = useServerFn(uploadLessonMedia);

  const q = useQuery({
    queryKey: ["admin", "lessons"],
    queryFn: () => listFn({ data: { password } }),
    enabled: !!password,
  });

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = q.data ?? [];

  const categories = useMemo(() => {
    const s = new Set(DEFAULT_CATEGORIES);
    rows.forEach((r) => s.add(r.category));
    return [...s];
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterCategory !== "all" && r.category !== filterCategory) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (!term) return true;
      return (
        r.title.toLowerCase().includes(term) ||
        r.subtitle.toLowerCase().includes(term) ||
        r.slug.toLowerCase().includes(term) ||
        r.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [rows, search, filterCategory, filterStatus]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "lessons"] });

  const onNew = () => setEditing({ ...EMPTY_DRAFT });

  const onEdit = (r: LessonRow) => setEditing(rowToDraft(r));

  const onSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Title is required");
    if (!editing.slug.trim()) editing.slug = slugify(editing.title);
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...patch } = editing;
        await updateFn({ data: { password, id, ...patch } });
        toast.success("Lesson saved");
      } else {
        await createFn({ data: { password, ...editing } });
        toast.success("Lesson created");
      }
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (ids: string[]) => {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} lesson${ids.length > 1 ? "s" : ""}?`)) return;
    try {
      await deleteFn({ data: { password, ids } });
      toast.success("Deleted");
      setSelected(new Set());
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onBulk = async (patch: { status?: LessonStatus; show_web?: boolean; show_app?: boolean; category?: string }) => {
    if (!selected.size) return;
    try {
      await bulkFn({ data: { password, ids: [...selected], patch } });
      toast.success("Updated");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onDuplicate = async (id: string) => {
    try {
      await duplicateFn({ data: { password, id } });
      toast.success("Duplicated");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onReorder = async (id: string, direction: "up" | "down") => {
    try {
      await reorderFn({ data: { password, id, direction } });
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell title="Lessons CMS" eyebrow="Content library">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons…"
            className="pl-8"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button onClick={onNew} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New lesson
          </Button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm">
          <span>{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => onBulk({ status: "published" })}>Publish</Button>
          <Button size="sm" variant="outline" onClick={() => onBulk({ status: "draft" })}>Move to draft</Button>
          <Button size="sm" variant="outline" onClick={() => onBulk({ status: "hidden" })}>Hide</Button>
          <Button size="sm" variant="outline" onClick={() => onBulk({ show_web: true })}><Globe className="mr-1 h-3 w-3" /> Show on web</Button>
          <Button size="sm" variant="outline" onClick={() => onBulk({ show_web: false })}>Hide from web</Button>
          <Button size="sm" variant="outline" onClick={() => onBulk({ show_app: true })}><Smartphone className="mr-1 h-3 w-3" /> Show in app</Button>
          <Button size="sm" variant="outline" onClick={() => onBulk({ show_app: false })}>Hide from app</Button>
          <Button size="sm" variant="destructive" className="ml-auto" onClick={() => onDelete([...selected])}>
            <Trash2 className="mr-1 h-3 w-3" /> Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-2">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="w-20 px-3 py-2">Order</th>
              <th className="px-3 py-2">Lesson</th>
              <th className="w-32 px-3 py-2">Category</th>
              <th className="w-28 px-3 py-2">Status</th>
              <th className="w-24 px-3 py-2">Surfaces</th>
              <th className="w-40 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!q.isLoading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No lessons match those filters.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onReorder(r.id, "up")} title="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onReorder(r.id, "down")} title="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded border border-dashed border-border" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{r.title || <em className="text-muted-foreground">Untitled</em>}</div>
                      <div className="truncate text-xs text-muted-foreground">/{r.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="secondary">{r.category}</Badge>
                </td>
                <td className="px-3 py-2">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 text-muted-foreground">
                    <span title={r.show_web ? "Visible on website" : "Hidden from website"}>
                      <Globe className={cn("h-3.5 w-3.5", r.show_web ? "text-primary" : "opacity-30")} />
                    </span>
                    <span title={r.show_app ? "Visible in mobile app" : "Hidden from mobile app"}>
                      <Smartphone className={cn("h-3.5 w-3.5", r.show_app ? "text-primary" : "opacity-30")} />
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => onEdit(r)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => onDuplicate(r.id)} title="Duplicate">
                      <CopyIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete([r.id])} title="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <LessonEditor
          draft={editing}
          categories={categories}
          saving={saving}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onUpload={async (kind, file) => {
            if (!editing.id) {
              toast.error("Save the lesson before uploading media.");
              return;
            }
            const b64 = await fileToBase64(file);
            const res = await uploadFn({
              data: {
                password,
                lesson_id: editing.id,
                kind,
                filename: file.name,
                content_type: file.type || (kind === "pdf" ? "application/pdf" : kind === "video" ? "video/mp4" : "image/jpeg"),
                base64: b64,
              },
            });
            setEditing((d) => (d ? { ...d, [res.column]: res.url } : d));
            toast.success(`${kind} uploaded`);
            refresh();
          }}
        />
      )}
    </AdminShell>
  );
}

function StatusPill({ status }: { status: LessonStatus }) {
  const map: Record<LessonStatus, { label: string; className: string; icon: typeof Eye }> = {
    published: { label: "Published", className: "bg-success/15 text-success-foreground", icon: Eye },
    draft: { label: "Draft", className: "bg-warning/15 text-warning-foreground", icon: FileText },
    hidden: { label: "Hidden", className: "bg-muted text-muted-foreground", icon: EyeOff },
  };
  const m = map[status];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs", m.className)}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}

function LessonEditor({
  draft,
  categories,
  saving,
  onChange,
  onClose,
  onSave,
  onUpload,
}: {
  draft: Draft;
  categories: string[];
  saving: boolean;
  onChange: (d: Draft) => void;
  onClose: () => void;
  onSave: () => void;
  onUpload: (kind: "image" | "video" | "pdf", file: File) => Promise<void>;
}) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (draft.tags.includes(t)) return setTagInput("");
    onChange({ ...draft, tags: [...draft.tags, t] });
    setTagInput("");
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit lesson" : "New lesson"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value;
                onChange({ ...draft, title, slug: draft.id ? draft.slug : slugify(title) });
              }}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Subtitle</Label>
            <Input value={draft.subtitle} onChange={(e) => onChange({ ...draft, subtitle: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={draft.slug} onChange={(e) => onChange({ ...draft, slug: slugify(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={draft.category} onValueChange={(v) => onChange({ ...draft, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={6}
              value={draft.description}
              onChange={(e) => onChange({ ...draft, description: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={draft.duration_minutes ?? ""}
              onChange={(e) =>
                onChange({
                  ...draft,
                  duration_minutes: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={draft.status} onValueChange={(v) => onChange({ ...draft, status: v as LessonStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="flex items-center gap-2 cursor-pointer"><Globe className="h-4 w-4" /> Show on website</Label>
            <Switch checked={draft.show_web} onCheckedChange={(v) => onChange({ ...draft, show_web: v })} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="flex items-center gap-2 cursor-pointer"><Smartphone className="h-4 w-4" /> Show in mobile app</Label>
            <Switch checked={draft.show_app} onCheckedChange={(v) => onChange({ ...draft, show_app: v })} />
          </div>

          {/* Tags */}
          <div className="space-y-1.5 md:col-span-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1">
              {draft.tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => onChange({ ...draft, tags: draft.tags.filter((x) => x !== t) })}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter"
              />
              <Button variant="outline" onClick={addTag} type="button">Add</Button>
            </div>
          </div>

          {/* Media uploads */}
          <MediaField
            label="Cover image"
            icon={<ImagePlus className="h-4 w-4" />}
            url={draft.image_url}
            accept="image/*"
            inputRef={imageRef}
            onUrlChange={(v) => onChange({ ...draft, image_url: v })}
            onFile={(f) => onUpload("image", f)}
            saved={!!draft.id}
          />
          <MediaField
            label="Video"
            icon={<VideoIcon className="h-4 w-4" />}
            url={draft.video_url}
            accept="video/*"
            inputRef={videoRef}
            onUrlChange={(v) => onChange({ ...draft, video_url: v })}
            onFile={(f) => onUpload("video", f)}
            saved={!!draft.id}
          />
          <MediaField
            label="Downloadable PDF"
            icon={<FileText className="h-4 w-4" />}
            url={draft.pdf_url}
            accept="application/pdf"
            inputRef={pdfRef}
            onUrlChange={(v) => onChange({ ...draft, pdf_url: v })}
            onFile={(f) => onUpload("pdf", f)}
            saved={!!draft.id}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : draft.id ? "Save changes" : "Create lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaField({
  label,
  icon,
  url,
  accept,
  inputRef,
  onUrlChange,
  onFile,
  saved,
}: {
  label: string;
  icon: React.ReactNode;
  url: string;
  accept: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onUrlChange: (v: string) => void;
  onFile: (f: File) => Promise<void>;
  saved: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      await onFile(file);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-1.5 md:col-span-2">
      <Label className="flex items-center gap-2">{icon} {label}</Label>
      <Input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Paste a URL or upload a file below"
      />
      <div className="flex items-center gap-2 text-xs">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          disabled={busy || !saved}
          className="text-xs"
        />
        {!saved && <span className="text-muted-foreground">Save lesson first to enable upload</span>}
        {busy && <span className="text-muted-foreground">Uploading…</span>}
      </div>
    </div>
  );
}