import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trackContactClick } from "@/lib/trackContactClick";
import { useServerFn } from "@tanstack/react-start";
import { verifyPortalAccess } from "@/lib/portal-access.functions";
import { getCaptchaConfig, studentSignIn } from "@/lib/auth-guard.functions";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { supabase } from "@/integrations/supabase/client";

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
  const runStudentSignIn = useServerFn(studentSignIn);
  const runCaptchaConfig = useServerFn(getCaptchaConfig);

  // Student email + password sign-in (persists per-student progress)
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [studentPw, setStudentPw] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentSubmitting, setStudentSubmitting] = useState(false);

  // Captcha state
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [studentCaptchaRequired, setStudentCaptchaRequired] = useState(false);
  const [studentCaptchaToken, setStudentCaptchaToken] = useState<string | null>(null);
  const [codeCaptchaRequired, setCodeCaptchaRequired] = useState(false);
  const [codeCaptchaToken, setCodeCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackContactClick("portal_view", "learner-portal");
    runCaptchaConfig().then((c) => setSiteKey(c.siteKey)).catch(() => {});
  }, [runCaptchaConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const pw = password.trim();
    try {
      const res = await verify({
        data: {
          password: pw,
          mode: isAdmin ? "admin" : "learner",
          captchaToken: codeCaptchaToken,
        },
      });
      if (!res.ok) {
        if (res.reason === "locked") {
          toast.error("Too many attempts. Try again in 15 minutes.");
        } else if (res.reason === "captcha_required") {
          setCodeCaptchaRequired(true);
          toast.error("Please complete the verification below and try again.");
        } else if (res.reason === "captcha_failed") {
          setCodeCaptchaToken(null);
          toast.error("Verification failed. Try the check again.");
        } else {
          toast.error("Incorrect or expired code. Email George to request access.");
        }
        if (res.captchaRequiredNext) setCodeCaptchaRequired(true);
        setCodeCaptchaToken(null);
        setSubmitting(false);
        return;
      }
      window.sessionStorage.setItem("portal_unlocked", "1");
      if (isAdmin) {
        window.sessionStorage.setItem("admin_unlocked", "1");
        window.sessionStorage.setItem("admin_password", pw);
      }
      // Subscription codes carry a student email — link the code login to
      // that Supabase account so progress persists across devices.
      let linked = false;
      if (!isAdmin && res.session?.access_token && res.session?.refresh_token) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
        if (!setErr) linked = true;
      }
      toast.success(
        isAdmin
          ? "Admin access granted."
          : linked && res.subscription?.email
          ? `Signed in as ${res.subscription.email}. Progress will save to your account.`
          : res.subscription?.expires_at
          ? `Access granted until ${new Date(res.subscription.expires_at).toLocaleDateString()}.`
          : "Access granted. Welcome to the learner portal.",
      );
      if (!isAdmin && res.subscription && !linked) {
        toast.warning(
          "Progress on this code won't sync across devices. Sign in with your email + password to save it to your account.",
        );
      }
      navigate({ to: isAdmin ? "/admin" : "/dashboard" });
    } catch {
      toast.error("Could not verify code. Please try again.");
      setSubmitting(false);
    }
  };

  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || studentPw.length < 6) {
      toast.error("Enter your email and a password (6+ characters).");
      return;
    }
    setStudentSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: studentPw,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        // If email confirmation is required, there'll be no session yet.
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) {
          toast.success("Check your email to confirm, then sign in.");
          setMode("signin");
          setStudentSubmitting(false);
          return;
        }
      } else {
        // Route sign-in through our guarded server function so brute-force
        // attempts trip captcha / lockout server-side.
        const res = await runStudentSignIn({
          data: {
            email: email.trim(),
            password: studentPw,
            captchaToken: studentCaptchaToken,
          },
        });
        if (!res.ok) {
          if (res.reason === "locked") {
            throw new Error("Too many attempts. Try again in 15 minutes.");
          }
          if (res.reason === "captcha_required") {
            setStudentCaptchaRequired(true);
            throw new Error("Please complete the verification below and try again.");
          }
          if (res.reason === "captcha_failed") {
            setStudentCaptchaToken(null);
            throw new Error("Verification failed. Try the check again.");
          }
          if (res.captchaRequiredNext) setStudentCaptchaRequired(true);
          setStudentCaptchaToken(null);
          throw new Error("Invalid email or password.");
        }
        if (res.session) {
          const { error: setErr } = await supabase.auth.setSession(res.session);
          if (setErr) throw setErr;
        }
      }
      window.sessionStorage.setItem("portal_unlocked", "1");
      toast.success("Signed in. Your progress will save automatically.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "Could not sign in. Check your details and try again.");
    } finally {
      setStudentSubmitting(false);
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
          {!isAdmin && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-left">
              <div className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-primary" />
                {mode === "signin" ? "Sign in with your GSM account" : "Create your GSM account"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Signing in with email + password saves your lesson scores and progress across every device.
              </p>
              <form onSubmit={handleStudentAuth} className="mt-3 space-y-2">
                {mode === "signup" && (
                  <Input
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                )}
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password (6+ characters)"
                  value={studentPw}
                  onChange={(e) => setStudentPw(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
                <Button type="submit" className="w-full" disabled={studentSubmitting}>
                  {studentSubmitting ? "..." : mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>
              <button
                type="button"
                className="mt-2 text-xs text-primary underline"
                onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              >
                {mode === "signin" ? "New to GSM? Create an account" : "Already have an account? Sign in"}
              </button>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Enter the admin access code to view site analytics, payments, and learner progress."
              : "Or enter a class access code below (given by George):"}
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
