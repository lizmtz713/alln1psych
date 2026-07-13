-- Your Story / Identity profile columns (synced from app)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cultural_background_text text,
  ADD COLUMN IF NOT EXISTS family_structure text,
  ADD COLUMN IF NOT EXISTS language_of_emotion text,
  ADD COLUMN IF NOT EXISTS strength_meaning text,
  ADD COLUMN IF NOT EXISTS environment_upbringing text,
  ADD COLUMN IF NOT EXISTS therapy_experience text;

COMMENT ON COLUMN public.profiles.cultural_background_text IS 'Free-text cultural identity (e.g. Mexican-American, first-gen)';
COMMENT ON COLUMN public.profiles.family_structure IS 'Who raised you (e.g. Single mom, Two parents)';
COMMENT ON COLUMN public.profiles.language_of_emotion IS 'Language user thinks/feels in (e.g. English, Spanish, Both)';
COMMENT ON COLUMN public.profiles.strength_meaning IS 'What "being strong" meant in their family';
COMMENT ON COLUMN public.profiles.environment_upbringing IS 'Comma-separated (e.g. Religious household, Low-income)';
COMMENT ON COLUMN public.profiles.therapy_experience IS 'never | tried-it | currently | positive | negative';
