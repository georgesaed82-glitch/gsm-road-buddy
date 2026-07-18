
-- Enums
DO $$ BEGIN CREATE TYPE public.progress_stage AS ENUM ('not_started','introduced','practised','developing','independent','test_standard','completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.lesson_block_kind AS ENUM ('text','image','diagram','animation','video','voice','quiz','instructor_note','homework','reference_point','gsm_method_callout'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.learning_asset_kind AS ENUM ('image','diagram','animation','video','voice','pdf','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.quiz_question_kind AS ENUM ('mcq','truefalse','image_pick','hazard_click'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.theory_section AS ENUM ('highway_code','road_signs','road_markings','show_me_tell_me'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.mock_result AS ENUM ('pass','fail'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.calendar_event_kind AS ENUM ('lesson','mock_test','theory','test','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.calendar_event_status AS ENUM ('scheduled','completed','cancelled','no_show'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.certificate_kind AS ENUM ('module','test_ready','passed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.gsm_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- learning_assets
CREATE TABLE IF NOT EXISTS public.learning_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.learning_asset_kind NOT NULL,
  storage_path text NOT NULL,
  mime text, width integer, height integer, duration_ms integer,
  alt_text text, caption text, credit text,
  tags text[] DEFAULT '{}',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learning_assets TO authenticated;
GRANT ALL ON public.learning_assets TO service_role;
ALTER TABLE public.learning_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learning_assets_read_auth" ON public.learning_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "learning_assets_admin_write" ON public.learning_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_learning_assets_updated BEFORE UPDATE ON public.learning_assets
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

-- learning_modules
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  module_number integer NOT NULL,
  title text NOT NULL, description text,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  cover_asset_id uuid REFERENCES public.learning_assets(id) ON DELETE SET NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learning_modules TO authenticated;
GRANT ALL ON public.learning_modules TO service_role;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learning_modules_read_auth" ON public.learning_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "learning_modules_admin_write" ON public.learning_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_learning_modules_updated BEFORE UPDATE ON public.learning_modules
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

-- learning_topics
CREATE TABLE IF NOT EXISTS public.learning_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  slug text NOT NULL, title text NOT NULL, summary text, category text,
  teaching_method_tags text[] DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  estimated_minutes integer,
  is_published boolean NOT NULL DEFAULT true,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug)
);
GRANT SELECT ON public.learning_topics TO authenticated;
GRANT ALL ON public.learning_topics TO service_role;
ALTER TABLE public.learning_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learning_topics_read_auth" ON public.learning_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "learning_topics_admin_write" ON public.learning_topics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_learning_topics_updated BEFORE UPDATE ON public.learning_topics
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_learning_topics_module ON public.learning_topics(module_id, order_index);

-- learning_lessons
CREATE TABLE IF NOT EXISTS public.learning_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  slug text NOT NULL, title text NOT NULL, body_richtext jsonb,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (topic_id, slug)
);
GRANT SELECT ON public.learning_lessons TO authenticated;
GRANT ALL ON public.learning_lessons TO service_role;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learning_lessons_read_published" ON public.learning_lessons FOR SELECT TO authenticated
  USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "learning_lessons_admin_write" ON public.learning_lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_learning_lessons_updated BEFORE UPDATE ON public.learning_lessons
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_learning_lessons_topic ON public.learning_lessons(topic_id, order_index);

-- lesson_blocks
CREATE TABLE IF NOT EXISTS public.lesson_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  kind public.lesson_block_kind NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  asset_id uuid REFERENCES public.learning_assets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_blocks TO authenticated;
GRANT ALL ON public.lesson_blocks TO service_role;
ALTER TABLE public.lesson_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_blocks_read_auth" ON public.lesson_blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesson_blocks_admin_write" ON public.lesson_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_lesson_blocks_updated BEFORE UPDATE ON public.lesson_blocks
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_lesson_blocks_lesson ON public.lesson_blocks(lesson_id, order_index);

-- lesson_quizzes + quiz_questions
CREATE TABLE IF NOT EXISTS public.lesson_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  pass_threshold integer NOT NULL DEFAULT 80,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_quizzes TO authenticated;
GRANT ALL ON public.lesson_quizzes TO service_role;
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_quizzes_read_auth" ON public.lesson_quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesson_quizzes_admin_write" ON public.lesson_quizzes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_lesson_quizzes_updated BEFORE UPDATE ON public.lesson_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  kind public.quiz_question_kind NOT NULL DEFAULT 'mcq',
  prompt text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_questions TO authenticated;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_questions_read_auth" ON public.quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "quiz_questions_admin_write" ON public.quiz_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_quiz_questions_updated BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

-- Progress
CREATE TABLE IF NOT EXISTS public.progress_student_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  topic_id uuid NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  stage public.progress_stage NOT NULL DEFAULT 'not_started',
  count integer NOT NULL DEFAULT 0,
  last_worked_at timestamptz, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, topic_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_student_topics TO authenticated;
GRANT ALL ON public.progress_student_topics TO service_role;
ALTER TABLE public.progress_student_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pst_owner_read" ON public.progress_student_topics FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "pst_staff_write" ON public.progress_student_topics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE TRIGGER trg_pst_updated BEFORE UPDATE ON public.progress_student_topics
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_pst_student ON public.progress_student_topics(student_id);

CREATE TABLE IF NOT EXISTS public.progress_lesson_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL, instructor_id uuid,
  lesson_date date NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes integer,
  strengths text, improvements text, instructor_notes text, homework text, next_objectives text,
  ai_summary text, ai_summary_generated_at timestamptz,
  weather text, route text, mood text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_lesson_entries TO authenticated;
GRANT ALL ON public.progress_lesson_entries TO service_role;
ALTER TABLE public.progress_lesson_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ple_owner_read" ON public.progress_lesson_entries FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "ple_staff_write" ON public.progress_lesson_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE TRIGGER trg_ple_updated BEFORE UPDATE ON public.progress_lesson_entries
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_ple_student ON public.progress_lesson_entries(student_id, lesson_date DESC);

CREATE TABLE IF NOT EXISTS public.progress_lesson_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_entry_id uuid NOT NULL REFERENCES public.progress_lesson_entries(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  stage_before public.progress_stage, stage_after public.progress_stage, note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_lesson_topics TO authenticated;
GRANT ALL ON public.progress_lesson_topics TO service_role;
ALTER TABLE public.progress_lesson_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plt_read" ON public.progress_lesson_topics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.progress_lesson_entries e WHERE e.id = lesson_entry_id
    AND (e.student_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor')))
);
CREATE POLICY "plt_staff_write" ON public.progress_lesson_topics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.progress_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  lesson_entry_id uuid REFERENCES public.progress_lesson_entries(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.learning_topics(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.learning_assets(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'photo', caption text, uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_uploads TO authenticated;
GRANT ALL ON public.progress_uploads TO service_role;
ALTER TABLE public.progress_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pu_owner_read" ON public.progress_uploads FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "pu_staff_write" ON public.progress_uploads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.progress_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL, code text NOT NULL, title text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (student_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_achievements TO authenticated;
GRANT ALL ON public.progress_achievements TO service_role;
ALTER TABLE public.progress_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_owner_read" ON public.progress_achievements FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "pa_staff_write" ON public.progress_achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.progress_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  overall_score numeric(5,2), readiness_score numeric(5,2), pass_probability numeric(5,2),
  module_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_snapshots TO authenticated;
GRANT ALL ON public.progress_snapshots TO service_role;
ALTER TABLE public.progress_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "psnap_owner_read" ON public.progress_snapshots FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "psnap_staff_write" ON public.progress_snapshots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE INDEX IF NOT EXISTS idx_psnap_student ON public.progress_snapshots(student_id, captured_at DESC);

-- Assessments
CREATE TABLE IF NOT EXISTS public.assess_mock_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT now(),
  minors integer NOT NULL DEFAULT 0, serious integer NOT NULL DEFAULT 0, dangerous integer NOT NULL DEFAULT 0,
  result public.mock_result, notes text,
  readiness_score numeric(5,2), pass_probability numeric(5,2),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assess_mock_tests TO authenticated;
GRANT ALL ON public.assess_mock_tests TO service_role;
ALTER TABLE public.assess_mock_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "amt_owner_read" ON public.assess_mock_tests FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "amt_staff_write" ON public.assess_mock_tests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.assess_hazard_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL, clip_id uuid, score integer,
  taken_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assess_hazard_runs TO authenticated;
GRANT ALL ON public.assess_hazard_runs TO service_role;
ALTER TABLE public.assess_hazard_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ahr_owner" ON public.assess_hazard_runs FOR ALL TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.assess_theory_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  section public.theory_section NOT NULL,
  score integer NOT NULL DEFAULT 0, total integer NOT NULL DEFAULT 0,
  taken_at timestamptz NOT NULL DEFAULT now(),
  mistakes jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assess_theory_runs TO authenticated;
GRANT ALL ON public.assess_theory_runs TO service_role;
ALTER TABLE public.assess_theory_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "atr_owner" ON public.assess_theory_runs FOR ALL TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.assess_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL, question_id uuid, section public.theory_section,
  wrong_count integer NOT NULL DEFAULT 1,
  last_wrong_at timestamptz NOT NULL DEFAULT now(),
  mastered_at timestamptz,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (student_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assess_review_queue TO authenticated;
GRANT ALL ON public.assess_review_queue TO service_role;
ALTER TABLE public.assess_review_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arq_owner" ON public.assess_review_queue FOR ALL TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.vrp_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL, ref_point_key text NOT NULL,
  stage public.progress_stage NOT NULL DEFAULT 'not_started',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, ref_point_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vrp_status TO authenticated;
GRANT ALL ON public.vrp_status TO service_role;
ALTER TABLE public.vrp_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vrp_owner_read" ON public.vrp_status FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "vrp_staff_write" ON public.vrp_status FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE TRIGGER trg_vrp_updated BEFORE UPDATE ON public.vrp_status
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

CREATE TABLE IF NOT EXISTS public.manoeuvre_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL, manoeuvre_key text NOT NULL,
  stage public.progress_stage NOT NULL DEFAULT 'not_started',
  attempts integer NOT NULL DEFAULT 0, last_result text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, manoeuvre_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manoeuvre_status TO authenticated;
GRANT ALL ON public.manoeuvre_status TO service_role;
ALTER TABLE public.manoeuvre_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mvr_owner_read" ON public.manoeuvre_status FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "mvr_staff_write" ON public.manoeuvre_status FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE TRIGGER trg_mvr_updated BEFORE UPDATE ON public.manoeuvre_status
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

-- Calendar & planner
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL, instructor_id uuid,
  kind public.calendar_event_kind NOT NULL DEFAULT 'lesson',
  starts_at timestamptz NOT NULL, ends_at timestamptz,
  location text, notes text,
  status public.calendar_event_status NOT NULL DEFAULT 'scheduled',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cev_owner_read" ON public.calendar_events FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "cev_staff_write" ON public.calendar_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE TRIGGER trg_cev_updated BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_cev_student_starts ON public.calendar_events(student_id, starts_at DESC);

CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id uuid REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  planned_topic_ids uuid[] NOT NULL DEFAULT '{}',
  objectives text, route_plan text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_plans TO authenticated;
GRANT ALL ON public.lesson_plans TO service_role;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lpl_owner_read" ON public.lesson_plans FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "lpl_staff_write" ON public.lesson_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE TRIGGER trg_lpl_updated BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

-- Achievements & certificates
CREATE TABLE IF NOT EXISTS public.achievement_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE, title text NOT NULL, description text,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  badge_asset_id uuid REFERENCES public.learning_assets(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievement_rules TO authenticated;
GRANT ALL ON public.achievement_rules TO service_role;
ALTER TABLE public.achievement_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar_read_auth" ON public.achievement_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "ar_admin_write" ON public.achievement_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ar_updated BEFORE UPDATE ON public.achievement_rules
  FOR EACH ROW EXECUTE FUNCTION public.gsm_set_updated_at();

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  kind public.certificate_kind NOT NULL,
  title text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  pdf_asset_id uuid REFERENCES public.learning_assets(id) ON DELETE SET NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cert_owner_read" ON public.certificates FOR SELECT TO authenticated
  USING (auth.uid()=student_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "cert_admin_write" ON public.certificates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Storage policies
CREATE POLICY "gsm_learning_assets_read_auth" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'learning-assets');
CREATE POLICY "gsm_learning_assets_admin_write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'learning-assets' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'learning-assets' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "gsm_progress_uploads_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'progress-uploads' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor')
  ));
CREATE POLICY "gsm_progress_uploads_staff_write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'progress-uploads' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor')))
  WITH CHECK (bucket_id = 'progress-uploads' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor')));

CREATE POLICY "gsm_certificates_owner_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'certificates' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor')
  ));
CREATE POLICY "gsm_certificates_admin_write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'certificates' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'certificates' AND public.has_role(auth.uid(),'admin'));

-- Seed modules
INSERT INTO public.learning_modules (slug, module_number, title, description, order_index) VALUES
  ('beginner', 1, 'Module 1 · Beginner', 'Foundations of driving: cockpit drill, controls, moving off and stopping, mirrors and basic manoeuvring.', 1),
  ('junctions', 2, 'Module 2 · Junctions', 'Every junction type: T-junctions, crossroads, roundabouts, traffic lights and box junctions.', 2),
  ('on-the-road', 3, 'Module 3 · On the Road', 'Real-world driving: meeting traffic, overtaking, dual carriageways, country roads, motorways, cyclists and weather.', 3),
  ('manoeuvres', 4, 'Module 4 · Manoeuvres', 'Test manoeuvres plus Extra Visuals: parking, bay parking, pulling up on the right, and reference points.', 4)
ON CONFLICT (slug) DO NOTHING;

-- Module 1 · Beginner (10 topics)
WITH m AS (SELECT id FROM public.learning_modules WHERE slug='beginner')
INSERT INTO public.learning_topics (module_id, slug, title, order_index, category, teaching_method_tags, estimated_minutes) VALUES
  ((SELECT id FROM m), 'dsssm-cockpit-drill', 'DSSSM · Cockpit Drill', 1, 'foundation', ARRAY['DSSSM'], 45),
  ((SELECT id FROM m), 'controls-instruments', 'Controls & Instruments', 2, 'foundation', ARRAY['GSM'], 30),
  ((SELECT id FROM m), 'moving-off-stopping', 'Moving Off & Stopping', 3, 'foundation', ARRAY['MSPSL','POM'], 60),
  ((SELECT id FROM m), 'safe-positioning', 'Safe Positioning', 4, 'foundation', ARRAY['BGO'], 30),
  ((SELECT id FROM m), 'mspsl-routine', 'Mirrors–Signal–Manoeuvre (MSPSL)', 5, 'foundation', ARRAY['MSPSL'], 45),
  ((SELECT id FROM m), 'steering', 'Steering', 6, 'foundation', ARRAY['GSM'], 30),
  ((SELECT id FROM m), 'clutch-control', 'Clutch Control', 7, 'foundation', ARRAY['GSM'], 45),
  ((SELECT id FROM m), 'changing-gears', 'Changing Gears', 8, 'foundation', ARRAY['GSM'], 30),
  ((SELECT id FROM m), 'emerging-basics', 'Emerging · T-Junction Basics', 9, 'foundation', ARRAY['MSPSL','POM'], 45),
  ((SELECT id FROM m), 'awareness-anticipation', 'Awareness & Anticipation', 10, 'foundation', ARRAY['15-70-15'], 45)
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module 2 · Junctions (10 topics)
WITH m AS (SELECT id FROM public.learning_modules WHERE slug='junctions')
INSERT INTO public.learning_topics (module_id, slug, title, order_index, category, teaching_method_tags, estimated_minutes) VALUES
  ((SELECT id FROM m), 't-junctions', 'T-Junctions', 1, 'junctions', ARRAY['MSPSL','POM'], 60),
  ((SELECT id FROM m), 'y-junctions', 'Y-Junctions', 2, 'junctions', ARRAY['MSPSL'], 30),
  ((SELECT id FROM m), 'crossroads', 'Crossroads', 3, 'junctions', ARRAY['MSPSL','POM'], 60),
  ((SELECT id FROM m), 'roundabouts', 'Roundabouts', 4, 'junctions', ARRAY['MSPSL','POM'], 60),
  ((SELECT id FROM m), 'mini-roundabouts', 'Mini Roundabouts', 5, 'junctions', ARRAY['MSPSL','POM'], 30),
  ((SELECT id FROM m), 'multi-lane-roundabouts', 'Multi-Lane Roundabouts', 6, 'junctions', ARRAY['MSPSL','POM'], 45),
  ((SELECT id FROM m), 'traffic-lights', 'Traffic Lights', 7, 'junctions', ARRAY['MSPSL','15-70-15'], 45),
  ((SELECT id FROM m), 'box-junctions', 'Box Junctions', 8, 'junctions', ARRAY['MSPSL'], 30),
  ((SELECT id FROM m), 'yellow-box-junctions', 'Yellow Box Junctions', 9, 'junctions', ARRAY['MSPSL'], 20),
  ((SELECT id FROM m), 'filter-lanes', 'Filter Lanes', 10, 'junctions', ARRAY['MSPSL'], 30)
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module 3 · On the Road (12 topics)
WITH m AS (SELECT id FROM public.learning_modules WHERE slug='on-the-road')
INSERT INTO public.learning_topics (module_id, slug, title, order_index, category, teaching_method_tags, estimated_minutes) VALUES
  ((SELECT id FROM m), 'meeting-traffic', 'Meeting Traffic', 1, 'road', ARRAY['MSPSL','15-70-15'], 45),
  ((SELECT id FROM m), 'overtaking', 'Overtaking', 2, 'road', ARRAY['MSPSL'], 45),
  ((SELECT id FROM m), 'pedestrian-crossings', 'Pedestrian Crossings', 3, 'road', ARRAY['Plan-to-Stop'], 45),
  ((SELECT id FROM m), 'dual-carriageways', 'Dual Carriageways', 4, 'road', ARRAY['MSPSL'], 60),
  ((SELECT id FROM m), 'country-roads', 'Country Roads', 5, 'road', ARRAY['15-70-15'], 45),
  ((SELECT id FROM m), 'urban-driving', 'Urban Driving', 6, 'road', ARRAY['BGO','15-70-15'], 60),
  ((SELECT id FROM m), 'motorway-driving', 'Motorway Driving', 7, 'road', ARRAY['MSPSL'], 60),
  ((SELECT id FROM m), 'cyclists-vulnerable-users', 'Cyclists & Vulnerable Users', 8, 'road', ARRAY['BGO'], 30),
  ((SELECT id FROM m), 'bad-weather', 'Bad Weather', 9, 'road', ARRAY['15-70-15'], 30),
  ((SELECT id FROM m), 'night-driving', 'Night Driving', 10, 'road', ARRAY['15-70-15'], 30),
  ((SELECT id FROM m), 'speed-positioning', 'Speed & Positioning', 11, 'road', ARRAY['BGO'], 30),
  ((SELECT id FROM m), 'independent-driving', 'Independent Driving', 12, 'road', ARRAY['MSPSL'], 60)
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module 4 · Manoeuvres (5 topics + Extra Visuals)
WITH m AS (SELECT id FROM public.learning_modules WHERE slug='manoeuvres')
INSERT INTO public.learning_topics (module_id, slug, title, order_index, category, teaching_method_tags, estimated_minutes) VALUES
  ((SELECT id FROM m), 'parallel-park', 'Parallel Park', 1, 'manoeuvre', ARRAY['POM','VRP'], 45),
  ((SELECT id FROM m), 'bay-park-forward', 'Bay Park · Forward', 2, 'manoeuvre', ARRAY['POM','VRP'], 30),
  ((SELECT id FROM m), 'bay-park-reverse', 'Bay Park · Reverse', 3, 'manoeuvre', ARRAY['POM','VRP'], 45),
  ((SELECT id FROM m), 'pull-up-right-reverse', 'Pull Up on the Right & Reverse', 4, 'manoeuvre', ARRAY['POM','VRP'], 30),
  ((SELECT id FROM m), 'turn-in-the-road', 'Turn in the Road', 5, 'manoeuvre', ARRAY['POM','VRP'], 30),
  ((SELECT id FROM m), 'extra-visuals', 'Extra Visuals · Reference Points Library', 6, 'visual', ARRAY['VRP'], 30)
ON CONFLICT (module_id, slug) DO NOTHING;
