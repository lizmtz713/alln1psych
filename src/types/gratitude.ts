/**
 * Gratitude Practice — Types for 3 Good Things, morning gratitude, streak, and review.
 */

/** One day's gratitude: 3 good things (evening) and optional morning gratitude. */
export interface DailyGratitude {
  date: string; // YYYY-MM-DD
  /** Evening: three things that went well (Post-Flight). */
  threeGoodThings: [string, string, string];
  /** Morning: one thing you're grateful for (Pre-Flight). Optional. */
  morningGratitude?: string;
  /** When the day was last updated (ISO). */
  updatedAt: string;
}

/** Weekly summary for gratitude review. */
export interface GratitudeWeekSummary {
  startDate: string;
  endDate: string;
  daysWithEvening: number;
  daysWithMorning: number;
  totalGoodThings: number;
  /** Consecutive days at end of week that had at least one entry. */
  streakAtEnd: number;
}

/** Simple pattern hint for insights (e.g. recurring themes). */
export interface GratitudePattern {
  label: string;
  description: string;
}

/** Single entry in the Gratitude Jar (activity) — free-form list. */
export interface GratitudeJarEntry {
  id: string;
  text: string;
  createdAt: string; // ISO
  why?: string;
}
