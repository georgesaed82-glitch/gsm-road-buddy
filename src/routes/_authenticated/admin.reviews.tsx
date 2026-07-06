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
  listReviews,
  upsertReview,
  deleteReview,
  reorderReviews,
  seedLocalContent,
  type ReviewRow,
} from "@/lib/local-content.functions";
export const Route = createFileRoute("/_authenticated/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews · Admin" }] }),
  component: ReviewsAdmin,
});

type Draft = ReviewRow;
const EMPTY: Draft = { id: "", name: "", note: "GSM learner", quote: "", rating: 5, order_index: 0, enabled: true };

function ReviewsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listReviews);
  const saveFn = useServerFn(upsertReview);
  const delFn = useServerFn(deleteReview);
  const orderFn = useServerFn(reorderReviews);
  const seedFn = useServerFn(seedLocalContent);
  const { data: rows = [] } = useQuery({ queryKey: ["reviews-admin"], queryFn: () => listFn() });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { setDrafts(rows); }, [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reviews-admin"] });
    qc.invalidateQueries({ queryKey: ["reviews-public"] });
  };

  const patch = (idx: number, p: Partial<Draft>) =>
    setDrafts((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));

  const save = async (d: Draft) => {
setSavingId(d.id || "new");
    try {
      await saveFn({
        data: {
          item: {
            id: d.id || undefined,
            name: d.name,
            note: d.note,
            quote: d.quote,
            rating: d.rating,
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
    if (!confirm("Delete this review?")) return;
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
    try { await orderFn({ data: { order } }); invalidate(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Reorder failed"); }
  };

  const addNew = () => setDrafts([...drafts, { ...EMPTY, order_index: drafts.length }]);

  const seed = async () => {
if (!confirm("Import all default reviews from the built-in list? (Only runs if table is empty.)")) return;
    try {
      const res = await seedFn({ data: { target: "reviews" } });
      toast.success(`Imported ${res.inserted.reviews ?? 0} reviews`);
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Seed failed");
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="Reviews">
      <div className="mb-4 flex justify-end gap-2">
        <Button variant="outline" onClick={seed}><Database className="mr-1 h-4 w-4" />Import defaults</Button>
        <Button onClick={addNew}><Plus className="mr-1 h-4 w-4" />Add review</Button>
      </div>
      <div className="grid gap-4">
        {drafts.map((d, idx) => (
          <Card key={d.id || `new-${idx}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm">{d.name || "New review"}</span>
                <div className="flex items-center gap-2 text-xs">
                  <Switch checked={d.enabled} onCheckedChange={(v) => patch(idx, { enabled: v })} />
                  <span className="text-muted-foreground">{d.enabled ? "Visible" : "Hidden"}</span>
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
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label>Name</Label><Input className="mt-1" value={d.name} onChange={(e) => patch(idx, { name: e.target.value })} /></div>
                <div><Label>Note / tag</Label><Input className="mt-1" value={d.note} onChange={(e) => patch(idx, { note: e.target.value })} /></div>
                <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} className="mt-1" value={d.rating} onChange={(e) => patch(idx, { rating: Number(e.target.value) || 5 })} /></div>
              </div>
              <div><Label>Quote</Label><Textarea rows={3} className="mt-1" value={d.quote} onChange={(e) => patch(idx, { quote: e.target.value })} /></div>
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