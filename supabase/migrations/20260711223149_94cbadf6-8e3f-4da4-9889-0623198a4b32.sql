
CREATE TABLE public.admin_roles (
  slug        text PRIMARY KEY,
  label       text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_system   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 100,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_roles TO authenticated;
GRANT ALL ON public.admin_roles TO service_role;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_roles read for admins"
  ON public.admin_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_permissions (
  key         text PRIMARY KEY,
  label       text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order  int NOT NULL DEFAULT 100
);
GRANT SELECT ON public.admin_permissions TO authenticated;
GRANT ALL ON public.admin_permissions TO service_role;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_permissions read for admins"
  ON public.admin_permissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_role_permissions (
  role_slug      text NOT NULL REFERENCES public.admin_roles(slug) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES public.admin_permissions(key) ON DELETE CASCADE,
  can_view       boolean NOT NULL DEFAULT false,
  can_edit       boolean NOT NULL DEFAULT false,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_slug, permission_key)
);
GRANT SELECT ON public.admin_role_permissions TO authenticated;
GRANT ALL ON public.admin_role_permissions TO service_role;
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions read for admins"
  ON public.admin_role_permissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_login_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email      text,
  event      text NOT NULL CHECK (event IN ('login_success','login_failure','logout','locked','password_changed','mfa_success','mfa_failure')),
  ip         text,
  user_agent text,
  mfa_used   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_login_events_admin_idx ON public.admin_login_events (admin_id, created_at DESC);
CREATE INDEX admin_login_events_created_idx ON public.admin_login_events (created_at DESC);
GRANT SELECT ON public.admin_login_events TO authenticated;
GRANT ALL ON public.admin_login_events TO service_role;
ALTER TABLE public.admin_login_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "login_events read for admins"
  ON public.admin_login_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email  text,
  action       text NOT NULL,
  entity_table text,
  entity_id    text,
  before_data  jsonb,
  after_data   jsonb,
  ip           text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_log_actor_idx ON public.admin_audit_log (actor_id, created_at DESC);
CREATE INDEX admin_audit_log_action_idx ON public.admin_audit_log (action, created_at DESC);
CREATE INDEX admin_audit_log_entity_idx ON public.admin_audit_log (entity_table, entity_id);
CREATE INDEX admin_audit_log_created_idx ON public.admin_audit_log (created_at DESC);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log read for admins"
  ON public.admin_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_role_slug        text REFERENCES public.admin_roles(slug),
  ADD COLUMN IF NOT EXISTS is_master_owner        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS username               text UNIQUE,
  ADD COLUMN IF NOT EXISTS must_change_password   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disabled_at            timestamptz,
  ADD COLUMN IF NOT EXISTS failed_login_count     int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until           timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_at          timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_ip          text,
  ADD COLUMN IF NOT EXISTS last_login_ua          text,
  ADD COLUMN IF NOT EXISTS session_timeout_minutes int NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS totp_secret_encrypted  text,
  ADD COLUMN IF NOT EXISTS totp_enabled           boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_single_master_owner
  ON public.profiles ((1))
  WHERE is_master_owner = true;

