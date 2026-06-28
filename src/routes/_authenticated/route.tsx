import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Learner portal is disabled while it is being prepared, but admins
    // can still reach the admin section.
    const isAdminRoute = location.pathname.startsWith("/admin");
    if (!isAdminRoute) throw redirect({ to: "/auth" });

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw redirect({ to: "/auth" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
