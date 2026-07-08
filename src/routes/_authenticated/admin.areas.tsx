import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, X, Database } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  listAreas,
  upsertArea,
  deleteArea,
  reorderAreas,
  seedLocalContent,
  type AreaRow,
} from "@/lib/local-content.functions";
export const Route = createFileRoute("/_authenticated/admin/areas")({
  head: () => ({ meta: [{ title: "Areas · Admin" }] }),
  component: AreasAdmin,
});

type Draft = Omit<AreaRow, "nearby_postcodes" | "highlights" | "faqs"> & {
  nearbyText: string;
  highlightsText: string;
  faqsText: string;
};

function toDraft(r: AreaRow): Draft {
  return {
    ...r,
    nearbyText: (r.nearby_postcodes ?? []).join(", "),
    highlightsText: (r.highlights ?? []).join("\n"),
    faqsText: (r.faqs ?? []).map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n"),
  };
}

function parseFaqs(text: string): { q: string; a: string }[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks
    .map((b) => {
      const qMatch = b.match(/^Q:\s*(.+?)(?:\n|$)/i);
      const aMatch = b.match(/\nA:\s*([\s\S]+)$/i);
      return { q: qMatch?.[1]?.trim() ?? "", a: aMatch?.[1]?.trim() ?? "" };
    })
    .filter((f) => f.q && f.a);
}

const EMPTY: Draft = {
  id: "",
  slug: "",
  area: "",
  postcode: "",
  intro: "",
  routes_text: "",
  order_index: 0,
  enabled: true,
  nearbyText: "",
  highlightsText: "",
  faqsText: "",
};

function AreasAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAreas);
  const saveFn = useServerFn(upsertArea);
  const delFn = useServerFn(deleteArea);
  const orderFn = useServerFn(reorderAreas);
  const seedFn = useServerFn(seedLocalContent);
  const { data: rows = [] } = useQuery({ queryKey: ["areas-admin"], queryFn: () => listFn() });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(rows.map(toDraft));
  }, [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["areas-admin"] });
    qc.invalidateQueries({ queryKey: ["areas-public"] });
  };

  const patch = (idx: number, p: Partial<Draft>) =>
    setDrafts((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));

  const save = async (d: Draft) => {
    setSavingId(d.id || "new");
    try {
      const nearby = d.nearbyText
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const highlights = d.highlightsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const faqs = parseFaqs(d.faqsText);
      await saveFn({
        data: {
          item: {
            id: d.id || undefined,
            slug: d.slug,
            area: d.area,
            postcode: d.postcode,
            nearby_postcodes: nearby,
            intro: d.intro,
            highlights,
            routes_text: d.routes_text,
            faqs,
            order_index: d.order_index,
            enabled: d.enabled,
          },
        },
      });
      toast.success("Saved");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this area page?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...drafts];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setDrafts(next.map((r, i) => ({ ...r, order_index: i })));
    const order = next.map((r, i) => ({ id: r.id, order_index: i })).filter((r) => r.id);
    try {
      await orderFn({ data: { order } });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  const addNew = () => setDrafts([...drafts, { ...EMPTY, order_index: drafts.length }]);

  const seed = async () => {
    if (!confirm("Import all default area pages? (Only runs if table is empty.)")) return;
    try {
      const res = await seedFn({ data: { target: "areas" } });
      toast.success(`Imported ${res.inserted.areas ?? 0} areas`);
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Seed failed");
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="Areas covered">
      <div className="mb-4 flex justify-end gap-2">
        <Button variant="outline" onClick={seed}>
          <Database className="mr-1 h-4 w-4" />
          Import defaults
        </Button>
        <Button onClick={addNew}>
          <Plus className="mr-1 h-4 w-4" />
          Add area
        </Button>
      </div>
      <div className="grid gap-6">
        {drafts.map((d, idx) => (
          <Card key={d.id || `new-${idx}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg">{d.area || "New area"}</h2>
                <span className="text-xs text-muted-foreground">{d.postcode}</span>
                <div className="flex items-center gap-2 text-xs">
                  <Switch checked={d.enabled} onCheckedChange={(v) => patch(idx, { enabled: v })} />
                  <span className="text-muted-foreground">{d.enabled ? "Visible" : "Hidden"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  aria-label="Move up"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0 || !d.id}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  aria-label="Move down"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(idx, 1)}
                  disabled={idx === drafts.length - 1 || !d.id}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                {d.id ? (
                  <Button
                    aria-label="Delete"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(d.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDrafts(drafts.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Area name</Label>
                  <Input
                    className="mt-1"
                    value={d.area}
                    onChange={(e) => patch(idx, { area: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    className="mt-1"
                    value={d.slug}
                    onChange={(e) => patch(idx, { slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Postcode</Label>
                  <Input
                    className="mt-1"
                    value={d.postcode}
                    onChange={(e) => patch(idx, { postcode: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Nearby postcodes (comma-separated)</Label>
                <Input
                  className="mt-1"
                  value={d.nearbyText}
                  onChange={(e) => patch(idx, { nearbyText: e.target.value })}
                />
              </div>
              <div>
                <Label>Intro paragraph</Label>
                <Textarea
                  rows={3}
                  className="mt-1"
                  value={d.intro}
                  onChange={(e) => patch(idx, { intro: e.target.value })}
                />
              </div>
              <div>
                <Label>Highlights (one per line)</Label>
                <Textarea
                  rows={4}
                  className="mt-1"
                  value={d.highlightsText}
                  onChange={(e) => patch(idx, { highlightsText: e.target.value })}
                />
              </div>
              <div>
                <Label>Routes description</Label>
                <Textarea
                  rows={3}
                  className="mt-1"
                  value={d.routes_text}
                  onChange={(e) => patch(idx, { routes_text: e.target.value })}
                />
              </div>
              <div>
                <Label>
                  FAQs (each block: <code>Q: …</code> newline <code>A: …</code>, blocks separated by
                  blank lines)
                </Label>
                <Textarea
                  rows={6}
                  className="mt-1 font-mono text-xs"
                  value={d.faqsText}
                  onChange={(e) => patch(idx, { faqsText: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => save(d)} disabled={savingId === (d.id || "new")}>
                  <Save className="mr-1 h-4 w-4" />
                  {savingId === (d.id || "new") ? "Saving…" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