INSERT INTO public.admin_roles (slug, label, description, sort_order) VALUES
  ('master_owner',       'Master Owner',        'Full control. Cannot be disabled, downgraded, or deleted.', 10),
  ('full_admin',         'Full Administrator',  'Manage learners, instructors, and content. Cannot modify the Master Owner.', 20),
  ('developer',          'Developer',           'Site and system configuration access. No learner data.', 30),
  ('content_manager',    'Content Manager',     'Website content, Highway Code, and blog.', 40),
  ('instructor_manager', 'Instructor Manager',  'Instructors, lessons, and bookings.', 50),
  ('support',            'Support Staff',       'Read learner data and respond to enquiries.', 60),
  ('read_only',          'Read Only',           'View-only access across the portal.', 70)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.admin_permissions (key, label, description, sort_order) VALUES
  ('dashboard',           'Dashboard',            'Admin dashboard and KPIs.', 10),
  ('learners',            'Learner Management',   'View and manage learner accounts.', 20),
  ('instructors',         'Instructor Management','View and manage instructor accounts.', 30),
  ('lessons',             'Lessons',              'Lesson catalog and bookings.', 40),
  ('payments',            'Payments',             'Payments, invoices and refunds.', 50),
  ('website_content',     'Website Content',      'Home, services, pages, images, SEO.', 60),
  ('highway_code',        'Highway Code Content', 'Highway Code lessons, signs, markings.', 70),
  ('quizzes',             'Quizzes',              'Theory questions and hazard clips.', 80),
  ('blog',                'Blog',                 'Blog posts and categories.', 90),
  ('settings',            'Settings',             'Site settings and configuration.', 100),
  ('user_management',     'User Management',      'Create, edit, disable and delete admin accounts.', 110),
  ('analytics',           'Analytics',            'Traffic, contact clicks, and reports.', 120),
  ('system_config',       'System Configuration', 'Email, integrations, secrets.', 130),
  ('security',            'Security',             'Audit log, login history, MFA policy.', 140)
ON CONFLICT (key) DO NOTHING;

DO $seed$
DECLARE
  perm_key text;
BEGIN
  FOR perm_key IN SELECT key FROM public.admin_permissions LOOP
    INSERT INTO public.admin_role_permissions (role_slug, permission_key, can_view, can_edit)
    VALUES ('master_owner', perm_key, true, true)
    ON CONFLICT (role_slug, permission_key) DO UPDATE SET can_view = true, can_edit = true;

    INSERT INTO public.admin_role_permissions (role_slug, permission_key, can_view, can_edit)
    VALUES ('full_admin', perm_key,
      perm_key NOT IN ('user_management','system_config','security'),
      perm_key NOT IN ('user_management','system_config','security'))
    ON CONFLICT (role_slug, permission_key) DO NOTHING;

    INSERT INTO public.admin_role_permissions (role_slug, permission_key, can_view, can_edit)
    VALUES ('developer', perm_key,
      perm_key IN ('dashboard','website_content','settings','system_config','analytics','security','highway_code','quizzes','blog'),
      perm_key IN ('website_content','settings','system_config','highway_code','quizzes','blog'))
    ON CONFLICT (role_slug, permission_key) DO NOTHING;

    INSERT INTO public.admin_role_permissions (role_slug, permission_key, can_view, can_edit)
    VALUES ('content_manager', perm_key,
      perm_key IN ('dashboard','website_content','highway_code','quizzes','blog','analytics'),
      perm_key IN ('website_content','highway_code','quizzes','blog'))
    ON CONFLICT (role_slug, permission_key) DO NOTHING;

    INSERT INTO public.admin_role_permissions (role_slug, permission_key, can_view, can_edit)
    VALUES ('instructor_manager', perm_key,
      perm_key IN ('dashboard','instructors','lessons','learners','payments','analytics'),
      perm_key IN ('instructors','lessons','learners'))
    ON CONFLICT (role_slug, permission_key) DO NOTHING;

    INSERT INTO public.admin_role_permissions (role_slug, permission_key, can_view, can_edit)
    VALUES ('support', perm_key,
      perm_key IN ('dashboard','learners','lessons','analytics','blog'),
      perm_key IN ('learners'))
    ON CONFLICT (role_slug, permission_key) DO NOTHING;

    INSERT INTO public.admin_role_permissions (role_slug, permission_key, can_view, can_edit)
    VALUES ('read_only', perm_key,
      perm_key NOT IN ('user_management','system_config','security'),
      false)
    ON CONFLICT (role_slug, permission_key) DO NOTHING;
  END LOOP;
END
$seed$;

UPDATE public.profiles
   SET is_master_owner = true,
       admin_role_slug = 'master_owner'
 WHERE id = 'b886613f-6b52-41b3-a3d9-fae10080bf2c';

