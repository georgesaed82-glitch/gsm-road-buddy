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

export type AuditRow = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_table: string | null;
  entity_id: string | null;
  before_data: unknown;
  after_data: unknown;
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
  before: unknown,
  after: unknown,
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

function tempPassword(): string {
  return (process.env.DEV_TEMP_ADMIN_PASSWORD || "GSM2026").trim();
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

    if (!target) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword(),
        email_confirm: true,
        user_metadata: { full_name: data.full_name || data.username },
      });
      if (createErr) throw new Error(createErr.message);
      target = created.user?.id ?? null;
      if (!target) throw new Error("Failed to create user");
    } else {
      // Existing auth user — reset password to temp
      await supabase.auth.admin.updateUserById(target, { password: tempPassword() });
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
    await supabase
      .from("user_roles")
      .insert({ user_id: target, role: "admin" })
      .then((r) => (r.error && !r.error.message.includes("duplicate") ? Promise.reject(r.error) : r))
      .catch(() => {});

    await writeAudit(context.userId, "create_admin", "profiles", target, null, {
      email: data.email,
      username: data.username,
      role_slug: data.role_slug,
    });

    return { ok: true, user_id: target, tempPassword: tempPassword() };
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

    await supabase.auth.admin.updateUserById(data.user_id, { password: tempPassword() });
    await supabase
      .from("profiles")
      .update({ must_change_password: true, failed_login_count: 0, locked_until: null })
      .eq("id", data.user_id);
    await supabase.auth.admin.signOut(data.user_id, "global").catch(() => {});

    await writeAudit(context.userId, "password_reset", "profiles", data.user_id, null, {
      temp: true,
    });
    return { ok: true, tempPassword: tempPassword() };
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
    if (data.newPassword === tempPassword()) {
      throw new Error("Choose a password different from the temporary one");
    }
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