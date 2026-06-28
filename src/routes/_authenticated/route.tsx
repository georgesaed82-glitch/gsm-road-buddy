import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Learner portal is currently disabled while it is being prepared.
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
