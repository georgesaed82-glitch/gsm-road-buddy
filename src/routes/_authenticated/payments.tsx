import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Download, Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackContactClick } from "@/lib/trackContactClick";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments & Packages · GSM Plus" }] }),
  component: PaymentsPage,
});

const packages = [
  {
    name: "Single lessons",
    duration: "2 hours",
    description: "Perfect for an assessment, refresher, or booking as you go.",
    features: ["2 hours 1-to-1 tuition", "Flexible location", "Progress feedback", "Pay-as-you-go"],
    popular: false,
  },
  {
    name: "Twelve-hour packages",
    duration: "12 hours",
    description: "A structured block of lessons to build real confidence.",
    features: [
      "12 hours 1-to-1 tuition",
      "Flexible location",
      "Progress feedback",
      "Structured goals",
    ],
    popular: true,
  },
  {
    name: "Intensive packages",
    duration: "Intensive",
    description: "Fast-track learning for learners who want to pass quickly.",
    features: [
      "Concentrated 1-to-1 tuition",
      "Flexible location",
      "Progress feedback",
      "Mock test included",
    ],
    popular: false,
  },
  {
    name: "Weekend packages",
    duration: "Weekend",
    description: "Saturday and Sunday sessions that fit around work or study.",
    features: [
      "Weekend 1-to-1 tuition",
      "Flexible location",
      "Progress feedback",
      "Flexible booking",
    ],
    popular: false,
  },
  {
    name: "Refresher packages",
    duration: "Refresher",
    description: "Rebuild confidence after a break or returning to driving.",
    features: [
      "Tailored 1-to-1 tuition",
      "Flexible location",
      "Progress feedback",
      "Confidence building",
    ],
    popular: false,
  },
  {
    name: "Pass Plus",
    duration: "Pass Plus",
    description: "Advanced modules for motorway, night and all-weather driving.",
    features: [
      "Pass Plus 1-to-1 tuition",
      "Flexible location",
      "Progress feedback",
      "Insurance discount potential",
    ],
    popular: false,
  },
];

function PaymentsPage() {
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: completed = 0 } = useQuery({
    queryKey: ["completed-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("lesson_bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed");
      return count ?? 0;
    },
  });

  const paid = payments.filter((p) => p.status === "paid");
  const hoursPurchased = paid.reduce((s, p) => s + Number(p.hours_purchased ?? 0), 0);
  const remaining = Math.max(0, hoursPurchased - completed);

  return (
    <PortalShell eyebrow="Billing" title="Payments & packages">
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Hours remaining" value={remaining.toFixed(1)} accent />
        <Stat label="Hours purchased" value={hoursPurchased.toFixed(1)} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Top up</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a package and contact us to arrange payment by card or bank transfer.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={`relative border-border bg-card ${pkg.popular ? "ring-2 ring-primary" : ""}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </div>
              )}
              <CardHeader className="pb-4">
                <h3 className="font-display text-xl font-semibold">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{pkg.duration}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    asChild
                    variant={pkg.popular ? "default" : "outline"}
                    className="w-full gap-2"
                  >
                    <a
                      href="https://wa.me/447961585231"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackContactClick("whatsapp", pkg.name)}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp us
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full gap-2 text-muted-foreground hover:text-primary"
                  >
                    <a
                      href="mailto:gsmdrivingschool@outlook.com"
                      onClick={() => trackContactClick("email", pkg.name)}
                    >
                      <Mail className="h-4 w-4" />
                      Email us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-card p-8 text-center sm:p-10">
          <h3 className="font-display text-2xl font-semibold text-foreground">Need details?</h3>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Every learner is different. Call or email us for a personalised quote based on your
            experience and goals.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="outline" className="h-11 gap-2">
              <a
                href="tel:+447961585231"
                onClick={() => trackContactClick("phone", "Payments CTA")}
              >
                <Phone className="h-4 w-4" />
                Call us
              </a>
            </Button>
            <Button asChild className="h-11 gap-2">
              <Link to="/contact" onClick={() => trackContactClick("email", "Payments CTA")}>
                <Mail className="h-4 w-4" />
                Email us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Receipts</h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No payments yet. Your receipts will appear here after your first booking.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Package</th>
                  <th className="px-5 py-3 text-left font-medium">Hours</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-5 py-4">
                      {new Date(p.paid_at ?? p.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{p.package_name}</td>
                    <td className="px-5 py-4">{p.hours_purchased}</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={p.status === "paid" ? "default" : "outline"}
                        className={p.status === "paid" ? "bg-success text-success-foreground" : ""}
                      >
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
    <div
      className={`border border-border p-5 ${accent ? "bg-accent text-accent-foreground" : "bg-card"}`}
    >
      <div
        className={`text-[11px] uppercase tracking-[0.18em] ${accent ? "opacity-80" : "text-muted-foreground"}`}
      >
        {label}
      </div>
      <div className="mt-3 font-display text-3xl">{value}</div>
    </div>
  );
}
