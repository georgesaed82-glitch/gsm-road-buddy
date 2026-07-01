import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments · GSM" }] }),
  component: PaymentsPage,
});

const gbp = (p: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(p / 100);

const packages = [
  { name: "Single lesson", hours: 1, blurb: "Pay-as-you-go for refreshers or top-ups." },
  { name: "10-hour block", hours: 10, blurb: "Most popular block for steady progress." },
  { name: "20-hour bundle", hours: 20, blurb: "Test-ready package with structured goals." },
  { name: "Intensive course", hours: 30, blurb: "1–2 week crash course. Includes mock test." },
];

function PaymentsPage() {
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: completed = 0 } = useQuery({
    queryKey: ["completed-count"],
    queryFn: async () => {
      const { count } = await supabase.from("lesson_bookings").select("id", { count: "exact", head: true }).eq("status", "completed");
      return count ?? 0;
    },
  });

  const paid = payments.filter((p) => p.status === "paid");
  const hoursPurchased = paid.reduce((s, p) => s + Number(p.hours_purchased ?? 0), 0);
  const spent = paid.reduce((s, p) => s + p.amount_pence, 0);
  const remaining = Math.max(0, hoursPurchased - completed);

  return (
    <PortalShell eyebrow="Billing" title="Payments & packages">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Hours remaining" value={remaining.toFixed(1)} accent />
        <Stat label="Hours purchased" value={hoursPurchased.toFixed(1)} />
        <Stat label="Lifetime spend" value={gbp(spent)} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Top up</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a package — payment is taken by card or bank transfer.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => (
            <div key={p.name} className="flex flex-col border border-border bg-card p-5">
              <div className="font-display text-lg text-foreground">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl text-primary">{gbp(p.price)}</span>
              </div>
              <div className="text-xs text-muted-foreground">{p.hours} hour{p.hours > 1 ? "s" : ""}</div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.blurb}</p>
              <Button asChild className="mt-5 rounded-none" size="sm">
                <a href="tel:+447961585231"><Phone className="mr-2 h-3.5 w-3.5" />Book over phone</a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Receipts</h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No payments yet. Your receipts will appear here after your first booking.</p>
        ) : (
          <div className="mt-4 overflow-hidden border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Package</th>
                  <th className="px-5 py-3 text-left font-medium">Hours</th>
                  <th className="px-5 py-3 text-left font-medium">Amount</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-5 py-4">{new Date(p.paid_at ?? p.created_at).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{p.package_name}</td>
                    <td className="px-5 py-4">{p.hours_purchased}</td>
                    <td className="px-5 py-4">{gbp(p.amount_pence)}</td>
                    <td className="px-5 py-4">
                      <Badge variant={p.status === "paid" ? "default" : "outline"} className={p.status === "paid" ? "bg-success text-success-foreground" : ""}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <button className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent">
                        <Download className="h-3.5 w-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PortalShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border border-border p-5 ${accent ? "bg-accent text-accent-foreground" : "bg-card"}`}>
      <div className={`text-[11px] uppercase tracking-[0.18em] ${accent ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-3 font-display text-3xl">{value}</div>
    </div>
  );
}
