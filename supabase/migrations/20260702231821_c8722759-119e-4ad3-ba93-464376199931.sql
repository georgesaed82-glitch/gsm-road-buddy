-- Lock down SECURITY DEFINER helpers that only triggers/cron should invoke.
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_skill_rating_change() FROM anon, authenticated, public;

-- has_role() is called inside RLS policies (e.g. skill_ratings admin read).
-- RLS evaluates the function AS THE CALLING ROLE, so authenticated must be
-- able to execute it or every gated SELECT returns "permission denied for
-- function has_role". Keep anon revoked; only signed-in users need it.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;