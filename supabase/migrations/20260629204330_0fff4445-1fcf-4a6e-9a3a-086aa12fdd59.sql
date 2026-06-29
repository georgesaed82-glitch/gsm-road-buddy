ALTER TABLE public.portal_access_codes
  ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz;

CREATE TABLE public.portal_access_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.portal_access_codes(id) ON DELETE CASCADE,
  used_at timestamptz NOT NULL DEFAULT now(),
  mode text NOT NULL CHECK (mode IN ('learner','admin')),
  user_agent text,
  ip_hash text
);
GRANT ALL ON public.portal_access_uses TO service_role;
ALTER TABLE public.portal_access_uses ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_portal_access_uses_code_id ON public.portal_access_uses(code_id, used_at DESC);