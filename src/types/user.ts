/**
 * User profile types — Build guide Phase 1.3 / spec alignment.
 * Canonical types for profile and age tier; userStore holds the actual state.
 */

export type AgeTier = 'teen' | 'youngAdult' | 'adult' | 'mature' | 'senior';

export interface UserProfile {
  name: string;
  birthday?: string;
  ageTier: AgeTier;
  loveLanguage?: string;
  learningStyle?: string;
  pronouns?: string;
  /** See ingauge-PHOSM-COMPLETE-SETUP.md for full profile fields */
}
