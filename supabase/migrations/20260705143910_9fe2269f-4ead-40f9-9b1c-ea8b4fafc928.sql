
CREATE TABLE public.theory_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id TEXT UNIQUE,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL DEFAULT '',
  option_explanations TEXT[] NOT NULL DEFAULT '{}',
  image_path TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT theory_questions_difficulty_check CHECK (difficulty IN ('easy','medium','hard')),
  CONSTRAINT theory_questions_correct_index_check CHECK (correct_index >= 0)
);

CREATE INDEX theory_questions_category_idx ON public.theory_questions(category);
CREATE INDEX theory_questions_published_idx ON public.theory_questions(is_published);
CREATE INDEX theory_questions_sort_idx ON public.theory_questions(sort_order);

GRANT SELECT ON public.theory_questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.theory_questions TO authenticated;
GRANT ALL ON public.theory_questions TO service_role;

ALTER TABLE public.theory_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published theory questions"
  ON public.theory_questions FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert theory questions"
  ON public.theory_questions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update theory questions"
  ON public.theory_questions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete theory questions"
  ON public.theory_questions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER theory_questions_updated_at
  BEFORE UPDATE ON public.theory_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.theory_questions
  (source_id, category, question, options, correct_index, explanation, option_explanations, is_published, sort_order)
SELECT
  o.question_id,
  COALESCE(split_part(o.question_id, '-', 1), 'general'),
  o.question,
  ARRAY(SELECT jsonb_array_elements_text(o.options))::text[],
  o.correct_index,
  o.explanation,
  ARRAY(SELECT jsonb_array_elements_text(o.option_explanations))::text[],
  true,
  0
FROM public.theory_question_overrides o
ON CONFLICT (source_id) DO NOTHING;
