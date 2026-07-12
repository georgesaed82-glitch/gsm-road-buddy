
-- 1. Trigger to block privilege escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acting_uid uuid := auth.uid();
  is_privileged boolean := false;
BEGIN
  -- Service role / internal (no JWT) bypasses this guard.
  IF acting_uid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COALESCE(is_master_owner, false)
      OR COALESCE(admin_role_slug, '') <> ''
    INTO is_privileged
    FROM public.profiles WHERE id = acting_uid;

  IF COALESCE(is_privileged, false) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.is_master_owner, false) <> false
       OR COALESCE(NEW.admin_role_slug, '') <> ''
       OR COALESCE(NEW.must_change_password, false) <> false
       OR NEW.disabled_at IS NOT NULL
       OR COALESCE(NEW.failed_login_count, 0) <> 0
       OR NEW.locked_until IS NOT NULL
       OR NEW.last_login_at IS NOT NULL
       OR NEW.last_login_ip IS NOT NULL
       OR NEW.last_login_ua IS NOT NULL
       OR NEW.totp_secret_encrypted IS NOT NULL
       OR COALESCE(NEW.totp_enabled, false) <> false THEN
      RAISE EXCEPTION 'permission denied: cannot set privileged profile fields';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.is_master_owner IS DISTINCT FROM OLD.is_master_owner
       OR NEW.admin_role_slug IS DISTINCT FROM OLD.admin_role_slug
       OR NEW.must_change_password IS DISTINCT FROM OLD.must_change_password
       OR NEW.disabled_at IS DISTINCT FROM OLD.disabled_at
       OR NEW.failed_login_count IS DISTINCT FROM OLD.failed_login_count
       OR NEW.locked_until IS DISTINCT FROM OLD.locked_until
       OR NEW.last_login_at IS DISTINCT FROM OLD.last_login_at
       OR NEW.last_login_ip IS DISTINCT FROM OLD.last_login_ip
       OR NEW.last_login_ua IS DISTINCT FROM OLD.last_login_ua
       OR NEW.totp_secret_encrypted IS DISTINCT FROM OLD.totp_secret_encrypted
       OR NEW.totp_enabled IS DISTINCT FROM OLD.totp_enabled
       OR NEW.session_timeout_minutes IS DISTINCT FROM OLD.session_timeout_minutes THEN
      RAISE EXCEPTION 'permission denied: cannot modify privileged profile fields';
    END IF;
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2. Column-level privileges: revoke broad UPDATE, grant only safe columns
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE INSERT ON public.profiles FROM authenticated;

GRANT UPDATE (
  full_name,
  username,
  phone,
  postcode,
  license_number,
  transmission,
  target_test_date,
  updated_at
) ON public.profiles TO authenticated;

GRANT INSERT (
  id,
  full_name,
  username,
  phone,
  postcode,
  license_number,
  transmission,
  target_test_date
) ON public.profiles TO authenticated;
