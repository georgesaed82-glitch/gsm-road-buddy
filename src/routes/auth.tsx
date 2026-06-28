import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackContactClick } from "@/lib/trackContactClick";

export const Route = createFileRoute("/auth")({
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
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackContactClick("portal_view", "learner-portal");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("portal_launch_subscribers")
      .insert({ email: trimmed });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        setDone(true);
        toast.success("You're already on the list — we'll be in touch!");
        return;
      }
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Thanks! We'll email you when the portal goes live.");
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Learner portal</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-2">Coming soon</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We're building a place for you to book lessons, track your progress, and manage payments online.
          </p>
          {done ? (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              You're on the list. We'll email you at launch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2 text-left">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" /> Get notified when it's live
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
                <Button type="submit" disabled={submitting}>
                  {submitting ? "..." : "Notify me"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                One email at launch. No spam, unsubscribe anytime.
              </p>
            </form>
          )}
          <p className="text-sm text-muted-foreground">
            In the meantime, call, WhatsApp, or email us to book lessons.
          </p>
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
