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
import { listFaqs, upsertFaq, deleteFaq, type FaqRow } from "@/lib/blog.functions";
export const Route = createFileRoute("/_authenticated/admin/faqs")({
  head: () => ({ meta: [{ title: "FAQs · Admin" }] }),
  component: FaqsAdmin,
});

type Draft = FaqRow & { _new?: boolean };

function FaqsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listFaqs);
  const saveFn = useServerFn(upsertFaq);
  const delFn = useServerFn(deleteFaq);
  const { data: rows = [] } = useQuery({ queryKey: ["faqs-admin"], queryFn: () => listFn() });
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => setDrafts(rows), [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["faqs-admin"] });
    qc.invalidateQueries({ queryKey: ["faqs-public"] });
  };

  const patch = (idx: number, p: Partial<Draft>) =>
    setDrafts((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));

  const save = async (d: Draft) => {
try {
      await saveFn({
        data: {
          item: {
            id: d.id && !d._new ? d.id : undefined,
            question: d.question,
            answer: d.answer,
            category: d.category || null,
            order_index: d.order_index,
            enabled: d.enabled,
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
if (!confirm("Delete this FAQ?")) return;
    try {
      await delFn({ data: { password, id: d.id } });
      toast.success("Deleted");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const addNew = () => {
    const max = drafts.reduce((a, d) => Math.max(a, d.order_index ?? 0), 0);
    setDrafts((cur) => [
      ...cur,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
        category: "General",
        order_index: max + 1,
        enabled: true,
        _new: true,
      },
    ]);
  };

  return (
    <AdminShell title="FAQs" eyebrow="Content">
      <div className="mb-4 flex justify-end">
        <Button onClick={addNew}>
          <Plus className="mr-1 h-4 w-4" />
          New FAQ
        </Button>
      </div>
      <div className="space-y-3">
        {drafts.length === 0 && (
          <p className="text-sm text-muted-foreground">No FAQs yet.</p>
        )}
        {drafts.map((d, i) => (
          <Card key={d.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-3">
              <div className="flex flex-1 items-center gap-2">
                <Switch
                  checked={d.enabled}
                  onCheckedChange={(v) => patch(i, { enabled: v })}
                  aria-label="Enabled"
                />
                <Input
                  placeholder="Question"
                  value={d.question}
                  onChange={(e) => patch(i, { question: e.target.value })}
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => save(d)}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(d, i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div>
                  <Label>Answer (Markdown)</Label>
                  <Textarea
                    rows={4}
                    value={d.answer}
                    onChange={(e) => patch(i, { answer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={d.category ?? ""}
                      onChange={(e) => patch(i, { category: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={d.order_index}
                      onChange={(e) => patch(i, { order_index: Number(e.target.value) || 0 })}
                    />
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