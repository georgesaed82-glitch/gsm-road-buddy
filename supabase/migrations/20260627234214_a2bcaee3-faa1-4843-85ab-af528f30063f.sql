
INSERT INTO public.user_roles (user_id, role) VALUES
  ('268ca376-54b6-491f-897a-521d561c16b4', 'admin'),
  ('b886613f-6b52-41b3-a3d9-fae10080bf2c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