CREATE OR REPLACE FUNCTION public.prevent_master_owner_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_master boolean;
  acting_master boolean;
  acting_uid uuid := auth.uid();
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_master_owner THEN
      RAISE EXCEPTION 'permission denied: master owner cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;

  target_master := COALESCE(OLD.is_master_owner, false);

  IF NOT target_master THEN
    IF NEW.is_master_owner AND NOT COALESCE(OLD.is_master_owner, false) THEN
      SELECT COALESCE(is_master_owner, false) INTO acting_master
        FROM public.profiles WHERE id = acting_uid;
      IF NOT COALESCE(acting_master, false) THEN
        RAISE EXCEPTION 'permission denied: only the master owner can create a master owner';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  SELECT COALESCE(is_master_owner, false) INTO acting_master
    FROM public.profiles WHERE id = acting_uid;

  IF NEW.is_master_owner IS DISTINCT FROM OLD.is_master_owner THEN
    RAISE EXCEPTION 'permission denied: master owner flag is immutable';
  END IF;
  IF NEW.admin_role_slug IS DISTINCT FROM OLD.admin_role_slug
     AND COALESCE(NEW.admin_role_slug,'') <> 'master_owner' THEN
    RAISE EXCEPTION 'permission denied: master owner role cannot be changed';
  END IF;
  IF NEW.disabled_at IS DISTINCT FROM OLD.disabled_at
     AND NEW.disabled_at IS NOT NULL THEN
    RAISE EXCEPTION 'permission denied: master owner cannot be disabled';
  END IF;

  IF acting_uid IS NULL THEN
    IF NEW.username IS DISTINCT FROM OLD.username
       OR NEW.full_name IS DISTINCT FROM OLD.full_name THEN
      RAISE EXCEPTION 'permission denied: only the master owner can edit their profile';
    END IF;
    RETURN NEW;
  END IF;

  IF NOT COALESCE(acting_master, false) THEN
    RAISE EXCEPTION 'permission denied: master owner is protected';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_master_owner_changes ON public.profiles;
CREATE TRIGGER trg_prevent_master_owner_changes
  BEFORE UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_master_owner_changes();

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _perm_key text, _mode text DEFAULT 'view')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.audit_role_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_uid uuid := auth.uid();
  actor_em text;
BEGIN
  SELECT full_name INTO actor_em FROM public.profiles WHERE id = actor_uid;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, entity_table, entity_id, before_data, after_data)
  VALUES (
    actor_uid,
    actor_em,
    'permission_' || lower(TG_OP),
    'admin_role_permissions',
    COALESCE(NEW.role_slug, OLD.role_slug) || ':' || COALESCE(NEW.permission_key, OLD.permission_key),
    CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_role_permission ON public.admin_role_permissions;
CREATE TRIGGER trg_audit_role_permission
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_permission_change();

CREATE OR REPLACE FUNCTION public.audit_admin_profile_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_uid uuid := auth.uid();
  actor_em text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF COALESCE(OLD.admin_role_slug, '') = ''
       AND COALESCE(NEW.admin_role_slug, '') = '' THEN
      RETURN NEW;
    END IF;
    IF NEW.admin_role_slug IS NOT DISTINCT FROM OLD.admin_role_slug
       AND NEW.disabled_at IS NOT DISTINCT FROM OLD.disabled_at
       AND NEW.is_master_owner IS NOT DISTINCT FROM OLD.is_master_owner
       AND NEW.must_change_password IS NOT DISTINCT FROM OLD.must_change_password
       AND NEW.locked_until IS NOT DISTINCT FROM OLD.locked_until THEN
      RETURN NEW;
    END IF;
  END IF;
  IF TG_OP = 'INSERT' AND COALESCE(NEW.admin_role_slug, '') = '' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' AND COALESCE(OLD.admin_role_slug, '') = '' THEN
    RETURN OLD;
  END IF;
  SELECT full_name INTO actor_em FROM public.profiles WHERE id = actor_uid;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, entity_table, entity_id, before_data, after_data)
  VALUES (
    actor_uid,
    actor_em,
    'admin_' || lower(TG_OP),
    'profiles',
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_admin_profile ON public.profiles;
CREATE TRIGGER trg_audit_admin_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_admin_profile_change();
