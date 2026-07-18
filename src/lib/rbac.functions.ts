import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------------------------------------------------------------------------
// Types shared with the client
// ---------------------------------------------------------------------------

export type AdminRoleSlug =
  | "master_owner"
  | "full_admin"
  | "developer"
  | "content_manager"
  | "instructor_manager"
  | "support"
  | "read_only";

export type PermissionKey =
  | "dashboard"
  | "learners"
  | "instructors"
  | "lessons"
  | "payments"
  | "website_content"
  | "highway_code"
  | "quizzes"
  | "blog"
  | "settings"
  | "user_management"
  | "analytics"
  | "system_config"
  | "security";

export type AdminRow = {
  user_id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  role_slug: AdminRoleSlug | null;
  role_label: string | null;
  is_master_owner: boolean;
  disabled_at: string | null;
  must_change_password: boolean;
  totp_enabled: boolean;
  locked_until: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  last_login_ua: string | null;
  created_at: string;
};

export type MyProfile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  role_slug: AdminRoleSlug | null;
  is_master_owner: boolean;
  must_change_password: boolean;
  totp_enabled: boolean;
  session_timeout_minutes: number;
  permissions: Record<PermissionKey, { view: boolean; edit: boolean }>;
};

export type RolePermissionRow = {
  role_slug: AdminRoleSlug;
  permission_key: PermissionKey;
  can_view: boolean;
  can_edit: boolean;
};

export type PermissionMatrix = {
  roles: { slug: AdminRoleSlug; label: string; description: string; sort_order: number }[];
  permissions: { key: PermissionKey; label: string; description: string; sort_order: number }[];
  entries: RolePermissionRow[];
};

export type LoginEvent = {
  id: string;
  admin_id: string | null;
  email: string | null;
  event: string;
  ip: string | null;
  user_agent: string | null;
  mfa_used: boolean;
  created_at: string;
};

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

export type AuditRow = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_table: string | null;
  entity_id: string | null;
  before_data: JsonValue | null;
  after_data: JsonValue | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Server helpers (inline to keep server-fn split-safe)
// ---------------------------------------------------------------------------

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function reqInfo(): Promise<{ ip: string | null; ua: string | null }> {
  try {
    const { reqMeta } = await import("./auth-guard.server");
    return reqMeta();
  } catch {
    return { ip: null, ua: null };
  }
}

// ---------------------------------------------------------------------------
// My profile + permissions
// ---------------------------------------------------------------------------

export const getMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyProfile> => {
    const supabase = await loadAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, full_name, username, admin_role_slug, is_master_owner, must_change_password, totp_enabled, session_timeout_minutes",
      )
      .eq("id", context.userId)
      .maybeSingle();

    const { data: user } = await supabase.auth.admin.getUserById(context.userId);
    const email = user?.user?.email ?? null;

    const p = (profile ?? {}) as {
      id?: string;
      full_name?: string | null;
      username?: string | null;
      admin_role_slug?: AdminRoleSlug | null;
      is_master_owner?: boolean;
      must_change_password?: boolean;
      totp_enabled?: boolean;
      session_timeout_minutes?: number;
    };

    const permissions: Record<PermissionKey, { view: boolean; edit: boolean }> = {
      dashboard: { view: false, edit: false },
      learners: { view: false, edit: false },
      instructors: { view: false, edit: false },
      lessons: { view: false, edit: false },
      payments: { view: false, edit: false },
      website_content: { view: false, edit: false },
      highway_code: { view: false, edit: false },
      quizzes: { view: false, edit: false },
      blog: { view: false, edit: false },
      settings: { view: false, edit: false },
      user_management: { view: false, edit: false },
      analytics: { view: false, edit: false },
      system_config: { view: false, edit: false },
      security: { view: false, edit: false },
    };

    if (p.is_master_owner) {
      (Object.keys(permissions) as PermissionKey[]).forEach((k) => {
        permissions[k] = { view: true, edit: true };
      });
    } else if (p.admin_role_slug) {
      const { data: rows } = await supabase
        .from("admin_role_permissions")
        .select("permission_key, can_view, can_edit")
        .eq("role_slug", p.admin_role_slug);
      for (const r of (rows ?? []) as {
        permission_key: PermissionKey;
        can_view: boolean;
        can_edit: boolean;
      }[]) {
        permissions[r.permission_key] = {
          view: r.can_view || r.can_edit,
          edit: r.can_edit,
        };
      }
    }

    return {
      user_id: context.userId,
      email,
      full_name: p.full_name ?? null,
      username: p.username ?? null,
      role_slug: p.admin_role_slug ?? null,
      is_master_owner: !!p.is_master_owner,
      must_change_password: !!p.must_change_password,
      totp_enabled: !!p.totp_enabled,
      session_timeout_minutes: p.session_timeout_minutes ?? 30,
      permissions,
    };
  });

