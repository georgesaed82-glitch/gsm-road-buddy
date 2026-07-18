-- SKILL RATINGS: remove learner write, keep learner read
DROP POLICY IF EXISTS "Users manage own skill ratings" ON public.skill_ratings;
CREATE POLICY "Users read own skill ratings"
  ON public.skill_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins insert skill ratings"
  ON public.skill_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete skill ratings"
  ON public.skill_ratings
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- LESSON BOOKINGS: restrict learner UPDATE to safe fields only
DROP POLICY IF EXISTS "own bookings update" ON public.lesson_bookings;
CREATE POLICY "own bookings update pickup only"
  ON public.lesson_bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IS NOT DISTINCT FROM (SELECT b.status FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND instructor_notes IS NOT DISTINCT FROM (SELECT b.instructor_notes FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND skills_covered IS NOT DISTINCT FROM (SELECT b.skills_covered FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND rating IS NOT DISTINCT FROM (SELECT b.rating FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
  );
CREATE POLICY "Admins update all bookings"
  ON public.lesson_bookings
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));