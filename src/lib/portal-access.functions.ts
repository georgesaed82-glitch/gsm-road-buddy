import { createServerFn } from "@tanstack/react-start";
import { evaluateAttemptState, fingerprintCode, guardCodeAttempt, logCodeAttempt } from "./auth-guard.functions";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Server-side admin auth. Reads the Supabase bearer token from the current
 * request (attached by `attachSupabaseAuth` client middleware) and confirms
 * the caller has the `admin` role in `public.user_roles`.
 *
 * The `password` argument is IGNORED — retained only so existing server-fn
 * signatures (which still declare a `password` field for backwards compat)
 * continue to compile. Do not use the argument for any auth decision.
 */
export async function verifyAdminPasswordServer(_password?: string): Promise<boolean> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const header = req?.headers.get("authorization") || req?.headers.get("Authorization");
    if (!header) return false;
    const token = header.replace(/^Bearer\s+/i, "").trim();
    if (!token) return false;
    const supabase = await admin();
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id;
    if (userErr || !uid) return false;
    const { data: role, error: roleErr } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) return false;
    return !!role;
  } catch {
    return false;
  }
}

async function requireAdmin(password: string) {
  if (!(await verifyAdminPasswordServer(password))) {
    throw new Error("Unauthorized");
  }
  return admin();
}

export const verifyPortalAccess = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; mode: "learner" | "admin"; captchaToken?: string | null; email?: string | null }) => d)
  .handler(async ({ data }): Promise<{
    ok: boolean;
    reason?: "invalid" | "locked" | "captcha_required" | "captcha_failed" | "email_mismatch";
    retryAfterSeconds?: number;
    captchaRequiredNext?: boolean;
    subscription?: { email: string | null; expires_at: string | null } | null;
    session?: { access_token: string; refresh_token: string } | null;
  }> => {
    const password = (data.password || "").trim();
    if (!password) return { ok: false };
    const submittedEmail = (data.email || "").trim().toLowerCase();
    const fingerprint = await fingerprintCode(password);
    const guard = await guardCodeAttempt(fingerprint, data.mode, data.captchaToken);
    if (!guard.proceed) {
      return { ok: false, reason: guard.reason, retryAfterSeconds: guard.retryAfterSeconds };
    }
    const captchaVerified = guard.captchaVerified;
    let req: Request | undefined;
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      req = getRequest();
    } catch {
      req = undefined;
    }
    const logUsage = async (codeId: string, mode: "learner" | "admin") => {
      try {
        const supabase = await admin();
        const ua = req?.headers.get("user-agent") ?? null;
        const ipRaw =
          req?.headers.get("cf-connecting-ip") ||
          req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          null;
        let ip_hash: string | null = null;
        if (ipRaw) {
          const buf = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(ipRaw),
          );
          ip_hash = Array.from(new Uint8Array(buf))
            .slice(0, 8)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }
        await supabase.from("portal_access_uses").insert({
          code_id: codeId,
          mode,
          user_agent: ua?.slice(0, 300) ?? null,
          ip_hash,
        });
        const { data: row } = await supabase
          .from("portal_access_codes")
          .select("use_count")
          .eq("id", codeId)
          .maybeSingle();
        await supabase
          .from("portal_access_codes")
          .update({
            use_count: (row?.use_count ?? 0) + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", codeId);
      } catch {
        /* best-effort logging */
      }
    };

    if (data.mode === "admin") {
      const ok = await verifyAdminPasswordServer(password);
      await logCodeAttempt(fingerprint, "admin", ok, captchaVerified);
      if (ok) {
        const supabase = await admin();
        const { data: row } = await supabase
          .from("portal_access_codes")
          .select("id")
          .eq("kind", "admin")
          .eq("code", password)
          .eq("revoked", false)
          .maybeSingle();
        if (row?.id) await logUsage(row.id, "admin");
        return { ok: true };
      }
      const after = await evaluateAttemptState(fingerprint);
      return { ok: false, reason: "invalid", captchaRequiredNext: after.required };
    }
    const supabase = await admin();
    const nowIso = new Date().toISOString();
    // Learner master code
    const { data: row } = await supabase
      .from("portal_access_codes")
      .select("id,kind,email,expires_at")
      .eq("code", password)
      .eq("revoked", false)
      .in("kind", ["learner", "subscription"])
      .maybeSingle();
    if (row) {
      if (row.expires_at && row.expires_at <= nowIso) {
        await logCodeAttempt(fingerprint, "learner", false, captchaVerified);
        const after = await evaluateAttemptState(fingerprint);
        return { ok: false, reason: "invalid", captchaRequiredNext: after.required };
      }
      // For subscription codes tied to an email, enforce that the learner
      // enters the matching email address alongside the PIN.
      if (row.kind === "subscription" && row.email) {
        if (!submittedEmail || submittedEmail !== row.email.trim().toLowerCase()) {
          await logCodeAttempt(fingerprint, "learner", false, captchaVerified);
          const after = await evaluateAttemptState(fingerprint);
          return { ok: false, reason: "email_mismatch", captchaRequiredNext: after.required };
        }
      }
      await logUsage(row.id, "learner");
      await logCodeAttempt(fingerprint, "learner", true, captchaVerified);
      let session: { access_token: string; refresh_token: string } | null = null;
      if (row.kind === "subscription" && row.email) {
        try {
          session = await mintSessionForEmail(row.email);
        } catch (e) {
          console.error("[portal-access] mintSessionForEmail failed", e);
        }
      }
      return {
        ok: true,
        subscription: row.kind === "subscription" ? { email: row.email, expires_at: row.expires_at } : null,
        session,
      };
    }
    await logCodeAttempt(fingerprint, "learner", false, captchaVerified);
    const after = await evaluateAttemptState(fingerprint);
    return { ok: false, reason: "invalid", captchaRequiredNext: after.required };
  });

