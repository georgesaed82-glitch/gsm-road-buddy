import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Copy,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  Download,
  ImagePlus,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { theoryCategories } from "@/data/theory";
import {
  listTheoryQuestionsCms,
  createTheoryQuestion,
  updateTheoryQuestion,
  deleteTheoryQuestions,
  bulkUpdateTheoryQuestions,
  duplicateTheoryQuestion,
  reorderTheoryQuestion,
  uploadTheoryQuestionImage,
  importTheoryQuestions,
  type TheoryQuestionRow,
  type TheoryDifficulty,
} from "@/lib/theory-cms.functions";
export const Route = createFileRoute("/_authenticated/admin/theory")({
  head: () => ({ meta: [{ title: "Theory questions CMS · Admin" }] }),
  component: AdminTheoryCms,
});

type Draft = {
  id?: string;
  source_id: string | null;
  category: string;
  tags: string[];
  difficulty: TheoryDifficulty;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  option_explanations: string[];
  image_path: string | null;
  image_url: string | null;
  is_published: boolean;
};

const EMPTY_DRAFT: Draft = {
  source_id: null,
  category: "alertness",
  tags: [],
  difficulty: "medium",
  question: "",
  options: ["", "", "", ""],
  correct_index: 0,
  explanation: "",
  option_explanations: ["", "", "", ""],
  image_path: null,
  image_url: null,
  is_published: true,
};

function rowToDraft(r: TheoryQuestionRow): Draft {
  const opts = [...r.options];
  const opex = [...r.option_explanations];
  while (opts.length < 4) opts.push("");
  while (opex.length < 4) opex.push("");
  return {
    id: r.id,
    source_id: r.source_id,
    category: r.category,
    tags: r.tags,
    difficulty: r.difficulty,
    question: r.question,
    options: opts,
    correct_index: r.correct_index,
    explanation: r.explanation,
    option_explanations: opex,
    image_path: r.image_path,
    image_url: r.image_url,
    is_published: r.is_published,
  };
}