async function requireMasterOwner(userId: string): Promise<void> {
  const supabase = await loadAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("is_master_owner, disabled_at")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.is_master_owner) throw new Error("Forbidden: master owner only");
  if (data.disabled_at) throw new Error("Forbidden: account disabled");
}

async function requirePermission(
  userId: string,
  key: PermissionKey,
  mode: "view" | "edit",
): Promise<void> {
  const supabase = await loadAdmin();
  const { data } = await supabase.rpc("has_permission", {
    _user_id: userId,
    _perm_key: key,
    _mode: mode,
  });
  if (!data) throw new Error(`Forbidden: missing permission ${key}:${mode}`);
}

async function writeAudit(
  actorId: string,
  action: string,
  entity_table: string | null,
  entity_id: string | null,
  before: JsonValue | null,
  after: JsonValue | null,
): Promise<void> {
  try {
    const supabase = await loadAdmin();
    const { data: p } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", actorId)
      .maybeSingle();
    const { ip, ua } = await reqInfo();
    await supabase.from("admin_audit_log").insert({
      actor_id: actorId,
      actor_email: p?.full_name ?? null,
      action,
      entity_table,
      entity_id,
      before_data: before as never,
      after_data: after as never,
      ip,
      user_agent: ua?.slice(0, 300) ?? null,
    });
  } catch (err) {
    console.error("[rbac] writeAudit failed", err);
  }
}

async function logLoginEvent(
  adminId: string | null,
  email: string | null,
  event: string,
  mfa = false,
): Promise<void> {
  try {
    const supabase = await loadAdmin();
    const { ip, ua } = await reqInfo();
    await supabase.from("admin_login_events").insert({
      admin_id: adminId,
      email,
      event,
      ip,
      user_agent: ua?.slice(0, 300) ?? null,
      mfa_used: mfa,
    });
  } catch (err) {
    console.error("[rbac] logLoginEvent failed", err);
  }
}

// ---------------------------------------------------------------------------
// Admin listing + lifecycle (Master Owner only for destructive ops)
// ---------------------------------------------------------------------------

export const listRbacAdmins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminRow[]> => {
    await requirePermission(context.userId, "user_management", "view");
    const supabase = await loadAdmin();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, username, admin_role_slug, is_master_owner, disabled_at, must_change_password, totp_enabled, locked_until, last_login_at, last_login_ip, last_login_ua, created_at",
      )
      .not("admin_role_slug", "is", null)
      .order("is_master_owner", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabase.from("admin_roles").select("slug, label");
    const labelBySlug = new Map<string, string>();
    for (const r of (roles ?? []) as { slug: string; label: string }[]) {
      labelBySlug.set(r.slug, r.label);
    }

    const rows: AdminRow[] = [];
    for (const p of (profiles ?? []) as Array<{
      id: string;
      full_name: string | null;
      username: string | null;
      admin_role_slug: AdminRoleSlug | null;
      is_master_owner: boolean;
      disabled_at: string | null;
      must_change_password: boolean;
      totp_enabled: boolean;
      locked_until: string | null;
      last_login_at: string | null;
      last_login_ip: string | null;
      last_login_ua: string | null;
      created_at: string;
    }>) {
      const { data: user } = await supabase.auth.admin.getUserById(p.id);
      rows.push({
        user_id: p.id,
        email: user?.user?.email ?? "(unknown)",
        username: p.username,
        full_name: p.full_name,
        role_slug: p.admin_role_slug,
        role_label: p.admin_role_slug ? (labelBySlug.get(p.admin_role_slug) ?? null) : null,
        is_master_owner: !!p.is_master_owner,
        disabled_at: p.disabled_at,
        must_change_password: !!p.must_change_password,
        totp_enabled: !!p.totp_enabled,
        locked_until: p.locked_until,
        last_login_at: p.last_login_at,
        last_login_ip: p.last_login_ip,
        last_login_ua: p.last_login_ua,
        created_at: p.created_at,
      });
    }
    return rows;
  });

