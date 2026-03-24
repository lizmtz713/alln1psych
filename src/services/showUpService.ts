/**
 * How to Show Up for Me — Supabase invites, responses, summaries.
 */
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import type {
  ShowUpAnswers,
  ShowUpInviteRow,
  ShowUpResponseRow,
  ShowUpSummaryRow,
} from '../types/showUp';
import { generateShowUpPreferenceSummary } from './showUpAI';

const INVITE_TTL_DAYS = 30;

async function randomUrlToken(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += chars[bytes[i]! % chars.length];
  }
  return s;
}

function appBaseUrl(): string {
  return (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_APP_URL) || 'https://alln1psych.com';
}

/** Public site / web root (for pass-along growth copy). */
export function getShowUpMarketingBaseUrl(): string {
  return appBaseUrl().replace(/\/$/, '');
}

export function getShowUpPublicUrl(token: string): string {
  const base = getShowUpMarketingBaseUrl();
  return `${base}/show-up/${token}`;
}

/**
 * Message guests can copy or share to spread the idea (they don't have an invite link for others).
 * Keeps tone human, not spammy.
 */
export function getGuestPassAlongShareMessage(): string {
  const base = getShowUpMarketingBaseUrl();
  return `I just shared how I like people to show up for me — about 2 minutes, no app. It felt really thoughtful.

If you want something like that with someone who cares about you, InGauge helps people understand each other better: ${base}`;
}

/** One-line highlight for inviter "light reward" card after someone completes. */
export function buildInviterHighlightLine(summary: ShowUpSummaryRow): string {
  const bullets = Array.isArray(summary.best_ways_to_show_up)
    ? (summary.best_ways_to_show_up as string[]).filter(Boolean).slice(0, 2)
    : [];
  const easy = summary.easy_show_up_summary?.trim();
  if (bullets.length && easy) return `${bullets.join(' · ')} — plus: ${easy}`;
  if (easy) return easy;
  if (bullets.length) return bullets.join(' · ');
  const t = summary.summary_text?.trim();
  if (t) return t.length > 160 ? `${t.slice(0, 157)}…` : t;
  return 'Your summary is ready — scroll for details.';
}

/** Guest preview (anon). */
export async function rpcGetShowUpInvitePreview(token: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase.rpc('get_show_up_invite_preview', { p_token: token });
  if (error) {
    if (__DEV__) console.warn('[showUp] preview', error);
    return null;
  }
  return (data as Record<string, unknown>) ?? null;
}

/** Guest submit (anon). */
export async function rpcSubmitShowUpResponse(
  token: string,
  answers: ShowUpAnswers,
  responderPreferredName: string,
  consentPersonalization: boolean
): Promise<{ ok: boolean; responseId?: string; error?: string }> {
  const { data, error } = await supabase.rpc('submit_show_up_response', {
    p_token: token,
    p_answers: answers as unknown as Record<string, unknown>,
    p_responder_preferred_name: responderPreferredName || null,
    p_consent_personalization: consentPersonalization,
  });
  if (error) {
    if (__DEV__) console.warn('[showUp] submit', error);
    return { ok: false, error: error.message };
  }
  const row = data as { ok?: boolean; response_id?: string; error?: string } | null;
  if (!row?.ok) return { ok: false, error: String(row?.error ?? 'unknown') };
  return { ok: true, responseId: row.response_id };
}

export async function expireActiveInvitesForPerson(ownerUserId: string, personId: string): Promise<void> {
  await supabase
    .from('show_up_invites')
    .update({ status: 'expired' })
    .eq('owner_user_id', ownerUserId)
    .eq('person_id', personId)
    .eq('status', 'active');
}

