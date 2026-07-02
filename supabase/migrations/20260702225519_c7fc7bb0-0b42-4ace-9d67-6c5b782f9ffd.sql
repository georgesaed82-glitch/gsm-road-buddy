
CREATE TABLE public.skill_rating_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_key TEXT NOT NULL,
  rating SMALLINT NOT NULL,
  previous_rating SMALLINT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX skill_rating_history_user_skill_idx
  ON public.skill_rating_history (user_id, skill_key, changed_at DESC);

GRANT SELECT, INSERT ON public.skill_rating_history TO authenticated;
GRANT ALL ON public.skill_rating_history TO service_role;

ALTER TABLE public.skill_rating_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own rating history"
  ON public.skill_rating_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own rating history"
  ON public.skill_rating_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.log_skill_rating_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.rating IS NOT DISTINCT FROM OLD.rating THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.skill_rating_history (user_id, skill_key, rating, previous_rating)
  VALUES (
    NEW.user_id,
    NEW.skill_key,
    NEW.rating,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.rating ELSE NULL END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS skill_ratings_log_history ON public.skill_ratings;
CREATE TRIGGER skill_ratings_log_history
AFTER INSERT OR UPDATE ON public.skill_ratings
FOR EACH ROW EXECUTE FUNCTION public.log_skill_rating_change();