const RoleSlugSchema = z.enum([
  "full_admin",
  "developer",
  "content_manager",
  "instructor_manager",
  "support",
  "read_only",
]);

/**
 * Generate a cryptographically random temporary password for admin
 * invitations and resets. Called ONCE per flow and the same value is used
 * for both the auth update and the email — never a shared static string.
 */
function generateTempPassword(): string {
  // 18 bytes → 24 base64 chars, then trim to a URL-safe alphanumeric to
  // avoid shell/URL-copy issues when learners paste it from email.
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

// Send an invitation / password-reset email through the shared email queue.
// Uses the service-role admin client so it works even when the recipient
// doesn't exist yet as a signed-in user.
async function sendAdminInviteEmail(params: {
  to: string;
  full_name?: string | null;
  username: string;
  tempPassword: string;
  kind: "invite" | "reset";
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const displayName = (params.full_name || params.username || "there").trim();
    const isInvite = params.kind === "invite";
    const loginUrl = "https://www.gsmdrivingschool.com/auth?admin=1";
    const subject = isInvite
      ? "Your GSM Plus admin account – temporary password inside"
      : "Your GSM Plus admin password has been reset";
    const heading = isInvite ? "Welcome to GSM Plus" : "Your admin password was reset";
    const intro = isInvite
      ? `You've been invited to the GSM Plus admin portal. Use the temporary credentials below to sign in for the first time. You'll be asked to set a new password immediately after signing in.`
      : `An administrator has reset your GSM Plus admin password. Use the temporary password below to sign in. You'll be asked to set a new password immediately after signing in.`;
    const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F3E8;font-family:Arial,Helvetica,sans-serif;color:#1D2A22">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="background:#ffffff;border:1px solid #E7E1CF;border-radius:12px;padding:28px">
      <h1 style="margin:0 0 8px;color:#234B36;font-size:22px">${heading}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.55">Hi ${escapeHtml(displayName)},</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.55">${intro}</p>
      <div style="background:#F7F3E8;border:1px solid #E7E1CF;border-radius:8px;padding:16px 18px;margin:0 0 20px">
        <p style="margin:0 0 6px;font-size:13px;color:#6A746D">Sign-in email</p>
        <p style="margin:0 0 14px;font-size:15px;font-weight:600">${escapeHtml(params.to)}</p>
        <p style="margin:0 0 6px;font-size:13px;color:#6A746D">Username</p>
        <p style="margin:0 0 14px;font-size:15px;font-weight:600">${escapeHtml(params.username)}</p>
        <p style="margin:0 0 6px;font-size:13px;color:#6A746D">Temporary password</p>
        <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.5px;color:#C97845;font-family:ui-monospace,Menlo,Consolas,monospace">${escapeHtml(params.tempPassword)}</p>
      </div>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.55">
        <a href="${loginUrl}" style="display:inline-block;background:#234B36;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Sign in to GSM Plus</a>
      </p>
      <p style="margin:0;font-size:13px;color:#6A746D;line-height:1.55">
        For security, this temporary password must be changed on first sign-in. If you weren't expecting this email, please ignore it or contact GSM Driving School.
      </p>
    </div>
    <p style="text-align:center;color:#6A746D;font-size:12px;margin:16px 0 0">GSM Driving School · gsmdrivingschool.com</p>
  </div>
</body></html>`;
    const text = `${heading}\n\nHi ${displayName},\n\n${intro}\n\nSign-in email: ${params.to}\nUsername: ${params.username}\nTemporary password: ${params.tempPassword}\n\nSign in: ${loginUrl}\n\nYou'll be asked to set a new password on first sign-in.\n\n— GSM Driving School`;
    const idempotencyKey = `admin-${params.kind}-${params.to}-${Date.now()}`;
    const payload = {
      message_id: idempotencyKey,
      idempotency_key: idempotencyKey,
      to: params.to,
      from: "GSM Driving School <notify@notify.gsmdrivingschool.com>",
      sender_domain: "notify.gsmdrivingschool.com",
      subject,
      html,
      text,
      purpose: "transactional",
      label: `admin-${params.kind}`,
      queued_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload,
    });
    if (error) {
      console.error("[rbac] enqueue_email failed:", error.message);
    }
  } catch (e) {
    console.error("[rbac] sendAdminInviteEmail failed:", e);
  }
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const createRbacAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email().max(255),
        username: z.string().trim().min(3).max(60),
        full_name: z.string().trim().max(120).optional(),
        role_slug: RoleSlugSchema,
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireMasterOwner(context.userId);
    const supabase = await loadAdmin();

    // Ensure username uniqueness
    const { data: dup } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .maybeSingle();
    if (dup) throw new Error("Username is already taken");

    // Ensure email doesn't already exist as an admin
    let target: string | null = null;
    for (let page = 1; page <= 20 && !target; page++) {
      const { data: list, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const match = list.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
      if (match) {
        target = match.id;
        break;
      }
      if (list.users.length < 200) break;
    }

    const tp = generateTempPassword();
    if (!target) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: data.email,
        password: tp,
        email_confirm: true,
        user_metadata: { full_name: data.full_name || data.username },
      });
      if (createErr) throw new Error(createErr.message);
      target = created.user?.id ?? null;
      if (!target) throw new Error("Failed to create user");
    } else {
      // Existing auth user — reset password to temp
      await supabase.auth.admin.updateUserById(target, { password: tp });
    }

    // Ensure profile row exists then set admin fields
    await supabase
      .from("profiles")
      .upsert({ id: target, full_name: data.full_name || data.username }, { onConflict: "id" });
    const { error: updErr } = await supabase
      .from("profiles")
      .update({
        admin_role_slug: data.role_slug,
        username: data.username,
        must_change_password: true,
        disabled_at: null,
        failed_login_count: 0,
        locked_until: null,
      })
      .eq("id", target);
    if (updErr) throw new Error(updErr.message);

    // Add legacy role marker so existing has_role('admin') gates pass
    {
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: target, role: "admin" });
      if (roleErr && !roleErr.message.includes("duplicate")) {
        console.warn("[rbac] user_roles insert failed:", roleErr.message);
      }
    }

    await writeAudit(context.userId, "create_admin", "profiles", target, null, {
      email: data.email,
      username: data.username,
      role_slug: data.role_slug,
    });

    await sendAdminInviteEmail({
      to: data.email,
      full_name: data.full_name || null,
      username: data.username,
      tempPassword: tp,
      kind: "invite",
    });

    return { ok: true, user_id: target, tempPassword: tp, emailSent: true };
  });

