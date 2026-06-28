
DROP POLICY "Anyone can subscribe" ON public.portal_launch_subscribers;
CREATE POLICY "Anyone can subscribe with valid email"
ON public.portal_launch_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND length(email) <= 254);
