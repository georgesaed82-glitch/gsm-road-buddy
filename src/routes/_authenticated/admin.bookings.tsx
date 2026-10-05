import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  listAdminBookings,
  saveAdminBooking,
  deleteAdminBooking,
  type AdminBooking,
} from "@/lib/admin-bookings.functions";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  head: () => ({ meta: [{ title: "Lesson bookings · Admin" }] }),
  component: BookingsAdmin,
});

type Draft = {
  id?: string;
  user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  instructor_name: string;
  pickup_location: string;
  instructor_notes: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
};

const EMPTY: Draft = {
  user_id: "",
  scheduled_at: "",
  duration_minutes: 60,
  instructor_name: "George",
  pickup_location: "",
  instructor_notes: "",
  status: "scheduled",
};

const toLocal = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const selectCls = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

function BookingsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAdminBookings);
  const saveFn = useServerFn(saveAdminBooking);
  const delFn = useServerFn(deleteAdminBooking);
  const { data } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => listFn() });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const learners = data?.learners ?? [];
  const bookings = data?.bookings ?? [];

  const edit = (b: AdminBooking) =>
    setDraft({
      id: b.id,
      user_id: b.user_id,
      scheduled_at: toLocal(b.scheduled_at),
      duration_minutes: b.duration_minutes,
      instructor_name: b.instructor_name,
      pickup_location: b.pickup_location ?? "",
      instructor_notes: b.instructor_notes ?? "",
      status: (b.status as Draft["status"]) ?? "scheduled",
    });

  const save = async () => {
    if (!draft) return;
    if (!draft.user_id || !draft.scheduled_at) return toast.error("Choose a learner and a date/time");
    setSaving(true);
    try {
      await saveFn({
        data: {
          ...draft,
          pickup_location: draft.pickup_location || null,
          instructor_notes: draft.instructor_notes || null,
        },
      });
      toast.success("Booking saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await delFn({ data: { id } });
    toast.success("Booking deleted");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  return (
    <AdminShell title="Lesson bookings">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Add and manage learners' lessons.</p>
          <Button onClick={() => setDraft({ ...EMPTY })}>
            <Plus className="mr-1 h-4 w-4" /> New booking
          </Button>
        </div>

        {draft && (
          <Card>
            <CardHeader className="font-semibold">{draft.id ? "Edit booking" : "New booking"}</CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Learner</Label>
                <select className={selectCls} value={draft.user_id} onChange={(e) => setDraft({ ...draft, user_id: e.target.value })}>
                  <option value="">Choose a learner…</option>
                  {learners.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}{l.phone ? ` · ${l.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Date & time</Label>
                <Input type="datetime-local" value={draft.scheduled_at} onChange={(e) => setDraft({ ...draft, scheduled_at: e.target.value })} />
              </div>
              <div>
                <Label>Length (minutes)</Label>
                <Input type="number" min={15} step={15} value={draft.duration_minutes} onChange={(e) => setDraft({ ...draft, duration_minutes: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Instructor</Label>
                <Input value={draft.instructor_name} onChange={(e) => setDraft({ ...draft, instructor_name: e.target.value })} />
              </div>
              <div>
                <Label>Pickup location</Label>
                <Input value={draft.pickup_location} onChange={(e) => setDraft({ ...draft, pickup_location: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <select className={selectCls} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft["status"] })}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No show</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Textarea value={draft.instructor_notes} onChange={(e) => setDraft({ ...draft, instructor_notes: e.target.value })} />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save booking"}</Button>
                <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {learners.length === 0 && (
          <p className="text-sm text-muted-foreground">No learner accounts yet — learners need an account before you can book them.</p>
        )}

        <div className="space-y-2">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-semibold">{b.learner_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(b.scheduled_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {b.duration_minutes} min · {b.instructor_name} · {b.status}
                  </p>
                  {b.pickup_location && <p className="text-xs text-muted-foreground">Pickup: {b.pickup_location}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => edit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
        </div>
      </div>
    </AdminShell>
  );
}
