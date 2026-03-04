-- Comprehensive research-based profile (Identity, Origins, Experiences, How You Operate, What Gives Life, Sensitive, Open)
-- Arrays stored as JSONB for flexibility and querying.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ethnicity text,
  ADD COLUMN IF NOT EXISTS gender_identity text,
  ADD COLUMN IF NOT EXISTS sexual_orientation text,
  ADD COLUMN IF NOT EXISTS disability jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS disability_details text,
  ADD COLUMN IF NOT EXISTS body_relationship text,
  ADD COLUMN IF NOT EXISTS country_of_origin text,
  ADD COLUMN IF NOT EXISTS current_country text,
  ADD COLUMN IF NOT EXISTS languages_spoken jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS family_size text,
  ADD COLUMN IF NOT EXISTS birth_order text,
  ADD COLUMN IF NOT EXISTS socioeconomic_growing_up text,
  ADD COLUMN IF NOT EXISTS socioeconomic_current text,
  ADD COLUMN IF NOT EXISTS religious_background text,
  ADD COLUMN IF NOT EXISTS religious_current text,
  ADD COLUMN IF NOT EXISTS adverse_childhood_experiences jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS significant_life_experiences jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS education_experience text,
  ADD COLUMN IF NOT EXISTS communication_style_direct smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS communication_style_emotional smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conflict_style text,
  ADD COLUMN IF NOT EXISTS energy_pattern text,
  ADD COLUMN IF NOT EXISTS introvert_extrovert text,
  ADD COLUMN IF NOT EXISTS identify_as jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS what_brings_meaning jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_life_stage text,
  ADD COLUMN IF NOT EXISTS relationship_status text,
  ADD COLUMN IF NOT EXISTS parenting_status text,
  ADD COLUMN IF NOT EXISTS sensitive_topics_custom jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS triggers_to_avoid text,
  ADD COLUMN IF NOT EXISTS what_makes_you_different text,
  ADD COLUMN IF NOT EXISTS learning_style text;

COMMENT ON COLUMN public.profiles.ethnicity IS 'Ethnic/racial identity (free text + options)';
COMMENT ON COLUMN public.profiles.gender_identity IS 'Woman, Man, Non-binary, etc.';
COMMENT ON COLUMN public.profiles.disability IS 'JSON array: Physical, Chronic illness, Neurodivergent, etc.';
COMMENT ON COLUMN public.profiles.body_relationship IS 'Comfortable, Working on it, Complicated, etc.';
COMMENT ON COLUMN public.profiles.languages_spoken IS 'JSON array of languages';
COMMENT ON COLUMN public.profiles.adverse_childhood_experiences IS 'ACEs: JSON array';
COMMENT ON COLUMN public.profiles.identify_as IS 'Athlete, Artist, Caregiver, etc. JSON array';
COMMENT ON COLUMN public.profiles.what_brings_meaning IS 'Family, Career, Creativity, etc. JSON array';
