/**
 * Life Wrapped — Types for reports, stats, and story cards.
 * Data collection runs now; full experience unlocks December 21.
 */

export const WRAPPED_YEAR = 2026;
export const WRAPPED_UNLOCK_DATE = '2026-12-21';

export interface WrappedGaugeSnapshot {
  body?: number;
  state?: number;
  emotion?: number;
  connection?: number;
  direction?: number;
  alignment?: number;
}

export interface WrappedDailyCounts {
  checkIns: number;
  journalEntries: number;
  connectionLogs: number;
  preFlights: number;
  postFlights: number;
}

export interface WrappedCollectionState {
  year: number;
  checkIns: number;
  journalEntries: number;
  connectionLogs: number;
  preFlights: number;
  postFlights: number;
  lastCheckInAt?: string;
  lastJournalAt?: string;
  lastConnectionAt?: string;
  lastPreFlightAt?: string;
  lastPostFlightAt?: string;
}

export interface WrappedStoryCard {
  id: string;
  title: string;
  subtitle?: string;
  stat?: string | number;
  insight?: string;
  emoji?: string;
  /** For gauge cards: color hex, label, short description */
  gaugeColor?: string;
  gaugeLabel?: string;
  gaugeDescription?: string;
  /** Commitment-level or emotional copy (e.g. "The Valley" / "The Peak") */
  emotionalLabel?: string;
}

/** Payload sent to generate-wrapped-insights edge function */
export interface WrappedInsightsPayload {
  stats: WrappedDailyCounts;
  /** Visual score bars e.g. "████████░░" (10 chars) per metric */
  scoreBars?: Record<string, string>;
  highMonth?: { month: number; label: string; value: number };
  lowMonth?: { month: number; label: string; value: number };
  bestDay?: { date: string; label: string };
  hardestDay?: { date: string; label: string };
  streakDays?: number;
  totalMoments: number;
}

export interface WrappedReport {
  year: number;
  generatedAt: string;
  cards: WrappedStoryCard[];
  stats: WrappedDailyCounts;
  insights?: string[];
  /** Optional payload used for AI (for debugging or re-run) */
  payload?: WrappedInsightsPayload;
}
