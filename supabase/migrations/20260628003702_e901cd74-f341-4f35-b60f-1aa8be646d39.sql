
CREATE TABLE public.portal_launch_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_launch_subscribers TO authenticated;
GRANT INSERT ON public.portal_launch_subscribers TO anon;
GRANT ALL ON public.portal_launch_subscribers TO service_role;
ALTER TABLE public.portal_launch_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
ON public.portal_launch_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
ON public.portal_launch_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscribers"
ON public.portal_launch_subscribers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
