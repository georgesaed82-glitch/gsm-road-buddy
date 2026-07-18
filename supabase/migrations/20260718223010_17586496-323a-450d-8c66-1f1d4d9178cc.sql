CREATE TABLE IF NOT EXISTS public.progress_learning_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  last_block_id uuid,
  progress_pct int NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  quiz_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS progress_learning_lessons_student_idx
  ON public.progress_learning_lessons (student_id);
CREATE INDEX IF NOT EXISTS progress_learning_lessons_lesson_idx
  ON public.progress_learning_lessons (lesson_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_learning_lessons TO authenticated;
GRANT ALL ON public.progress_learning_lessons TO service_role;

ALTER TABLE public.progress_learning_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own lesson progress"
  ON public.progress_learning_lessons
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can view all lesson progress"
  ON public.progress_learning_lessons
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER progress_learning_lessons_set_updated_at
  BEFORE UPDATE ON public.progress_learning_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();