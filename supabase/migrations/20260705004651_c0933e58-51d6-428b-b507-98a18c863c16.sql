
CREATE TABLE public.theory_question_overrides (
  question_id text PRIMARY KEY,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index int NOT NULL,
  explanation text NOT NULL,
  option_explanations jsonb NOT NULL,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.theory_question_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.theory_question_overrides TO authenticated;
GRANT ALL ON public.theory_question_overrides TO service_role;

ALTER TABLE public.theory_question_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read theory overrides"
  ON public.theory_question_overrides
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert theory overrides"
  ON public.theory_question_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update theory overrides"
  ON public.theory_question_overrides
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete theory overrides"
  ON public.theory_question_overrides
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER theory_overrides_set_updated_at
  BEFORE UPDATE ON public.theory_question_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
