import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Upload, X } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  listStudentPassPhotosAdmin,
  upsertStudentPassPhoto,
  deleteStudentPassPhoto,
  reorderStudentPassPhotos,
  uploadStudentPassPhotoImage,
  type StudentPassPhoto,
} from "@/lib/student-passes.functions";

export const Route = createFileRoute("/_authenticated/admin/student-passes")({
  head: () => ({ meta: [{ title: "Student passes · Admin" }] }),
  component: StudentPassesAdmin,
});

type Draft = StudentPassPhoto;

const EMPTY: Draft = {
  id: "",
  image_path: null,
  image_url: null,
  caption: "",
  order_index: 0,
  enabled: true,
  created_at: new Date().toISOString(),
};

function StudentPassesAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listStudentPassPhotosAdmin);
  const saveFn = useServerFn(upsertStudentPassPhoto);
  const delFn = useServerFn(deleteStudentPassPhoto);
  const orderFn = useServerFn(reorderStudentPassPhotos);
  const uploadFn = useServerFn(uploadStudentPassPhotoImage);

  const { data: rows = [] } = useQuery({
    queryKey: ["student-passes-admin"],
    queryFn: () => listFn(),
  });

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(rows);
  }, [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["student-passes-admin"] });
    qc.invalidateQueries({ queryKey: ["student-passes-public"] });
  };

  const save = async (d: Draft) => {
    setSavingId(d.id || "new");
    try {
      const res = await saveFn({
        data: {
          item: {
            id: d.id || undefined,
            caption: d.caption ?? "",
            order_index: d.order_index,
            enabled: d.enabled,
          },
        },
      });
      toast.success("Saved");
      invalidate();
      return res.id;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
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
    const order = next
      .map((r, i) => ({ id: r.id, order_index: i }))
      .filter((r) => r.id);
    setDrafts(next.map((r, i) => ({ ...r, order_index: i })));
    try {
      await orderFn({ data: { order } });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  const upload = async (draft: Draft, idx: number, file: File) => {
    let id = draft.id;
    if (!id) {
      // Auto-save a new row first so the upload has somewhere to land.
      const created = await save(draft);
      if (!created) return;
      id = created;
    }
    const b64 = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    try {
      await uploadFn({
        data: { id, filename: file.name, content_type: file.type, base64: b64 },
      });
      toast.success("Image uploaded");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const addNew = () =>
    setDrafts([
      { ...EMPTY, order_index: -1 - drafts.filter((d) => !d.id).length },
      ...drafts,
    ]);

  return (
    <AdminShell eyebrow="Admin" title="Student passes & success stories">
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Photos added here appear in the homepage &ldquo;Pass certificates, smiles, and the GSM
        car&rdquo; gallery. New photos show first. Hide a photo to remove it from the site
        without deleting it.
      </p>
      <div className="mb-4 flex justify-end">
        <Button onClick={addNew}>
          <Plus className="mr-1 h-4 w-4" />
          Add photo
        </Button>
      </div>
      <div className="grid gap-6">
        {drafts.map((d, idx) => (
          <Card key={d.id || `new-${idx}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-base">
                  {d.caption || (d.id ? "Untitled photo" : "New photo")}
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={d.enabled}
                    onCheckedChange={(v) =>
                      setDrafts(drafts.map((r, i) => (i === idx ? { ...r, enabled: v } : r)))
                    }
                  />
                  <span className="text-muted-foreground">
                    {d.enabled ? "Visible" : "Hidden"}
                  </span>
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
                {d.id && (
                  <Button
                    aria-label="Delete"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(d.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
                {!d.id && (
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
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full max-w-[180px] shrink-0">
                  {d.image_url ? (
                    <img
                      src={d.image_url}
                      alt={d.caption || "Student pass photo"}
                      className="aspect-square w-full rounded-md border border-border object-cover"
                    />
                  ) : (
                    <div className="grid aspect-square w-full place-items-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                      No image yet
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Caption</Label>
                    <Input
                      className="mt-1"
                      value={d.caption}
                      placeholder="e.g. First-time pass — Greenford Test Centre"
                      onChange={(e) =>
                        setDrafts(
                          drafts.map((r, i) =>
                            i === idx ? { ...r, caption: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
                      <Upload className="h-4 w-4" />
                      {d.image_url ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] && upload(d, idx, e.target.files[0])
                        }
                      />
                    </label>
                    <Button
                      onClick={() => save(d)}
                      disabled={savingId === (d.id || "new")}
                      className="ml-auto"
                    >
                      <Save className="mr-1 h-4 w-4" />
                      {savingId === (d.id || "new") ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}