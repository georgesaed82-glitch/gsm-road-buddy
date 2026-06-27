CREATE TABLE public.contact_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','email')),
  page TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_clicks TO anon, authenticated;
GRANT SELECT ON public.contact_clicks TO authenticated;
GRANT ALL ON public.contact_clicks TO service_role;
ALTER TABLE public.contact_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log clicks" ON public.contact_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read clicks" ON public.contact_clicks FOR SELECT TO authenticated USING (true);
CREATE INDEX contact_clicks_created_at_idx ON public.contact_clicks (created_at DESC);
CREATE INDEX contact_clicks_package_idx ON public.contact_clicks (package);