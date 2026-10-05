import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Languages,
  Lock,
  Mail,
  MessageSquareText,
  MonitorPlay,
  PlaySquare,
  Scroll,
  ShieldCheck,
  Signpost,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
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
import { GsmPlus } from "@/components/GsmPlus";
import { ComingSoonNotice } from "@/components/ComingSoonNotice";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { admin?: 1; next?: string } => {
    const isAdmin = search.admin === 1 || search.admin === "1";
    // Only accept a same-origin relative path; discard anything else.
    const rawNext = typeof search.next === "string" ? search.next : "";
    const safeNext = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
    const out: { admin?: 1; next?: string } = {};
    if (isAdmin) out.admin = 1;
    if (safeNext) out.next = safeNext;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Sign in | GSM Driving School" },
      { name: "description", content: "Staff sign in for GSM Driving School." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

const portalFeatures = [
  {
    icon: BarChart3,
    title: "Lesson progress",
    body: "View completed lessons, overall progress and what is still developing.",
  },
  {
    icon: Scroll,
    title: "Covered topics",
    body: "See every driving topic you have covered and what needs improvement.",
  },
  {
    icon: PlaySquare,
    title: "GSM media library",
    body: "Access original GSM training videos, animations and diagrams.",
  },
  {
    icon: GraduationCap,
    title: "GSM teaching system",
    body: "Learn reference points, clear routines and common mistakes in plain language.",
  },
  {
    icon: Signpost,
    title: "Theory support",
    body: "Practise theory questions, road signs, road markings and Highway Code topics.",
  },
  {
    icon: Trophy,
    title: "Mock tests",
    body: "Complete mock theory tests and review incorrect answers properly.",
  },
  {
    icon: Eye,
    title: "Hazard perception",
    body: "Practise developing-hazard training between practical lessons.",
  },
  {
    icon: MessageSquareText,
    title: "Instructor feedback",
    body: "View feedback and preparation advice for your future lessons.",
  },
  {
    icon: MonitorPlay,
    title: "Any device",
    body: "Open the portal on a mobile phone, tablet or computer.",
  },
  {
    icon: Languages,
    title: "Language options",
    body: "Change the portal language where available for easier learning.",
  },
];

const freeAccess = ["Basic information", "Selected learning materials", "Starter theory support"];
const premiumAccess = [
  "Full driving topics",
  "Training videos and animations",
  "Progress tracking",
  "Theory practice and mock tests",
  "Hazard perception",
  "Personalised learning support",
];

function AuthPage() {
  const navigate = useNavigate();
  const { admin, next } = Route.useSearch();
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
      window.location.assign(next && next.startsWith("/") ? next : "/admin/");
      return;
    }
    if (!emailValue) {
      const msg = "Enter your email address or student ID.";
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
      if (next && next.startsWith("/")) {
        window.location.assign(next);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch {
      const msg = "Could not verify code. Please try again.";
      setAuthMessage({ type: "error", text: msg });
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const loginForm = (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4 text-accent" /> {isAdmin ? "Email address" : "Email address or student ID"}
        </label>
        <Input
          type={isAdmin ? "email" : "text"}
          required
          autoComplete={isAdmin ? "email" : "username"}
          placeholder={isAdmin ? "you@example.com" : "Email address or student ID"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className="h-12 rounded-xl bg-background text-base"
        />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Lock className="h-4 w-4 text-accent" /> {isAdmin ? "Password" : "Password or PIN"}
        </label>
        {!isAdmin && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>Keyboard:</span>
            <div className="inline-flex overflow-hidden rounded-full border border-border bg-background">
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
            pattern={!isAdmin && effectiveKeyboardMode === "numeric" ? "[0-9]*" : undefined}
            autoComplete={isAdmin ? "current-password" : "off"}
            placeholder={isAdmin ? "Enter your password" : "Enter your password or PIN"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            className="h-12 rounded-xl bg-background text-base"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password or PIN" : "Show password or PIN"}
            className="h-12 shrink-0 rounded-xl px-4"
          >
            {showPassword ? "Hide" : "Show"}
          </Button>
        </div>
      </div>

      {codeCaptchaRequired && siteKey ? (
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs text-muted-foreground">Please confirm you're not a bot:</p>
          <TurnstileWidget siteKey={siteKey} onToken={setCodeCaptchaToken} />
        </div>
      ) : null}

      {authMessage ? (
        <p
          role={authMessage.type === "error" ? "alert" : "status"}
          className={
            authMessage.type === "error"
              ? "rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
          }
        >
          {authMessage.text}
        </p>
      ) : null}

      {!isAdmin ? (
        <div className="flex flex-col gap-3 pt-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
              disabled={submitting}
            />
            <span>Remember me</span>
          </label>
          <a
            href="mailto:gsmdrivingschool@outlook.com?subject=Forgot%20GSM%20Plus%20password%20or%20PIN"
            className="font-semibold text-primary underline underline-offset-4"
          >
            Forgot password or PIN?
          </a>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        {submitting ? "Checking…" : isAdmin ? "Sign in" : "Log In to GSM Plus"}
      </Button>
    </form>
  );

  if (isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md rounded-2xl border-2 border-primary bg-card text-center shadow-[0_6px_0_0_var(--primary),0_18px_30px_-12px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Secure Administrator Login</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mt-2">
                Email + password login
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in using your registered administrator email address and password to access the
              GSM Driving School Administration Portal.
            </p>
            {loginForm}
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

  return (
    <main className="bg-background">
      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
          Practical driving lessons &amp; free driving videos
        </h1>
        <p className="mt-4 text-muted-foreground">
          Book patient one-to-one lessons with GSM Driving School, and watch our free driving tips on
          YouTube in the meantime.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/youtube">Driving videos</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          <Link to="/auth" search={{ admin: 1 }} className="underline underline-offset-4 hover:text-primary">
            Staff sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
