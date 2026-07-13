import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Copy as CopyIcon,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ImagePlus,
  Globe,
  Smartphone,
  ExternalLink,
  History,
  RotateCcw,
  Trash,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listHomeSectionsAdmin,
  createHomeSection,
  updateHomeSection,
  deleteHomeSection,
  duplicateHomeSection,
  reorderHomeSection,
  uploadHomeSectionMedia,
  saveHomeSectionDraft,
  listHomeSectionVersions,
  restoreHomeSectionVersion,
  softDeleteHomeSection,
  restoreHomeSection,
  purgeHomeSection,
  type ContentVersionRow,
  type HomeSectionRow,
  type HomeSectionStatus,
} from "@/lib/home-cms.functions";

export const Route = createFileRoute("/_authenticated/admin/home")({
  head: () => ({ meta: [{ title: "Homepage sections CMS · Admin" }] }),
  component: AdminHomeCms,
});

const SECTION_TYPES = [
  "hero",
  "why",
  "postcodes",
  "areas",
  "recent-pass",
  "gallery",
  "quizzes",
  "install-app",
  "portal",
  "cta",
  "custom",
];

const BACKGROUNDS = ["default", "muted", "card", "primary", "accent"];

type Draft = {
  id?: string;
  section_key: string;
  section_type: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  background: string;
  layout: string;
  status: HomeSectionStatus;
  show_web: boolean;
  show_app: boolean;
  sort_order: number;
};

function emptyDraft(): Draft {
  return {
    section_key: "",
    section_type: "custom",
    eyebrow: "",
    title: "",
    subtitle: "",
    body: "",
    image_url: "",
    cta_primary_label: "",
    cta_primary_href: "",
    cta_secondary_label: "",
    cta_secondary_href: "",
    background: "default",
    layout: "default",
    status: "draft",
    show_web: true,
    show_app: true,
    sort_order: 0,
  };
}

function fromRow(r: HomeSectionRow): Draft {
  return {
    id: r.id,
    section_key: r.section_key,
    section_type: r.section_type,
    eyebrow: r.eyebrow,
    title: r.title,
    subtitle: r.subtitle,
    body: r.body,
    image_url: r.image_url,
    cta_primary_label: r.cta_primary_label,
    cta_primary_href: r.cta_primary_href,
    cta_secondary_label: r.cta_secondary_label,
    cta_secondary_href: r.cta_secondary_href,
    background: r.background,
    layout: r.layout,
    status: r.status,
    show_web: r.show_web,
    show_app: r.show_app,
    sort_order: r.sort_order,
  };
}

