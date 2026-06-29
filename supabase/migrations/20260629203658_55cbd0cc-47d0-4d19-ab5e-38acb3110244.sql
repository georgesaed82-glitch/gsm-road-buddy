CREATE TABLE public.portal_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('admin','learner','subscription')),
  email text,
  label text,
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_access_codes TO service_role;
ALTER TABLE public.portal_access_codes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_portal_access_codes_updated_at
  BEFORE UPDATE ON public.portal_access_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_portal_access_codes_kind ON public.portal_access_codes(kind);
CREATE INDEX idx_portal_access_codes_code ON public.portal_access_codes(code);