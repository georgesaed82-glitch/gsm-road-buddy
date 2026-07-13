-- Helper: returns true when the proposed new profile row keeps privileged
-- fields identical to the current stored row, OR the acting user is a
-- privileged account (master owner / any admin role).
CREATE OR REPLACE FUNCTION public.profile_update_allowed(_new public.profiles)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_row public.profiles;
  acting_privileged boolean := false;
BEGIN
  SELECT * INTO old_row FROM public.profiles WHERE id = _new.id;
  IF NOT FOUND THEN
    -- No existing row: fall back to blocking privileged fields entirely.
    RETURN COALESCE(_new.is_master_owner, false) = false
       AND COALESCE(_new.admin_role_slug, '') = ''
       AND COALESCE(_new.must_change_password, false) = false
       AND _new.disabled_at IS NULL
       AND COALESCE(_new.failed_login_count, 0) = 0
       AND _new.locked_until IS NULL
       AND _new.last_login_at IS NULL
       AND _new.last_login_ip IS NULL
       AND _new.last_login_ua IS NULL
       AND _new.totp_secret_encrypted IS NULL
       AND COALESCE(_new.totp_enabled, false) = false;
  END IF;

  SELECT COALESCE(is_master_owner, false)
      OR COALESCE(admin_role_slug, '') <> ''
    INTO acting_privileged
    FROM public.profiles WHERE id = auth.uid();

  IF COALESCE(acting_privileged, false) THEN
    RETURN true;
  END IF;

  RETURN _new.is_master_owner         IS NOT DISTINCT FROM old_row.is_master_owner
     AND _new.admin_role_slug         IS NOT DISTINCT FROM old_row.admin_role_slug
     AND _new.must_change_password    IS NOT DISTINCT FROM old_row.must_change_password
     AND _new.disabled_at             IS NOT DISTINCT FROM old_row.disabled_at
     AND _new.failed_login_count      IS NOT DISTINCT FROM old_row.failed_login_count
     AND _new.locked_until            IS NOT DISTINCT FROM old_row.locked_until
     AND _new.last_login_at           IS NOT DISTINCT FROM old_row.last_login_at
     AND _new.last_login_ip           IS NOT DISTINCT FROM old_row.last_login_ip
     AND _new.last_login_ua           IS NOT DISTINCT FROM old_row.last_login_ua
     AND _new.session_timeout_minutes IS NOT DISTINCT FROM old_row.session_timeout_minutes
     AND _new.totp_secret_encrypted   IS NOT DISTINCT FROM old_row.totp_secret_encrypted
     AND _new.totp_enabled            IS NOT DISTINCT FROM old_row.totp_enabled;
END;
$$;

REVOKE ALL ON FUNCTION public.profile_update_allowed(public.profiles) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_update_allowed(public.profiles) FROM anon;
GRANT EXECUTE ON FUNCTION public.profile_update_allowed(public.profiles) TO authenticated;
GRANT EXECUTE ON FUNCTION public.profile_update_allowed(public.profiles) TO service_role;

-- Replace the permissive UPDATE policy with one that also blocks privileged
-- field writes at the policy layer. The existing
-- prevent_profile_privilege_escalation trigger remains as defence-in-depth.
DROP POLICY IF EXISTS "self update profile" ON public.profiles;

CREATE POLICY "Users update own profile (non-privileged fields)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND public.profile_update_allowed(profiles)
);