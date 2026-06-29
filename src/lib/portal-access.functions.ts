import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const BOOTSTRAP_CODE = "7777";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Returns true if `password` is a valid active admin code (or bootstrap if no admin row set). */
export async function verifyAdminPasswordServer(password: string): Promise<boolean> {
  if (!password) return false;
  const supabase = await admin();
  const { data } = await supabase
    .from("portal_access_codes")
    .select("id")
    .eq("kind", "admin")
    .eq("code", password)
    .eq("revoked", false)
    .maybeSingle();
  if (data) return true;
  const { count } = await supabase
    .from("portal_access_codes")
    .select("id", { count: "exact", head: true })
    .eq("kind", "admin")
    .eq("revoked", false);
  if ((count ?? 0) === 0 && password === (process.env.ADMIN_PASSWORD || BOOTSTRAP_CODE)) return true;
  return false;
}

async function requireAdmin(password: string) {
  if (!(await verifyAdminPasswordServer(password))) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return admin();
}

export const verifyPortalAccess = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; mode: "learner" | "admin" }) => d)
  .handler(async ({ data }): Promise<{ ok: boolean; subscription?: { email: string | null; expires_at: string | null } | null }> => {
    const password = (data.password || "").trim();
    if (!password) return { ok: false };
    let req: Request | undefined;
    try {
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
      }
      return { ok };
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
      if (row.expires_at && row.expires_at <= nowIso) return { ok: false };
      await logUsage(row.id, "learner");
      return {
        ok: true,
        subscription: row.kind === "subscription" ? { email: row.email, expires_at: row.expires_at } : null,
      };
    }
    const { count } = await supabase
      .from("portal_access_codes")
      .select("id", { count: "exact", head: true })
      .eq("kind", "learner")
      .eq("revoked", false);
    if ((count ?? 0) === 0 && password === BOOTSTRAP_CODE) return { ok: true };
    return { ok: false };
  });

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
    if (error) throw new Response(error.message, { status: 500 });
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
    if (error) throw new Response(error.message, { status: 500 });
    return (rows ?? []) as AccessUse[];
  });

function validateCode(code: string) {
  const trimmed = (code || "").trim();
  if (trimmed.length < 4 || trimmed.length > 64) {
    throw new Response("Code must be 4-64 characters", { status: 400 });
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
      throw new Response("That code is already in use. Choose another.", { status: 400 });
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
    if (error) throw new Response(error.message, { status: 500 });
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
      throw new Response("Invalid email", { status: 400 });
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
    if (error) throw new Response(error.message, { status: 400 });
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
    if (error) throw new Response(error.message, { status: 500 });
    return { ok: true };
  });

export const deleteAccessCode = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await requireAdmin(data.password);
    const { error } = await supabase.from("portal_access_codes").delete().eq("id", data.id);
    if (error) throw new Response(error.message, { status: 500 });
    return { ok: true };
  });