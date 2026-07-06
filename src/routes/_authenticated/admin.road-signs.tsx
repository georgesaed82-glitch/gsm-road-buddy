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
import { OfficialSignImage } from "@/components/OfficialSignImage";
import { signs, type Sign, type SignCategory } from "@/data/signs";
import { useContentOverrides } from "@/hooks/useContentOverrides";
import {
  upsertContentOverride,
  deleteContentOverride,
  uploadContentImage,
  reorderContentOverrides,
} from "@/lib/content-overrides.functions";
export const Route = createFileRoute("/_authenticated/admin/road-signs")({
  head: () => ({ meta: [{ title: "Road signs library · Admin" }] }),
  component: AdminRoadSignsPage,
});

const CATS: { value: SignCategory; label: string }[] = [
  { value: "warning", label: "Warning" },
  { value: "prohibitory", label: "Prohibitory" },
  { value: "mandatory", label: "Mandatory" },
  { value: "speed", label: "Speed" },
  { value: "information", label: "Information" },
  { value: "direction", label: "Direction" },
  { value: "signals", label: "Signals" },
  { value: "crossings", label: "Crossings" },
];

type Row = {
  id: string;
  name: string;
  meaning: string;
  category: SignCategory;
  isCustom: boolean;
  baseSign?: Sign;
};

