import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminPasswordServer } from "./portal-access.functions";

async function requireAdmin() {
  if (!(await verifyAdminPasswordServer())) {
    throw new Error("Unauthorized");
  }
}

export type AdminRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

export const listAdmins = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({}).parse(d))
  .handler(async ({ data }): Promise<AdminRow[]> => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true });
    if (rolesErr) throw new Error(rolesErr.message);

    const rows: AdminRow[] = [];
    for (const r of roles ?? []) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
      const email = u?.user?.email ?? "(unknown)";
      const full_name = (u?.user?.user_metadata as any)?.full_name ?? null;
      rows.push({ user_id: r.user_id, email, full_name, created_at: r.created_at as string });
    }
    return rows;
  });

export const addAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255) }).parse(d),
  )
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Page through users to find matching email (Auth Admin API has no direct lookup).
    let target: { id: string } | null = null;
    for (let page = 1; page <= 20 && !target; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw new Error(error.message);
      const match = list.users.find((u) => (u.email ?? "").toLowerCase() === input.email);
      if (match) {
        target = { id: match.id };
        break;
      }
      if (list.users.length < 200) break;
    }
    if (!target) throw new Error("No account found for that email. Ask them to sign up first.");

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: target.id, role: "admin" });
    if (insErr && !insErr.message.includes("duplicate")) throw new Error(insErr.message);
    return { ok: true };
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) throw new Error("At least one admin must remain.");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", input.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
