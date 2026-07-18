DROP POLICY IF EXISTS "Anyone can read theory overrides" ON public.theory_question_overrides;
CREATE POLICY "Admins can read theory overrides"
  ON public.theory_question_overrides
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));