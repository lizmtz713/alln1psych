/**
 * Your Story — sync user profile story fields to Supabase and hydrate on load.
 */

import { supabase } from '../lib/supabase';

export interface UserStoryData {
  cultural_background_text?: string | null;
  family_structure?: string | null;
  language_of_emotion?: string | null;
  strength_meaning?: string | null;
  environment_upbringing?: string | null; // comma-separated
  therapy_experience?: string | null;
}

export async function updateUserStory(
  userId: string,
  data: UserStoryData
): Promise<{ error: Error | null }> {
  const row: Record<string, unknown> = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  return { error: error ? new Error(error.message) : null };
}

export async function loadUserStory(userId: string): Promise<UserStoryData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('cultural_background_text, family_structure, language_of_emotion, strength_meaning, environment_upbringing, therapy_experience')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as UserStoryData;
}
