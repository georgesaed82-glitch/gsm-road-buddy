import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  listLegalPages,
  upsertLegalPage,
  deleteLegalPage,
  type LegalPageRow,
} from "@/lib/legal-pages.functions";
export const Route = createFileRoute("/_authenticated/admin/legal")({
  head: () => ({ meta: [{ title: "Legal pages · Admin" }] }),
  component: LegalAdmin,
});

type Draft = LegalPageRow & { _new?: boolean };

function LegalAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listLegalPages);
  const saveFn = useServerFn(upsertLegalPage);
  const delFn = useServerFn(deleteLegalPage);
  const { data: rows = [] } = useQuery({ queryKey: ["legal-pages-admin"], queryFn: () => listFn() });
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => setDrafts(rows), [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["legal-pages-admin"] });
  };

  const patch = (idx: number, p: Partial<Draft>) =>
    setDrafts((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));

  const save = async (d: Draft) => {
if (!password) return toast.error("Admin password missing.");
    try {
      await saveFn({
        data: {
          password,
          item: {
            slug: d.slug,
            title: d.title,
            body_markdown: d.body_markdown,
            seo_title: d.seo_title,
            seo_description: d.seo_description,
            enabled: d.enabled,
            sort_order: d.sort_order,
          },
        },
      });
      toast.success("Saved");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const remove = async (d: Draft, idx: number) => {
    if (d._new) {
      setDrafts((cur) => cur.filter((_, i) => i !== idx));
      return;
    }
if (!password) return toast.error("Admin password missing.");
    if (!confirm(`Delete /legal/${d.slug}?`)) return;
    try {
      await delFn({ data: { password, slug: d.slug } });
      toast.success("Deleted");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const addNew = () => {
    const max = drafts.reduce((a, d) => Math.max(a, d.sort_order ?? 0), 0);
    setDrafts((cur) => [
      ...cur,
      {
        slug: "",
        title: "",
        body_markdown: "",
        seo_title: null,
        seo_description: null,
        enabled: true,
        sort_order: max + 1,
        updated_at: new Date().toISOString(),
        _new: true,
      },
    ]);
  };

  return (
    <AdminShell title="Legal pages" eyebrow="Content">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pages served at <code>/legal/&lt;slug&gt;</code>. Markdown supported.
        </p>
        <Button onClick={addNew}>
          <Plus className="mr-1 h-4 w-4" /> New legal page
        </Button>
      </div>
      <div className="space-y-3">
        {drafts.length === 0 && (
          <p className="text-sm text-muted-foreground">No legal pages yet.</p>
        )}
        {drafts.map((d, i) => (
          <Card key={d.slug || `new-${i}`}>
            <CardHeader className="flex flex-row items-center gap-2 p-3">
              <Switch checked={d.enabled} onCheckedChange={(v) => patch(i, { enabled: v })} />
              <Input
                className="max-w-[220px]"
                placeholder="slug (e.g. privacy)"
                value={d.slug}
                onChange={(e) => patch(i, { slug: e.target.value })}
                disabled={!d._new}
              />
              <Input
                placeholder="Title"
                value={d.title}
                onChange={(e) => patch(i, { title: e.target.value })}
              />
              <Button size="sm" variant="outline" onClick={() => save(d)}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(d, i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0">
              <div>
                <Label>Body (Markdown)</Label>
                <Textarea
                  rows={10}
                  value={d.body_markdown}
                  onChange={(e) => patch(i, { body_markdown: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>SEO title</Label>
                  <Input
                    value={d.seo_title ?? ""}
                    onChange={(e) => patch(i, { seo_title: e.target.value || null })}
                  />
                </div>
                <div>
                  <Label>SEO description</Label>
                  <Input
                    value={d.seo_description ?? ""}
                    onChange={(e) => patch(i, { seo_description: e.target.value || null })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}