function AdminRoadSignsPage() {
  const { all, isEnabled, sortOrder, customItems, get } = useContentOverrides();
  const upsert = useServerFn(upsertContentOverride);
  const del = useServerFn(deleteContentOverride);
  const upload = useServerFn(uploadContentImage);
  const reorder = useServerFn(reorderContentOverrides);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<SignCategory | "all">("all");
  const [showHidden, setShowHidden] = useState(true);

  const rows = useMemo<Row[]>(() => {
    const baseRows: Row[] = signs.map((s) => ({
      id: s.id,
      name: s.name,
      meaning: s.meaning,
      category: s.category,
      isCustom: false,
      baseSign: s,
    }));
    const customRows: Row[] = customItems("sign").map((r) => ({
      id: r.item_id,
      name: r.name ?? "Custom sign",
      meaning: r.description ?? "",
      category: (CATS.some((c) => c.value === r.group_slug)
        ? (r.group_slug as SignCategory)
        : "information"),
      isCustom: true,
    }));
    const merged = [...baseRows, ...customRows];
    merged.sort((a, b) => sortOrder("sign", a.id) - sortOrder("sign", b.id));
    return merged;
  }, [customItems, sortOrder, all]);

  const filtered = rows.filter((r) => {
    if (!showHidden && !isEnabled("sign", r.id)) return false;
    if (filter === "all") return true;
    // Use current-override category if edited
    const ov = get("sign", r.id);
    const effective = (ov?.group_slug as SignCategory | undefined) ?? r.category;
    return effective === filter;
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["content-overrides"] });

  const move = async (id: string, dir: -1 | 1) => {
    const ids = filtered.map((r) => r.id);
    const idx = ids.indexOf(id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= ids.length) return;
    const next = ids.slice();
    [next[idx], next[target]] = [next[target], next[idx]];
    // Reorder ALL rows so persisted sort_order matches full-list positions.
    const otherIds = rows.filter((r) => !ids.includes(r.id)).map((r) => r.id);
    const fullOrder = [
      ...rows.map((r) => r.id).filter((i) => !next.includes(i) && !otherIds.includes(i)),
      ...next,
      ...otherIds,
    ];
    // Simpler: compute the new full order by mirroring the move within `rows`.
    const fullIds = rows.map((r) => r.id);
    const fIdx = fullIds.indexOf(id);
    const fTarget = fullIds.indexOf(ids[target]);
    [fullIds[fIdx], fullIds[fTarget]] = [fullIds[fTarget], fullIds[fIdx]];
    void fullOrder;

    try {
      await reorder({ data: { kind: "sign", item_ids: fullIds } });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  const toggleEnabled = async (row: Row) => {
    const nextEnabled = !isEnabled("sign", row.id);
    try {
      await upsert({
        data: {
          kind: "sign",
          item_id: row.id,
          enabled: nextEnabled,
        },
      });
      invalidate();
      toast.success(nextEnabled ? "Sign shown" : "Sign hidden");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const addCustom = async () => {
    const id = `custom:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    try {
      await upsert({
        data: {
          kind: "sign",
          item_id: id,
          name: "New custom sign",
          description: "Describe what this sign means…",
          group_slug: "information",
          enabled: true,
          sort_order: (rows.length + 1) * 10,
        },
      });
      invalidate();
      toast.success("Custom sign added — edit it below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    }
  };

  return (
    <AdminShell eyebrow="Content" title="Road signs library">
      <p className="max-w-3xl text-sm text-muted-foreground">
        Manage every road sign that appears in the Highway Code learning
        section. Upload your own image to replace the artwork, edit the name or
        meaning, hide signs you don't want learners to see, reorder them, or add
        entirely new custom signs.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Category</Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as SignCategory | "all")}>
            <SelectTrigger className="h-9 w-[180px] rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({rows.length})</SelectItem>
              {CATS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <Plus className="mr-2 h-3.5 w-3.5" /> Add custom sign
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.map((row) => (
          <SignRow
            key={row.id}
            row={row}
            enabled={isEnabled("sign", row.id)}
            onMoveUp={() => move(row.id, -1)}
            onMoveDown={() => move(row.id, 1)}
            onToggle={() => toggleEnabled(row)}
            onDeleteCustom={async () => {
              if (!confirm(`Delete "${row.name}"?`)) return;
              try {
                await del({ data: { kind: "sign", item_id: row.id } });
                invalidate();
                toast.success("Sign deleted");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Delete failed");
              }
            }}
            onResetOverride={async () => {
              if (!confirm("Reset this sign back to the built-in artwork and text?")) return;
              try {
                await del({ data: { kind: "sign", item_id: row.id } });
                invalidate();
                toast.success("Reset to defaults");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Reset failed");
              }
            }}
            onSave={async (draft) => {
              try {
                await upsert({
                  data: {
                    kind: "sign",
                    item_id: row.id,
                    name: draft.name,
                    description: draft.meaning,
                    group_slug: draft.category,
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
                    kind: "sign",
                    item_id: row.id,
                    filename: file.name,
                    content_type: file.type || "image/png",
                    base64: b64,
                  },
                });
                await upsert({
                  data: {
                    kind: "sign",
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
            No signs match this filter.
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function SignRow({
  row,
  enabled,
  onMoveUp,
  onMoveDown,
  onToggle,
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
  onDeleteCustom: () => void;
  onResetOverride: () => void;
  onSave: (draft: { name: string; meaning: string; category: SignCategory }) => void;
  onUploadImage: (file: File) => void;
}) {
  const { get } = useContentOverrides();
  const ov = get("sign", row.id);
  const currentName = ov?.name ?? row.name;
  const currentMeaning = ov?.description ?? row.meaning;
  const currentCat = (ov?.group_slug as SignCategory | undefined) ?? row.category;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: currentName, meaning: currentMeaning, category: currentCat });

  const overrideImg = ov?.image_url ?? null;
  const hasCustomisation = Boolean(ov && (ov.name || ov.description || ov.group_slug || ov.image_path));

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
      <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center bg-background">
        {row.baseSign ? (
          <OfficialSignImage sign={row.baseSign} variant="card" overrideSrc={overrideImg} />
        ) : overrideImg ? (
          <img src={overrideImg} alt={currentName} className="max-h-full max-w-full object-contain" />
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
              value={draft.category}
              onValueChange={(v) => setDraft((d) => ({ ...d, category: v as SignCategory }))}
            >
              <SelectTrigger className="h-9 rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
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
              <Badge variant="outline">{CATS.find((c) => c.value === currentCat)?.label ?? currentCat}</Badge>
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