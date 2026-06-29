ALTER TABLE public.theory_progress
  ADD COLUMN IF NOT EXISTS best_score_pct integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_score_pct integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone NULL;