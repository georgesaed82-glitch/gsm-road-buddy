
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  level TEXT NOT NULL DEFAULT 'error',
  source TEXT NOT NULL DEFAULT 'client',
  message TEXT NOT NULL,
  stack TEXT,
  route TEXT,
  url TEXT,
  user_id UUID,
  user_email TEXT,
  user_agent TEXT,
  mechanism TEXT,
  fingerprint TEXT,
  extra JSONB NOT NULL DEFAULT '{}'::jsonb,
  alert_sent BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX error_logs_created_at_idx ON public.error_logs (created_at DESC);
CREATE INDEX error_logs_fingerprint_idx ON public.error_logs (fingerprint);
CREATE INDEX error_logs_level_idx ON public.error_logs (level);

GRANT INSERT ON public.error_logs TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.error_logs TO service_role;
GRANT ALL ON public.error_logs TO service_role;

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert an error report; no reads for non-admins.
CREATE POLICY "Anyone can log an error" ON public.error_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read errors" ON public.error_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete errors" ON public.error_logs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.error_alert_state (
  fingerprint TEXT NOT NULL PRIMARY KEY,
  last_alert_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INT NOT NULL DEFAULT 1
);

GRANT ALL ON public.error_alert_state TO service_role;
ALTER TABLE public.error_alert_state ENABLE ROW LEVEL SECURITY;
