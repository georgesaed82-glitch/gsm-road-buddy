import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Trash2, Upload, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  listDownloads,
  upsertDownloadMeta,
  uploadDownloadFile,
  deleteDownload,
  type DownloadRow,
} from "@/lib/blog.functions";
export const Route = createFileRoute("/_authenticated/admin/downloads")({
  head: () => ({ meta: [{ title: "Downloads · Admin" }] }),
  component: DownloadsAdmin,
});

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DownloadsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listDownloads);
  const uploadFn = useServerFn(uploadDownloadFile);
  const saveFn = useServerFn(upsertDownloadMeta);
  const delFn = useServerFn(deleteDownload);
  const { data: rows = [] } = useQuery({ queryKey: ["downloads-admin"], queryFn: () => listFn() });
  const [newMeta, setNewMeta] = useState({ title: "", description: "", category: "General" });
  const fileRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["downloads-admin"] });
    qc.invalidateQueries({ queryKey: ["downloads-public"] });
  };

  const doUpload = async (file: File) => {
    if (!newMeta.title.trim()) return toast.error("Enter a title before uploading.");
const reader = new FileReader();
    reader.onload = async () => {
      try {
        await uploadFn({
          data: {
            title: newMeta.title.trim(),
            description: newMeta.description,
            category: newMeta.category,
            filename: file.name,
            content_type: file.type || "application/octet-stream",
            base64: (reader.result as string).split(",", 2)[1] ?? "",
          },
        });
        toast.success("Uploaded");
        setNewMeta({ title: "", description: "", category: newMeta.category });
        invalidate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const saveMeta = async (r: DownloadRow) => {
try {
      await saveFn({
        data: {
          item: {
            id: r.id,
            title: r.title,
            description: r.description,
            category: r.category,
            order_index: r.order_index,
            enabled: r.enabled,
          },
        },
      });
      toast.success("Saved");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
if (!confirm("Delete this file permanently?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <AdminShell title="Downloads" eyebrow="Content">
      <Card className="mb-6">
        <CardHeader className="p-4">
          <div className="font-display text-lg">Upload a new file</div>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, images — max 20 MB. Set a title first, then choose a file.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Title</Label>
              <Input
                value={newMeta.title}
                onChange={(e) => setNewMeta((n) => ({ ...n, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={newMeta.category}
                onChange={(e) => setNewMeta((n) => ({ ...n, category: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newMeta.description}
                onChange={(e) => setNewMeta((n) => ({ ...n, description: e.target.value }))}
              />
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doUpload(f);
              e.currentTarget.value = "";
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-4 w-4" />
            Choose file & upload
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No files yet.</p>}
        {rows.map((r) => (
          <DownloadRowCard key={r.id} row={r} onSave={saveMeta} onDelete={remove} />
        ))}
      </div>
    </AdminShell>
  );
}

function DownloadRowCard({
  row,
  onSave,
  onDelete,
}: {
  row: DownloadRow;
  onSave: (r: DownloadRow) => Promise<unknown> | unknown;
  onDelete: (id: string) => Promise<unknown> | unknown;
}) {
  const [draft, setDraft] = useState<DownloadRow>(row);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
          />
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          {draft.url && (
            <a
              href={draft.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center border border-border px-3 py-1.5 text-sm"
            >
              <ExternalLink className="mr-1 h-4 w-4" />
            </a>
          )}
          <Button size="sm" variant="outline" onClick={() => onSave(draft)}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(draft.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              value={draft.category ?? ""}
              onChange={(e) => setDraft({ ...draft, category: e.target.value || null })}
            />
          </div>
          <div>
            <Label>Order</Label>
            <Input
              type="number"
              value={draft.order_index}
              onChange={(e) => setDraft({ ...draft, order_index: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {draft.mime_type ?? "file"} · {formatSize(draft.size_bytes)} · {draft.storage_path}
        </div>
      </CardContent>
    </Card>
  );
}