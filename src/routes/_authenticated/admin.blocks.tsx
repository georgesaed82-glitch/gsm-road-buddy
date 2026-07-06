import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Upload, X } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { theoryCategories } from "@/data/theory";
import { reviews } from "@/data/reviews";
import { georgesTips } from "@/data/georgesTips";
import {
  listContentOverrides,
  upsertContentOverride,
  deleteContentOverride,
  uploadContentImage,
  type ContentKind,
  type ContentOverrideRow,
  type OverrideBlock,
} from "@/lib/content-overrides.functions";
export const Route = createFileRoute("/_authenticated/admin/blocks")({
  head: () => ({ meta: [{ title: "Edit George's methods, tips & reviews · Admin" }] }),
  component: AdminBlocksPage,
});

type Section = "georges-tip" | "georges-principle" | "memory-tip" | "common-fail" | "review";

type Field = "title" | "body" | "aid" | "rule" | "note";

type SectionSpec = {
  label: string;
  itemsLabel: string;
  items: { id: string; label: string }[];
  fields: Field[];
  mode: "blocks" | "strings"; // strings for George's principles (plain list)
  helper?: string;
  defaults: (id: string) => OverrideBlock[] | string[];
  perItemMeta?: (id: string) => { name?: string; description?: string };
};

const stripReactNode = (node: unknown): string => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(stripReactNode).join(" ");
  if (node && typeof node === "object" && "props" in node) {
    // @ts-expect-error — ReactNode traversal
    return stripReactNode(node.props.children);
  }
  return "";
};

const SECTIONS: Record<Section, SectionSpec> = {
  "georges-tip": {
    label: "George's tips (per topic)",
    itemsLabel: "Topic",
    items: theoryCategories.map((c) => ({ id: c.slug, label: c.title })),
    fields: ["title", "body"],
    mode: "blocks",
    helper: "Each block becomes one “George says” card on the Highway Code topic.",
    defaults: (id) =>
      (georgesTips[id] ?? []).map((t) => ({
        title: t.title,
        body: stripReactNode(t.body).replace(/\s+/g, " ").trim(),
      })),
  },
  "georges-principle": {
    label: "George's principles",
    itemsLabel: "Set",
    items: [{ id: "default", label: "The nine driving principles" }],
    fields: ["title"], // used as the single-line entry
    mode: "strings",
    helper: "Shown on the Highway Code page as the numbered list of driving principles.",
    defaults: () => [
      "Stretch your vision.",
      "Plan to stop, look to go.",
      "Use the 15–70–15 scanning method.",
      "Keep traffic moving safely.",
      "Stay in your lane.",
      "Drive defensively.",
      "Look for other people's mistakes.",
      "Read the road early, not late.",
      "Good observation gives you more time to make better decisions.",
    ],
  },
  "memory-tip": {
    label: "Memory tips",
    itemsLabel: "Set",
    items: [{ id: "default", label: "Memory aids panel" }],
    fields: ["title", "aid", "body"],
    mode: "blocks",
    helper: "Each block is one memory-aid card (title, mnemonic, explanation).",
    defaults: () => [
      { title: "Road studs — which colour, where?", aid: "Red = Left · Amber = Right · White = Middle · Green = sliP road", body: "Red on the left edge, Amber on the right, White between lanes, Green where a slip road meets the main carriageway." },
    ],
  },
  "common-fail": {
    label: "Common fail reasons",
    itemsLabel: "Set",
    items: [{ id: "default", label: "Common reasons people fail" }],
    fields: ["title", "body", "rule"],
    mode: "blocks",
    helper: "Each block is one fail-reason card. The rule label shows underneath (e.g. “Rules 159, 161”).",
    defaults: () => [
      { title: "Not checking mirrors properly", body: "Examiners want MSM every single time.", rule: "Rules 159, 161" },
    ],
  },
  review: {
    label: "Reviews",
    itemsLabel: "Review",
    items: reviews.map((r, i) => ({ id: `r-${i}`, label: `${i + 1}. ${r.name}` })),
    fields: ["body"],
    mode: "blocks",
    helper: "Author name and note edit inline. The quote block below is the review text.",
    defaults: (id) => {
      const i = Number(id.replace("r-", ""));
      const r = reviews[i];
      return r ? [{ body: r.quote }] : [];
    },
    perItemMeta: (id) => {
      const i = Number(id.replace("r-", ""));
      const r = reviews[i];
      return r ? { name: r.name, description: r.note } : {};
    },
  },
};

function AdminBlocksPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listContentOverrides);
  const upsertFn = useServerFn(upsertContentOverride);
  const deleteFn = useServerFn(deleteContentOverride);
  const uploadFn = useServerFn(uploadContentImage);

  const [section, setSection] = useState<Section>("georges-tip");
  const [itemIdx, setItemIdx] = useState(0);
  useEffect(() => setItemIdx(0), [section]);

  const spec = SECTIONS[section];
  const currentItem = spec.items[itemIdx];

  const { data: overrides = [] } = useQuery({
    queryKey: ["content-overrides"],
    queryFn: () => listFn(),
  });
  const overrideMap = useMemo(() => {
    const m = new Map<string, ContentOverrideRow>();
    for (const o of overrides) m.set(`${o.kind}:${o.item_id}`, o);
    return m;
  }, [overrides]);

  const existing = currentItem ? overrideMap.get(`${section}:${currentItem.id}`) : undefined;

  const [blocks, setBlocks] = useState<OverrideBlock[]>([]);
  const [strings, setStrings] = useState<string[]>([]);
  const [meta, setMeta] = useState<{ name: string; description: string }>({ name: "", description: "" });

  useEffect(() => {
    if (!currentItem) return;
    const defaults = spec.defaults(currentItem.id);
    const metaDefaults = spec.perItemMeta?.(currentItem.id) ?? {};
    if (existing) {
      if (spec.mode === "strings") {
        setStrings((existing.data?.strings as string[] | undefined) ?? (defaults as string[]));
      } else {
        setBlocks((existing.data?.blocks as OverrideBlock[] | undefined) ?? (defaults as OverrideBlock[]));
      }
      setMeta({
        name: existing.name ?? metaDefaults.name ?? "",
        description: existing.description ?? metaDefaults.description ?? "",
      });
    } else {
      if (spec.mode === "strings") setStrings(defaults as string[]);
      else setBlocks(defaults as OverrideBlock[]);
      setMeta({ name: metaDefaults.name ?? "", description: metaDefaults.description ?? "" });
    }
  }, [section, currentItem, existing, spec]);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!currentItem) return;
    setSaving(true);
    try {
      const usePerItemMeta = !!spec.perItemMeta;
      await upsertFn({
        data: {
          kind: section as ContentKind,
          item_id: currentItem.id,
          name: usePerItemMeta ? meta.name.trim() || null : null,
          description: usePerItemMeta ? meta.description.trim() || null : null,
          data: spec.mode === "strings"
            ? { strings: strings.map((s) => s.trim()).filter(Boolean) }
            : { blocks: blocks
                .map((b) => ({
                  title: b.title?.trim() || undefined,
                  body: b.body?.trim() || undefined,
                  aid: b.aid?.trim() || undefined,
                  rule: b.rule?.trim() || undefined,
                  note: b.note?.trim() || undefined,
                  image_path: b.image_path || undefined,
                }))
                .filter((b) => b.title || b.body || b.aid || b.rule || b.note || b.image_path),
            },
        },
      });
      toast.success("Saved");
      await qc.invalidateQueries({ queryKey: ["content-overrides"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetToOriginal = () => {
    if (!currentItem) return;
    const defaults = spec.defaults(currentItem.id);
    const metaDefaults = spec.perItemMeta?.(currentItem.id) ?? {};
    if (spec.mode === "strings") setStrings(defaults as string[]);
    else setBlocks(defaults as OverrideBlock[]);
    setMeta({ name: metaDefaults.name ?? "", description: metaDefaults.description ?? "" });
  };

  const removeOverride = async () => {
    if (!existing || !currentItem) return;
    if (!window.confirm("Remove this override and restore the original?")) return;
    try {
      await deleteFn({ data: { kind: section as ContentKind, item_id: currentItem.id } });
      toast.success("Removed");
      await qc.invalidateQueries({ queryKey: ["content-overrides"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const editedInSection = overrides.filter((o) => o.kind === section).length;

  return (
    <AdminShell eyebrow="Admin" title="Edit George's methods, tips & reviews">
      <div className="mb-6 grid gap-3 sm:grid-cols-[240px_1fr_auto] sm:items-end">
        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Section</Label>
          <Select value={section} onValueChange={(v) => setSection(v as Section)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(SECTIONS) as Section[]).map((s) => (
                <SelectItem key={s} value={s}>{SECTIONS[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{spec.itemsLabel}</Label>
          <Select
            value={currentItem?.id ?? ""}
            onValueChange={(id) => setItemIdx(spec.items.findIndex((it) => it.id === id))}
          >
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {spec.items.map((it, i) => (
                <SelectItem key={it.id} value={it.id}>
                  {i + 1}. {it.label} {overrideMap.has(`${section}:${it.id}`) ? "•" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {itemIdx + 1} of {spec.items.length} · {editedInSection} edited
        </div>
      </div>

      {spec.helper && (
        <p className="mb-4 text-xs text-muted-foreground">{spec.helper}</p>
      )}

      {currentItem && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase">{currentItem.id}</Badge>
              {existing && (
                <Badge className="bg-emerald-600 text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> edited
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={itemIdx === 0} onClick={() => setItemIdx((i) => Math.max(0, i - 1))}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={itemIdx >= spec.items.length - 1} onClick={() => setItemIdx((i) => Math.min(spec.items.length - 1, i + 1))}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {spec.perItemMeta && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Author name</Label>
                  <Input className="mt-1" value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
                </div>
                <div>
                  <Label>Note (e.g. “GSM learner”)</Label>
                  <Input className="mt-1" value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
                </div>
              </div>
            )}

            {spec.mode === "strings" ? (
              <StringListEditor value={strings} onChange={setStrings} />
            ) : (
              <BlockListEditor
                value={blocks}
                onChange={setBlocks}
                fields={spec.fields}
                onUploadImage={async (file) => {
                  if (!currentItem) throw new Error("No item selected");
                  if (file.size > 5 * 1024 * 1024) throw new Error("Image too large — max 5 MB.");
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    const r = new FileReader();
                    r.onload = () => resolve(String(r.result));
                    r.onerror = () => reject(r.error);
                    r.readAsDataURL(file);
                  });
                  const res = await uploadFn({
                    data: {
                      kind: section as ContentKind,
                      item_id: currentItem.id,
                      filename: file.name,
                      content_type: file.type || "image/png",
                      base64: dataUrl,
                    },
                  });
                  return { image_path: res.image_path, image_url: res.image_url };
                }}
              />
            )}

            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <Button onClick={save} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="outline" onClick={resetToOriginal} disabled={saving}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to original
              </Button>
              {existing && (
                <Button variant="outline" onClick={removeOverride} disabled={saving}>
                  Remove saved override
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}

function BlockListEditor({
  value,
  onChange,
  fields,
  onUploadImage,
}: {
  value: OverrideBlock[];
  onChange: (v: OverrideBlock[]) => void;
  fields: Field[];
  onUploadImage: (file: File) => Promise<{ image_path: string; image_url: string }>;
}) {
  const update = (i: number, patch: Partial<OverrideBlock>) => {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => {
    if (!window.confirm("Delete this block?")) return;
    onChange(value.filter((_, idx) => idx !== i));
  };
  const add = () => onChange([...value, {}]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const handleUpload = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const res = await onUploadImage(file);
      update(i, { image_path: res.image_path, image_url: res.image_url });
      toast.success("Image uploaded — remember to Save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  const labels: Record<Field, string> = {
    title: "Title",
    body: "Body",
    aid: "Memory aid / mnemonic",
    rule: "Rule reference",
    note: "Note",
  };

  return (
    <div className="space-y-4">
      {value.map((b, i) => (
        <div key={i} className="border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Block {i + 1}</div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {fields.map((f) => {
              const isLong = f === "body";
              return (
                <div key={f}>
                  <Label>{labels[f]}</Label>
                  {isLong ? (
                    <Textarea
                      className="mt-1 min-h-[100px]"
                      value={(b[f] as string | undefined) ?? ""}
                      onChange={(e) => update(i, { [f]: e.target.value })}
                    />
                  ) : (
                    <Input
                      className="mt-1"
                      value={(b[f] as string | undefined) ?? ""}
                      onChange={(e) => update(i, { [f]: e.target.value })}
                    />
                  )}
                </div>
              );
            })}
            <div>
              <Label>Image (optional)</Label>
              <div className="mt-1 flex items-center gap-3">
                {b.image_url ? (
                  <img src={b.image_url} alt="" className="h-20 w-20 border border-border object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center border border-dashed border-border text-[11px] text-muted-foreground">
                    None
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingIdx === i ? "Uploading…" : b.image_url ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingIdx === i}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(i, f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {b.image_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => update(i, { image_path: undefined, image_url: null })}
                    >
                      <X className="mr-1 h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={add}>
        <Plus className="mr-2 h-4 w-4" /> Add block
      </Button>
    </div>
  );
}

function StringListEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <Label>Items (one per line)</Label>
      <Textarea
        className="mt-1 min-h-[260px]"
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
      <p className="mt-1 text-xs text-muted-foreground">Blank lines are ignored on save.</p>
    </div>
  );
}
