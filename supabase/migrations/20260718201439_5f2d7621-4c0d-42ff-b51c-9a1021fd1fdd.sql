DROP POLICY IF EXISTS "Admins read content versions" ON public.content_versions;
DROP POLICY IF EXISTS "Admins write content versions" ON public.content_versions;

CREATE POLICY "Admins read content versions"
  ON public.content_versions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins write content versions"
  ON public.content_versions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));