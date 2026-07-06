import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trackContactClick } from "@/lib/trackContactClick";
import { useServerFn } from "@tanstack/react-start";
import { verifyPortalAccess } from "@/lib/portal-access.functions";
import { getCaptchaConfig } from "@/lib/auth-guard.functions";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { admin?: 1 } => {
    const isAdmin = search.admin === 1 || search.admin === "1";
    return isAdmin ? { admin: 1 } : {};
  },
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const tracked = useRef(false);
  const verify = useServerFn(verifyPortalAccess);
  const runCaptchaConfig = useServerFn(getCaptchaConfig);

  // Captcha state
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [codeCaptchaRequired, setCodeCaptchaRequired] = useState(false);
  const [codeCaptchaToken, setCodeCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackContactClick("portal_view", "learner-portal");
    runCaptchaConfig().then((c) => setSiteKey(c.siteKey)).catch(() => {});
    // Restore saved credentials for the learner portal
    if (!isAdmin) {
      try {
        const raw = window.localStorage.getItem("gsm_remember_learner");
        if (raw) {
          const saved = JSON.parse(raw) as { email?: string; pin?: string };
          if (saved.email) setEmail(saved.email);
          if (saved.pin) setPassword(saved.pin);
          setRemember(true);
        }
      } catch {}
    }
  }, [runCaptchaConfig, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setSubmitting(true);
    const pw = password.trim();
    const emailValue = email.trim();
    if (!emailValue) {
      const msg = "Enter your email address.";
      setAuthMessage({ type: "error", text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }
    if (isAdmin) {
      // Prefer normal account sign-in, but keep the portal-code path available
      // so the recent auth hardening cannot strand an existing admin account.
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailValue,
          password: pw,
        });
        if (!error) {
          // Scrub any legacy admin-unlock state left over from the old build.
          try {
            window.localStorage.removeItem("admin_unlocked");
            window.localStorage.removeItem("admin_password");
          } catch {}
          const msg = "Signed in. Checking admin access...";
          setAuthMessage({ type: "success", text: msg });
          toast.success(msg);
          navigate({ to: "/admin" });
          return;
        }
        const res = await verify({
          data: {
            password: pw,
            mode: "admin",
            captchaToken: codeCaptchaToken,
            email: emailValue,
          },
        });
        if (!res.ok || !res.session?.access_token || !res.session?.refresh_token) {
          const msg = "Sign-in failed. Check your email and password.";
          setAuthMessage({ type: "error", text: msg });
          toast.error(msg);
          setCodeCaptchaToken(null);
          setSubmitting(false);
          return;
        }
        const { error: setErr } = await supabase.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
        if (setErr) {
          const msg = "Sign-in failed. Please try again.";
          setAuthMessage({ type: "error", text: msg });
          toast.error(msg);
          setSubmitting(false);
          return;
        }
        try {
          window.localStorage.removeItem("admin_unlocked");
          window.localStorage.removeItem("admin_password");
        } catch {}
        const msg = "Signed in. Checking admin access...";
        setAuthMessage({ type: "success", text: msg });
        toast.success(msg);
        navigate({ to: "/admin" });
      } catch {
        const msg = "Sign-in failed. Please try again.";
        setAuthMessage({ type: "error", text: msg });
        toast.error(msg);
        setSubmitting(false);
      }
      return;
    }
    try {
      const res = await verify({
        data: {
          password: pw,
          mode: "learner",
          captchaToken: codeCaptchaToken,
          email: emailValue,
        },
      });
      if (!res.ok) {
        let msg: string;
        if (res.reason === "locked") {
          msg = "Too many attempts. Try again in 15 minutes.";
        } else if (res.reason === "captcha_required") {
          setCodeCaptchaRequired(true);
          msg = "Please complete the verification below and try again.";
        } else if (res.reason === "captcha_failed") {
          setCodeCaptchaToken(null);
          msg = "Verification failed. Try the check again.";
        } else if (res.reason === "email_mismatch") {
          msg = "That PIN isn't linked to this email. Check both and try again.";
        } else {
          msg = "The PIN is incorrect. Please use the PIN George sent you.";
        }
        setAuthMessage({ type: "error", text: msg });
        toast.error(msg);
        if (res.captchaRequiredNext) setCodeCaptchaRequired(true);
        setCodeCaptchaToken(null);
        setSubmitting(false);
        return;
      }
      window.sessionStorage.setItem("portal_unlocked", "1");
      // Persist / clear the remembered learner credentials
      try {
        if (remember) {
          window.localStorage.setItem(
            "gsm_remember_learner",
            JSON.stringify({ email: emailValue, pin: pw }),
          );
        } else {
          window.localStorage.removeItem("gsm_remember_learner");
        }
      } catch {}
      // Subscription codes carry a student email — link the code login to
      // that Supabase account so progress persists across devices.
      let linked = false;
      if (res.session?.access_token && res.session?.refresh_token) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
        if (!setErr) linked = true;
      }
      const successMessage = linked && res.subscription?.email
          ? `Signed in as ${res.subscription.email}. Progress will save to your account.`
          : res.subscription?.expires_at
          ? `Access granted until ${new Date(res.subscription.expires_at).toLocaleDateString()}.`
          : "Access granted. Welcome to the learner portal.";
      setAuthMessage({ type: "success", text: successMessage });
      toast.success(successMessage);
      navigate({ to: "/dashboard" });
    } catch {
      const msg = "Could not verify code. Please try again.";
      setAuthMessage({ type: "error", text: msg });
      toast.error(msg);
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
            <Badge variant="secondary" className="mt-2">
              {isAdmin ? "Admin sign-in" : "Email + PIN login"}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Sign in with your admin email and password. Access to the admin area is granted to users with the admin role."
              : "Enter your email address and the PIN George sent you. Your progress saves automatically to your account."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Email address
              </label>
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" /> {isAdmin ? "Password" : "PIN"}
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                required
                inputMode={isAdmin ? "text" : "numeric"}
                autoComplete="off"
                placeholder={isAdmin ? "Your password" : "Enter your PIN"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "..." : isAdmin ? "Sign in" : "Enter"}
              </Button>
            </div>
            {codeCaptchaRequired && siteKey ? (
              <div className="pt-2">
                <p className="mb-1 text-xs text-muted-foreground">
                  Please confirm you're not a bot:
                </p>
                <TurnstileWidget siteKey={siteKey} onToken={setCodeCaptchaToken} />
              </div>
            ) : null}
            {authMessage ? (
              <p
                role={authMessage.type === "error" ? "alert" : "status"}
                className={
                  authMessage.type === "error"
                    ? "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    : "rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
                }
              >
                {authMessage.text}
              </p>
            ) : null}
            {!isAdmin && (
              <label className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  disabled={submitting}
                />
                <span>Remember my email and PIN on this device</span>
              </label>
            )}
          </form>
          {isAdmin ? (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-left space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-primary" /> Forgot or setting up your password?
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your admin email above, then click below to email yourself a
                password reset link. First-time admins use the same flow to set
                their initial password.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={async () => {
                  const emailValue = email.trim();
                  if (!emailValue) {
                    toast.error("Enter your admin email address above first.");
                    return;
                  }
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(emailValue, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) {
                      toast.error(error.message || "Could not send reset email.");
                      return;
                    }
                    toast.success("Reset email sent. Check your inbox.");
                  } catch {
                    toast.error("Could not send reset email. Try again.");
                  }
                }}
              >
                Email me a reset link
              </Button>
            </div>
          ) : (
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-left">
            <div className="flex items-center gap-2 font-medium">
              <Mail className="h-4 w-4 text-primary" /> Don't have a PIN yet?
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Email George at{" "}
              <a
                href="mailto:gsmdrivingschool@outlook.com?subject=Learner%20portal%20PIN%20request"
                className="font-medium text-primary underline"
              >
                gsmdrivingschool@outlook.com
              </a>{" "}
              to request a PIN for the learner portal.
            </p>
          </div>
          )}
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