/**
 * Ensures a Supabase auth user exists for `email` and returns a fresh
 * access/refresh token pair the client can hand to `supabase.auth.setSession`.
 * This is what links an access-code login to the student's account so their
 * progress (skill_ratings, user_mistakes, theory_progress) persists across devices.
 */
async function mintSessionForEmail(
  email: string,
): Promise<{ access_token: string; refresh_token: string } | null> {
  const supabase = await admin();
  const normalized = email.trim().toLowerCase();

  // Try to mint a magiclink directly (O(1) lookup — no user pagination).
  // If the user doesn't exist yet, create it and retry.
  let link = await supabase.auth.admin.generateLink({ type: "magiclink", email: normalized });
  if (link.error || !link.data?.properties?.hashed_token) {
    const { error: createErr } = await supabase.auth.admin.createUser({
      email: normalized,
      email_confirm: true,
    });
    if (createErr && !/registered|exists/i.test(createErr.message)) {
      console.error("[portal-access] createUser failed", createErr);
      return null;
    }
    link = await supabase.auth.admin.generateLink({ type: "magiclink", email: normalized });
  }
  if (link.error || !link.data?.properties?.hashed_token) {
    console.error("[portal-access] generateLink failed", link.error);
    return null;
  }

  // Use a throwaway client (no persisted session on the server) to verify the
  // token and receive access/refresh tokens we can ship to the browser.
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_PUBLISHABLE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  const { createClient } = await import("@supabase/supabase-js");
  const stateless = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data: verified, error: verifyErr } = await stateless.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.data.properties.hashed_token,
  });
  if (verifyErr || !verified?.session) {
    console.error("[portal-access] verifyOtp failed", verifyErr);
    return null;
  }
  return {
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
  };
}

export type AccessCodeRow = {
  id: string;
  code: string;
  kind: "admin" | "learner" | "subscription";
  email: string | null;
  label: string | null;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
  use_count: number;
  last_used_at: string | null;
  status: "active" | "expired" | "revoked";
};

export const listAccessCodes = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }): Promise<AccessCodeRow[]> => {
    const supabase = await requireAdmin(data.password);
    const { data: rows, error } = await supabase
      .from("portal_access_codes")
      .select("id,code,kind,email,label,expires_at,revoked,created_at,use_count,last_used_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const now = Date.now();
    return (rows ?? []).map((r: any) => ({
      ...r,
      status: r.revoked
        ? "revoked"
        : r.expires_at && new Date(r.expires_at).getTime() <= now
        ? "expired"
        : "active",
    })) as AccessCodeRow[];
  });

export type AccessUse = {
  id: string;
  used_at: string;
  mode: "learner" | "admin";
  user_agent: string | null;
};

