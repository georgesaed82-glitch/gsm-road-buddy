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
  listHazardClips,
  upsertHazardClip,
  deleteHazardClip,
  reorderHazardClips,
  seedLocalContent,
  type HazardClipRow,
} from "@/lib/local-content.functions";
export const Route = createFileRoute("/_authenticated/admin/hazard-clips")({
  head: () => ({ meta: [{ title: "Hazard clips · Admin" }] }),
  component: HazardAdmin,
});

type Draft = HazardClipRow;
const EMPTY: Draft = {
  id: "", slug: "", title: "", scenario: "", difficulty: "Medium",
  duration_seconds: 35, developing_hazard: "", order_index: 0, enabled: true,
};

function HazardAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listHazardClips);
  const saveFn = useServerFn(upsertHazardClip);
  const delFn = useServerFn(deleteHazardClip);
  const orderFn = useServerFn(reorderHazardClips);
  const seedFn = useServerFn(seedLocalContent);
  const { data: rows = [] } = useQuery({ queryKey: ["hazard-clips-admin"], queryFn: () => listFn() });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { setDrafts(rows); }, [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["hazard-clips-admin"] });
    qc.invalidateQueries({ queryKey: ["hazard-clips-public"] });
  };

  const patch = (idx: number, p: Partial<Draft>) =>
    setDrafts((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));

  const save = async (d: Draft) => {
if (!password) return toast.error("Admin password missing.");
    setSavingId(d.id || "new");
    try {
      await saveFn({
        data: {
          password,
          item: {
            id: d.id || undefined,
            slug: d.slug,
            title: d.title,
            scenario: d.scenario,
            difficulty: d.difficulty as "Easy" | "Medium" | "Hard",
            duration_seconds: d.duration_seconds,
            developing_hazard: d.developing_hazard,
            order_index: d.order_index,
            enabled: d.enabled,
          },
        },
      });
      toast.success("Saved");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally { setSavingId(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this clip metadata? (video/poster files are not touched.)")) return;
if (!password) return;
    try { await delFn({ data: { password, id } }); toast.success("Deleted"); invalidate(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
  };

  const move = async (idx: number, dir: -1 | 1) => {
if (!password) return;
    const next = [...drafts];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setDrafts(next.map((r, i) => ({ ...r, order_index: i })));
    const order = next.map((r, i) => ({ id: r.id, order_index: i })).filter((r) => r.id);
    try { await orderFn({ data: { password, order } }); invalidate(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Reorder failed"); }
  };

  const addNew = () => setDrafts([...drafts, { ...EMPTY, order_index: drafts.length }]);

  const seed = async () => {
if (!password) return toast.error("Admin password missing.");
    if (!confirm("Import all default hazard clip metadata? (Only runs if table is empty.)")) return;
    try {
      const res = await seedFn({ data: { password, target: "hazard_clips" } });
      toast.success(`Imported ${res.inserted.hazard_clips ?? 0} clips`);
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Seed failed");
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="Hazard perception clips">
      <p className="mb-4 text-sm text-muted-foreground">
        Edit the metadata (title, scenario, difficulty, duration) for each hazard clip. Video and poster files
        are managed separately in <em>Hazard videos</em>.
      </p>
      <div className="mb-4 flex justify-end gap-2">
        <Button variant="outline" onClick={seed}><Database className="mr-1 h-4 w-4" />Import defaults</Button>
        <Button onClick={addNew}><Plus className="mr-1 h-4 w-4" />Add clip</Button>
      </div>
      <div className="grid gap-4">
        {drafts.map((d, idx) => (
          <Card key={d.id || `new-${idx}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm">{d.title || "New clip"}</span>
                <span className="text-xs text-muted-foreground">{d.slug}</span>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Title</Label><Input className="mt-1" value={d.title} onChange={(e) => patch(idx, { title: e.target.value })} /></div>
                <div><Label>Slug</Label><Input className="mt-1" value={d.slug} onChange={(e) => patch(idx, { slug: e.target.value })} /></div>
                <div>
                  <Label>Difficulty</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={d.difficulty}
                    onChange={(e) => patch(idx, { difficulty: e.target.value })}
                  >
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div><Label>Duration (seconds)</Label><Input type="number" className="mt-1" value={d.duration_seconds} onChange={(e) => patch(idx, { duration_seconds: Number(e.target.value) || 0 })} /></div>
              </div>
              <div><Label>Scenario</Label><Textarea rows={2} className="mt-1" value={d.scenario} onChange={(e) => patch(idx, { scenario: e.target.value })} /></div>
              <div><Label>Developing hazard</Label><Textarea rows={2} className="mt-1" value={d.developing_hazard} onChange={(e) => patch(idx, { developing_hazard: e.target.value })} /></div>
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