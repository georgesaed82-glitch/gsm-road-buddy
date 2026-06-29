import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trackContactClick } from "@/lib/trackContactClick";
import { useServerFn } from "@tanstack/react-start";
import { verifyPortalAccess } from "@/lib/portal-access.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    admin: search.admin === 1 || search.admin === "1" ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Learner portal coming soon | GSM Driving School" },
      {
        name: "description",
        content: "The GSM Driving School learner portal is coming soon. Manage lessons, payments, and progress online.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { admin } = Route.useSearch();
  const isAdmin = admin === 1;
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const tracked = useRef(false);
  const verify = useServerFn(verifyPortalAccess);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackContactClick("portal_view", "learner-portal");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const pw = password.trim();
    try {
      const res = await verify({ data: { password: pw, mode: isAdmin ? "admin" : "learner" } });
      if (!res.ok) {
        toast.error("Incorrect or expired code. Email George to request access.");
        setSubmitting(false);
        return;
      }
      window.sessionStorage.setItem("portal_unlocked", "1");
      if (isAdmin) {
        window.sessionStorage.setItem("admin_unlocked", "1");
        window.sessionStorage.setItem("admin_password", pw);
      }
      toast.success(
        isAdmin
          ? "Admin access granted."
          : res.subscription?.expires_at
          ? `Access granted until ${new Date(res.subscription.expires_at).toLocaleDateString()}.`
          : "Access granted. Welcome to the learner portal.",
      );
      navigate({ to: isAdmin ? "/admin" : "/dashboard" });
    } catch {
      toast.error("Could not verify code. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {isAdmin ? "Admin login" : "Learner portal"}
          </CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-2">Password protected</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Enter the admin access code to view site analytics, payments, and learner progress."
              : "Enter your access code to view lessons, theory practice, hazard perception, and payments."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-2 text-left">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" /> Access code
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                required
                inputMode="numeric"
                autoComplete="off"
                placeholder="Enter code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "..." : "Enter"}
              </Button>
            </div>
          </form>
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-left">
            <div className="flex items-center gap-2 font-medium">
              <Mail className="h-4 w-4 text-primary" /> Don't have access?
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Email George at{" "}
              <a
                href="mailto:gsmdrivingschool@outlook.com?subject=Learner%20portal%20access"
                className="font-medium text-primary underline"
              >
                gsmdrivingschool@outlook.com
              </a>{" "}
              to request full access to the learner portal.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to the site
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
