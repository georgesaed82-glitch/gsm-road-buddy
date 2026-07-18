DROP POLICY IF EXISTS "self insert profile" ON public.profiles;
CREATE POLICY "self insert profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND COALESCE(is_master_owner, false) = false
    AND COALESCE(admin_role_slug, '') = ''
    AND COALESCE(must_change_password, false) = false
    AND disabled_at IS NULL
    AND COALESCE(failed_login_count, 0) = 0
    AND locked_until IS NULL
    AND last_login_at IS NULL
    AND last_login_ip IS NULL
    AND last_login_ua IS NULL
    AND totp_secret_encrypted IS NULL
    AND COALESCE(totp_enabled, false) = false
  );