function csvEscape(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function toCsv(rows: TheoryQuestionRow[]): string {
  const header = [
    "source_id",
    "category",
    "tags",
    "difficulty",
    "question",
    "option1",
    "option2",
    "option3",
    "option4",
    "correct_index",
    "explanation",
    "opt1_expl",
    "opt2_expl",
    "opt3_expl",
    "opt4_expl",
    "is_published",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    const opts = [...r.options];
    while (opts.length < 4) opts.push("");
    const opex = [...r.option_explanations];
    while (opex.length < 4) opex.push("");
    lines.push(
      [
        r.source_id ?? "",
        r.category,
        r.tags.join("|"),
        r.difficulty,
        r.question,
        opts[0],
        opts[1],
        opts[2],
        opts[3],
        String(r.correct_index),
        r.explanation,
        opex[0],
        opex[1],
        opex[2],
        opex[3],
        r.is_published ? "true" : "false",
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }
  return lines.join("\n");
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        cur.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (field !== "" || cur.length) {
          cur.push(field);
          rows.push(cur);
          cur = [];
          field = "";
        }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else field += c;
    }
  }
  if (field !== "" || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

function AdminTheoryCms() {
  const qc = useQueryClient();
  const listFn = useServerFn(listTheoryQuestionsCms);
  const createFn = useServerFn(createTheoryQuestion);
  const updateFn = useServerFn(updateTheoryQuestion);
  const deleteFn = useServerFn(deleteTheoryQuestions);
  const bulkFn = useServerFn(bulkUpdateTheoryQuestions);
  const dupFn = useServerFn(duplicateTheoryQuestion);
  const reorderFn = useServerFn(reorderTheoryQuestion);
  const uploadFn = useServerFn(uploadTheoryQuestionImage);
  const importFn = useServerFn(importTheoryQuestions);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["theory-cms"],
    queryFn: () => listFn(),
  });

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [published, setPublished] = useState("all");
  const [sort, setSort] = useState<"order" | "updated" | "category" | "question">("order");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (difficulty !== "all" && r.difficulty !== difficulty) return false;
      if (published === "yes" && !r.is_published) return false;
      if (published === "no" && r.is_published) return false;
      if (needle) {
        const hay = `${r.question} ${r.explanation} ${r.tags.join(" ")} ${r.source_id ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    if (sort === "updated") list = list.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    if (sort === "category")
      list = list.slice().sort((a, b) => a.category.localeCompare(b.category) || a.sort_order - b.sort_order);
    if (sort === "question") list = list.slice().sort((a, b) => a.question.localeCompare(b.question));
    return list;
  }, [rows, q, category, difficulty, published, sort]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const password = () => {
if (!p) toast.error("Admin password missing. Sign in via /auth?admin=1.");
    return p;
  };

  const refresh = () => qc.invalidateQueries({ queryKey: ["theory-cms"] });

  const openNew = () => setDraft({ ...EMPTY_DRAFT });
  const openEdit = (r: TheoryQuestionRow) => setDraft(rowToDraft(r));

  const save = async () => {
    if (!draft) return;
    const p = password();
    if (!p) return;
    if (!draft.question.trim()) {
      toast.error("Question is required.");
      return;
    }
    if (draft.options.filter((o) => o.trim()).length < 2) {
      toast.error("At least 2 options required.");
      return;
    }
    const opts = draft.options.filter((o) => o.trim());
    if (draft.correct_index >= opts.length) {
      toast.error("Correct answer must be one of the filled options.");
      return;
    }
    const opex = draft.option_explanations.slice(0, opts.length);
    setSaving(true);
    try {
      if (draft.id) {
        await updateFn({
          data: {
            id: draft.id,
            source_id: draft.source_id,
            category: draft.category,
            tags: draft.tags,
            difficulty: draft.difficulty,
            question: draft.question.trim(),
            options: opts,
            correct_index: draft.correct_index,
            explanation: draft.explanation.trim(),
            option_explanations: opex,
            is_published: draft.is_published,
          },
        });
      } else {
        await createFn({
          data: {
            source_id: draft.source_id,
            category: draft.category,
            tags: draft.tags,
            difficulty: draft.difficulty,
            question: draft.question.trim(),
            options: opts,
            correct_index: draft.correct_index,
            explanation: draft.explanation.trim(),
            option_explanations: opex,
            is_published: draft.is_published,
          },
        });
      }
      toast.success("Saved");
      setDraft(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!draft?.id) {
      toast.error("Save the question first to attach an image.");
      return;
    }
    const p = password();
    if (!p) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await uploadFn({
          data: {
            question_id: draft.id!,
            filename: file.name,
            content_type: file.type || "image/png",
            base64: String(reader.result ?? ""),
          },
        });
        setDraft({ ...draft, image_path: res.image_path, image_url: res.image_url });
        toast.success("Image uploaded");
        await refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const doDelete = async (ids: string[]) => {
    const p = password();
    if (!p || !ids.length) return;
    if (!window.confirm(`Delete ${ids.length} question${ids.length > 1 ? "s" : ""}?`)) return;
    try {
      await deleteFn({ data: { password: p, ids } });
      toast.success("Deleted");
      setSelected(new Set());
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const doDuplicate = async (id: string) => {
    const p = password();
    if (!p) return;
    try {
      await dupFn({ data: { password: p, id } });
      toast.success("Duplicated");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Duplicate failed");
    }
  };

  const doReorder = async (id: string, direction: "up" | "down") => {
    const p = password();
    if (!p) return;
    try {
      await reorderFn({ data: { password: p, id, direction } });
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  const doBulkPublish = async (is_published: boolean) => {
    const p = password();
    const ids = [...selected];
    if (!p || !ids.length) return;
    try {
      await bulkFn({ data: { password: p, ids, patch: { is_published } } });
      toast.success(is_published ? "Published" : "Unpublished");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const doBulkCategory = async (cat: string) => {
    const p = password();
    const ids = [...selected];
    if (!p || !ids.length) return;
    try {
      await bulkFn({ data: { password: p, ids, patch: { category: cat } } });
      toast.success("Category updated");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const doBulkDifficulty = async (d: TheoryDifficulty) => {
    const p = password();
    const ids = [...selected];
    if (!p || !ids.length) return;
    try {
      await bulkFn({ data: { password: p, ids, patch: { difficulty: d } } });
      toast.success("Difficulty updated");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const doExport = () => {
    const csv = toCsv(filtered.length ? filtered : rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theory-questions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    const p = password();
    if (!p) return;
    const text = await file.text();
    const parsed = parseCsv(text).filter((r) => r.some((c) => c.trim()));
    if (parsed.length < 2) {
      toast.error("CSV has no rows.");
      return;
    }
    const header = parsed[0].map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);
    const need = ["category", "question", "option1", "option2", "correct_index"];
    for (const n of need) if (idx(n) === -1) {
      toast.error(`CSV missing column: ${n}`);
      return;
    }
    const rowsOut = parsed.slice(1).map((cols) => {
      const opts = ["option1", "option2", "option3", "option4"].map((k) => cols[idx(k)] ?? "").filter((v) => v.trim());
      const opex = ["opt1_expl", "opt2_expl", "opt3_expl", "opt4_expl"]
        .map((k) => (idx(k) === -1 ? "" : cols[idx(k)] ?? ""))
        .slice(0, opts.length);
      const rawDiff = (idx("difficulty") === -1 ? "medium" : cols[idx("difficulty")] ?? "medium").trim().toLowerCase();
      const diff: TheoryDifficulty = rawDiff === "easy" || rawDiff === "hard" ? rawDiff : "medium";
      return {
        source_id: idx("source_id") === -1 ? null : (cols[idx("source_id")] || "").trim() || null,
        category: cols[idx("category")].trim(),
        tags:
          idx("tags") === -1
            ? []
            : (cols[idx("tags")] || "")
                .split("|")
                .map((t) => t.trim())
                .filter(Boolean),
        difficulty: diff,
        question: cols[idx("question")].trim(),
        options: opts,
        correct_index: Number(cols[idx("correct_index")] || 0),
        explanation: idx("explanation") === -1 ? "" : (cols[idx("explanation")] || "").trim(),
        option_explanations: opex,
        is_published:
          idx("is_published") === -1
            ? true
            : ["false", "0", "no"].indexOf((cols[idx("is_published")] || "").trim().toLowerCase()) === -1,
      };
    });
    try {
      const res = await importFn({ data: { password: p, rows: rowsOut } });
      toast.success(`Imported ${res.inserted} questions`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="Theory questions CMS">
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search question, explanation, tag, id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {theoryCategories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulty</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={published} onValueChange={setPublished}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="yes">Published</SelectItem>
            <SelectItem value="no">Unpublished</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Manual order</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="question">Question A→Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New question</Button>
        <Button variant="outline" onClick={doExport}><Download className="mr-1 h-4 w-4" /> Export CSV</Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) doImport(f).then(() => (fileRef.current!.value = ""));
          }}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" /> Import CSV</Button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {rows.length} question{rows.length === 1 ? "" : "s"}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded border border-border bg-secondary/50 p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => doBulkPublish(true)}><Eye className="mr-1 h-4 w-4" /> Publish</Button>
          <Button size="sm" variant="outline" onClick={() => doBulkPublish(false)}><EyeOff className="mr-1 h-4 w-4" /> Unpublish</Button>
          <Select onValueChange={doBulkCategory}>
            <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Set category…" /></SelectTrigger>
            <SelectContent>
              {theoryCategories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => doBulkDifficulty(v as TheoryDifficulty)}>
            <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Set difficulty…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="destructive" onClick={() => doDelete([...selected])}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 p-3"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" /></th>
              <th className="p-3">Question</th>
              <th className="p-3">Category</th>
              <th className="p-3">Difficulty</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No questions match your filters.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                <td className="p-3"><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} /></td>
                <td className="p-3">
                  <button className="text-left font-medium hover:underline" onClick={() => openEdit(r)}>
                    {r.question}
                  </button>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.source_id && <Badge variant="outline" className="text-[10px]">{r.source_id}</Badge>}
                    {r.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">{r.category}</td>
                <td className="p-3 whitespace-nowrap capitalize">{r.difficulty}</td>
                <td className="p-3 whitespace-nowrap">
                  {r.is_published ? (
                    <Badge className="bg-emerald-600 text-white">Published</Badge>
                  ) : (
                    <Badge variant="outline">Hidden</Badge>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button aria-label="Move up" size="icon" variant="ghost" onClick={() => doReorder(r.id, "up")} title="Move up"><ArrowUp className="h-4 w-4" /></Button>
                    <Button aria-label="Move down" size="icon" variant="ghost" onClick={() => doReorder(r.id, "down")} title="Move down"><ArrowDown className="h-4 w-4" /></Button>
                    <Button aria-label="Copy" size="icon" variant="ghost" onClick={() => doDuplicate(r.id)} title="Duplicate"><Copy className="h-4 w-4" /></Button>
                    <Button aria-label="Delete" size="icon" variant="ghost" onClick={() => doDelete([r.id])} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit question" : "New question"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {theoryCategories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={draft.difficulty} onValueChange={(v) => setDraft({ ...draft, difficulty: v as TheoryDifficulty })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Question</Label>
                <Textarea
                  className="min-h-[80px]"
                  value={draft.question}
                  onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                />
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={draft.tags.join(", ")}
                  onChange={(e) =>
                    setDraft({ ...draft, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Options — tick the correct answer</Label>
                {draft.options.map((opt, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded border p-3",
                      draft.correct_index === i ? "border-emerald-600 bg-emerald-600/5" : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={draft.correct_index === i}
                        onChange={() => setDraft({ ...draft, correct_index: i })}
                        className="h-4 w-4"
                      />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        Option {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                    <Input
                      className="mt-2"
                      value={opt}
                      onChange={(e) => {
                        const next = [...draft.options];
                        next[i] = e.target.value;
                        setDraft({ ...draft, options: next });
                      }}
                    />
                    <Textarea
                      className="mt-2 min-h-[60px]"
                      placeholder="Why this option is right/wrong (shown when picked)"
                      value={draft.option_explanations[i] ?? ""}
                      onChange={(e) => {
                        const next = [...draft.option_explanations];
                        next[i] = e.target.value;
                        setDraft({ ...draft, option_explanations: next });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label>Main explanation</Label>
                <Textarea
                  className="min-h-[80px]"
                  value={draft.explanation}
                  onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 rounded border border-border p-3">
                <div className="flex-1">
                  <Label className="mb-1 block">Image</Label>
                  {draft.image_url ? (
                    <img src={draft.image_url} alt="" className="max-h-40 rounded border border-border" />
                  ) : (
                    <p className="text-xs text-muted-foreground">Optional. Save the question first, then upload.</p>
                  )}
                </div>
                <input
                  ref={imgFileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f).then(() => (imgFileRef.current!.value = ""));
                  }}
                />
                <Button
                  variant="outline"
                  disabled={!draft.id}
                  onClick={() => imgFileRef.current?.click()}
                >
                  <ImagePlus className="mr-1 h-4 w-4" /> Upload
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="pub"
                  checked={draft.is_published}
                  onCheckedChange={(v) => setDraft({ ...draft, is_published: v === true })}
                />
                <Label htmlFor="pub" className="cursor-pointer">Published (visible on the site)</Label>
              </div>

              <div>
                <Label>Linked built-in question ID (optional)</Label>
                <Input
                  value={draft.source_id ?? ""}
                  onChange={(e) => setDraft({ ...draft, source_id: e.target.value.trim() || null })}
                  placeholder="e.g. alertness-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Set to override a built-in question's content. Leave empty for a brand-new question.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)} disabled={saving}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}