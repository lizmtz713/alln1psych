/**
 * Friend Survey Service
 * 
 * Allows users to send surveys to friends who don't have the app.
 * Friends fill out preferences (love language, communication style, etc.)
 * and responses are synced back to the Light profile.
 */

import { supabase } from '../lib/supabase';
import { useLightsStore } from '../stores/lightsStore';
import type { Light } from '../types/lights';

// ============================================
// Types
// ============================================

export interface SurveyLink {
  id: string;
  lightId: string;
  token: string;
  url: string;
  friendName: string;
  senderName: string;
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  isActive: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyLinkId: string;
  loveLanguage?: string;
  loveLanguageNotes?: string;
  commPreference?: string;
  contactFrequency?: string;
  supportStyle?: string;
  celebrationStyle?: string;
  birthday?: string;
  wishList?: string;
  additionalNotes?: string;
  createdAt: Date;
}

export interface CreateSurveyParams {
  lightId: string;
  friendName: string;
  senderName?: string;
}

// ============================================
// Create Survey Link
// ============================================

export async function createFriendSurvey(params: CreateSurveyParams): Promise<{
  success: boolean;
  url?: string;
  token?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('create-friend-survey', {
      body: {
        lightId: params.lightId,
        friendName: params.friendName,
        senderName: params.senderName,
      },
    });

    if (error) {
      console.error('[FriendSurvey] Create error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Unknown error' };
    }

    return {
      success: true,
      url: data.url,
      token: data.token,
    };
  } catch (err) {
    console.error('[FriendSurvey] Create exception:', err);
    return { success: false, error: 'Failed to create survey' };
  }
}

// ============================================
// Get User's Survey Links
// ============================================

export async function getMySurveyLinks(): Promise<SurveyLink[]> {
  try {
    const { data, error } = await supabase
      .from('friend_survey_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FriendSurvey] Fetch links error:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      lightId: row.light_id,
      token: row.token,
      url: `https://getingauge.com/s/${row.token}`,
      friendName: row.friend_name,
      senderName: row.sender_name,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      isActive: row.is_active,
    }));
  } catch (err) {
    console.error('[FriendSurvey] Fetch links exception:', err);
    return [];
  }
}

// ============================================
// Get Survey Responses
// ============================================

export async function getSurveyResponses(): Promise<SurveyResponse[]> {
  try {
    const { data, error } = await supabase
      .from('friend_survey_responses')
      .select(`
        *,
        friend_survey_links!inner(light_id, friend_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FriendSurvey] Fetch responses error:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      surveyLinkId: row.survey_link_id,
      loveLanguage: row.love_language,
      loveLanguageNotes: row.love_language_notes,
      commPreference: row.comm_preference,
      contactFrequency: row.contact_frequency,
      supportStyle: row.support_style,
      celebrationStyle: row.celebration_style,
      birthday: row.birthday,
      wishList: row.wish_list,
      additionalNotes: row.additional_notes,
      createdAt: new Date(row.created_at),
    }));
  } catch (err) {
    console.error('[FriendSurvey] Fetch responses exception:', err);
    return [];
  }
}

// ============================================
// Get Response for Specific Light
// ============================================

export async function getSurveyResponseForLight(lightId: string): Promise<SurveyResponse | null> {
  try {
    const { data, error } = await supabase
      .from('friend_survey_responses')
      .select(`
        *,
        friend_survey_links!inner(light_id)
      `)
      .eq('friend_survey_links.light_id', lightId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      surveyLinkId: data.survey_link_id,
      loveLanguage: data.love_language,
      loveLanguageNotes: data.love_language_notes,
      commPreference: data.comm_preference,
      contactFrequency: data.contact_frequency,
      supportStyle: data.support_style,
      celebrationStyle: data.celebration_style,
      birthday: data.birthday,
      wishList: data.wish_list,
      additionalNotes: data.additional_notes,
      createdAt: new Date(data.created_at),
    };
  } catch (err) {
    console.error('[FriendSurvey] Get response for light error:', err);
    return null;
  }
}

// ============================================
// Sync Survey Response to Light Profile
// ============================================

export async function syncSurveyToLight(lightId: string): Promise<boolean> {
  try {
    const response = await getSurveyResponseForLight(lightId);
    if (!response) return false;

    const updateLight = useLightsStore.getState().updateLight;

    // Map survey responses to Light fields
    const updates: Partial<Light> = {};

    if (response.loveLanguage) {
      updates.loveLanguage = mapLoveLanguage(response.loveLanguage);
      if (response.loveLanguageNotes) {
        updates.loveLanguageNotes = response.loveLanguageNotes;
      }
    }

    if (response.commPreference) {
      updates.bestWayToConnect = mapCommPreference(response.commPreference);
    }

    if (response.supportStyle) {
      updates.whatTheyNeed = mapSupportStyle(response.supportStyle);
    }

    if (response.birthday) {
      updates.birthday = response.birthday;
    }

    if (response.wishList) {
      // Add to existing wish list or create new
      updates.giftIdeas = [response.wishList];
    }

    if (response.additionalNotes) {
      updates.notes = response.additionalNotes;
    }

    // Update the light
    updateLight(lightId, updates);

    return true;
  } catch (err) {
    console.error('[FriendSurvey] Sync to light error:', err);
    return false;
  }
}

// ============================================
// Helpers
// ============================================

function mapLoveLanguage(value: string): string {
  const map: Record<string, string> = {
    words: 'Words of Affirmation',
    time: 'Quality Time',
    help: 'Acts of Service',
    gifts: 'Receiving Gifts',
    touch: 'Physical Touch',
  };
  return map[value] || value;
}

function mapCommPreference(value: string): string {
  const map: Record<string, string> = {
    texts: 'Texts and messages',
    calls: 'Phone or video calls',
    in_person: 'In person hangouts',
    group: 'Group settings',
    mix: 'Mix of everything',
  };
  return map[value] || value;
}

function mapSupportStyle(value: string): string {
  const map: Record<string, string> = {
    listen: 'Just listen, don\'t try to fix it',
    distract: 'Distract me, do something fun',
    problem_solve: 'Help me think through it',
    check_in: 'Check in regularly, don\'t let me isolate',
    give_space: 'Give me space, I\'ll come to you when ready',
  };
  return map[value] || value;
}

// ============================================
// Generate Share Message
// ============================================

export function generateShareMessage(friendName: string, surveyUrl: string): string {
  return `Hey ${friendName}! 💜

I'm trying to be a better friend and understand how you like to connect. Mind filling out this quick survey? Takes 2 min, no app needed.

${surveyUrl}

Thanks! 🙏`;
}

// ============================================
// Check for New Responses (for notifications)
// ============================================

export async function checkForNewResponses(lastChecked: Date): Promise<{
  lightId: string;
  friendName: string;
}[]> {
  try {
    const { data, error } = await supabase
      .from('friend_survey_responses')
      .select(`
        id,
        created_at,
        friend_survey_links!inner(light_id, friend_name)
      `)
      .gt('created_at', lastChecked.toISOString());

    if (error || !data) return [];

    return data.map((row: any) => ({
      lightId: row.friend_survey_links.light_id,
      friendName: row.friend_survey_links.friend_name,
    }));
  } catch (err) {
    console.error('[FriendSurvey] Check new responses error:', err);
    return [];
  }
}
