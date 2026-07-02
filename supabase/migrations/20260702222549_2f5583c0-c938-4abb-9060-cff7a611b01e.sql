
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS platform text;

DROP POLICY IF EXISTS "Anyone can log page views" ON public.page_views;
CREATE POLICY "Anyone can log page views" ON public.page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(path) <= 300
    AND (referrer IS NULL OR char_length(referrer) <= 500)
    AND (user_agent IS NULL OR char_length(user_agent) <= 500)
    AND (session_id IS NULL OR char_length(session_id) <= 80)
    AND (platform IS NULL OR char_length(platform) <= 40)
  );
