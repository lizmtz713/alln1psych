/**
 * Comprehensive profile — load/save research-based profile fields to Supabase.
 * Complements userStoryService with the full extended profile (Identity, Origins,
 * Experiences, How You Operate, What Gives Life, Sensitive, Open).
 */

import { supabase } from '../lib/supabase';

export interface ExtendedProfileData {
  cultural_background_text?: string | null;
  family_structure?: string | null;
  language_of_emotion?: string | null;
  strength_meaning?: string | null;
  environment_upbringing?: string | null;
  therapy_experience?: string | null;
  learning_style?: string | null;
  love_language?: string | null;
  ethnicity?: string | null;
  gender_identity?: string | null;
  sexual_orientation?: string | null;
  disability?: string[] | null;
  disability_details?: string | null;
  body_relationship?: string | null;
  country_of_origin?: string | null;
  current_country?: string | null;
  languages_spoken?: string[] | null;
  family_size?: string | null;
  birth_order?: string | null;
  socioeconomic_growing_up?: string | null;
  socioeconomic_current?: string | null;
  religious_background?: string | null;
  religious_current?: string | null;
  adverse_childhood_experiences?: string[] | null;
  significant_life_experiences?: string[] | null;
  education_level?: string | null;
  education_experience?: string | null;
  communication_style_direct?: number | null;
  communication_style_emotional?: number | null;
  conflict_style?: string | null;
  energy_pattern?: string | null;
  introvert_extrovert?: string | null;
  identify_as?: string[] | null;
  what_brings_meaning?: string[] | null;
  current_life_stage?: string | null;
  relationship_status?: string | null;
  parenting_status?: string | null;
  sensitive_topics_custom?: string[] | null;
  triggers_to_avoid?: string | null;
  what_makes_you_different?: string | null;
}

/** For updates, environment_upbringing can be string[] (from store); we save as comma-separated text. */
function toDbRow(data: ExtendedProfileData & { environment_upbringing?: string | string[] | null }): Record<string, unknown> {
  const row: Record<string, unknown> = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  const env = (data as any).environment_upbringing;
  if (Array.isArray(env)) {
    row.environment_upbringing = env.length ? env.join(', ') : null;
  }
  return row;
}

export async function updateExtendedProfile(
  userId: string,
  data: ExtendedProfileData
): Promise<{ error: Error | null }> {
  const row = toDbRow(data);
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  return { error: error ? new Error(error.message) : null };
}

export async function loadExtendedProfile(userId: string): Promise<ExtendedProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'cultural_background_text, family_structure, language_of_emotion, strength_meaning, environment_upbringing, therapy_experience, learning_style, ethnicity, gender_identity, sexual_orientation, disability, disability_details, body_relationship, country_of_origin, current_country, languages_spoken, family_size, birth_order, socioeconomic_growing_up, socioeconomic_current, religious_background, religious_current, adverse_childhood_experiences, significant_life_experiences, education_level, education_experience, communication_style_direct, communication_style_emotional, conflict_style, energy_pattern, introvert_extrovert, identify_as, what_brings_meaning, current_life_stage, relationship_status, parenting_status, sensitive_topics_custom, triggers_to_avoid, what_makes_you_different'
    )
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  const raw = data as Record<string, unknown>;
  // environment_upbringing: DB text -> string[]
  const env = raw.environment_upbringing;
  if (typeof env === 'string') {
    raw.environment_upbringing = env ? env.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  }
  return raw as ExtendedProfileData;
}
