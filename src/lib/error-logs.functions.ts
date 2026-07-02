import { createServerFn } from "@tanstack/react-start";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type ErrorLogRow = {
  id: string;
  created_at: string;
  level: string;
  source: string;
  message: string;
  stack: string | null;
  route: string | null;
  url: string | null;
  user_id: string | null;
  user_email: string | null;
  user_agent: string | null;
  mechanism: string | null;
  fingerprint: string | null;
  extra: unknown;
  alert_sent: boolean;
};

function fingerprintOf(message: string, stack: string | null | undefined) {
  const base = `${message}\n${(stack ?? "").split("\n").slice(0, 3).join("\n")}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) {
    h = (h * 31 + base.charCodeAt(i)) | 0;
  }
  return `fp_${(h >>> 0).toString(36)}`;
}

/** Public endpoint: any visitor can report an error. */
export const logClientError = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      message: string;
      stack?: string | null;
      route?: string | null;
      url?: string | null;
      userAgent?: string | null;
      mechanism?: string | null;
      level?: "error" | "warning" | "info";
      source?: string;
      userId?: string | null;
      userEmail?: string | null;
      extra?: Record<string, string | number | boolean | null>;
    }) => d,
  )
  .handler(async ({ data }) => {
    const message = String(data.message ?? "").slice(0, 4000);
    if (!message) return { ok: false as const };
    const stack = data.stack ? String(data.stack).slice(0, 20000) : null;
    const fp = fingerprintOf(message, stack);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("error_logs")
      .insert({
        level: data.level ?? "error",
        source: data.source ?? "client",
        message,
        stack,
        route: data.route ? String(data.route).slice(0, 500) : null,
        url: data.url ? String(data.url).slice(0, 1000) : null,
        user_id: data.userId ?? null,
        user_email: data.userEmail ? String(data.userEmail).slice(0, 320) : null,
        user_agent: data.userAgent ? String(data.userAgent).slice(0, 1000) : null,
        mechanism: data.mechanism ? String(data.mechanism).slice(0, 100) : null,
        fingerprint: fp,
        extra: (data.extra ?? {}) as never,
      })
      .select("id")
      .single();
    if (error) return { ok: false as const };

    // Fire-and-forget email alert (throttled) — never block the insert.
    void maybeSendAlert(fp, message, {
      stack,
      route: data.route ?? null,
      url: data.url ?? null,
      mechanism: data.mechanism ?? null,
      userEmail: data.userEmail ?? null,
    }).catch(() => {});

    return { ok: true as const, id: inserted?.id ?? null };
  });

const ALERT_THROTTLE_MINUTES = 30;
const ALERT_RECIPIENT = "gsmdrivingschool@outlook.com";

async function maybeSendAlert(
  fingerprint: string,
  message: string,
  ctx: {
    stack: string | null;
    route: string | null;
    url: string | null;
    mechanism: string | null;
    userEmail: string | null;
  },
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const cutoffIso = new Date(Date.now() - ALERT_THROTTLE_MINUTES * 60_000).toISOString();

  const { data: state } = await supabaseAdmin
    .from("error_alert_state")
    .select("fingerprint,last_alert_at,count")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (state && state.last_alert_at > cutoffIso) {
    // Within throttle window — bump count silently.
    await supabaseAdmin
      .from("error_alert_state")
      .update({ count: (state.count ?? 1) + 1 })
      .eq("fingerprint", fingerprint);
    return;
  }

  const lovableKey = process.env.LOVABLE_API_KEY;
  const outlookKey = process.env.MICROSOFT_OUTLOOK_API_KEY;
  if (!lovableKey || !outlookKey) return;

  const subject = `[GSM alert] ${message.slice(0, 120)}`;
  const rows = [
    ["Route", ctx.route],
    ["URL", ctx.url],
    ["User", ctx.userEmail],
    ["Mechanism", ctx.mechanism],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555;">${k}</td><td>${escapeHtml(String(v))}</td></tr>`) 
    .join("");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;">
      <h2 style="margin:0 0 8px 0;color:#b91c1c;">Production error captured</h2>
      <p style="margin:0 0 16px 0;color:#333;"><strong>${escapeHtml(message)}</strong></p>
      <table style="border-collapse:collapse;margin-bottom:16px;">${rows}</table>
      ${ctx.stack ? `<pre style="background:#f4f4f4;padding:12px;overflow:auto;font-size:12px;">${escapeHtml(ctx.stack.slice(0, 4000))}</pre>` : ""}
      <p style="margin-top:24px;font-size:12px;color:#777;">
        Further occurrences of this exact error will be suppressed for ${ALERT_THROTTLE_MINUTES} minutes to avoid inbox floods.
        View all errors in your admin dashboard: Admin → Errors.
      </p>
    </div>`;

  try {
    await fetch("https://connector-gateway.lovable.dev/microsoft_outlook/me/sendMail", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": outlookKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: ALERT_RECIPIENT } }],
        },
        saveToSentItems: false,
      }),
    });
  } catch {
    /* swallow — alert delivery is best effort */
  }

  await supabaseAdmin
    .from("error_alert_state")
    .upsert({ fingerprint, last_alert_at: nowIso, count: (state?.count ?? 0) + 1 });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// -------- Admin views --------

export const listErrorLogs = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; days?: number; limit?: number }) => d)
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) {
      throw new Response("Unauthorized", { status: 401 });
    }
    const days = Math.min(90, Math.max(1, data.days ?? 7));
    const limit = Math.min(500, Math.max(10, data.limit ?? 200));
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("error_logs")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as ErrorLogRow[] };
  });

export const getErrorStats = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; days?: number }) => d)
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) {
      throw new Response("Unauthorized", { status: 401 });
    }
    const days = Math.min(90, Math.max(1, data.days ?? 7));
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("error_logs")
      .select("fingerprint,message,route,created_at,level")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    const list = rows ?? [];
    const byFp = new Map<string, { fingerprint: string; message: string; route: string | null; count: number; last: string }>();
    for (const r of list) {
      const fp = r.fingerprint ?? r.message;
      const cur = byFp.get(fp);
      if (cur) {
        cur.count += 1;
        if (r.created_at > cur.last) cur.last = r.created_at;
      } else {
        byFp.set(fp, { fingerprint: fp, message: r.message, route: r.route, count: 1, last: r.created_at });
      }
    }
    const grouped = [...byFp.values()].sort((a, b) => b.count - a.count).slice(0, 25);
    return { total: list.length, unique: byFp.size, grouped };
  });

export const clearResolvedErrors = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; olderThanDays?: number }) => d)
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) {
      throw new Response("Unauthorized", { status: 401 });
    }
    const days = Math.min(365, Math.max(1, data.olderThanDays ?? 30));
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error, count } = await supabaseAdmin
      .from("error_logs")
      .delete({ count: "exact" })
      .lt("created_at", cutoff);
    if (error) throw new Error(error.message);
    return { deleted: count ?? 0 };
  });

/** Public: expose SENTRY_DSN to the browser so the SDK can initialise. */
export const getSentryConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    dsn: process.env.SENTRY_DSN ?? null,
    environment: process.env.NODE_ENV ?? "production",
  };
});