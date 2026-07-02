import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const WINDOW_MINUTES = 15;
const CAPTCHA_AFTER = 2; // require captcha after this many failures in window
const LOCK_AFTER = 8;    // hard-lock identifier after this many failures in window

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function reqMeta(): { ip: string | null; ua: string | null } {
  try {
    const req = getRequest();
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    const ua = req.headers.get("user-agent");
    return { ip, ua: ua ? ua.slice(0, 300) : null };
  } catch {
    return { ip: null, ua: null };
  }
}

export type CaptchaState = {
  siteKey: string | null;
  required: boolean;
  locked: boolean;
  retryAfterSeconds: number;
  failures: number;
};

/**
 * Count recent failures for a given identifier (email or "code:<hash>") AND
 * for the requester's IP, and decide whether captcha / lockout applies.
 * The returned state is what the client uses to render (or skip) the widget.
 */
export async function evaluateAttemptState(identifier: string): Promise<CaptchaState> {
  const supabase = await admin();
  const { ip } = reqMeta();
  const ipHash = await hashIp(ip);
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

  const [byId, byIp] = await Promise.all([
    supabase
      .from("auth_attempts")
      .select("id", { count: "exact", head: true })
      .eq("identifier", identifier)
      .eq("success", false)
      .gte("created_at", since),
    ipHash
      ? supabase
          .from("auth_attempts")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .eq("success", false)
          .gte("created_at", since)
      : Promise.resolve({ count: 0 } as { count: number }),
  ]);

  const failures = Math.max(byId.count ?? 0, (byIp as { count: number }).count ?? 0);
  const siteKey = process.env.TURNSTILE_SITE_KEY || null;
  return {
    siteKey,
    required: failures >= CAPTCHA_AFTER && !!siteKey,
    locked: failures >= LOCK_AFTER,
    retryAfterSeconds: WINDOW_MINUTES * 60,
    failures,
  };
}

async function recordAttempt(
  identifier: string,
  kind: "student_signin" | "access_code" | "admin_code",
  success: boolean,
  captchaVerified: boolean,
): Promise<void> {
  try {
    const supabase = await admin();
    const { ip, ua } = reqMeta();
    const ipHash = await hashIp(ip);
    await supabase.from("auth_attempts").insert({
      identifier,
      ip_hash: ipHash,
      kind,
      success,
      captcha_verified: captchaVerified,
      user_agent: ua,
    });
  } catch {
    // best-effort logging
  }
}

/**
 * Verify a Cloudflare Turnstile token server-side against Cloudflare's
 * siteverify endpoint. Returns true only on cryptographically valid tokens.
 */
export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  if (!token) return false;
  try {
    const { ip } = reqMeta();
    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);
    if (ip) body.append("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return !!json.success;
  } catch {
    return false;
  }
}

// -- Public server fns ------------------------------------------------------

/** Expose the Turnstile site key to the client (public value, safe). */
export const getCaptchaConfig = createServerFn({ method: "GET" }).handler(async () => {
  return { siteKey: process.env.TURNSTILE_SITE_KEY || null };
});

/** Peek at attempt state for a given identifier (email or "code"). */
export const getAttemptState = createServerFn({ method: "POST" })
  .inputValidator((d: { identifier: string }) => d)
  .handler(async ({ data }): Promise<CaptchaState> => {
    const id = (data.identifier || "").trim().toLowerCase();
    if (!id) {
      return {
        siteKey: process.env.TURNSTILE_SITE_KEY || null,
        required: false,
        locked: false,
        retryAfterSeconds: WINDOW_MINUTES * 60,
        failures: 0,
      };
    }
    return evaluateAttemptState(id);
  });

/**
 * Server-side wrapper around Supabase email/password sign-in that:
 *  - checks recent failed attempts and enforces captcha/lockout,
 *  - verifies the Turnstile token when required,
 *  - performs the sign-in via the publishable-key client,
 *  - records success/failure for future decisions.
 *
 * On success returns access/refresh tokens the browser hands to
 * `supabase.auth.setSession`.
 */
export const studentSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string; captchaToken?: string | null }) => d)
  .handler(async ({ data }): Promise<{
    ok: boolean;
    reason?: "invalid" | "locked" | "captcha_required" | "captcha_failed";
    retryAfterSeconds?: number;
    session?: { access_token: string; refresh_token: string };
  }> => {
    const email = (data.email || "").trim().toLowerCase();
    const password = data.password || "";
    if (!email || !password) return { ok: false, reason: "invalid" };

    const state = await evaluateAttemptState(email);
    if (state.locked) {
      return { ok: false, reason: "locked", retryAfterSeconds: state.retryAfterSeconds };
    }
    let captchaVerified = false;
    if (state.required) {
      captchaVerified = await verifyTurnstileToken(data.captchaToken);
      if (!captchaVerified) {
        await recordAttempt(email, "student_signin", false, false);
        return { ok: false, reason: data.captchaToken ? "captcha_failed" : "captcha_required" };
      }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY =
      process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return { ok: false, reason: "invalid" };
    }
    const { createClient } = await import("@supabase/supabase-js");
    const stateless = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    const { data: signed, error } = await stateless.auth.signInWithPassword({ email, password });
    if (error || !signed?.session) {
      await recordAttempt(email, "student_signin", false, captchaVerified);
      return { ok: false, reason: "invalid" };
    }
    await recordAttempt(email, "student_signin", true, captchaVerified);
    return {
      ok: true,
      session: {
        access_token: signed.session.access_token,
        refresh_token: signed.session.refresh_token,
      },
    };
  });

// Helpers re-used by portal-access.functions.ts
export async function guardCodeAttempt(
  passwordFingerprint: string,
  mode: "learner" | "admin",
  captchaToken: string | null | undefined,
): Promise<
  | { proceed: true; captchaVerified: boolean }
  | { proceed: false; reason: "locked" | "captcha_required" | "captcha_failed"; retryAfterSeconds: number }
> {
  const kind: "access_code" | "admin_code" = mode === "admin" ? "admin_code" : "access_code";
  const state = await evaluateAttemptState(passwordFingerprint);
  if (state.locked) {
    return { proceed: false, reason: "locked", retryAfterSeconds: state.retryAfterSeconds };
  }
  if (state.required) {
    const ok = await verifyTurnstileToken(captchaToken);
    if (!ok) {
      await recordAttempt(passwordFingerprint, kind, false, false);
      return {
        proceed: false,
        reason: captchaToken ? "captcha_failed" : "captcha_required",
        retryAfterSeconds: state.retryAfterSeconds,
      };
    }
    return { proceed: true, captchaVerified: true };
  }
  return { proceed: true, captchaVerified: false };
}

export async function logCodeAttempt(
  passwordFingerprint: string,
  mode: "learner" | "admin",
  success: boolean,
  captchaVerified: boolean,
): Promise<void> {
  await recordAttempt(
    passwordFingerprint,
    mode === "admin" ? "admin_code" : "access_code",
    success,
    captchaVerified,
  );
}

/** Stable fingerprint for a raw access code (never stored in plain text). */
export async function fingerprintCode(code: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  return "code:" + Array.from(new Uint8Array(buf))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}