export const changeRbacAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ user_id: z.string().uuid(), role_slug: RoleSlugSchema }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireMasterOwner(context.userId);
    const supabase = await loadAdmin();
    const { data: existing } = await supabase
      .from("profiles")
      .select("admin_role_slug, is_master_owner")
      .eq("id", data.user_id)
      .maybeSingle();
    if (existing?.is_master_owner) throw new Error("Master Owner role is immutable");
    const { error } = await supabase
      .from("profiles")
      .update({ admin_role_slug: data.role_slug })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.userId,
      "role_change",
      "profiles",
      data.user_id,
      { role_slug: existing?.admin_role_slug ?? null },
      { role_slug: data.role_slug },
    );
    return { ok: true };
  });

export const setRbacAdminDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid(), disabled: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireMasterOwner(context.userId);
    if (context.userId === data.user_id) throw new Error("You cannot disable your own account");
    const supabase = await loadAdmin();
    const { data: existing } = await supabase
      .from("profiles")
      .select("is_master_owner, disabled_at")
      .eq("id", data.user_id)
      .maybeSingle();
    if (existing?.is_master_owner) throw new Error("Master Owner cannot be disabled");

    const disabled_at = data.disabled ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("profiles")
      .update({ disabled_at, failed_login_count: 0, locked_until: null })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);

    // Ban / unban at the Auth layer + kill sessions
    await supabase.auth.admin.updateUserById(data.user_id, {
      ban_duration: data.disabled ? "87600h" : "none",
    });
    if (data.disabled) {
      await supabase.auth.admin.signOut(data.user_id, "global").catch(() => {});
    }

    await writeAudit(
      context.userId,
      data.disabled ? "disable_admin" : "enable_admin",
      "profiles",
      data.user_id,
      { disabled_at: existing?.disabled_at ?? null },
      { disabled_at },
    );
    return { ok: true };
  });

export const deleteRbacAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireMasterOwner(context.userId);
    if (context.userId === data.user_id) throw new Error("You cannot delete your own account");
    const supabase = await loadAdmin();
    const { data: existing } = await supabase
      .from("profiles")
      .select("is_master_owner")
      .eq("id", data.user_id)
      .maybeSingle();
    if (existing?.is_master_owner) throw new Error("Master Owner cannot be deleted");

    // Cleanup legacy user_roles first
    await supabase.from("user_roles").delete().eq("user_id", data.user_id);
    await supabase.from("profiles").delete().eq("id", data.user_id);
    const { error } = await supabase.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);

    await writeAudit(context.userId, "delete_admin", "profiles", data.user_id, existing, null);
    return { ok: true };
  });

