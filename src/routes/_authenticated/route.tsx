import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const isAdminRoute = location.pathname.startsWith("/admin");

    if (typeof window === "undefined") return;

    if (isAdminRoute) {
      const unlocked = window.sessionStorage.getItem("admin_unlocked") === "1";
      if (!unlocked) throw redirect({ to: "/auth", search: { admin: 1 } });
      return;
    }

    const unlocked = window.sessionStorage.getItem("portal_unlocked") === "1";
    if (!unlocked) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
