
DROP POLICY IF EXISTS "Anyone can log an error" ON public.error_logs;
CREATE POLICY "Anyone can log an error" ON public.error_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    message IS NOT NULL
    AND length(message) BETWEEN 1 AND 4000
    AND (stack IS NULL OR length(stack) < 20000)
    AND (route IS NULL OR length(route) < 500)
    AND (url IS NULL OR length(url) < 1000)
    AND (user_agent IS NULL OR length(user_agent) < 1000)
  );

-- error_alert_state is service-role only by design (no anon/authenticated access).
-- Add an explicit no-access policy to satisfy the linter.
CREATE POLICY "No client access to alert state" ON public.error_alert_state
  FOR SELECT TO authenticated USING (false);