export const listAccessUses = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; codeId: string; limit?: number }) => d)
  .handler(async ({ data }): Promise<AccessUse[]> => {
    const supabase = await requireAdmin(data.password);
    const limit = Math.min(500, Math.max(1, data.limit ?? 100));
    const { data: rows, error } = await supabase
      .from("portal_access_uses")
      .select("id,used_at,mode,user_agent")
      .eq("code_id", data.codeId)
      .order("used_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (rows ?? []) as AccessUse[];
  });

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const exportAccessUsesCsv = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; codeId: string }) => d)
  .handler(async ({ data }): Promise<{ filename: string; csv: string }> => {
    const supabase = await requireAdmin(data.password);
    const { data: codeRow, error: codeErr } = await supabase
      .from("portal_access_codes")
      .select("id,code,kind,email,label,expires_at,revoked,created_at,use_count,last_used_at")
      .eq("id", data.codeId)
      .maybeSingle();
    if (codeErr) throw new Error(codeErr.message);
    if (!codeRow) throw new Error("Code not found");

    const { data: rows, error } = await supabase
      .from("portal_access_uses")
      .select("id,used_at,mode,user_agent,ip_hash")
      .eq("code_id", data.codeId)
      .order("used_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);

    const generatedAt = new Date().toISOString();
    const meta = [
      ["# Portal access login history"],
      ["# Code", codeRow.code],
      ["# Kind", codeRow.kind],
      ["# Email", codeRow.email ?? ""],
      ["# Label", codeRow.label ?? ""],
      ["# Created", codeRow.created_at ?? ""],
      ["# Expires", codeRow.expires_at ?? ""],
      ["# Revoked", String(codeRow.revoked)],
      ["# Total logins", String(codeRow.use_count ?? 0)],
      ["# Last used", codeRow.last_used_at ?? ""],
      ["# Exported at", generatedAt],
      ["# Rows", String(rows?.length ?? 0)],
    ];
    const header = ["used_at_iso", "used_at_local", "mode", "user_agent", "ip_hash"];
    const body = (rows ?? []).map((r: any) => [
      r.used_at,
      new Date(r.used_at).toLocaleString("en-GB", { timeZone: "Europe/London" }),
      r.mode,
      r.user_agent ?? "",
      r.ip_hash ?? "",
    ]);

    const lines = [
      ...meta.map((row) => row.map(csvEscape).join(",")),
      "",
      header.join(","),
      ...body.map((row) => row.map(csvEscape).join(",")),
    ];
    const csv = lines.join("\n");

    const safeCode = (codeRow.code || "code").replace(/[^a-zA-Z0-9_-]+/g, "_");
    const datePart = generatedAt.slice(0, 10);
    const filename = `access-logins_${safeCode}_${datePart}.csv`;
    return { filename, csv };
  });

function validateCode(code: string) {
  const trimmed = (code || "").trim();
  if (trimmed.length < 4 || trimmed.length > 64) {
    throw new Error("Code must be 4-64 characters");
  }
  return trimmed;
}

/** Replace (or create) the active code for kind = admin | learner. Old codes of that kind are revoked. */
export const setMasterPassword = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; kind: "admin" | "learner"; newCode: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await requireAdmin(data.password);
    const newCode = validateCode(data.newCode);

    const { data: dup } = await supabase
      .from("portal_access_codes")
      .select("id,kind,revoked")
      .eq("code", newCode)
      .maybeSingle();
    if (dup && !(dup.kind === data.kind && dup.revoked)) {
      throw new Error("That code is already in use. Choose another.");
    }

    // Revoke any existing active master code of this kind
    await supabase
      .from("portal_access_codes")
      .update({ revoked: true })
      .eq("kind", data.kind)
      .eq("revoked", false);

    const { error } = await supabase.from("portal_access_codes").insert({
      code: newCode,
      kind: data.kind,
      label: data.kind === "admin" ? "Admin master password" : "Learner master password",
    });
    if (error) throw new Error(error.message);
    return { ok: true, newCode };
  });

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/** Issue a time-limited subscription code for a learner email. */
export const createSubscriptionCode = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; email: string; days: number; label?: string; code?: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await requireAdmin(data.password);
    const email = (data.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error("Invalid email");
    }
    const days = Math.min(365, Math.max(1, Math.floor(data.days || 30)));
    const expires_at = new Date(Date.now() + days * 86400_000).toISOString();

    let code = data.code ? validateCode(data.code) : generateCode();
    // Avoid collisions when auto-generated
    if (!data.code) {
      for (let i = 0; i < 5; i++) {
        const { data: exists } = await supabase
          .from("portal_access_codes")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (!exists) break;
        code = generateCode();
      }
    }

    const { error, data: inserted } = await supabase
      .from("portal_access_codes")
      .insert({
        code,
        kind: "subscription",
        email,
        label: data.label?.trim() || `${days}-day access`,
        expires_at,
      })
      .select("id,code,email,expires_at")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

export const revokeAccessCode = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await requireAdmin(data.password);
    const { error } = await supabase
      .from("portal_access_codes")
      .update({ revoked: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAccessCode = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await requireAdmin(data.password);
    const { error } = await supabase.from("portal_access_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });