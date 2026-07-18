
-- Helper: elevated instructor check (senior_instructor or admin or instructor)
CREATE OR REPLACE FUNCTION public.is_instructor_or_higher(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'senior_instructor'::app_role, 'instructor'::app_role)
  );
$$;
REVOKE ALL ON FUNCTION public.is_instructor_or_higher(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_instructor_or_higher(uuid) TO authenticated, service_role;

-- Enums for the video library
DO $$ BEGIN
  CREATE TYPE public.ai_video_provider AS ENUM ('youtube','upload','external');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.ai_video_status AS ENUM ('draft','pending_review','approved','rejected','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.ai_video_transmission AS ENUM ('any','manual','automatic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.ai_video_difficulty AS ENUM ('beginner','intermediate','advanced','test_ready');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Table
CREATE TABLE public.ai_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  provider public.ai_video_provider NOT NULL,
  youtube_id text,
  external_url text,
  storage_path text,
  poster_url text,
  duration_seconds int,
  transmission public.ai_video_transmission NOT NULL DEFAULT 'any',
  difficulty public.ai_video_difficulty NOT NULL DEFAULT 'beginner',
  tags text[] NOT NULL DEFAULT '{}',
  topic_ids uuid[] NOT NULL DEFAULT '{}',
  lesson_ids uuid[] NOT NULL DEFAULT '{}',
  status public.ai_video_status NOT NULL DEFAULT 'draft',
  is_premium boolean NOT NULL DEFAULT true,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text,
  view_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_videos_status_idx ON public.ai_videos(status);
CREATE INDEX ai_videos_uploaded_by_idx ON public.ai_videos(uploaded_by);
CREATE INDEX ai_videos_topic_ids_idx ON public.ai_videos USING GIN(topic_ids);
CREATE INDEX ai_videos_lesson_ids_idx ON public.ai_videos USING GIN(lesson_ids);
CREATE INDEX ai_videos_tags_idx ON public.ai_videos USING GIN(tags);

-- 2. Grants (public.ai_videos)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_videos TO authenticated;
GRANT ALL ON public.ai_videos TO service_role;

-- 3. RLS
ALTER TABLE public.ai_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_videos_select_approved_or_own_or_admin"
  ON public.ai_videos FOR SELECT
  TO authenticated
  USING (
    status = 'approved'
    OR uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "ai_videos_insert_admin_or_senior"
  ON public.ai_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'senior_instructor'::app_role)
      AND uploaded_by = auth.uid()
    )
  );

CREATE POLICY "ai_videos_update_admin_or_senior_own"
  ON public.ai_videos FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'senior_instructor'::app_role)
      AND uploaded_by = auth.uid()
      AND status IN ('draft','pending_review','rejected')
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'senior_instructor'::app_role)
      AND uploaded_by = auth.uid()
    )
  );

CREATE POLICY "ai_videos_delete_admin"
  ON public.ai_videos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Trigger: normalize/enforce status transitions and audit stamps
CREATE OR REPLACE FUNCTION public.ai_videos_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
  is_admin boolean := public.has_role(actor, 'admin'::app_role);
BEGIN
  IF actor IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT is_admin THEN
      NEW.status := 'pending_review';
      NEW.uploaded_by := actor;
      NEW.approved_by := NULL;
      NEW.approved_at := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NOT is_admin THEN
      IF NEW.status <> OLD.status
         AND NEW.status NOT IN ('draft','pending_review') THEN
        RAISE EXCEPTION 'permission denied: only admin can approve/reject/archive videos';
      END IF;
      NEW.status := 'pending_review';
      NEW.approved_by := OLD.approved_by;
      NEW.approved_at := OLD.approved_at;
      NEW.uploaded_by := OLD.uploaded_by;
    ELSE
      IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
        NEW.approved_by := actor;
        NEW.approved_at := now();
      END IF;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.ai_videos_guard() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER ai_videos_guard_ins BEFORE INSERT ON public.ai_videos
  FOR EACH ROW EXECUTE FUNCTION public.ai_videos_guard();
CREATE TRIGGER ai_videos_guard_upd BEFORE UPDATE ON public.ai_videos
  FOR EACH ROW EXECUTE FUNCTION public.ai_videos_guard();
