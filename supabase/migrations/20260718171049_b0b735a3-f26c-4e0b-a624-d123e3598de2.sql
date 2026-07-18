
-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated/PUBLIC.
-- Trigger functions don't need EXECUTE grants (Postgres runs triggers using
-- the definer). Only re-grant to authenticated for functions the app calls
-- as the signed-in user (has_role, has_permission, enqueue_email).

REVOKE ALL ON FUNCTION public.prevent_master_owner_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_role_permission_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_admin_profile_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.profile_update_allowed(public.profiles) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_skill_rating_change() FROM PUBLIC, anon, authenticated;

-- Internal email-queue helpers — only service_role (via supabaseAdmin) needs these.
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- enqueue_email: called by admin server functions acting as the signed-in user.
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO authenticated;

-- has_role / has_permission: used in RLS policies and by app server code
-- acting as the signed-in user. Keep authenticated EXECUTE; drop anon/PUBLIC.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.has_permission(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text, text) TO authenticated;
