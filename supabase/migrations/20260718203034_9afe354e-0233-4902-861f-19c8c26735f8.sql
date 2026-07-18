DROP POLICY IF EXISTS "Anyone can read content overrides" ON public.content_overrides;
CREATE POLICY "Public reads enabled content overrides"
  ON public.content_overrides
  FOR SELECT
  USING (enabled = true);
CREATE POLICY "Admins read all content overrides"
  ON public.content_overrides
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));