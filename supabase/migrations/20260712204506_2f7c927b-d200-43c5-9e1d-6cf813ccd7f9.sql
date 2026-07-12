
CREATE OR REPLACE FUNCTION public.bootstrap_promote_master_owner(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily bypass the master-owner protection trigger.
  PERFORM set_config('session_replication_role', 'replica', true);

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

  PERFORM set_config('session_replication_role', 'origin', true);
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_promote_master_owner(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_promote_master_owner(uuid) TO service_role;
