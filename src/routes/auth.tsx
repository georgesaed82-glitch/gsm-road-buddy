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
import { recordAdminLogin } from "@/lib/rbac.functions";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { admin?: 1 } => {
    const isAdmin = search.admin === 1 || search.admin === "1";
    return isAdmin ? { admin: 1 } : {};
  },
  head: () => ({
    meta: [
      { title: "GSM Plus coming soon | GSM Driving School" },
      {
        name: "description",
        content:
          "GSM Plus, the premium learner platform from GSM Driving School, is coming soon. Manage lessons, payments, and progress online.",
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
  const [keyboardMode, setKeyboardMode] = useState<"numeric" | "text">(isAdmin ? "text" : "numeric");
  const [showPassword, setShowPassword] = useState(false);
  // Admins are always full-keyboard; only learners get the numeric PIN pad.
  const effectiveKeyboardMode: "numeric" | "text" = isAdmin ? "text" : keyboardMode;
  const [authMessage, setAuthMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const tracked = useRef(false);
  const verify = useServerFn(verifyPortalAccess);
  const runCaptchaConfig = useServerFn(getCaptchaConfig);
  const recordLogin = useServerFn(recordAdminLogin);

  // Captcha state
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [codeCaptchaRequired, setCodeCaptchaRequired] = useState(false);
  const [codeCaptchaToken, setCodeCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackContactClick("portal_view", "learner-portal");
    runCaptchaConfig()
      .then((c) => setSiteKey(c.siteKey))
      .catch(() => {});
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
      } catch {
        // Ignore corrupted saved credentials.
      }
    }
  }, [runCaptchaConfig, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setSubmitting(true);
    const adminPassword = password;
    const learnerPin = password.trim();
    const emailValue = email.trim();
    if (isAdmin) {
      if (!emailValue) {
        const msg = "Enter your administrator email address.";
        setAuthMessage({ type: "error", text: msg });
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      if (!adminPassword) {
        const msg = "Enter your password.";
        setAuthMessage({ type: "error", text: msg });
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      // Per-admin email + password sign-in only. Shared PINs are no longer
      // accepted — every administrator must have their own account.
      const { data: sess, error: signErr } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: adminPassword,
      });
      if (signErr || !sess?.session) {
        const msg = "Email or password is incorrect.";
        setAuthMessage({ type: "error", text: msg });
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      try {
        const r = await recordLogin({ data: {} as never });
        if (!r?.ok) {
          await supabase.auth.signOut();
          const msg = "This account is not an administrator.";
          setAuthMessage({ type: "error", text: msg });
          toast.error(msg);
          setSubmitting(false);
          return;
        }
      } catch (err) {
        await supabase.auth.signOut();
        const msg = err instanceof Error ? err.message : "Sign-in failed.";
        setAuthMessage({ type: "error", text: msg });
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      try {
        window.localStorage.removeItem("admin_unlocked");
        window.localStorage.removeItem("admin_password");
      } catch {
        // Best-effort cleanup of legacy keys.
      }
      const msg = "Signed in. Opening admin portal...";
      setAuthMessage({ type: "success", text: msg });
      toast.success(msg);
      navigate({ to: "/admin" });
      return;
    }
    if (!emailValue) {
      const msg = "Enter your email address.";
      setAuthMessage({ type: "error", text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }
    try {
      const res = await verify({
        data: {
          password: learnerPin,
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
            JSON.stringify({ email: emailValue, pin: learnerPin }),
          );
        } else {
          window.localStorage.removeItem("gsm_remember_learner");
        }
      } catch {
        // localStorage may be unavailable (private mode); ignore.
      }
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
      const successMessage =
        linked && res.subscription?.email
          ? `Signed in as ${res.subscription.email}. Progress will save to your account.`
          : res.subscription?.expires_at
            ? `Access granted until ${new Date(res.subscription.expires_at).toLocaleDateString()}.`
            : "Access granted. Welcome to GSM Plus.";
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
            {isAdmin ? (
              "Secure Administrator Login"
            ) : (
              <>
                <span className="font-bold">GSM</span>{" "}
                <span className="font-semibold text-accent">PLUS+</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-2">
              {isAdmin ? "Email + password login" : "Email + PIN login"}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Sign in using your registered administrator email address and password to access the GSM Driving School Administration Portal."
              : "Enter your email address and the PIN George sent you. Your progress saves automatically to your account."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            {!isAdmin && (
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
            )}
            {isAdmin && (
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
            )}
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" /> {isAdmin ? "Password" : "PIN"}
            </label>
            {!isAdmin && (
              <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span>Keyboard:</span>
                <div className="inline-flex overflow-hidden rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => setKeyboardMode("numeric")}
                    className={
                      "px-3 py-1 text-[11px] font-medium transition " +
                      (keyboardMode === "numeric"
                        ? "bg-accent text-accent-foreground"
                        : "bg-transparent text-muted-foreground hover:text-primary")
                    }
                    aria-pressed={keyboardMode === "numeric"}
                  >
                    123 Numbers
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyboardMode("text")}
                    className={
                      "px-3 py-1 text-[11px] font-medium transition " +
                      (keyboardMode === "text"
                        ? "bg-accent text-accent-foreground"
                        : "bg-transparent text-muted-foreground hover:text-primary")
                    }
                    aria-pressed={keyboardMode === "text"}
                  >
                    ABC Full
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type={showPassword ? "text" : "password"}
                required
                inputMode={effectiveKeyboardMode}
                pattern={effectiveKeyboardMode === "numeric" ? "[0-9]*" : undefined}
                autoComplete="off"
                placeholder={isAdmin ? "Enter your password" : "Enter your PIN"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide" : "Show"}
                className="px-2"
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
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
          {!isAdmin ? (
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
                to request a PIN for GSM Plus.
              </p>
            </div>
          ) : null}
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
