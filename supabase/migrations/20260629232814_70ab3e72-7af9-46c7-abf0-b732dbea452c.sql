CREATE TABLE public.pwa_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  platform text,
  user_agent text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pwa_events_created_at_idx ON public.pwa_events (created_at DESC);
CREATE INDEX pwa_events_event_idx ON public.pwa_events (event);
CREATE INDEX pwa_events_session_idx ON public.pwa_events (session_id);

GRANT INSERT ON public.pwa_events TO anon, authenticated;
GRANT SELECT ON public.pwa_events TO authenticated;
GRANT ALL ON public.pwa_events TO service_role;

ALTER TABLE public.pwa_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log pwa events" ON public.pwa_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    event IN (
      'prompt_available',
      'prompt_shown',
      'prompt_accepted',
      'prompt_dismissed',
      'installed',
      'displayed_standalone'
    )
    AND (platform IS NULL OR char_length(platform) <= 60)
    AND (user_agent IS NULL OR char_length(user_agent) <= 500)
    AND (session_id IS NULL OR char_length(session_id) <= 80)
  );

CREATE POLICY "Admins read pwa events" ON public.pwa_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));