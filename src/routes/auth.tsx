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
      { title: "GSM Plus — Coming Soon" },
      {
        name: "description",
        content:
          "GSM Plus is the new premium learner portal from GSM Driving School. Discover what is coming and sign up for updates.",
      },
      { property: "og:title", content: "GSM Plus — Coming Soon" },
      {
        property: "og:description",
        content:
          "GSM Plus will support GSM learners with progress tracking, videos, diagrams, theory practice, mock tests, hazard perception and personalised feedback.",
      },
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
        <Card className="w-full max-w-md border-border bg-card text-center">
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
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-background via-secondary/20 to-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              <Sparkles className="h-4 w-4" /> GSM Learning Platform
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-bold leading-[1.04] text-foreground sm:text-5xl lg:text-6xl">
                GSM Plus
              </h1>
              <Badge
                variant="secondary"
                className="rounded-full border border-accent/50 bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-sm"
              >
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Coming Soon
              </Badge>
            </div>
            <p className="mt-2 font-display text-xl font-semibold text-accent sm:text-2xl">
              Your Complete Driving Learning Portal
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              GSM Plus is an online learning and progress platform designed to support learners
              alongside their practical driving lessons. It will give students access to lesson
              progress, driving topics, training videos, diagrams, theory support, mock tests and
              personalised feedback in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                Contact support
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#coming-soon"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent/50 bg-card px-6 py-4 font-bold text-primary shadow-sm hover:border-accent"
              >
                Learn more
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-border/60 bg-card p-4 shadow-[0_30px_80px_-40px_rgba(29,42,34,0.45)] sm:p-6">
              <div className="rounded-[1.5rem] bg-primary p-5 text-primary-foreground sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <GsmPlus variant="pill" gsmClassName="text-primary-foreground" />
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                    In development
                  </span>
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Lessons", "—", "planned"],
                    ["Topics", "—", "planned"],
                    ["Mocks", "—", "planned"],
                  ].map(([label, value, caption]) => (
                    <div key={label} className="rounded-2xl bg-primary-foreground/10 p-4">
                      <div className="text-xs uppercase tracking-widest text-primary-foreground/65">
                        {label}
                      </div>
                      <div className="mt-2 font-display text-3xl font-bold text-accent">{value}</div>
                      <div className="text-xs text-primary-foreground/70">{caption}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    ["Reference points", "—"],
                    ["Meeting traffic", "—"],
                    ["Hazard perception", "—"],
                  ].map(([topic, pct]) => (
                    <div key={topic}>
                      <div className="flex justify-between text-sm">
                        <span>{topic}</span>
                        <span className="font-semibold text-accent">{pct}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-primary-foreground/15">
                        <div className="h-full rounded-full bg-accent" style={{ width: "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background p-4">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <div className="mt-2 font-semibold text-foreground">Lesson progress</div>
                  <p className="mt-1 text-sm text-muted-foreground">Track every topic as you develop.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background p-4">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <div className="mt-2 font-semibold text-foreground">Test readiness</div>
                  <p className="mt-1 text-sm text-muted-foreground">Clear targets before your test day.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for + Why different */}
      <section className="border-b border-border/60 bg-background px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-[0_18px_45px_-32px_rgba(29,42,34,0.35)] sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              <User className="h-3.5 w-3.5" /> Who it's for
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Made for GSM learners — from first lesson to test day.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {[
                "Absolute beginners starting their very first lesson.",
                "Learners who want to revise between practical sessions.",
                "Students preparing for the theory or practical test.",
                "Parents supervising private practice at home.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-accent/40 bg-primary p-7 text-primary-foreground shadow-[0_25px_60px_-30px_rgba(35,75,54,0.55)] sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Why it's different
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
              Built by real GSM instructors — not a generic app.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
              {[
                "Every topic is taught the GSM way — MSPSL, POM, reference points and plain-English \"why\" explanations.",
                "Hazard clips are filmed on the roads you actually drive around West London — not stock footage.",
                "Your instructor sees the same progress view, so lessons pick up exactly where you left off.",
                "One place for progress, videos, animations, theory and mock tests — no other app to juggle.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* All included modules */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
              All included learning modules
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Everything included in GSM Plus.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              A complete learning system — every tool you need from day one right through to your practical test.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {portalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border/60 bg-card p-5 shadow-[0_12px_30px_-24px_rgba(29,42,34,0.35)]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/12 text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </div>
              );
            })}
          </div>

          {/* Highlight strip — headline modules the user asked to see called out */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: PlaySquare, label: "AI Video Library" },
              { icon: BarChart3, label: "Student Progress System" },
              { icon: Eye, label: "Hazard Perception" },
              { icon: Trophy, label: "Theory Tests" },
              { icon: BookOpen, label: "Highway Code" },
              { icon: Signpost, label: "Road Signs" },
              { icon: MonitorPlay, label: "Driving Animations" },
              { icon: MessageSquareText, label: "Premium Support" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/35 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/80">
              Planned access levels
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Free access vs GSM Plus premium access
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-[0_18px_45px_-32px_rgba(29,42,34,0.35)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-sm font-bold text-success">
                <CheckCircle2 className="h-4 w-4" /> Free access
              </div>
              <p className="mt-4 text-muted-foreground">
                Basic information and selected learning materials to help visitors and new learners
                understand the GSM approach.
              </p>
              <ul className="mt-6 space-y-3">
                {freeAccess.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-accent/60 bg-primary p-7 text-primary-foreground shadow-[0_25px_60px_-30px_rgba(35,75,54,0.65)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
                <Sparkles className="h-4 w-4" /> GSM Plus premium access
              </div>
              <p className="mt-4 text-primary-foreground/82">
                Full training topics, videos, animations, progress tracking, theory practice, mock
                tests, hazard perception and personalised learning support.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {premiumAccess.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="coming-soon" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ComingSoonNotice />
          <div className="mt-8 rounded-2xl border border-border/60 bg-card p-5 text-center">
            <div className="flex items-center justify-center gap-2 font-semibold text-foreground">
              <Mail className="h-5 w-5 text-accent" /> Want to know when it launches?
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Contact GSM support and we will let you know as soon as GSM Plus+ is ready.
            </p>
            <a
              href="mailto:gsmdrivingschool@outlook.com?subject=GSM%20Plus%20launch%20notification"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent/50 bg-background px-4 py-2 text-sm font-bold text-primary hover:border-accent"
            >
              Contact support
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
