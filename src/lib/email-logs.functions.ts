import { createServerFn } from "@tanstack/react-start";
import { verifyAdminPasswordServer } from "./portal-access.functions";

export type EmailLogRow = {
  id: string;
  created_at: string;
  updated_at: string | null;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  provider_message_id: string | null;
  provider_workflow_id: string | null;
  provider_status: string | null;
  provider_http_status: number | null;
  provider_request_id: string | null;
  provider_response: string | null;
  metadata: string | null;
  suppression?: {
    reason: string | null;
    provider_event: string | null;
    created_at: string;
  } | null;
};

export const listEmailLogs = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      days?: number;
      limit?: number;
      status?: string | null;
      template?: string | null;
      recipient?: string | null;
      dedupe?: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) {
      throw new Error("Unauthorized");
    }
    const days = Math.min(90, Math.max(1, data.days ?? 14));
    const limit = Math.min(500, Math.max(10, data.limit ?? 200));
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("email_send_log")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit * 2); // pull extra so we can dedupe by message_id

    if (data.status) query = query.eq("status", data.status);
    if (data.template) query = query.eq("template_name", data.template);
    if (data.recipient) query = query.ilike("recipient_email", `%${data.recipient}%`);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    // Deduplicate by message_id (keep latest status) unless caller asked for full history
    const dedupe = data.dedupe !== false;
    let list = rows ?? [];
    if (dedupe) {
      const seen = new Set<string>();
      list = list.filter((r) => {
        const key = r.message_id ?? r.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    list = list.slice(0, limit);

    // Enrich with suppression / delivery events for recipients we've logged
    const recipients = [...new Set(list.map((r) => r.recipient_email).filter(Boolean))];
    const suppressionMap = new Map<
      string,
      { reason: string | null; provider_event: string | null; created_at: string }
    >();
    if (recipients.length > 0) {
      const { data: suppressed } = await supabaseAdmin
        .from("suppressed_emails")
        .select("email, reason, metadata, created_at")
        .in("email", recipients);
      for (const s of suppressed ?? []) {
        suppressionMap.set(s.email, {
          reason: s.reason ?? null,
          provider_event:
            s.metadata && typeof s.metadata === "object" && "event" in s.metadata
              ? String((s.metadata as { event: unknown }).event)
              : null,
          created_at: s.created_at,
        });
      }
    }

    const serialized: EmailLogRow[] = list.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      updated_at: r.updated_at ?? null,
      message_id: r.message_id,
      template_name: r.template_name,
      recipient_email: r.recipient_email,
      status: r.status,
      error_message: r.error_message,
      provider_message_id: r.provider_message_id ?? null,
      provider_workflow_id: r.provider_workflow_id ?? null,
      provider_status: r.provider_status ?? null,
      provider_http_status: r.provider_http_status ?? null,
      provider_request_id: r.provider_request_id ?? null,
      provider_response: r.provider_response ? JSON.stringify(r.provider_response, null, 2) : null,
      metadata: r.metadata ? JSON.stringify(r.metadata, null, 2) : null,
      suppression: suppressionMap.get(r.recipient_email) ?? null,
    }));

    return { rows: serialized };
  });

export const getEmailLogStats = createServerFn({ method: "POST" })
  .inputValidator((d: { days?: number }) => d)
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) {
      throw new Error("Unauthorized");
    }
    const days = Math.min(90, Math.max(1, data.days ?? 14));
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("email_send_log")
      .select("message_id, status, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    const latestByMessage = new Map<string, string>();
    for (const r of rows ?? []) {
      const key = r.message_id ?? crypto.randomUUID();
      if (!latestByMessage.has(key)) latestByMessage.set(key, r.status);
    }
    const counts: Record<string, number> = {};
    for (const status of latestByMessage.values()) {
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return {
      total: latestByMessage.size,
      counts,
      days,
    };
  });

export const listEmailHistoryForMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { message_id: string }) => d)
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer())) {
      throw new Error("Unauthorized");
    }
    if (!data.message_id) return { rows: [] as EmailLogRow[] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("email_send_log")
      .select("*")
      .eq("message_id", data.message_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const serialized: EmailLogRow[] = (rows ?? []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      updated_at: r.updated_at ?? null,
      message_id: r.message_id,
      template_name: r.template_name,
      recipient_email: r.recipient_email,
      status: r.status,
      error_message: r.error_message,
      provider_message_id: r.provider_message_id ?? null,
      provider_workflow_id: r.provider_workflow_id ?? null,
      provider_status: r.provider_status ?? null,
      provider_http_status: r.provider_http_status ?? null,
      provider_request_id: r.provider_request_id ?? null,
      provider_response: r.provider_response ? JSON.stringify(r.provider_response, null, 2) : null,
      metadata: r.metadata ? JSON.stringify(r.metadata, null, 2) : null,
      suppression: null,
    }));
    return { rows: serialized };
  });