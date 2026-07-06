import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  listPackages,
  upsertPackage,
  deletePackage,
  reorderPackages,
  type PackageRow,
} from "@/lib/catalog.functions";
export const Route = createFileRoute("/_authenticated/admin/pricing")({
  head: () => ({ meta: [{ title: "Pricing packages · Admin" }] }),
  component: PricingAdmin,
});

type Draft = Omit<PackageRow, "features"> & { featuresText: string };

function toDraft(r: PackageRow): Draft {
  return { ...r, featuresText: (r.features ?? []).join("\n") };
}

const EMPTY: Draft = {
  id: "",
  name: "",
  duration: "",
  description: "",
  cta_label: "WhatsApp us",
  popular: false,
  order_index: 0,
  enabled: true,
  featuresText: "",
};

function PricingAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listPackages);
  const saveFn = useServerFn(upsertPackage);
  const delFn = useServerFn(deletePackage);
  const orderFn = useServerFn(reorderPackages);
  const { data: rows = [] } = useQuery({ queryKey: ["packages-admin"], queryFn: () => listFn() });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(rows.map(toDraft));
  }, [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["packages-admin"] });
    qc.invalidateQueries({ queryKey: ["packages-public"] });
  };

  const patch = (idx: number, p: Partial<Draft>) =>
    setDrafts((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));

  const save = async (d: Draft) => {
if (!password) return toast.error("Admin password missing. Sign in via /auth?admin=1.");
    setSavingId(d.id || "new");
    try {
      const features = d.featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
      await saveFn({
        data: {
          password,
          item: {
            id: d.id || undefined,
            name: d.name,
            duration: d.duration,
            description: d.description,
            features,
            cta_label: d.cta_label,
            popular: d.popular,
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
    if (!confirm("Delete this package?")) return;
if (!password) return;
    try {
      await delFn({ data: { password, id } });
      toast.success("Deleted");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
if (!password) return;
    const next = [...drafts];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setDrafts(next.map((r, i) => ({ ...r, order_index: i })));
    const order = next.map((r, i) => ({ id: r.id, order_index: i })).filter((r) => r.id);
    try {
      await orderFn({ data: { password, order } });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  const addNew = () => setDrafts([...drafts, { ...EMPTY, order_index: drafts.length }]);

  return (
    <AdminShell eyebrow="Admin" title="Pricing packages">
      <div className="mb-4 flex justify-end">
        <Button onClick={addNew}><Plus className="mr-1 h-4 w-4" />Add package</Button>
      </div>
      <div className="grid gap-6">
        {drafts.map((d, idx) => (
          <Card key={d.id || `new-${idx}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg">{d.name || "New package"}</h2>
                <div className="flex items-center gap-2 text-xs">
                  <Switch checked={d.enabled} onCheckedChange={(v) => patch(idx, { enabled: v })} />
                  <span className="text-muted-foreground">{d.enabled ? "Visible" : "Hidden"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Switch checked={d.popular} onCheckedChange={(v) => patch(idx, { popular: v })} />
                  <span className="text-muted-foreground">Most popular</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button aria-label="Move up" size="icon" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0 || !d.id}><ArrowUp className="h-4 w-4" /></Button>
                <Button aria-label="Move down" size="icon" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === drafts.length - 1 || !d.id}><ArrowDown className="h-4 w-4" /></Button>
                {d.id ? (
                  <Button aria-label="Delete" size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                ) : (
                  <Button size="icon" variant="ghost" onClick={() => setDrafts(drafts.filter((_, i) => i !== idx))}><X className="h-4 w-4" /></Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Name</Label><Input className="mt-1" value={d.name} onChange={(e) => patch(idx, { name: e.target.value })} /></div>
                <div><Label>Duration / price label</Label><Input className="mt-1" value={d.duration} onChange={(e) => patch(idx, { duration: e.target.value })} /></div>
                <div><Label>CTA label</Label><Input className="mt-1" value={d.cta_label} onChange={(e) => patch(idx, { cta_label: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Description</Label><Textarea className="mt-1" value={d.description} onChange={(e) => patch(idx, { description: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Features (one per line)</Label><Textarea rows={5} className="mt-1" value={d.featuresText} onChange={(e) => patch(idx, { featuresText: e.target.value })} /></div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => save(d)} disabled={savingId === (d.id || "new")}>
                  <Save className="mr-1 h-4 w-4" />{savingId === (d.id || "new") ? "Saving…" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}