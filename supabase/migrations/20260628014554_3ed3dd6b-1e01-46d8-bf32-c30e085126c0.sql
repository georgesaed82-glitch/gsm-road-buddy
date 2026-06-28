DROP POLICY IF EXISTS "Authenticated can read clicks" ON public.contact_clicks;
DROP POLICY IF EXISTS "Admins read contact clicks" ON public.contact_clicks;

CREATE POLICY "Admins read contact clicks"
  ON public.contact_clicks
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, DELETE ON public.contact_clicks TO authenticated;
GRANT ALL ON public.contact_clicks TO service_role;