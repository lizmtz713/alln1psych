/**
 * Supabase database service. All reads/writes go through here.
 * Stores remain the source of truth for UI; this layer persists to Supabase.
 */

import { supabase } from '../lib/supabase';

// --- Profile (matches public.profiles) ---
export interface DbProfile {
  id: string;
  name: string;
  pronouns: string | null;
  age_group: string | null;
  communication_preference: string | null;
  love_language: string | null;
  onboarding_completed: boolean;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as DbProfile;
}

export async function updateProfile(
  userId: string,
  data: Partial<Omit<DbProfile, 'id' | 'created_at'>>
): Promise<{ error: Error | null }> {
  const row: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  return { error: error ? new Error(error.message) : null };
}

export interface OnboardingData {
  name: string;
  pronouns?: string | null;
  age_group: string | null;
  communication_preference: string | null;
  love_language: string | null;
}

export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<{ error: Error | null }> {
  const row = {
    name: data.name,
    pronouns: data.pronouns ?? null,
    age_group: data.age_group,
    communication_preference: data.communication_preference,
    love_language: data.love_language,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  return { error: error ? new Error(error.message) : null };
}

// --- Conversations ---
export async function createConversation(
  userId: string,
  mode: 'voice' | 'text' | 'mixed'
): Promise<{ id: string } | { error: Error }> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, mode })
    .select('id')
    .single();
  if (error || !data) return { error: new Error(error?.message ?? 'Failed to create conversation') };
  return { id: data.id };
}

export async function addMessage(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  isVoice: boolean
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content,
    is_voice: isVoice,
  });
  return { error: error ? new Error(error.message) : null };
}

export interface ConversationWithMessages {
  id: string;
  started_at: string;
  mode: string | null;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    is_voice: boolean;
    created_at: string;
  }>;
}

export async function getRecentConversations(
  userId: string,
  limit: number
): Promise<ConversationWithMessages[]> {
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('id, started_at, mode')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error || !convs?.length) return [];
  const ids = convs.map((c) => c.id);
  const { data: msgs } = await supabase
    .from('messages')
    .select('conversation_id, id, role, content, is_voice, created_at')
    .in('conversation_id', ids)
    .order('created_at', { ascending: true });
  const byConv: Record<string, ConversationWithMessages['messages']> = {};
  convs.forEach((c) => { byConv[c.id] = []; });
  msgs?.forEach((m) => {
    if (byConv[m.conversation_id]) {
      byConv[m.conversation_id].push({
        id: m.id,
        role: m.role,
        content: m.content,
        is_voice: m.is_voice,
        created_at: m.created_at,
      });
    }
  });
  return convs.map((c) => ({
    id: c.id,
    started_at: c.started_at,
    mode: c.mode,
    messages: byConv[c.id] ?? [],
  }));
}

// --- Mood & Temperature ---
export async function addMoodCheckin(
  userId: string,
  mood: string,
  label: string,
  note?: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('mood_checkins').insert({
    user_id: userId,
    mood,
    mood_label: label,
    note: note ?? null,
  });
  if (error) return { error: new Error(error.message) };
  const { error: tempErr } = await supabase
    .from('temperature')
    .update({
      current_temp: mood,
      temp_label: label,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  return { error: tempErr ? new Error(tempErr.message) : null };
}

export async function getTemperature(userId: string): Promise<{
  current_temp: string;
  temp_label: string;
  note: string | null;
} | null> {
  const { data, error } = await supabase
    .from('temperature')
    .select('current_temp, temp_label, note')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data;
}

export async function updateTemperature(
  userId: string,
  temp: string,
  label: string,
  note?: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('temperature')
    .update({
      current_temp: temp,
      temp_label: label,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  return { error: error ? new Error(error.message) : null };
}

export async function getMoodHistory(
  userId: string,
  days: number
): Promise<Array<{ id: string; mood: string; mood_label: string; note: string | null; created_at: string }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('mood_checkins')
    .select('id, mood, mood_label, note, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as Array<{ id: string; mood: string; mood_label: string; note: string | null; created_at: string }>;
}

// --- Circle ---
export interface CircleMemberInput {
  member_name: string;
  relationship: string;
  contact_method?: string;
  sharing_level?: 'full' | 'limited';
}

export async function getCircleMembers(userId: string): Promise<Array<{
  id: string;
  member_name: string;
  relationship: string;
  contact_method: string | null;
  sharing_level: string;
  status: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('circles')
    .select('id, member_name, relationship, contact_method, sharing_level, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    member_name: string;
    relationship: string;
    contact_method: string | null;
    sharing_level: string;
    status: string;
    created_at: string;
  }>;
}

export async function addCircleMember(
  userId: string,
  member: CircleMemberInput
): Promise<{ id: string } | { error: Error }> {
  const { data, error } = await supabase
    .from('circles')
    .insert({
      user_id: userId,
      member_name: member.member_name,
      relationship: member.relationship,
      contact_method: member.contact_method ?? null,
      sharing_level: member.sharing_level ?? 'full',
    })
    .select('id')
    .single();
  if (error || !data) return { error: new Error(error?.message ?? 'Failed to add member') };
  return { id: data.id };
}

export async function removeCircleMember(circleId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('circles').delete().eq('id', circleId);
  return { error: error ? new Error(error.message) : null };
}

export async function getNudges(userId: string): Promise<Array<{
  id: string;
  member_name: string;
  message: string;
  read: boolean;
  acted_on: boolean;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('nudges')
    .select('id, member_name, message, read, acted_on, created_at')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    member_name: string;
    message: string;
    read: boolean;
    acted_on: boolean;
    created_at: string;
  }>;
}

// --- Journal ---
export async function getJournalEntries(
  userId: string,
  limit: number
): Promise<Array<{
  id: string;
  content: string;
  mood: string | null;
  source: string;
  conversation_id: string | null;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, content, mood, source, conversation_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    content: string;
    mood: string | null;
    source: string;
    conversation_id: string | null;
    created_at: string;
  }>;
}

export async function addJournalEntry(
  userId: string,
  content: string,
  options?: { mood?: string; source?: string; conversation_id?: string }
): Promise<{ id: string } | { error: Error }> {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      content,
      mood: options?.mood ?? null,
      source: options?.source ?? 'manual',
      conversation_id: options?.conversation_id ?? null,
    })
    .select('id')
    .single();
  if (error || !data) return { error: new Error(error?.message ?? 'Failed to add entry') };
  return { id: data.id };
}

export async function deleteJournalEntry(entryId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', entryId);
  return { error: error ? new Error(error.message) : null };
}

// --- Education ---
export async function getEducationProgress(userId: string): Promise<Array<{
  lesson_id: string;
  completed: boolean;
  reflection: string | null;
  completed_at: string | null;
}>> {
  const { data, error } = await supabase
    .from('education_progress')
    .select('lesson_id, completed, reflection, completed_at')
    .eq('user_id', userId);
  if (error) return [];
  return (data ?? []) as Array<{
    lesson_id: string;
    completed: boolean;
    reflection: string | null;
    completed_at: string | null;
  }>;
}

export async function completeLesson(
  userId: string,
  lessonId: string,
  reflection?: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('education_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      reflection: reflection ?? null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  );
  return { error: error ? new Error(error.message) : null };
}
