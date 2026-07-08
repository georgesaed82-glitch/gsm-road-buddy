import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password | GSM Driving School" },
      {
        name: "description",
        content: "Set a new password for your GSM Driving School admin account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase places `#type=recovery&access_token=...` in the URL fragment when
  // the user clicks the reset link. Wait for onAuthStateChange to fire
  // PASSWORD_RECOVERY (or a session to appear) before showing the form.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const pw = password.trim();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters.");
    if (pw !== confirm.trim()) return toast.error("Passwords do not match.");
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) {
        toast.error(error.message || "Could not update password.");
        setSubmitting(false);
        return;
      }
      toast.success("Password updated. Redirecting…");
      navigate({ to: "/admin" });
    } catch {
      toast.error("Could not update password.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Set a new password</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-2">
              Password reset
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!ready ? (
            <p className="text-sm text-muted-foreground">
              Waiting for the reset link to be verified… If nothing happens within a few seconds,
              request a fresh reset email from the admin sign-in page.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" /> New password
              </label>
              <Input
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" /> Confirm new password
              </label>
              <Input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={submitting}
              />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth" search={{ admin: 1 }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to admin sign-in
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
