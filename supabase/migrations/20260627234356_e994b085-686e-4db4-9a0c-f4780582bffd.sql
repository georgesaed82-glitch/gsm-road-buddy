DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE lower(email) = 'georgesaed@hotmail.co.uk');
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE lower(email) = 'georgesaed82@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;