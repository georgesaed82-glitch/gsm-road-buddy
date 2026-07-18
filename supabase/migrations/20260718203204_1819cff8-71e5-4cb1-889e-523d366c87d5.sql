-- Simplify learner UPDATE policy; the actual field-lock is enforced by a trigger
DROP POLICY IF EXISTS "own bookings update pickup only" ON public.lesson_bookings;
CREATE POLICY "own bookings update"
  ON public.lesson_bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.lesson_bookings_lock_learner_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins can change anything; skip the lock
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  -- Service role / internal (no JWT) bypasses this guard
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.user_id          IS DISTINCT FROM OLD.user_id
     OR NEW.instructor_name  IS DISTINCT FROM OLD.instructor_name
     OR NEW.scheduled_at     IS DISTINCT FROM OLD.scheduled_at
     OR NEW.duration_minutes IS DISTINCT FROM OLD.duration_minutes
     OR NEW.status           IS DISTINCT FROM OLD.status
     OR NEW.instructor_notes IS DISTINCT FROM OLD.instructor_notes
     OR NEW.skills_covered   IS DISTINCT FROM OLD.skills_covered
     OR NEW.rating           IS DISTINCT FROM OLD.rating THEN
    RAISE EXCEPTION 'permission denied: learners can only edit pickup_location';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.lesson_bookings_lock_learner_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tr_lesson_bookings_lock_learner_fields ON public.lesson_bookings;
CREATE TRIGGER tr_lesson_bookings_lock_learner_fields
  BEFORE UPDATE ON public.lesson_bookings
  FOR EACH ROW EXECUTE FUNCTION public.lesson_bookings_lock_learner_fields();