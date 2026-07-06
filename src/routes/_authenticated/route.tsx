import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const isAdminRoute = location.pathname.startsWith("/admin");

    if (typeof window === "undefined") return;

    if (isAdminRoute) {
      // Admin routes require a real Supabase session; the role check
      // (has_role('admin')) is enforced inside /_authenticated/admin.tsx
      // and server-side by every admin server function.
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw redirect({ to: "/auth", search: { admin: 1 } });
      return;
    }

    const unlocked = window.sessionStorage.getItem("portal_unlocked") === "1";
    if (unlocked) return;
    // A signed-in Supabase session also counts as portal access (student login).
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      window.sessionStorage.setItem("portal_unlocked", "1");
      return;
    }
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
