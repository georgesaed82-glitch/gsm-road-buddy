import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const isAdminRoute = location.pathname.startsWith("/admin");

    if (isAdminRoute) {
      // Admin section still requires real authentication + admin role.
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
      return;
    }

    // Learner portal: simple shared-password gate stored in sessionStorage.
    if (typeof window !== "undefined") {
      const unlocked = window.sessionStorage.getItem("portal_unlocked") === "1";
      if (!unlocked) throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
