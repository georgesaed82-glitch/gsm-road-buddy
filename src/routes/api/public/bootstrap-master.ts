import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/bootstrap-master")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-bootstrap-token");
        if (!token || token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        const body = (await request.json()) as { email: string; password: string };
        const email = body.email.trim().toLowerCase();
        const password = body.password;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Find or create the auth user.
        let userId: string | null = null;
        let page = 1;
        while (page < 20) {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) return Response.json({ error: error.message }, { status: 500 });
          const found = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
          if (found) { userId = found.id; break; }
          if (data.users.length < 200) break;
          page += 1;
        }
        if (userId) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
          });
          if (error) return Response.json({ error: error.message }, { status: 500 });
        } else {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (error || !data.user) {
            return Response.json({ error: error?.message ?? "create failed" }, { status: 500 });
          }
          userId = data.user.id;
        }

        // Promote to master owner, demoting any previous master owner.
        // The prevent_master_owner_changes trigger blocks normal writes, so we
        // temporarily disable it on the profiles table for this transaction.
        const sql = `
          BEGIN;
          ALTER TABLE public.profiles DISABLE TRIGGER prevent_master_owner_changes_trg;
          UPDATE public.profiles
             SET is_master_owner = false,
                 admin_role_slug = CASE WHEN admin_role_slug = 'master_owner' THEN 'developer' ELSE admin_role_slug END
           WHERE is_master_owner = true AND id <> $1;
          INSERT INTO public.profiles (id, is_master_owner, admin_role_slug, full_name)
          VALUES ($1, true, 'master_owner', 'George Saed')
          ON CONFLICT (id) DO UPDATE
             SET is_master_owner = true,
                 admin_role_slug = 'master_owner',
                 disabled_at = NULL,
                 must_change_password = false,
                 locked_until = NULL;
          ALTER TABLE public.profiles ENABLE TRIGGER prevent_master_owner_changes_trg;
          COMMIT;`;
        // Use a plain SQL RPC-style call by invoking postgrest raw isn't possible;
        // fall back to the pg-meta style via a helper function created in a
        // migration. For simplicity here, run the statements individually.
        void sql;
        const { error: e1 } = await (supabaseAdmin.rpc as unknown as (
          fn: string,
          args: Record<string, unknown>,
        ) => Promise<{ error: { message: string } | null }>)(
          "bootstrap_promote_master_owner",
          { _user_id: userId },
        );
        if (e1) return Response.json({ error: e1.message }, { status: 500 });

        return Response.json({ ok: true, user_id: userId });
      },
    },
  },
});