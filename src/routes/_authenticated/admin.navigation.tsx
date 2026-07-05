import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listNavItems, saveNavItems, type NavItemRow } from "@/lib/cms.functions";
import { getAdminPassword } from "@/lib/admin-gate";

export const Route = createFileRoute("/_authenticated/admin/navigation")({
  head: () => ({ meta: [{ title: "Navigation menus · Admin" }] }),
  component: NavigationPage,
});

type Editable = Omit<NavItemRow, "updated_at"> & { _new?: boolean };

const LOCATIONS: Array<{ v: NavItemRow["location"]; label: string }> = [
  { v: "header", label: "Header menu" },
  { v: "footer-primary", label: "Footer — primary links" },
  { v: "footer-secondary", label: "Footer — secondary links" },
  { v: "portal", label: "Learner portal dropdown" },
];

function NavigationPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listNavItems);
  const saveFn = useServerFn(saveNavItems);
  const { data: rows = [] } = useQuery({ queryKey: ["nav-items"], queryFn: () => listFn() });

  const [items, setItems] = useState<Editable[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(rows.map((r) => ({ ...r })));
    setDeletedIds([]);
  }, [rows]);

  const grouped = useMemo(() => {
    const m = new Map<NavItemRow["location"], Editable[]>();
    for (const it of items) {
      const arr = m.get(it.location) ?? [];
      arr.push(it);
      m.set(it.location, arr);
    }
    for (const [, arr] of m) arr.sort((a, b) => a.order_index - b.order_index);
    return m;
  }, [items]);

  const update = (id: string, patch: Partial<Editable>) => setItems((its) => its.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id: string) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    if (!it._new) setDeletedIds((d) => [...d, id]);
    setItems((its) => its.filter((x) => x.id !== id));
  };
  const move = (id: string, delta: number) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    const siblings = (grouped.get(it.location) ?? []).slice();
    const idx = siblings.findIndex((x) => x.id === id);
    const j = idx + delta;
    if (j < 0 || j >= siblings.length) return;
    [siblings[idx], siblings[j]] = [siblings[j], siblings[idx]];
    const patches = siblings.map((s, i) => ({ id: s.id, order_index: (i + 1) * 10 }));
    setItems((its) => its.map((x) => patches.find((p) => p.id === x.id) ? { ...x, order_index: patches.find((p) => p.id === x.id)!.order_index } : x));
  };
  const add = (location: NavItemRow["location"]) => {
    const existing = grouped.get(location) ?? [];
    const nextOrder = (existing.at(-1)?.order_index ?? 0) + 10;
    setItems((its) => [...its, { id: crypto.randomUUID(), location, label: "New link", href: "/", order_index: nextOrder, enabled: true, icon: null, _new: true }]);
  };

  const save = async () => {
    const password = getAdminPassword();
    if (!password) return toast.error("Admin password missing. Sign in via /auth?admin=1.");
    setSaving(true);
    try {
      await saveFn({
        data: {
          password,
          items: items.map((it) => ({
            id: it._new ? undefined : it.id,
            location: it.location,
            label: it.label,
            href: it.href,
            order_index: it.order_index,
            enabled: it.enabled,
            icon: it.icon,
          })),
          delete_ids: deletedIds,
        },
      });
      toast.success("Saved");
      await qc.invalidateQueries({ queryKey: ["nav-items"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="Navigation menus">
      <p className="mb-4 text-sm text-muted-foreground">Edit the header, footer and learner-portal menus. Toggle the switch to hide a link without deleting it. Reorder with the arrows.</p>
      <div className="space-y-6">
        {LOCATIONS.map(({ v, label }) => {
          const list = grouped.get(v) ?? [];
          return (
            <Card key={v}>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="font-display text-xl">{label}</h2>
                <Button variant="outline" size="sm" onClick={() => add(v)}><Plus className="mr-1 h-4 w-4" /> Add link</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}
                {list.map((it, i) => (
                  <div key={it.id} className="grid gap-2 border border-border bg-background p-3 sm:grid-cols-[1fr_1.5fr_auto_auto]">
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Label</Label>
                      <Input value={it.label} onChange={(e) => update(it.id, { label: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Href</Label>
                      <Input value={it.href} onChange={(e) => update(it.id, { href: e.target.value })} placeholder="/services or https://…" />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Switch checked={it.enabled} onCheckedChange={(v2) => update(it.id, { enabled: v2 })} />
                        <span className="text-xs">{it.enabled ? "Visible" : "Hidden"}</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => move(it.id, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => move(it.id, 1)} disabled={i === list.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <Button size="lg" onClick={save} disabled={saving} className="shadow-lg"><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save all changes"}</Button>
      </div>
    </AdminShell>
  );
}