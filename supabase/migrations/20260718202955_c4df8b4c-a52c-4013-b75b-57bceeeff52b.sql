DROP POLICY IF EXISTS "own bookings update pickup only" ON public.lesson_bookings;
CREATE POLICY "own bookings update pickup only"
  ON public.lesson_bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND instructor_name  IS NOT DISTINCT FROM (SELECT b.instructor_name  FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND scheduled_at     IS NOT DISTINCT FROM (SELECT b.scheduled_at     FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND duration_minutes IS NOT DISTINCT FROM (SELECT b.duration_minutes FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND status           IS NOT DISTINCT FROM (SELECT b.status           FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND instructor_notes IS NOT DISTINCT FROM (SELECT b.instructor_notes FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND skills_covered   IS NOT DISTINCT FROM (SELECT b.skills_covered   FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND rating           IS NOT DISTINCT FROM (SELECT b.rating           FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
    AND user_id          IS NOT DISTINCT FROM (SELECT b.user_id          FROM public.lesson_bookings b WHERE b.id = lesson_bookings.id)
  );