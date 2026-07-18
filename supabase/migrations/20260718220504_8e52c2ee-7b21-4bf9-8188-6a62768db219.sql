-- Allow students to record and update their own topic progress
CREATE POLICY "pst_owner_write"
  ON public.progress_student_topics
  FOR ALL
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);