export async function createShowUpInvite(params: {
  ownerUserId: string;
  personId: string;
  personDisplayName: string;
  inviterDisplayName: string;
}): Promise<{ invite: ShowUpInviteRow; url: string } | null> {
  const token = await randomUrlToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + INVITE_TTL_DAYS);

  await expireActiveInvitesForPerson(params.ownerUserId, params.personId);

  const { data, error } = await supabase
    .from('show_up_invites')
    .insert({
      owner_user_id: params.ownerUserId,
      person_id: params.personId,
      token,
      status: 'active',
      inviter_display_name: params.inviterDisplayName.trim() || 'Someone',
      person_display_name: params.personDisplayName.trim() || null,
      expires_at: expires.toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    if (__DEV__) console.warn('[showUp] create invite', error);
    return null;
  }

  return {
    invite: data as unknown as ShowUpInviteRow,
    url: getShowUpPublicUrl(token),
  };
}

export async function fetchLatestResponseForPerson(
  ownerUserId: string,
  personId: string
): Promise<ShowUpResponseRow | null> {
  const { data, error } = await supabase
    .from('show_up_responses')
    .select('*')
    .eq('owner_user_id', ownerUserId)
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (__DEV__) console.warn('[showUp] fetch response', error);
    return null;
  }
  if (!data) return null;
  return {
    ...data,
    answers: (data.answers as ShowUpAnswers) ?? {},
  } as ShowUpResponseRow;
}

export async function fetchSummaryForResponse(
  ownerUserId: string,
  responseId: string
): Promise<ShowUpSummaryRow | null> {
  const { data, error } = await supabase
    .from('show_up_summaries')
    .select('*')
    .eq('owner_user_id', ownerUserId)
    .eq('response_id', responseId)
    .maybeSingle();

  if (error) {
    if (__DEV__) console.warn('[showUp] fetch summary', error);
    return null;
  }
  return data as ShowUpSummaryRow | null;
}

export async function fetchLatestSummaryForPerson(
  ownerUserId: string,
  personId: string
): Promise<{ response: ShowUpResponseRow; summary: ShowUpSummaryRow | null } | null> {
  const response = await fetchLatestResponseForPerson(ownerUserId, personId);
  if (!response) return null;
  const summary = await fetchSummaryForResponse(ownerUserId, response.id);
  return { response, summary };
}

/** One-line hint for Reach Out / Tone Check. */
export function buildShowUpToneHint(summary: ShowUpSummaryRow | null): string | null {
  if (!summary) return null;
  const parts: string[] = [];
  if (summary.communication_style_summary) parts.push(summary.communication_style_summary);
  if (summary.repair_style_summary) parts.push(summary.repair_style_summary);
  if (summary.easy_show_up_summary) parts.push(summary.easy_show_up_summary);
  if (parts.length === 0 && summary.summary_text) return summary.summary_text.slice(0, 200);
  return parts.slice(0, 2).join(' ');
}

export async function ensureSummaryForLatestResponse(
  ownerUserId: string,
  personId: string
): Promise<ShowUpSummaryRow | null> {
  const response = await fetchLatestResponseForPerson(ownerUserId, personId);
  if (!response) return null;

  const existing = await fetchSummaryForResponse(ownerUserId, response.id);
  if (existing) return existing;

  const ai = await generateShowUpPreferenceSummary(response.answers, response.responder_preferred_name ?? undefined);
  if (!ai) return null;

  const { data, error } = await supabase
    .from('show_up_summaries')
    .insert({
      owner_user_id: ownerUserId,
      person_id: personId,
      response_id: response.id,
      summary_text: ai.summaryBlurb,
      best_ways_to_show_up: ai.bestWaysToShowUp,
      stress_help: ai.stressHelp,
      avoid: ai.avoid,
      communication_style_summary: ai.communicationStyle,
      repair_style_summary: ai.repairStyle,
      easy_show_up_summary: ai.easyWayToShowUp,
      important_dates_note: ai.importantDates ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    if (__DEV__) console.warn('[showUp] insert summary', error);
    return null;
  }
  return data as ShowUpSummaryRow;
}