export const resetRbacAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireMasterOwner(context.userId);
    const supabase = await loadAdmin();
    const { data: existing } = await supabase
      .from("profiles")
      .select("is_master_owner")
      .eq("id", data.user_id)
      .maybeSingle();
    if (existing?.is_master_owner)
      throw new Error("Master Owner password can only be changed by the Master Owner directly");

    const tp = generateTempPassword();
    await supabase.auth.admin.updateUserById(data.user_id, { password: tp });
    await supabase
      .from("profiles")
      .update({ must_change_password: true, failed_login_count: 0, locked_until: null })
      .eq("id", data.user_id);
    await supabase.auth.admin.signOut(data.user_id, "global").catch(() => {});

    await writeAudit(context.userId, "password_reset", "profiles", data.user_id, null, {
      temp: true,
    });
    // Look up the target's email + username so we can email them the new temp password.
    const { data: targetUser } = await supabase.auth.admin.getUserById(data.user_id);
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", data.user_id)
      .maybeSingle();
    const targetEmail = targetUser?.user?.email ?? null;
    if (targetEmail) {
      await sendAdminInviteEmail({
        to: targetEmail,
        full_name: targetProfile?.full_name ?? null,
        username: targetProfile?.username ?? targetEmail,
        tempPassword: tp,
        kind: "reset",
      });
    }

    return { ok: true, tempPassword: tp, emailSent: Boolean(targetEmail) };
  });

// Self password change — clears must_change_password
export const changeOwnPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(200),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    // No static temp comparison: temp passwords are cryptographically random
    // per invocation, so we can't (and don't need to) compare against them.
    const supabase = await loadAdmin();
    const { data: user } = await supabase.auth.admin.getUserById(context.userId);
    const email = user?.user?.email;
    if (!email) throw new Error("No email on account");

    // Verify current password by attempting a stateless sign-in
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY =
      process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY!;
    const { createClient } = await import("@supabase/supabase-js");
    const stateless = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    const { error: signErr } = await stateless.auth.signInWithPassword({
      email,
      password: data.currentPassword,
    });
    if (signErr) throw new Error("Current password is incorrect");

    await supabase.auth.admin.updateUserById(context.userId, { password: data.newPassword });
    await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", context.userId);
    await logLoginEvent(context.userId, email, "password_changed");
    await writeAudit(context.userId, "password_changed", "profiles", context.userId, null, {
      self: true,
    });
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Permission matrix
// ---------------------------------------------------------------------------

export const getPermissionMatrix = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PermissionMatrix> => {
    await requirePermission(context.userId, "user_management", "view");
    const supabase = await loadAdmin();
    const [{ data: roles }, { data: perms }, { data: entries }] = await Promise.all([
      supabase
        .from("admin_roles")
        .select("slug, label, description, sort_order")
        .order("sort_order"),
      supabase
        .from("admin_permissions")
        .select("key, label, description, sort_order")
        .order("sort_order"),
      supabase
        .from("admin_role_permissions")
        .select("role_slug, permission_key, can_view, can_edit"),
    ]);
    return {
      roles: (roles ?? []) as PermissionMatrix["roles"],
      permissions: (perms ?? []) as PermissionMatrix["permissions"],
      entries: (entries ?? []) as RolePermissionRow[],
    };
  });

export const updateRolePermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        role_slug: z.enum([
          "full_admin",
          "developer",
          "content_manager",
          "instructor_manager",
          "support",
          "read_only",
        ]),
        permission_key: z.string(),
        can_view: z.boolean(),
        can_edit: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireMasterOwner(context.userId);
    const supabase = await loadAdmin();
    // Edit implies view
    const can_view = data.can_edit ? true : data.can_view;
    const { error } = await supabase
      .from("admin_role_permissions")
      .upsert(
        {
          role_slug: data.role_slug,
          permission_key: data.permission_key,
          can_view,
          can_edit: data.can_edit,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "role_slug,permission_key" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Audit + login history views
// ---------------------------------------------------------------------------

export const listAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ limit: z.number().min(1).max(500).optional() }).parse(d))
  .handler(async ({ context, data }): Promise<AuditRow[]> => {
    await requirePermission(context.userId, "security", "view");
    const supabase = await loadAdmin();
    const { data: rows, error } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 200);
    if (error) throw new Error(error.message);
    return (rows ?? []) as AuditRow[];
  });

