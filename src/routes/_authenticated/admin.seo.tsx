import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { listPageSeo, upsertPageSeo, deletePageSeo, listSiteSettings, upsertSiteSetting } from "@/lib/cms.functions";
export const Route = createFileRoute("/_authenticated/admin/seo")({
  head: () => ({ meta: [{ title: "SEO editor · Admin" }] }),
  component: SeoPage,
});

// All shareable public routes (top-level; not admin/portal).
const ROUTES: Array<{ path: string; label: string }> = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/services", label: "Practical services" },
  { path: "/pricing", label: "Pricing" },
  { path: "/reviews", label: "Reviews" },
  { path: "/contact", label: "Contact" },
  { path: "/instructors", label: "Instructors" },
  { path: "/theory", label: "Theory landing" },
  { path: "/areas", label: "Areas index" },
  { path: "/auth", label: "Sign in / auth" },
];

function SeoPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listPageSeo);
  const saveFn = useServerFn(upsertPageSeo);
  const delFn = useServerFn(deletePageSeo);
  const listSettingsFn = useServerFn(listSiteSettings);
  const upsertSettingFn = useServerFn(upsertSiteSetting);

  const { data: rows = [] } = useQuery({ queryKey: ["page-seo"], queryFn: () => listFn() });
  const byRoute = useMemo(() => new Map(rows.map((r) => [r.route, r])), [rows]);

  const { data: settings = [] } = useQuery({ queryKey: ["site-settings"], queryFn: () => listSettingsFn() });
  const ratingRow = settings.find((s) => s.key === "site_rating");
  const ratingValue = (ratingRow?.value ?? {}) as { rating?: number; review_count?: number; show?: boolean };
  const [rating, setRating] = useState({ rating: 5.0, review_count: 143, show: true });
  const [savingRating, setSavingRating] = useState(false);
  useEffect(() => {
    setRating({
      rating: typeof ratingValue.rating === "number" ? ratingValue.rating : 5.0,
      review_count: typeof ratingValue.review_count === "number" ? ratingValue.review_count : 143,
      show: ratingValue.show !== false,
    });
  }, [ratingRow?.updated_at]);

  const saveRating = async () => {
setSavingRating(true);
    try {
      await upsertSettingFn({ data: { password, key: "site_rating", value: { rating: Number(rating.rating), review_count: Math.round(Number(rating.review_count)), show: rating.show } } });
      toast.success("Rating saved");
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingRating(false);
    }
  };

  const [idx, setIdx] = useState(0);
  const current = ROUTES[idx];
  const existing = byRoute.get(current.path);

  const [form, setForm] = useState({
    title: "", description: "", og_title: "", og_description: "", canonical_override: "", noindex: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      title: existing?.title ?? "",
      description: existing?.description ?? "",
      og_title: existing?.og_title ?? "",
      og_description: existing?.og_description ?? "",
      canonical_override: existing?.canonical_override ?? "",
      noindex: existing?.noindex ?? false,
    });
  }, [existing, current.path]);

  const save = async () => {
setSaving(true);
    try {
      await saveFn({
        data: {
          route: current.path,
          title: form.title.trim() || null,
          description: form.description.trim() || null,
          og_title: form.og_title.trim() || null,
          og_description: form.og_description.trim() || null,
          og_image_path: null,
          canonical_override: form.canonical_override.trim() || null,
          noindex: form.noindex,
        },
      });
      toast.success("Saved");
      await qc.invalidateQueries({ queryKey: ["page-seo"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const removeOverride = async () => {
    if (!existing) return;
    if (!window.confirm("Remove this SEO override and use the built-in defaults?")) return;
try {
      await delFn({ data: { password, route: current.path } });
      toast.success("Removed");
      await qc.invalidateQueries({ queryKey: ["page-seo"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="SEO editor">
      <p className="mb-4 text-sm text-muted-foreground">Override the title, description and social preview for any public page. Leave a field blank to fall back to the built-in default.</p>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Sitewide</Badge>
            <span className="text-sm font-medium">Aggregate rating (used in JSON-LD, meta, and public rating labels)</span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Rating value</Label>
            <Input type="number" step="0.1" min={0} max={5} className="mt-1" value={rating.rating}
              onChange={(e) => setRating({ ...rating, rating: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Review count</Label>
            <Input type="number" step="1" min={0} className="mt-1" value={rating.review_count}
              onChange={(e) => setRating({ ...rating, review_count: Number(e.target.value) })} />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={rating.show} onCheckedChange={(v) => setRating({ ...rating, show: v })} />
              <span className="text-sm">Show publicly</span>
            </div>
            <Button onClick={saveRating} disabled={savingRating} className="ml-auto"><Save className="mr-2 h-4 w-4" />{savingRating ? "Saving…" : "Save"}</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Page</Label>
          <Select value={current.path} onValueChange={(p) => setIdx(ROUTES.findIndex((r) => r.path === p))}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {ROUTES.map((r, i) => (
                <SelectItem key={r.path} value={r.path}>{i + 1}. {r.label} — {r.path} {byRoute.has(r.path) ? "•" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">{idx + 1} of {ROUTES.length} · {rows.length} overridden</div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{current.path}</Badge>
            {existing && <Badge className="bg-emerald-600 text-white"><CheckCircle2 className="mr-1 h-3 w-3" /> overridden</Badge>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}><ChevronLeft className="h-4 w-4" /> Prev</Button>
            <Button variant="outline" size="sm" disabled={idx >= ROUTES.length - 1} onClick={() => setIdx((i) => Math.min(ROUTES.length - 1, i + 1))}>Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Page title <span className="text-xs text-muted-foreground">(under 60 chars)</span></Label>
            <Input className="mt-1" maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Meta description <span className="text-xs text-muted-foreground">(under 160 chars)</span></Label>
            <Textarea className="mt-1 min-h-[80px]" maxLength={400} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>OG title (social preview)</Label>
              <Input className="mt-1" value={form.og_title} onChange={(e) => setForm({ ...form, og_title: e.target.value })} placeholder="Defaults to page title" />
            </div>
            <div>
              <Label>OG description</Label>
              <Input className="mt-1" value={form.og_description} onChange={(e) => setForm({ ...form, og_description: e.target.value })} placeholder="Defaults to meta description" />
            </div>
          </div>
          <div>
            <Label>Canonical URL override (advanced)</Label>
            <Input className="mt-1" value={form.canonical_override} onChange={(e) => setForm({ ...form, canonical_override: e.target.value })} placeholder="Leave blank to auto-generate" />
          </div>
          <div className="flex items-center gap-3 border-t pt-3">
            <Switch checked={form.noindex} onCheckedChange={(v) => setForm({ ...form, noindex: v })} />
            <div>
              <div className="text-sm font-medium">Hide from search engines</div>
              <div className="text-xs text-muted-foreground">Adds a noindex tag so Google won't list this page.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save changes"}</Button>
            {existing && (
              <Button variant="outline" onClick={removeOverride}><RotateCcw className="mr-2 h-4 w-4" /> Remove override</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}