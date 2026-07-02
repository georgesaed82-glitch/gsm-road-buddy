CREATE TABLE public.user_mistakes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_mistakes TO authenticated;
GRANT ALL ON public.user_mistakes TO service_role;

ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own mistakes"
  ON public.user_mistakes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own mistakes"
  ON public.user_mistakes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own mistakes"
  ON public.user_mistakes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX user_mistakes_user_id_idx ON public.user_mistakes (user_id);
