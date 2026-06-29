CREATE TABLE public.admin_alert_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  notify_on_enquiry_spike BOOLEAN NOT NULL DEFAULT TRUE,
  notify_on_system_critical BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_alert_subscribers TO service_role;
ALTER TABLE public.admin_alert_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON public.admin_alert_subscribers FOR ALL USING (false) WITH CHECK (false);