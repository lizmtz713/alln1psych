/**
 * Rituals — Pre-Flight (morning) and Post-Flight (evening) types.
 * Used by ritualsStore and Flight Log aggregation.
 */

export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface PreFlightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sleepQuality: SleepQuality;
  morningFeeling: number; // 0-100
  intention: string;
  completedAt: string; // ISO
  /** Voice answer for sleep (optional) */
  sleepVoiceUri?: string;
  sleepVoiceDurationSec?: number;
  sleepTranscript?: string;
}

export type DayRating = 1 | 2 | 3 | 4 | 5;

export type IntentionHonored = 'yes' | 'partial' | 'no' | 'forgot';

export interface PostFlightEntry {
  id: string;
  date: string;
  dayRating: DayRating;
  wentWell: string;
  lettingGo: string;
  intentionHonored: IntentionHonored;
  tomorrowNote?: string;
  completedAt: string;

  /** Voice/score from "What was the highlight of today?" */
  highlightScore?: number;
  highlightText?: string;
  highlightVoiceUri?: string;
  highlightVoiceDurationSec?: number;
  highlightTranscript?: string;

  /** Voice/score from "Anything weighing on you?" (lower = more weight) */
  weighingScore?: number;
  weighingText?: string;
  weighingVoiceUri?: string;
  weighingVoiceDurationSec?: number;
  weighingTranscript?: string;

  /** "Who do you appreciate today?" (no score) */
  appreciateText?: string;
  appreciateVoiceUri?: string;
  appreciateVoiceDurationSec?: number;
  appreciateTranscript?: string;

  /** "How are you ending the day?" */
  endingScore?: number;
  endingVoiceUri?: string;
  endingVoiceDurationSec?: number;
  endingTranscript?: string;
}

export interface RitualsSettings {
  /** Enable morning Pre-Flight reminder */
  preFlightReminderEnabled: boolean;
  /** Morning reminder time (0-23 hour, 0-59 minute) */
  preFlightReminderHour: number;
  preFlightReminderMinute: number;
  /** Show calendar events in Pre-Flight heads up */
  showCalendarEvents: boolean;
  /** Show birthdays from Lights in Pre-Flight heads up */
  showBirthdays: boolean;
  /** Show cycle info in Pre-Flight heads up (if cycle enabled) */
  showCycleInfo: boolean;
  /** Enable evening Post-Flight reminder */
  postFlightReminderEnabled: boolean;
  postFlightReminderHour: number;
  postFlightReminderMinute: number;
}

export const DEFAULT_RITUALS_SETTINGS: RitualsSettings = {
  preFlightReminderEnabled: false,
  preFlightReminderHour: 7,
  preFlightReminderMinute: 0,
  showCalendarEvents: false,
  showBirthdays: true,
  showCycleInfo: true,
  postFlightReminderEnabled: false,
  postFlightReminderHour: 21,
  postFlightReminderMinute: 0,
};
