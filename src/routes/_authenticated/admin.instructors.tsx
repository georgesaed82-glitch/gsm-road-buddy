import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Upload, X } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  listInstructors,
  upsertInstructor,
  deleteInstructor,
  reorderInstructors,
  uploadInstructorImage,
  type InstructorRow,
} from "@/lib/catalog.functions";
import { getAdminPassword } from "@/lib/admin-gate";

export const Route = createFileRoute("/_authenticated/admin/instructors")({
  head: () => ({ meta: [{ title: "Instructors · Admin" }] }),
  component: InstructorsAdmin,
});

type Draft = Omit<InstructorRow, "image_url"> & { badgesText: string };

function toDraft(r: InstructorRow): Draft {
  return { ...r, badgesText: (r.badges ?? []).join(", ") };
}

const EMPTY: Draft = {
  id: "",
  name: "",
  role: "Instructor",
  bio: "",
  initials: "",
  color: "bg-primary/10 text-primary",
  rating: null,
  reviews: 0,
  location: "",
  badges: [],
  cta_href: "/contact",
  image_path: null,
  order_index: 0,
  enabled: true,
  badgesText: "",
};

function InstructorsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInstructors);
  const saveFn = useServerFn(upsertInstructor);
  const delFn = useServerFn(deleteInstructor);
  const orderFn = useServerFn(reorderInstructors);
  const uploadFn = useServerFn(uploadInstructorImage);
  const { data: rows = [] } = useQuery({ queryKey: ["instructors-admin"], queryFn: () => listFn() });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(rows.map(toDraft));
  }, [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["instructors-admin"] });
    qc.invalidateQueries({ queryKey: ["instructors-public"] });
  };

  const save = async (d: Draft) => {
    const password = getAdminPassword();
    if (!password) return toast.error("Admin password missing. Sign in via /auth?admin=1.");
    setSavingId(d.id || "new");
    try {
      const badges = d.badgesText.split(",").map((s) => s.trim()).filter(Boolean);
      await saveFn({
        data: {
          password,
          item: {
            id: d.id || undefined,
            name: d.name,
            role: d.role,
            bio: d.bio,
            initials: d.initials,
            color: d.color,
            rating: d.rating,
            reviews: d.reviews ?? 0,
            location: d.location ?? "",
            badges,
            cta_href: d.cta_href,
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
    if (!confirm("Delete this instructor?")) return;
    const password = getAdminPassword();
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
    const password = getAdminPassword();
    if (!password) return;
    const next = [...drafts];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    const order = next.map((r, i) => ({ id: r.id, order_index: i })).filter((r) => r.id);
    setDrafts(next.map((r, i) => ({ ...r, order_index: i })));
    try {
      await orderFn({ data: { password, order } });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  const upload = async (id: string, file: File) => {
    const password = getAdminPassword();
    if (!password || !id) return toast.error("Save the instructor first, then upload an image.");
    const b64 = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    try {
      await uploadFn({ data: { password, id, filename: file.name, content_type: file.type, base64: b64 } });
      toast.success("Image uploaded");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const addNew = () => setDrafts([...drafts, { ...EMPTY, order_index: drafts.length }]);

  return (
    <AdminShell eyebrow="Admin" title="Instructors">
      <div className="mb-4 flex justify-end">
        <Button onClick={addNew}><Plus className="mr-1 h-4 w-4" />Add instructor</Button>
      </div>
      <div className="grid gap-6">
        {drafts.map((d, idx) => (
          <Card key={d.id || `new-${idx}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg">{d.name || "New instructor"}</h2>
                <div className="flex items-center gap-2 text-xs">
                  <Switch checked={d.enabled} onCheckedChange={(v) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, enabled: v } : r)))} />
                  <span className="text-muted-foreground">{d.enabled ? "Visible" : "Hidden"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button aria-label="Move up" size="icon" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0 || !d.id}><ArrowUp className="h-4 w-4" /></Button>
                <Button aria-label="Move down" size="icon" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === drafts.length - 1 || !d.id}><ArrowDown className="h-4 w-4" /></Button>
                {d.id && (
                  <Button aria-label="Delete" size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                )}
                {!d.id && (
                  <Button size="icon" variant="ghost" onClick={() => setDrafts(drafts.filter((_, i) => i !== idx))}><X className="h-4 w-4" /></Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Name</Label><Input className="mt-1" value={d.name} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)))} /></div>
                <div><Label>Role</Label><Input className="mt-1" value={d.role} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, role: e.target.value } : r)))} /></div>
                <div><Label>Initials (fallback)</Label><Input className="mt-1" value={d.initials} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, initials: e.target.value } : r)))} /></div>
                <div><Label>Colour class (fallback)</Label><Input className="mt-1" value={d.color} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, color: e.target.value } : r)))} /></div>
                <div><Label>Rating (0–5)</Label><Input type="number" step="0.1" className="mt-1" value={d.rating ?? ""} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, rating: e.target.value === "" ? null : Number(e.target.value) } : r)))} /></div>
                <div><Label>Reviews count</Label><Input type="number" className="mt-1" value={d.reviews ?? 0} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, reviews: Number(e.target.value) } : r)))} /></div>
                <div><Label>Location</Label><Input className="mt-1" value={d.location ?? ""} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, location: e.target.value } : r)))} /></div>
                <div><Label>Badges (comma-separated)</Label><Input className="mt-1" value={d.badgesText} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, badgesText: e.target.value } : r)))} /></div>
                <div className="sm:col-span-2"><Label>CTA link</Label><Input className="mt-1" value={d.cta_href} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, cta_href: e.target.value } : r)))} /></div>
                <div className="sm:col-span-2"><Label>Bio</Label><Textarea className="mt-1" value={d.bio} onChange={(e) => setDrafts(drafts.map((r, i) => (i === idx ? { ...r, bio: e.target.value } : r)))} /></div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
                  <Upload className="h-4 w-4" />
                  {d.image_path ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && upload(d.id, e.target.files[0])}
                  />
                </label>
                {d.image_path && <span className="text-xs text-muted-foreground">Image attached</span>}
                <Button onClick={() => save(d)} disabled={savingId === (d.id || "new")} className="ml-auto">
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