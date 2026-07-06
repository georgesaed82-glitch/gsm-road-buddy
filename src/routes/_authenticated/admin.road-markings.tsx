import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  Save,
  Trash2,
  Plus,
  RotateCcw,
  X,
  Search,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roadMarkings, markingGroups, type MarkingGroup, type RoadMarking } from "@/data/roadMarkings";
import { useContentOverrides } from "@/hooks/useContentOverrides";
import {
  upsertContentOverride,
  deleteContentOverride,
  uploadContentImage,
  reorderContentOverrides,
} from "@/lib/content-overrides.functions";
export const Route = createFileRoute("/_authenticated/admin/road-markings")({
  head: () => ({ meta: [{ title: "Road markings library · Admin" }] }),
  component: AdminRoadMarkingsPage,
});

type Row = {
  id: string;
  name: string;
  meaning: string;
  group: MarkingGroup;
  isCustom: boolean;
  base?: RoadMarking;
};

function AdminRoadMarkingsPage() {
  const { isEnabled, sortOrder, customItems, get, all } = useContentOverrides();
  const upsert = useServerFn(upsertContentOverride);
  const del = useServerFn(deleteContentOverride);
  const upload = useServerFn(uploadContentImage);
  const reorder = useServerFn(reorderContentOverrides);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<MarkingGroup | "all">("all");
  const [showHidden, setShowHidden] = useState(true);
  const [search, setSearch] = useState("");

  const rows = useMemo<Row[]>(() => {
    const base: Row[] = roadMarkings.map((m) => ({
      id: m.id,
      name: m.name,
      meaning: m.meaning,
      group: m.group,
      isCustom: false,
      base: m,
    }));
    const custom: Row[] = customItems("marking").map((r) => ({
      id: r.item_id,
      name: r.name ?? "Custom marking",
      meaning: r.description ?? "",
      group: (markingGroups.some((g) => g.slug === r.group_slug)
        ? (r.group_slug as MarkingGroup)
        : "along"),
      isCustom: true,
    }));
    const merged = [...base, ...custom];
    merged.sort((a, b) => sortOrder("marking", a.id) - sortOrder("marking", b.id));
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customItems, sortOrder, all]);

  const filtered = rows.filter((r) => {
    if (!showHidden && !isEnabled("marking", r.id)) return false;
    const ov = get("marking", r.id);
    const effective = (ov?.group_slug as MarkingGroup | undefined) ?? r.group;
    if (filter !== "all" && effective !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (ov?.name ?? r.name).toLowerCase();
      const meaning = (ov?.description ?? r.meaning).toLowerCase();
      if (!name.includes(q) && !meaning.includes(q) && !r.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["content-overrides"] });

  const move = async (id: string, dir: -1 | 1) => {
    const fullIds = rows.map((r) => r.id);
    const idx = fullIds.indexOf(id);
    const target = idx + dir;
    if (target < 0 || target >= fullIds.length) return;
    [fullIds[idx], fullIds[target]] = [fullIds[target], fullIds[idx]];
    try {
      await reorder({ data: { kind: "marking", item_ids: fullIds } });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  const toggleEnabled = async (row: Row) => {
    const nextEnabled = !isEnabled("marking", row.id);
    try {
      await upsert({
        data: {
          kind: "marking",
          item_id: row.id,
          enabled: nextEnabled,
        },
      });
      invalidate();
      toast.success(nextEnabled ? "Shown" : "Hidden");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const addCustom = async () => {
    const id = `custom:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    try {
      await upsert({
        data: {
          kind: "marking",
          item_id: id,
          name: "New custom marking",
          description: "Describe what this marking means…",
          group_slug: "along",
          enabled: true,
          sort_order: (rows.length + 1) * 10,
        },
      });
      invalidate();
      toast.success("Custom marking added — edit it below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    }
  };

  const duplicate = async (row: Row) => {
    const id = `custom:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const ov = get("marking", row.id);
    try {
      await upsert({
        data: {
          kind: "marking",
          item_id: id,
          name: `${ov?.name ?? row.name} (copy)`,
          description: ov?.description ?? row.meaning,
          group_slug: (ov?.group_slug as string | undefined) ?? row.group,
          image_path: ov?.image_path ?? null,
          enabled: true,
          sort_order: (rows.length + 1) * 10,
        },
      });
      invalidate();
      toast.success("Duplicated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Duplicate failed");
    }
  };

  return (
    <AdminShell eyebrow="Content" title="Road markings library">
      <p className="max-w-3xl text-sm text-muted-foreground">
        Manage every painted road marking. Upload your own image to replace the
        built-in diagram, edit the name or meaning, hide markings, reorder them,
        duplicate existing entries, or add entirely new custom markings.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Group</Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as MarkingGroup | "all")}>
            <SelectTrigger className="h-9 w-[220px] rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({rows.length})</SelectItem>
              {markingGroups.map((g) => (
                <SelectItem key={g.slug} value={g.slug}>{g.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search markings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-[220px] rounded-none pl-7"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
          />
          Show hidden
        </label>
        <div className="ml-auto">
          <Button onClick={addCustom} className="rounded-none">
            <Plus className="mr-2 h-3.5 w-3.5" /> Add custom marking
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.map((row) => (
          <MarkingRow
            key={row.id}
            row={row}
            enabled={isEnabled("marking", row.id)}
            onMoveUp={() => move(row.id, -1)}
            onMoveDown={() => move(row.id, 1)}
            onToggle={() => toggleEnabled(row)}
            onDuplicate={() => duplicate(row)}
            onDeleteCustom={async () => {
              if (!confirm(`Delete "${row.name}"?`)) return;
              try {
                await del({ data: { kind: "marking", item_id: row.id } });
                invalidate();
                toast.success("Deleted");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Delete failed");
              }
            }}
            onResetOverride={async () => {
              if (!confirm("Reset back to the built-in diagram and text?")) return;
              try {
                await del({ data: { kind: "marking", item_id: row.id } });
                invalidate();
                toast.success("Reset");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Reset failed");
              }
            }}
            onSave={async (draft) => {
              try {
                await upsert({
                  data: {
                    kind: "marking",
                    item_id: row.id,
                    name: draft.name,
                    description: draft.meaning,
                    group_slug: draft.group,
                  },
                });
                invalidate();
                toast.success("Saved");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Save failed");
              }
            }}
            onUploadImage={async (file) => {
              const b64 = await fileToBase64(file);
              try {
                const uploaded = await upload({
                  data: {
                    kind: "marking",
                    item_id: row.id,
                    filename: file.name,
                    content_type: file.type || "image/png",
                    base64: b64,
                  },
                });
                await upsert({
                  data: {
                    kind: "marking",
                    item_id: row.id,
                    image_path: uploaded.image_path,
                  },
                });
                invalidate();
                toast.success("Image uploaded");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Upload failed");
              }
            }}
          />
        ))}
        {!filtered.length && (
          <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No markings match this filter.
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function MarkingRow({
  row,
  enabled,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDuplicate,
  onDeleteCustom,
  onResetOverride,
  onSave,
  onUploadImage,
}: {
  row: Row;
  enabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDeleteCustom: () => void;
  onResetOverride: () => void;
  onSave: (draft: { name: string; meaning: string; group: MarkingGroup }) => void;
  onUploadImage: (file: File) => void;
}) {
  const { get } = useContentOverrides();
  const ov = get("marking", row.id);
  const currentName = ov?.name ?? row.name;
  const currentMeaning = ov?.description ?? row.meaning;
  const currentGroup = (ov?.group_slug as MarkingGroup | undefined) ?? row.group;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: currentName, meaning: currentMeaning, group: currentGroup });

  const overrideImg = ov?.image_url ?? null;
  const hasCustomisation = Boolean(ov && (ov.name || ov.description || ov.group_slug || ov.image_path));
  const Visual = row.base?.Visual;

  return (
    <div className={`grid grid-cols-[auto_120px_1fr_auto] items-start gap-4 border p-4 ${enabled ? "border-border bg-card" : "border-dashed border-border bg-muted/40 opacity-70"}`}>
      <div className="flex flex-col items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveUp} aria-label="Move up">
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveDown} aria-label="Move down">
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden border border-border bg-neutral-900">
        {overrideImg ? (
          <img src={overrideImg} alt={currentName} className="h-full w-full object-cover" />
        ) : Visual ? (
          <Visual />
        ) : (
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">No image</div>
        )}
      </div>
      <div className="min-w-0">
        {editing ? (
          <div className="grid gap-2">
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Name"
            />
            <Textarea
              value={draft.meaning}
              onChange={(e) => setDraft((d) => ({ ...d, meaning: e.target.value }))}
              placeholder="Meaning"
              rows={3}
            />
            <Select
              value={draft.group}
              onValueChange={(v) => setDraft((d) => ({ ...d, group: v as MarkingGroup }))}
            >
              <SelectTrigger className="h-9 rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {markingGroups.map((g) => (
                  <SelectItem key={g.slug} value={g.slug}>{g.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-none"
                onClick={() => {
                  onSave(draft);
                  setEditing(false);
                }}
              >
                <Save className="mr-2 h-3.5 w-3.5" /> Save
              </Button>
              <Button size="sm" variant="outline" className="rounded-none" onClick={() => setEditing(false)}>
                <X className="mr-2 h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base text-foreground">{currentName}</h3>
              {row.isCustom && <Badge variant="outline">Custom</Badge>}
              {!enabled && <Badge variant="outline">Hidden</Badge>}
              {hasCustomisation && !row.isCustom && <Badge variant="secondary">Customised</Badge>}
              <Badge variant="outline">{markingGroups.find((g) => g.slug === currentGroup)?.title ?? currentGroup}</Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{currentMeaning}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{row.id}</p>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" className="rounded-none" onClick={() => setEditing((v) => !v)}>
          Edit
        </Button>
        <label className="inline-flex">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) onUploadImage(f);
            }}
          />
          <span className="inline-flex cursor-pointer items-center border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary">
            <Upload className="mr-1.5 h-3 w-3" /> {overrideImg ? "Replace" : "Upload"}
          </span>
        </label>
        <Button variant="outline" size="sm" className="rounded-none" onClick={onToggle}>
          {enabled ? <><EyeOff className="mr-1.5 h-3 w-3" /> Hide</> : <><Eye className="mr-1.5 h-3 w-3" /> Show</>}
        </Button>
        <Button variant="outline" size="sm" className="rounded-none" onClick={onDuplicate}>
          <Plus className="mr-1.5 h-3 w-3" /> Duplicate
        </Button>
        {row.isCustom ? (
          <Button variant="outline" size="sm" className="rounded-none text-destructive" onClick={onDeleteCustom}>
            <Trash2 className="mr-1.5 h-3 w-3" /> Delete
          </Button>
        ) : hasCustomisation ? (
          <Button variant="outline" size="sm" className="rounded-none" onClick={onResetOverride}>
            <RotateCcw className="mr-1.5 h-3 w-3" /> Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}