
-- 1. Lock down search_path and execution on SECURITY DEFINER email queue helpers
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- 2. Replace permissive contact_clicks INSERT policy with a constrained WITH CHECK
DROP POLICY IF EXISTS "Anyone can log clicks" ON public.contact_clicks;

CREATE POLICY "Anyone can log clicks"
ON public.contact_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (
  channel IN ('whatsapp', 'email', 'phone', 'portal_view')
  AND (package IS NULL OR char_length(package) <= 80)
  AND (page IS NULL OR char_length(page) <= 200)
  AND (user_agent IS NULL OR char_length(user_agent) <= 500)
  AND (referrer IS NULL OR char_length(referrer) <= 500)
);
