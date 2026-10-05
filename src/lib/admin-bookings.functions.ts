import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type AdminLearner = { id: string; name: string; phone: string | null };
export type AdminBooking = {
  id: string;
  user_id: string;
  learner_name: string;
  scheduled_at: string;
  duration_minutes: number;
  instructor_name: string;
  pickup_location: string | null;
  instructor_notes: string | null;
  status: string;
};

export const listAdminBookings = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: bookings, error }, { data: profiles }] = await Promise.all([
    supabaseAdmin
      .from("lesson_bookings")
      .select("id,user_id,scheduled_at,duration_minutes,instructor_name,pickup_location,instructor_notes,status")
      .order("scheduled_at", { ascending: false })
      .limit(300),
    supabaseAdmin.from("profiles").select("id,full_name,username,phone").order("full_name").limit(1000),
  ]);
  if (error) throw new Error(error.message);
  const learners: AdminLearner[] = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.full_name || p.username || "Unnamed learner",
    phone: p.phone,
  }));
  const names = new Map(learners.map((l) => [l.id, l.name]));
  return {
    learners,
    bookings: (bookings ?? []).map((b) => ({ ...b, learner_name: names.get(b.user_id) ?? "Unknown" })) as AdminBooking[],
  };
});

const input = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  scheduled_at: z.string().min(10),
  duration_minutes: z.number().int().min(15).max(480),
  instructor_name: z.string().trim().min(1).max(100),
  pickup_location: z.string().trim().max(200).nullable(),
  instructor_notes: z.string().trim().max(2000).nullable(),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
});

export const saveAdminBooking = createServerFn({ method: "POST" })
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...rest } = data;
    const row = { ...rest, scheduled_at: new Date(rest.scheduled_at).toISOString() };
    if (id) {
      const { error } = await supabaseAdmin.from("lesson_bookings").update(row).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: ins, error } = await supabaseAdmin.from("lesson_bookings").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const deleteAdminBooking = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lesson_bookings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
