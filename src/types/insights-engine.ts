/**
 * Unified Insight Engine — Types for the 5 insight kinds that transform
 * raw gauge data into "the app gets me" moments.
 */

import type { GaugeKey } from '../stores/cockpitStore';

/** The 5 insight types from the Unified Insight Engine spec */
export type InsightKind = 'pattern' | 'cause' | 'timing' | 'growth' | 'meaning';

export interface BaseGeneratedInsight {
  id: string;
  kind: InsightKind;
  /** Short headline for cards */
  title: string;
  /** 1–2 sentence explanation */
  body: string;
  /** Primary gauge(s) this insight relates to */
  gauges: GaugeKey[];
  /** 0–1; used for ordering and "confidence" display */
  confidence: number;
  /** When this insight was generated (ISO) */
  generatedAt: string;
}

/** Pattern — "This is what we see in your data" (e.g. Wednesdays are hard, sleep → state) */
export interface PatternInsight extends BaseGeneratedInsight {
  kind: 'pattern';
  /** Optional: underlying pattern type from patternDetection (day_of_week, sleep_state, etc.) */
  patternType?: string;
}

/** Cause — "This might be why" (e.g. poor sleep → lower state; connection gap → emotion dip) */
export interface CauseInsight extends BaseGeneratedInsight {
  kind: 'cause';
  /** Suggested cause factor (e.g. "Sleep", "Connection gap") */
  factor?: string;
}

/** Timing — "When it tends to happen" (e.g. dips in the afternoon, better on weekends) */
export interface TimingInsight extends BaseGeneratedInsight {
  kind: 'timing';
  /** e.g. "weekday evenings", "Monday morning" */
  timeLabel?: string;
}

/** Growth — "How you're changing" (e.g. state up 15% this month, more check-ins) */
export interface GrowthInsight extends BaseGeneratedInsight {
  kind: 'growth';
  /** Optional metric (e.g. "+12%", "3 more check-ins") */
  metric?: string;
}

/** Meaning — "What it might mean for you" (gentle reframe, not diagnosis) */
export interface MeaningInsight extends BaseGeneratedInsight {
  kind: 'meaning';
  /** Optional reframe or "what this could mean" line */
  reframe?: string;
}

export type GeneratedInsight =
  | PatternInsight
  | CauseInsight
  | TimingInsight
  | GrowthInsight
  | MeaningInsight;

/** Input context for the engine: where and for what we're generating insights */
export type InsightContext = 'home' | 'gauge' | 'postCheckIn';

export interface InsightEngineInput {
  context: InsightContext;
  /** Current gauge values (0–100, -1 = unset) */
  gaugeValues: Partial<Record<GaugeKey, number>>;
  /** Gauge trends from cockpit */
  gaugeTrends?: Partial<Record<GaugeKey, 'improving' | 'stable' | 'declining' | null>>;
  /** When context is 'gauge', which gauge we're focusing on */
  gauge?: GaugeKey;
  /** Recent per-day gauge snapshots for pattern/timing (date → values) */
  recentGaugeByDay?: Array<{ date: string; values: Partial<Record<GaugeKey, number>> }>;
  /** Last N days of check-in dates (YYYY-MM-DD) */
  checkInDates?: string[];
  /** Days since last connection log (for connection_gaps / cause) */
  daysSinceConnection?: number;
  /** Pre/Post flight entries for pattern detection (optional; if available) */
  preFlights?: Array<{ date: string; sleepQuality?: number; morningFeeling?: number }>;
  postFlights?: Array<{ date: string; dayRating?: number }>;
  /** Wins captured this week (for growth tracking) */
  winsThisWeek?: number;
  /** Sleep by day (hours, quality 1–5) for sleep–gauge correlation insights */
  sleepByDay?: Array<{ date: string; hours?: number; quality?: number }>;
}
