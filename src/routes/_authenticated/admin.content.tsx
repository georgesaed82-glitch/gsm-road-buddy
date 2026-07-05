import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OfficialSignImage } from "@/components/OfficialSignImage";
import { signs, type Sign } from "@/data/signs";
import { roadMarkings, markingGroups } from "@/data/roadMarkings";
import { policeSignals, signalGroups } from "@/data/policeSignals";
import { theoryCategories } from "@/data/theory";
import {
  listContentOverrides,
  upsertContentOverride,
  deleteContentOverride,
  uploadContentImage,
  type ContentKind,
  type ContentOverrideRow,
} from "@/lib/content-overrides.functions";
import { getAdminPassword } from "@/lib/admin-gate";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({ meta: [{ title: "Edit signs, markings & arm signals · Admin" }] }),
  component: AdminContentPage,
});

type Item = {
  id: string;
  name: string;
  description: string;
  group: string | null;
  key_points?: string[];
  topics?: string[];
};

function toItems(kind: ContentKind): Item[] {
  if (kind === "sign") {
    return signs.map((s: Sign) => ({ id: s.id, name: s.name, description: s.meaning, group: s.category }));
  }
  if (kind === "marking") {
    return roadMarkings.map((m) => ({ id: m.id, name: m.name, description: m.meaning, group: m.group }));
  }
  if (kind === "signal") {
    return policeSignals.map((s) => ({ id: s.id, name: s.name, description: s.meaning, group: s.group }));
  }
  return theoryCategories.map((c) => ({
    id: c.slug,
    name: c.title,
    description: c.description,
    group: null,
    key_points: c.keyPoints,
    topics: c.topics,
  }));
}

function groupOptionsFor(kind: ContentKind): { value: string; label: string }[] {
  if (kind === "sign") {
    return [
      { value: "warning", label: "Warning" },
      { value: "prohibitory", label: "Prohibitory" },
      { value: "mandatory", label: "Mandatory" },
      { value: "speed", label: "Speed" },
      { value: "information", label: "Information" },
      { value: "direction", label: "Direction" },
      { value: "signals", label: "Signals" },
      { value: "crossings", label: "Crossings" },
    ];
  }
  if (kind === "marking") return markingGroups.map((g) => ({ value: g.slug, label: g.title }));
  if (kind === "signal") return signalGroups.map((g) => ({ value: g.slug, label: g.title }));
  return [];
}

type Draft = {
  name: string;
  description: string;
  group_slug: string;
  image_path: string | null;
  image_url: string | null;
  key_points: string[];
  topics: string[];
};

function draftOf(item: Item, ov?: ContentOverrideRow): Draft {
  return draftOfInner(item, ov);
}

function draftOfInner(item: Item, ov?: ContentOverrideRow): Draft {
  return {
    name: ov?.name ?? item.name,
    description: ov?.description ?? item.description,
    group_slug: ov?.group_slug ?? item.group ?? "",
    image_path: ov?.image_path ?? null,
    image_url: ov?.image_url ?? null,
    key_points: ov?.key_points ?? item.key_points ?? [],
    topics: ov?.topics ?? item.topics ?? [],
  };
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function AdminContentPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listContentOverrides);
  const upsertFn = useServerFn(upsertContentOverride);
  const deleteFn = useServerFn(deleteContentOverride);
  const uploadFn = useServerFn(uploadContentImage);

  const [kind, setKind] = useState<ContentKind>("sign");
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [kind]);

  const items = useMemo(() => toItems(kind), [kind]);
  const current = items[index];

  const { data: overrides = [] } = useQuery({
    queryKey: ["content-overrides"],
    queryFn: () => listFn(),
  });
  const overrideMap = useMemo(() => {
    const m = new Map<string, ContentOverrideRow>();
    for (const o of overrides) m.set(`${o.kind}:${o.item_id}`, o);
    return m;
  }, [overrides]);

  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => {
    if (!current) return setDraft(null);
    setDraft(draftOf(current, overrideMap.get(`${kind}:${current.id}`)));
  }, [current, kind, overrideMap]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!current || !draft) {
    return (
      <AdminShell eyebrow="Admin" title="Edit signs, markings & arm signals">
        <p className="text-sm text-muted-foreground">No items to edit.</p>
      </AdminShell>
    );
  }

  const existing = overrideMap.get(`${kind}:${current.id}`);
  const isEdited = !!existing;

  const originalMatchesDraft =
    draft.name === current.name &&
    draft.description === current.description &&
    draft.group_slug === (current.group ?? "") &&
    !draft.image_path &&
    arraysEqual(draft.key_points, current.key_points ?? []) &&
    arraysEqual(draft.topics, current.topics ?? []);
  const overrideMatchesDraft =
    !!existing &&
    draft.name === (existing.name ?? current.name) &&
    draft.description === (existing.description ?? current.description) &&
    draft.group_slug === (existing.group_slug ?? current.group ?? "") &&
    (draft.image_path ?? null) === (existing.image_path ?? null) &&
    arraysEqual(draft.key_points, existing.key_points ?? current.key_points ?? []) &&
    arraysEqual(draft.topics, existing.topics ?? current.topics ?? []);

  const dirty = existing ? !overrideMatchesDraft : !originalMatchesDraft;

  const requirePassword = (): string | null => {
    const p = getAdminPassword();
    if (!p) {
      toast.error("Admin password missing. Sign in via /auth?admin=1.");
      return null;
    }
    return p;
  };

  const save = async () => {
    const password = requirePassword();
    if (!password) return;
    if (!draft.name.trim() || !draft.description.trim()) {
      toast.error("Name and description are required.");
      return;
    }
    setSaving(true);
    try {
      await upsertFn({
        data: {
          password,
          kind,
          item_id: current.id,
          name: draft.name.trim(),
          description: draft.description.trim(),
          group_slug: draft.group_slug || null,
          image_path: draft.image_path,
          key_points: kind === "highway" ? draft.key_points.map((s) => s.trim()).filter(Boolean) : null,
          topics: kind === "highway" ? draft.topics.map((s) => s.trim()).filter(Boolean) : null,
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

  const removeOverride = async () => {
    if (!existing) return;
    const password = requirePassword();
    if (!password) return;
    if (!window.confirm("Remove this override and restore the original?")) return;
    try {
      await deleteFn({ data: { password, kind, item_id: current.id } });
      toast.success("Removed");
      await qc.invalidateQueries({ queryKey: ["content-overrides"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const onImageChange = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large — max 5 MB.");
      return;
    }
    const password = requirePassword();
    if (!password) return;
    setUploading(true);
    try {
      const dataUrl = await readFileAsBase64(file);
      const res = await uploadFn({
        data: {
          password,
          kind,
          item_id: current.id,
          filename: file.name,
          content_type: file.type || "image/png",
          base64: dataUrl,
        },
      });
      setDraft({ ...draft, image_path: res.image_path, image_url: res.image_url });
      toast.success("Image uploaded — remember to Save to publish.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setDraft({ ...draft, image_path: null, image_url: null });
  };

  const go = (delta: number) => {
    if (dirty && !window.confirm("Discard unsaved changes on this item?")) return;
    setIndex((n) => Math.max(0, Math.min(items.length - 1, n + delta)));
  };

  const preview =
    kind === "sign" ? (
      <OfficialSignImage
        sign={signs.find((s) => s.id === current.id)!}
        variant="detail"
        overrideSrc={draft.image_url}
      />
    ) : draft.image_url ? (
      <img src={draft.image_url} alt={draft.name} className="h-40 w-40 object-cover border border-border" />
    ) : (
      <div className="flex h-40 w-40 items-center justify-center border border-dashed border-border text-xs text-muted-foreground">
        Uses built-in illustration
      </div>
    );

  const editedCount = overrides.filter((o) => o.kind === kind).length;

  return (
    <AdminShell eyebrow="Admin" title="Edit signs, markings & arm signals">
      <div className="mb-6 grid gap-3 sm:grid-cols-[220px_1fr_auto] sm:items-end">
        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Section</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as ContentKind)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sign">Road signs ({signs.length})</SelectItem>
              <SelectItem value="marking">Road markings ({roadMarkings.length})</SelectItem>
              <SelectItem value="signal">Arm signals ({policeSignals.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Jump to</Label>
          <Select value={current.id} onValueChange={(id) => setIndex(items.findIndex((it) => it.id === id))}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {items.map((it, i) => (
                <SelectItem key={it.id} value={it.id}>
                  {i + 1}. {it.name} {overrideMap.has(`${kind}:${it.id}`) ? "•" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {index + 1} of {items.length} · {editedCount} edited
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase">{current.id}</Badge>
            {isEdited && (
              <Badge className="bg-emerald-600 text-white">
                <CheckCircle2 className="mr-1 h-3 w-3" /> edited
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => go(-1)} disabled={index === 0}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => go(1)} disabled={index >= items.length - 1}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-44 items-center justify-center">{preview}</div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onImageChange(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                {draft.image_url && (
                  <Button variant="outline" size="sm" onClick={clearImage}>
                    <X className="mr-1 h-3.5 w-3.5" /> Remove image
                  </Button>
                )}
                {!draft.image_url && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ImageIcon className="h-3 w-3" /> Optional
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  className="mt-1"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description / meaning</Label>
                <Textarea
                  className="mt-1 min-h-[140px]"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Category / group</Label>
                <Select
                  value={draft.group_slug}
                  onValueChange={(v) => setDraft({ ...draft, group_slug: v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose group" /></SelectTrigger>
                  <SelectContent>
                    {groupOptionsFor(kind).map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Category is stored on the override but doesn't yet reshuffle the built-in category filters on the app.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <Button onClick={save} disabled={saving || !dirty}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDraft(draftOf(current))}
              disabled={saving}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset editor to original
            </Button>
            {isEdited && (
              <Button variant="outline" onClick={removeOverride} disabled={saving}>
                Remove saved override
              </Button>
            )}
            <div className="ml-auto text-xs text-muted-foreground">
              {dirty ? "Unsaved changes" : "Up to date"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => go(-1)} disabled={index === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button variant="outline" onClick={() => go(1)} disabled={index >= items.length - 1}>
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </AdminShell>
  );
}