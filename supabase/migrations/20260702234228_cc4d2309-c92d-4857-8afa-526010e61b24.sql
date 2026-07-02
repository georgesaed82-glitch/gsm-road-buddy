
CREATE TABLE public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  ip_hash text,
  kind text NOT NULL CHECK (kind IN ('student_signin','access_code','admin_code')),
  success boolean NOT NULL,
  captcha_verified boolean NOT NULL DEFAULT false,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.auth_attempts TO service_role;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read auth_attempts"
  ON public.auth_attempts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX auth_attempts_identifier_time_idx ON public.auth_attempts (identifier, created_at DESC);
CREATE INDEX auth_attempts_ip_time_idx ON public.auth_attempts (ip_hash, created_at DESC);