export const listLoginEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        adminId: z.string().uuid().optional(),
        limit: z.number().min(1).max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<LoginEvent[]> => {
    await requirePermission(context.userId, "security", "view");
    const supabase = await loadAdmin();
    let query = supabase
      .from("admin_login_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 200);
    if (data.adminId) query = query.eq("admin_id", data.adminId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []) as LoginEvent[];
  });

// ---------------------------------------------------------------------------
// Public: called after a successful admin sign-in to log + refresh metadata
// ---------------------------------------------------------------------------

export const recordAdminLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await loadAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select("admin_role_slug, disabled_at, is_master_owner")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile?.admin_role_slug && !profile?.is_master_owner) {
      // Not an admin — do not log to admin table
      return { ok: false };
    }
    if (profile.disabled_at) {
      await supabase.auth.admin.signOut(context.userId, "global").catch(() => {});
      await logLoginEvent(context.userId, null, "login_failure");
      throw new Error("Account is disabled");
    }
    const { ip, ua } = await reqInfo();
    const { data: user } = await supabase.auth.admin.getUserById(context.userId);
    await supabase
      .from("profiles")
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: ip,
        last_login_ua: ua?.slice(0, 300) ?? null,
        failed_login_count: 0,
      })
      .eq("id", context.userId);
    await logLoginEvent(context.userId, user?.user?.email ?? null, "login_success");
    return { ok: true };
  });

export const recordAdminLogout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await loadAdmin();
    const { data: user } = await supabase.auth.admin.getUserById(context.userId);
    await logLoginEvent(context.userId, user?.user?.email ?? null, "logout");
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Admin invitation send log
// ---------------------------------------------------------------------------

export type AdminInviteLogRow = {
  message_id: string;
  recipient_email: string;
  template_name: string; // "admin-invite" | "admin-reset"
  status: string; // sent | pending | failed | dlq | suppressed
  error_message: string | null;
  created_at: string;
};

export const listAdminInvites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminInviteLogRow[]> => {
    await requireMasterOwner(context.userId);
    const supabase = await loadAdmin();

    // Pull the last 200 admin invite/reset rows, then dedupe by message_id keeping
    // the newest row so we see the final delivery status per email.
    const { data, error } = await supabase
      .from("email_send_log")
      .select("message_id, recipient_email, template_name, status, error_message, created_at")
      .in("template_name", ["admin-invite", "admin-reset"])
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const seen = new Set<string>();
    const out: AdminInviteLogRow[] = [];
    for (const row of data ?? []) {
      const mid = (row as any).message_id as string | null;
      if (!mid || seen.has(mid)) continue;
      seen.add(mid);
      out.push(row as AdminInviteLogRow);
    }
    return out.slice(0, 50);
  });

export const resendAdminInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireMasterOwner(context.userId);
    const supabase = await loadAdmin();

    // Look up target email and profile
    const { data: targetUser } = await supabase.auth.admin.getUserById(data.user_id);
    const targetEmail = targetUser?.user?.email ?? null;
    if (!targetEmail) throw new Error("Could not find email for that admin.");

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("username, full_name, is_master_owner")
      .eq("id", data.user_id)
      .maybeSingle();
    if (targetProfile?.is_master_owner) {
      throw new Error("Cannot resend invitation to the Master Owner account.");
    }

    // Reset password to a fresh temp and force change on next login
    const tp = generateTempPassword();
    await supabase.auth.admin.updateUserById(data.user_id, { password: tp });
    await supabase
      .from("profiles")
      .update({ must_change_password: true, failed_login_count: 0, locked_until: null })
      .eq("id", data.user_id);
    await supabase.auth.admin.signOut(data.user_id, "global").catch(() => {});

    await sendAdminInviteEmail({
      to: targetEmail,
      full_name: targetProfile?.full_name ?? null,
      username: targetProfile?.username ?? targetEmail,
      tempPassword: tp,
      kind: "invite",
    });

    await writeAudit(context.userId, "resend_invite", "profiles", data.user_id, null, {
      email: targetEmail,
    });

    return { ok: true, tempPassword: tp, to: targetEmail };
  });