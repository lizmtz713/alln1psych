/**
 * How to Show Up for Me — guest questionnaire + inviter summaries.
 * See docs/SHOW_UP_FOR_ME_MVP.md
 */

export type ShowUpContactMethod = 'text' | 'call' | 'voice_note' | 'email' | 'in_person' | 'depends';

export interface ShowUpAnswers {
  preferredName?: string;
  contactMethod?: ShowUpContactMethod;
  contactDependsNote?: string;
  checkInStyle?: string[];
  stressSupport?: string[];
  stressAvoid?: string[];
  appreciation?: string[];
  easyShowUp?: string;
  importantDatesKind?: 'birthday' | 'hard_season' | 'anniversary' | 'not_now';
  importantDatesDetail?: string;
  additionalNotes?: string;
  consentPersonalization?: boolean;
  /** Optional deeper section */
  communicationStyle?: string;
  repairPreference?: string;
  repairBarriers?: string[];
  contactFrequency?: string;
  invitationStyle?: string[];
}

export interface ShowUpInviteRow {
  id: string;
  owner_user_id: string;
  person_id: string;
  token: string;
  status: 'active' | 'completed' | 'expired';
  inviter_display_name: string;
  person_display_name: string | null;
  created_at: string;
  expires_at: string;
  last_opened_at: string | null;
  completed_at: string | null;
}

export interface ShowUpResponseRow {
  id: string;
  owner_user_id: string;
  person_id: string;
  invite_id: string;
  answers: ShowUpAnswers;
  responder_preferred_name: string | null;
  consent_personalization: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ShowUpSummaryRow {
  id: string;
  owner_user_id: string;
  person_id: string;
  response_id: string;
  summary_text: string | null;
  best_ways_to_show_up: unknown;
  stress_help: unknown;
  avoid: unknown;
  communication_style_summary: string | null;
  repair_style_summary: string | null;
  easy_show_up_summary: string | null;
  important_dates_note: string | null;
  generated_at: string;
}

export interface ShowUpPreferenceSummaryResult {
  bestWaysToShowUp: string[];
  stressHelp: string[];
  avoid: string[];
  communicationStyle: string;
  repairStyle: string;
  easyWayToShowUp: string;
  importantDates?: string;
  summaryBlurb: string;
}
