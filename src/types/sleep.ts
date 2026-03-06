/**
 * Sleep Insights — Types for sleep data (HealthKit, manual, Pre-Flight) and insights.
 */

/** Source of the sleep record */
export type SleepSource = 'healthkit' | 'manual' | 'preflight';

/** Quality 1–5 (same as Pre-Flight / rituals) */
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

/** One night's sleep record (one per date = morning-after date). */
export interface SleepData {
  date: string; // YYYY-MM-DD (date you woke up / morning of)
  /** Duration in hours (e.g. 7.5) */
  hours: number;
  quality: SleepQuality;
  source: SleepSource;
  /** When this record was created/updated (ISO) */
  updatedAt: string;
  /** From HealthKit: bed/wake times if available */
  bedTime?: string; // ISO
  wakeTime?: string; // ISO
}

/** Insight linking sleep to a gauge (e.g. "When you sleep 7+ hours, Body tends to be higher"). */
export interface SleepInsight {
  id: string;
  gauge: 'body' | 'state' | 'emotion';
  title: string;
  body: string;
  /** e.g. "7+ hours" or "poor sleep" */
  sleepCondition: string;
  /** Correlation hint: higher / lower / neutral */
  correlation: 'higher' | 'lower' | 'neutral';
  generatedAt: string; // ISO
}
