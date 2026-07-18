
-- has_role and has_permission read tables that authenticated already has
-- SELECT access to (user_roles, profiles, admin_role_permissions). Switching
-- to SECURITY INVOKER removes the definer-executable warning while keeping
-- them usable inside RLS policies and app queries.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _perm_key text, _mode text DEFAULT 'view')
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND is_master_owner = true
  ) OR EXISTS (
    SELECT 1
      FROM public.profiles p
      JOIN public.admin_role_permissions rp
        ON rp.role_slug = p.admin_role_slug
     WHERE p.id = _user_id
       AND p.disabled_at IS NULL
       AND rp.permission_key = _perm_key
       AND ( (_mode = 'view' AND (rp.can_view OR rp.can_edit))
          OR (_mode = 'edit' AND rp.can_edit) )
  );
$function$;

-- enqueue_email is now only called via supabaseAdmin (service_role).
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
