
CREATE TABLE public.skill_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_key TEXT NOT NULL,
  rating SMALLINT NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_ratings TO authenticated;
GRANT ALL ON public.skill_ratings TO service_role;

ALTER TABLE public.skill_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own skill ratings"
  ON public.skill_ratings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all skill ratings"
  ON public.skill_ratings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all skill ratings"
  ON public.skill_ratings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_skill_ratings_updated_at
  BEFORE UPDATE ON public.skill_ratings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
