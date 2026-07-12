
CREATE OR REPLACE FUNCTION public.bootstrap_promote_master_owner(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  ALTER TABLE public.profiles DISABLE TRIGGER trg_prevent_master_owner_changes;

  UPDATE public.profiles
     SET is_master_owner = false,
         admin_role_slug = CASE WHEN admin_role_slug = 'master_owner' THEN 'developer' ELSE admin_role_slug END
   WHERE is_master_owner = true AND id <> _user_id;

  INSERT INTO public.profiles (id, is_master_owner, admin_role_slug, full_name)
  VALUES (_user_id, true, 'master_owner', 'George Saed')
  ON CONFLICT (id) DO UPDATE
     SET is_master_owner = true,
         admin_role_slug = 'master_owner',
         disabled_at = NULL,
         must_change_password = false,
         locked_until = NULL;

  ALTER TABLE public.profiles ENABLE TRIGGER trg_prevent_master_owner_changes;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_promote_master_owner(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_promote_master_owner(uuid) TO service_role;

DO $$
DECLARE
  target_email text := 'georgesaed82@gmail.com';
  target_pw text := '963128';
  target_id uuid;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(target_email);

  IF target_id IS NULL THEN
    target_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
    ) VALUES (
      target_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      target_email,
      crypt(target_pw, gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      jsonb_build_object('full_name','George Saed'),
      false, false
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      target_id,
      target_id::text,
      jsonb_build_object('sub', target_id::text, 'email', target_email, 'email_verified', true),
      'email',
      now(), now(), now()
    );
  ELSE
    UPDATE auth.users
       SET encrypted_password = crypt(target_pw, gen_salt('bf')),
           email_confirmed_at = COALESCE(email_confirmed_at, now()),
           updated_at = now()
     WHERE id = target_id;
  END IF;

  PERFORM public.bootstrap_promote_master_owner(target_id);
END $$;
