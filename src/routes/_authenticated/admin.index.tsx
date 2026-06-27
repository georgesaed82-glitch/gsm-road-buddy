import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async () => {
      const [profiles, bookings, payments] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("lesson_bookings").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }),
      ]);
      return {
        students: profiles.count ?? 0,
        lessons: bookings.count ?? 0,
        payments: payments.count ?? 0,
      };
    },
  });

  return (
    <AdminShell eyebrow="Admin" title="Overview">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={stats?.students ?? "—"} />
        <StatCard label="Lessons booked" value={stats?.lessons ?? "—"} />
        <StatCard label="Payments" value={stats?.payments ?? "—"} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <h2 className="font-display text-lg">Quick links</h2>
        </CardHeader>
        <CardContent>
          <Link
            to="/admin/contact-clicks"
            className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            <BarChart3 className="h-4 w-4" /> Contact clicks
          </Link>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-2 font-display text-4xl">{value}</div>
      </CardContent>
    </Card>
  );
}