function AdminHomeCms() {
  const qc = useQueryClient();
  const list = useServerFn(listHomeSectionsAdmin);
  const create = useServerFn(createHomeSection);
  const update = useServerFn(updateHomeSection);
  const remove = useServerFn(deleteHomeSection);
  const dupe = useServerFn(duplicateHomeSection);
  const reorder = useServerFn(reorderHomeSection);
  const upload = useServerFn(uploadHomeSectionMedia);
  const saveDraft = useServerFn(saveHomeSectionDraft);
  const listVersions = useServerFn(listHomeSectionVersions);
  const restoreVersion = useServerFn(restoreHomeSectionVersion);
  const softDelete = useServerFn(softDeleteHomeSection);
  const restoreRow = useServerFn(restoreHomeSection);
  const purgeRow = useServerFn(purgeHomeSection);

  const [showRecycle, setShowRecycle] = useState(false);

  const q = useQuery({
    queryKey: ["admin", "home-sections", showRecycle],
    queryFn: () => list({ data: { include_deleted: showRecycle } }),
  });

  const [editing, setEditing] = useState<Draft | null>(null);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [versions, setVersions] = useState<ContentVersionRow[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editingSnapshot = useRef<string>("");
  const isDirty = useRef(false);

  const rowById = useMemo(() => {
    const m = new Map<string, HomeSectionRow>();
    (q.data ?? []).forEach((r) => m.set(r.id, r));
    return m;
  }, [q.data]);

  const refreshVersions = async (id: string) => {
    try {
      const v = await listVersions({ data: { id } });
      setVersions(v);
    } catch {
      // ignore
    }
  };

  // Autosave: 1.5s debounce for edits to existing sections
  useEffect(() => {
    if (!editing?.id) return;
    const current = JSON.stringify(editing);
    if (current === editingSnapshot.current) return; // no real change
    isDirty.current = true;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (!editing.id) return;
      setAutosaveState("saving");
      try {
        const payload = { ...editing };
        delete (payload as { id?: string }).id;
        await saveDraft({
          data: { id: editing.id, patch: payload, kind: "autosave" },
        });
        setAutosaveState("saved");
        setLastSavedAt(new Date());
        isDirty.current = false;
        editingSnapshot.current = current;
        qc.invalidateQueries({ queryKey: ["admin", "home-sections"] });
      } catch {
        setAutosaveState("error");
      }
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // Reset autosave snapshot when opening a section
  useEffect(() => {
    if (editing?.id) {
      editingSnapshot.current = JSON.stringify(editing);
      setAutosaveState("idle");
      isDirty.current = false;
      void refreshVersions(editing.id);
    } else {
      editingSnapshot.current = "";
      setVersions([]);
      setShowHistory(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);

  const rows = useMemo(() => {
    const all = q.data ?? [];
    if (!filter.trim()) return all;
    const f = filter.toLowerCase();
    return all.filter(
      (r) =>
        r.section_key.toLowerCase().includes(f) ||
        r.title.toLowerCase().includes(f) ||
        r.section_type.toLowerCase().includes(f),
    );
  }, [q.data, filter]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "home-sections"] });

  const onSave = async (publish = false) => {
    if (!editing) return;
    if (!editing.section_key.trim()) {
      toast.error("Section key is required");
      return;
    }
    setBusy(true);
    try {
      const payload = { ...editing };
      delete (payload as { id?: string }).id;
      if (publish) (payload as { status: HomeSectionStatus }).status = "published";
      if (editing.id) {
        await saveDraft({
          data: {
            id: editing.id,
            patch: payload,
            kind: publish ? "publish" : "manual",
          },
        });
        toast.success(publish ? "Published" : "Saved");
      } else {
        const row = await create({ data: { section: payload } });
        toast.success("Created");
        // Snapshot the initial state so it appears in version history
        try {
          await saveDraft({
            data: { id: row.id, patch: {}, kind: "manual" },
          });
        } catch {
          /* non-fatal */
        }
      }
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (row: HomeSectionRow) => {
    if (!confirm(`Move section "${row.section_key}" to the recycle bin?`)) return;
    try {
      await softDelete({ data: { id: row.id } });
      toast.success("Moved to recycle bin");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onRestore = async (row: HomeSectionRow) => {
    try {
      await restoreRow({ data: { id: row.id } });
      toast.success("Restored");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onPurge = async (row: HomeSectionRow) => {
    if (!confirm(`Permanently delete "${row.section_key}"? This cannot be undone.`)) return;
    try {
      await purgeRow({ data: { id: row.id } });
      toast.success("Permanently deleted");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onRestoreVersion = async (v: ContentVersionRow) => {
    if (!editing?.id) return;
    if (!confirm("Restore this version? The current content will be snapshotted first.")) return;
    try {
      const row = await restoreVersion({ data: { id: editing.id, version_id: v.id } });
      setEditing(fromRow(row));
      toast.success("Restored");
      void refreshVersions(editing.id);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  // Silence the unused remove warning; kept for backward compatibility
  void remove;

  const onDuplicate = async (row: HomeSectionRow) => {
    try {
      await dupe({ data: { id: row.id } });
      toast.success("Duplicated");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onMove = async (row: HomeSectionRow, direction: "up" | "down") => {
    try {
      await reorder({ data: { id: row.id, direction } });
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onToggle = async (row: HomeSectionRow, patch: Partial<HomeSectionRow>) => {
    try {
      await update({ data: { id: row.id, patch: patch as never } });
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onUpload = async (file: File) => {
    if (!editing) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      const base64 = btoa(bin);
      const { url } = await upload({
        data: {
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          base64,
        },
      });
      setEditing({ ...editing, image_url: url });
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Homepage sections" eyebrow="CMS">
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter by key, title or type…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-72"
            />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View homepage
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showRecycle ? "default" : "outline"}
              onClick={() => setShowRecycle((v) => !v)}
              className="gap-2"
            >
              <Trash className="h-4 w-4" />
              {showRecycle ? "Hide recycle bin" : "Recycle bin"}
            </Button>
            <Button onClick={() => setEditing(emptyDraft())} className="gap-2">
              <Plus className="h-4 w-4" /> New section
            </Button>
          </div>
        </div>

        {showRecycle && (
          <p className="text-xs text-muted-foreground">
            Deleted sections are kept here and hidden from the public site. Restore to bring them
            back, or permanently delete to remove them and their version history.
          </p>
        )}

        <div className="overflow-hidden border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Key / Title</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-center">Web</th>
                <th className="px-3 py-2 text-center">App</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {q.isLoading && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!q.isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    No sections yet.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={i === 0}
                        onClick={() => onMove(r, "up")}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={i === rows.length - 1}
                        onClick={() => onMove(r, "down")}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <span className="ml-1 text-xs text-muted-foreground">{r.sort_order}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {r.title || <span className="text-muted-foreground">(untitled)</span>}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">{r.section_key}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{r.section_type}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={r.status}
                      onValueChange={(v) => onToggle(r, { status: v as HomeSectionStatus })}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onToggle(r, { show_web: !r.show_web })}
                      className="inline-flex items-center gap-1 text-xs"
                      title={r.show_web ? "Visible on website" : "Hidden on website"}
                    >
                      <Globe
                        className={
                          r.show_web ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"
                        }
                      />
                      {r.show_web ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onToggle(r, { show_app: !r.show_app })}
                      className="inline-flex items-center gap-1 text-xs"
                      title={r.show_app ? "Visible in app" : "Hidden in app"}
                    >
                      <Smartphone
                        className={
                          r.show_app ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"
                        }
                      />
                      {r.show_app ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {r.deleted_at ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRestore(r)}
                            className="gap-1"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => onPurge(r)}
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(fromRow(r))}
                          >
                            Edit
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => onDuplicate(r)}
                            title="Duplicate"
                          >
                            <CopyIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => onDelete(r)}
                            title="Move to recycle bin"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit section" : "New section"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Section key</Label>
                  <Input
                    value={editing.section_key}
                    onChange={(e) => setEditing({ ...editing, section_key: e.target.value })}
                    placeholder="e.g. hero, promo-banner"
                    disabled={!!editing.id}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Unique identifier used by the site to render this section.
                  </p>
                </div>
                <div>
                  <Label>Section type</Label>
                  <Select
                    value={editing.section_type}
                    onValueChange={(v) => setEditing({ ...editing, section_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Eyebrow (small text above title)</Label>
                <Input
                  value={editing.eyebrow}
                  onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })}
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea
                  rows={4}
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </div>

              <div>
                <Label>Image</Label>
                {editing.image_url && (
                  <img
                    src={editing.image_url}
                    alt=""
                    className="mt-2 max-h-40 border border-border object-cover"
                  />
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={editing.image_url}
                    onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                    placeholder="https://…"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUpload(f);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    className="gap-2"
                  >
                    <ImagePlus className="h-4 w-4" /> Upload
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Primary button label</Label>
                  <Input
                    value={editing.cta_primary_label}
                    onChange={(e) => setEditing({ ...editing, cta_primary_label: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Primary button link</Label>
                  <Input
                    value={editing.cta_primary_href}
                    onChange={(e) => setEditing({ ...editing, cta_primary_href: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
                <div>
                  <Label>Secondary button label</Label>
                  <Input
                    value={editing.cta_secondary_label}
                    onChange={(e) =>
                      setEditing({ ...editing, cta_secondary_label: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Secondary button link</Label>
                  <Input
                    value={editing.cta_secondary_href}
                    onChange={(e) => setEditing({ ...editing, cta_secondary_href: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Background</Label>
                  <Select
                    value={editing.background}
                    onValueChange={(v) => setEditing({ ...editing, background: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BACKGROUNDS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editing.status}
                    onValueChange={(v) =>
                      setEditing({ ...editing, status: v as HomeSectionStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={editing.show_web}
                    onCheckedChange={(v) => setEditing({ ...editing, show_web: v })}
                  />
                  <Globe className="h-4 w-4" /> Show on website
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={editing.show_app}
                    onCheckedChange={(v) => setEditing({ ...editing, show_app: v })}
                  />
                  <Smartphone className="h-4 w-4" /> Show in app
                </label>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-wrap items-center justify-between gap-2 sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {autosaveState === "saving" && (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Autosaving…
                </span>
              )}
              {autosaveState === "saved" && lastSavedAt && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <CheckCircle2 className="h-3 w-3" /> Autosaved{" "}
                  {lastSavedAt.toLocaleTimeString()}
                </span>
              )}
              {autosaveState === "error" && (
                <span className="text-destructive">Autosave failed — click Save Draft.</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setEditing(null)} className="gap-2">
                <X className="h-4 w-4" /> Close
              </Button>
              <Button variant="outline" onClick={() => onSave(false)} disabled={busy} className="gap-2">
                <Save className="h-4 w-4" /> Save draft
              </Button>
              <Button onClick={() => onSave(true)} disabled={busy} className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Publish
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
