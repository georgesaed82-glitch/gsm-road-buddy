DROP POLICY IF EXISTS "Deny all to app roles" ON public.portal_access_codes;
CREATE POLICY "Deny all to app roles"
ON public.portal_access_codes
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all to app roles" ON public.portal_access_uses;
CREATE POLICY "Deny all to app roles"
ON public.portal_access_uses
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);