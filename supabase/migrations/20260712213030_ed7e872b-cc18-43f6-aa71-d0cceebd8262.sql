
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change_token_new IS NULL
   OR email_change_token_current IS NULL
   OR reauthentication_token IS NULL
   OR email_change IS NULL
   OR phone_change IS NULL
   OR phone_change_token IS NULL;

UPDATE auth.users
SET
  encrypted_password = crypt('h69bnqOjDFHwwQyo!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now(),
  banned_until = NULL
WHERE id = 'c28799f3-b92f-4bd7-b786-4d081ec30030';

INSERT INTO public.user_roles (user_id, role)
VALUES ('c28799f3-b92f-4bd7-b786-4d081ec30030', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles
SET must_change_password = true,
    locked_until = NULL,
    disabled_at = NULL
WHERE id = 'c28799f3-b92f-4bd7-b786-4d081ec30030';
