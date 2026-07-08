import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { isAdmin, isLoading } = useIsAdmin();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: "/auth", search: { admin: 1 } });
    }
  }, [isAdmin, isLoading, navigate]);
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Checking admin access...
      </div>
    );
  }
  if (!isAdmin) return null;
  return <Outlet />;
}
