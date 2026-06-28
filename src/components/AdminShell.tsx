import type { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, LogOut, ShieldCheck, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/contact-clicks", label: "Contact clicks", icon: BarChart3 },
  { to: "/admin/admins", label: "Admin accounts", icon: ShieldCheck },
  { to: "/admin/email", label: "Email settings", icon: Mail },
] as const;

export function AdminShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="border border-border bg-card p-2">
          <div className="border-b border-border px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Admin portal</div>
            <div className="mt-1 font-display text-lg text-foreground">GSM control</div>
          </div>
          <nav className="mt-2 flex flex-col gap-0.5">
            {items.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/dashboard"
            className="mt-2 flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Learner portal
          </Link>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-border pb-6">
          {eyebrow && (
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-6 bg-accent" />
              {eyebrow}
            </div>
          )}
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-foreground">{title}</h1>
        </header>
        <div className="pt-8">{children}</div>
      </main>
    </div>
  );
}