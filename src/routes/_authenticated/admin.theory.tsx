import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sampleTheoryQuestions, theoryCategories, type TheoryQuestion } from "@/data/theory";
import {
  listTheoryOverrides,
  upsertTheoryOverride,
  deleteTheoryOverride,
  type TheoryOverrideRow,
} from "@/lib/theory-overrides.functions";
import { getAdminPassword } from "@/lib/admin-gate";

export const Route = createFileRoute("/_authenticated/admin/theory")({
  head: () => ({ meta: [{ title: "Edit theory questions · Admin" }] }),
  component: AdminTheoryPage,
});

type Draft = {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  optionExplanations: [string, string, string, string];
};

function toDraft(q: TheoryQuestion, ov?: TheoryOverrideRow): Draft {
  const src = ov
    ? {
        question: ov.question,
        options: ov.options,
        correctIndex: ov.correct_index,
        explanation: ov.explanation,
        optionExplanations: ov.option_explanations,
      }
    : q;
  const opts = [...src.options];
  const opex = [...src.optionExplanations];
  while (opts.length < 4) opts.push("");
  while (opex.length < 4) opex.push("");
  return {
    question: src.question,
    options: [opts[0], opts[1], opts[2], opts[3]] as [string, string, string, string],
    correctIndex: src.correctIndex,
    explanation: src.explanation,
    optionExplanations: [opex[0], opex[1], opex[2], opex[3]] as [string, string, string, string],
  };
}

function draftMatchesOverride(d: Draft, o?: TheoryOverrideRow): boolean {
  if (!o) return false;
  return (
    d.question === o.question &&
    d.correctIndex === o.correct_index &&
    d.explanation === o.explanation &&
    d.options.every((v, i) => v === o.options[i]) &&
    d.optionExplanations.every((v, i) => v === o.option_explanations[i])
  );
}

function AdminTheoryPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listTheoryOverrides);
  const upsertFn = useServerFn(upsertTheoryOverride);
  const deleteFn = useServerFn(deleteTheoryOverride);

  const { data: overrides = [] } = useQuery({
    queryKey: ["theory-overrides"],
    queryFn: () => listFn(),
  });

  const overrideMap = useMemo(() => {
    const m = new Map<string, TheoryOverrideRow>();
    for (const o of overrides) m.set(o.question_id, o);
    return m;
  }, [overrides]);

  const [categorySlug, setCategorySlug] = useState<string>("all");
  const filtered = useMemo(() => {
    return categorySlug === "all"
      ? sampleTheoryQuestions
      : sampleTheoryQuestions.filter((q) => q.category === categorySlug);
  }, [categorySlug]);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
  }, [categorySlug]);

  const current = filtered[index];
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (!current) {
      setDraft(null);
      return;
    }
    setDraft(toDraft(current, overrideMap.get(current.id)));
  }, [current, overrideMap]);

  const [saving, setSaving] = useState(false);

  if (!current || !draft) {
    return (
      <AdminShell eyebrow="Admin" title="Edit theory questions">
        <p className="text-sm text-muted-foreground">No questions found for this section.</p>
      </AdminShell>
    );
  }

  const existing = overrideMap.get(current.id);
  const isEdited = !!existing;
  const original = current;
  const originalMatchesDraft =
    draft.question === original.question &&
    draft.correctIndex === original.correctIndex &&
    draft.explanation === original.explanation &&
    draft.options.every((v, i) => v === original.options[i]) &&
    draft.optionExplanations.every((v, i) => v === (original.optionExplanations[i] ?? ""));

  const dirty = existing ? !draftMatchesOverride(draft, existing) : !originalMatchesDraft;

  const save = async () => {
    const password = getAdminPassword();
    if (!password) {
      toast.error("Admin password missing. Sign in via /auth?admin=1.");
      return;
    }
    if (draft.options.some((o) => !o.trim())) {
      toast.error("All four options must be filled in.");
      return;
    }
    setSaving(true);
    try {
      await upsertFn({
        data: {
          password,
          question_id: current.id,
          question: draft.question.trim(),
          options: draft.options.map((o) => o.trim()),
          correct_index: draft.correctIndex,
          explanation: draft.explanation.trim(),
          option_explanations: draft.optionExplanations.map((o) => o.trim()),
        },
      });
      toast.success("Saved");
      await qc.invalidateQueries({ queryKey: ["theory-overrides"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetToOriginal = () => {
    setDraft(toDraft(current));
  };

  const revertOverride = async () => {
    if (!existing) return;
    const password = getAdminPassword();
    if (!password) {
      toast.error("Admin password missing.");
      return;
    }
    if (!window.confirm("Remove your override and restore the original question?")) return;
    try {
      await deleteFn({ data: { password, question_id: current.id } });
      toast.success("Override removed");
      await qc.invalidateQueries({ queryKey: ["theory-overrides"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const go = (delta: number) => {
    if (dirty && !window.confirm("Discard unsaved changes on this question?")) return;
    setIndex((n) => Math.max(0, Math.min(filtered.length - 1, n + delta)));
  };

  return (
    <AdminShell eyebrow="Admin" title="Edit theory questions">
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Section</Label>
          <Select value={categorySlug} onValueChange={setCategorySlug}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sections ({sampleTheoryQuestions.length})</SelectItem>
              {theoryCategories.map((c) => {
                const n = sampleTheoryQuestions.filter((q) => q.category === c.slug).length;
                if (!n) return null;
                return (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.title} ({n})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Question {index + 1} of {filtered.length} · {overrideMap.size} edited so far
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase tracking-wider">
              {current.category.replaceAll("-", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">{current.id}</span>
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
            <Button variant="outline" size="sm" onClick={() => go(1)} disabled={index >= filtered.length - 1}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Question</Label>
            <Textarea
              className="mt-1 min-h-[80px]"
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Options (tick the correct answer)</Label>
            {draft.options.map((opt, i) => (
              <div
                key={i}
                className={cn(
                  "rounded border p-3",
                  draft.correctIndex === i ? "border-emerald-600 bg-emerald-600/5" : "border-border",
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={draft.correctIndex === i}
                    onChange={() => setDraft({ ...draft, correctIndex: i })}
                    className="h-4 w-4"
                    aria-label={`Mark option ${i + 1} as correct`}
                  />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Option {String.fromCharCode(65 + i)}
                  </span>
                  {draft.correctIndex === i && (
                    <span className="text-xs font-semibold text-emerald-700">Correct answer</span>
                  )}
                </div>
                <Input
                  className="mt-2"
                  value={opt}
                  onChange={(e) => {
                    const next = [...draft.options] as Draft["options"];
                    next[i] = e.target.value;
                    setDraft({ ...draft, options: next });
                  }}
                />
                <Label className="mt-3 block text-xs text-muted-foreground">
                  Why this option is {draft.correctIndex === i ? "right" : "wrong"} (shown when the student picks it)
                </Label>
                <Textarea
                  className="mt-1 min-h-[60px]"
                  value={draft.optionExplanations[i]}
                  onChange={(e) => {
                    const next = [...draft.optionExplanations] as Draft["optionExplanations"];
                    next[i] = e.target.value;
                    setDraft({ ...draft, optionExplanations: next });
                  }}
                />
              </div>
            ))}
          </div>

          <div>
            <Label>Main explanation (shown after any answer)</Label>
            <Textarea
              className="mt-1 min-h-[100px]"
              value={draft.explanation}
              onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <Button onClick={save} disabled={saving || !dirty}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="outline" onClick={resetToOriginal} disabled={saving}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset editor to original
            </Button>
            {isEdited && (
              <Button variant="outline" onClick={revertOverride} disabled={saving}>
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
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous question
        </Button>
        <Button variant="outline" onClick={() => go(1)} disabled={index >= filtered.length - 1}>
          Next question <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </AdminShell>
  );
}