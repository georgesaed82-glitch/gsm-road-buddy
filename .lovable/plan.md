
# GSM Plus Admin RBAC — Revised Plan

Locking in your latest requirements. Two-role core (**Master Owner** + **Admin**) with the extra roles from your first message layered on top as extensions of "Admin".

---

## 1. Master Owner protection (three layers, no way around it)

- **Database trigger**: `prevent_master_owner_changes()` fires `BEFORE UPDATE OR DELETE` on `profiles`.
  - Blocks any change to `is_master_owner`, `admin_role`, `disabled_at`, or deletion of the master owner row.
  - Only the master owner themselves can update their own `full_name`, `username`, or trigger their own password reset. Everyone else is rejected with `permission denied: master owner is protected`.
- **`enforce_single_master_owner()`** trigger — only one row in `profiles` can ever have `is_master_owner = true`.
- **Server-function guard** `requireMasterOwner(context)` — every lifecycle server fn (create admin, disable, delete, change role, reset password) first asserts the caller is master owner. Non-master callers get a hard 403 before any SQL runs.
- **UI lock**: master owner row on `/admin/admins` renders with a shield badge, no destructive buttons, no role dropdown.
- Your Supabase Auth password is never displayed and never used for any other admin — every new admin has their own `auth.users` row created by `supabaseAdmin.auth.admin.createUser`.

---

## 2. Roles

Seeded in `admin_roles` (editable descriptions, immutable slugs):

| Slug | Purpose |
|---|---|
| `master_owner` | You. Full control. Cannot be deleted, downgraded, or disabled. |
| `full_admin` | Manage learners + content. **Cannot touch the Master Owner row.** |
| `developer` | Site/code access, no learner data. Instantly revocable. |
| `content_manager` | Website + Highway Code + Blog. |
| `instructor_manager` | Instructors + lessons + bookings. |
| `support` | Read learners, reply to email, log contact clicks. |
| `read_only` | View-only across the portal. |

Permission matrix (14 keys × view/edit) is stored in `admin_role_permissions` and editable only by the Master Owner from `/admin/admins/roles`. Master Owner column is always fully checked and read-only.

---

## 3. Admin accounts

- **Each admin has their own** email, username (unique), password. Never share the Master Owner login.
- New admin created from `/admin/admins → Create admin`:
  - You pick role, email, username.
  - System sets temp password `GSM2026` (via `DEV_TEMP_ADMIN_PASSWORD` env var so it's rotatable) and flips `must_change_password = true`.
- **Force password change on first login**: a `ForcePasswordChange` gate wraps `_authenticated/admin/*`. If `must_change_password` is true the admin can only see the change-password form. On successful change the flag is cleared and a `password_changed` audit entry is written.
- **Instant deactivation**: `disabled_at` timestamp on the profile + Supabase Auth ban via `supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '87600h' })`. All active sessions killed with `supabaseAdmin.auth.admin.signOut(id, 'global')`. The admin cannot sign in or use existing tokens the moment you click Disable.
- **Delete admin**: hard delete via `supabaseAdmin.auth.admin.deleteUser(id)`, cascades from `auth.users` → `profiles`. Master owner row is blocked by the DB trigger.
- **Reset password**: sets password to `GSM2026` again + `must_change_password = true`.
- Row actions: Create, Reset password, Disable/Enable, Delete, Change role, View last login.

---

## 4. Audit + login logging (everything, forever)

- `admin_login_events` — every sign-in AND sign-out attempt: admin id, email, ip, user agent, success bool, mfa used, created_at.
- `admin_audit_log` — every change: actor id, actor email, action (`create_admin`, `disable_admin`, `role_change`, `permission_change`, `password_reset`, `content_edit`, etc.), entity table, entity id, `before`/`after` JSONB diffs, ip, ua, created_at.
- Triggers on `profiles`, `admin_role_permissions`, and the main content tables (`blog_posts`, `lessons`, `theory_questions`, `home_sections`, etc.) auto-write audit rows on UPDATE/DELETE.
- Server-fn writes (create/disable/delete admin) call an `writeAudit()` helper.
- New UI pages:
  - `/admin/admins/audit` — searchable log (actor, action, date range, entity).
  - `/admin/admins/logins` — login history with IP + device.
- Audit rows are append-only: RLS grants `SELECT` to Master Owner + `security:view` roles, **no** `UPDATE`/`DELETE` for anyone. Retention via a Postgres cron you control (I'll leave it disabled by default).

---

## 5. Security baseline

- Passwords: stored only in `auth.users` (Supabase Argon2/bcrypt). We never hash ourselves, never see plaintext after creation.
- Failed-login lockout: 5 fails in 15 min → `locked_until = now() + 15 min`. Already partially in place via `auth_attempts`; extended to admin-specific counters.
- Inactivity logout: client hook `useIdleLogout(minutes)` reads `session_timeout_minutes` from the profile (default 30) and signs the admin out.
- 2FA (TOTP) available to every admin; soft-required for Master Owner + Full Admin (banner until enrolled).
- Every privileged server fn: `requireSupabaseAuth` → `requirePermission(key, mode)` → optional `requireMasterOwner` → `supabaseAdmin` loaded inside the handler.

---

## Rollout order

1. **Phase 1** (this turn if approved): Migration for schema + triggers + seed roles + promote you to `master_owner`. **Nothing user-visible changes.**
2. **Phase 2**: `rbac.functions.ts` server layer + audit helper + login logging.
3. **Phase 3**: Admin portal UI (list, create/disable/delete, roles matrix, audit page, force-password-change gate, own security page).
4. **Phase 4**: 2FA rollout + idle-logout + final security scan + publish.

I'll stop for your OK between phases 1 → 2 and 3 → 4 so you can review.

---

**Reply "go" to run Phase 1 (the migration). I'll bind `is_master_owner = true` to your existing account `gsmdrivingschool@outlook.com` (user id `b886613f-…`) — confirm that's correct or paste a different id.**
