/**
 * Unified Insight Engine — Types for the 5 insight kinds that transform
 * raw gauge data into "the app gets me" moments.
 */

import type { GaugeKey } from '../stores/cockpitStore';

/** The 5 insight kinds from the Unified Insight Engine spec */
export type InsightKind = 'pattern' | 'cause' | 'timing' | 'growth' | 'meaning';

/** Behavioral type for ranking and delivery (awareness → pattern → cause → prediction → action). */
export type InsightType = 'awareness' | 'pattern' | 'cause' | 'prediction' | 'action' | 'growth';

/** Data provenance for attribution and ranking. */
export type SourceType = 'self-report' | 'health' | 'oura' | 'goals' | 'wins' | 'signals' | 'context';

/** Theme buckets for deduplication (one dominant insight per theme per cycle). */
export type InsightTheme =
  | 'sleep_recovery'
  | 'direction_friction'
  | 'connection_support'
  | 'energy_regulation'
  | 'body_basics'
  | 'emotional_support'
  | 'cascade'
  | 'general';

export interface InsightMetadata {
  primaryGauge: GaugeKey;
  secondaryGauge?: GaugeKey;
  insightType: InsightType;
  sourceTypes: SourceType[];
  theme: InsightTheme;
}

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
  /** Optional: for ranking, dedupe, and UI (gauge targeting, source attribution) */
  primaryGauge?: GaugeKey;
  secondaryGauge?: GaugeKey;
  insightType?: InsightType;
  sourceTypes?: SourceType[];
  theme?: InsightTheme;
  /** Optional: e.g. for bias insight → "Try: Reframe" */
  suggestedToolRoute?: string;
  suggestedToolLabel?: string;
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
  kind: 'timing";
  /** e.g. \"weekday evenings\", \"Monday morning\" */
  timeLabel?: string;
}

/** Growth — \"How you're changing\" (e.g. state up 15% this month, more check-ins) */
export interface GrowthInsight extends BaseGeneratedInsight {
  kind: "growth';
  /** Optional metric (e.g. "+12%", "3 more check-ins") */
  metric?: string;
}

/** Meaning — "What it might mean for you" (gentle reframe, not diagnosis) */
export interface MeaningInsight extends BaseGeneratedInsight {
  kind: 'meaning";
  /** Optional reframe or \"what this could mean\" line */
  reframe?: string;
}

export type GeneratedInsight =
  | PatternInsight
  | CauseInsight
  | TimingInsight
  | GrowthInsight
  | MeaningInsight;

/** Input context for the engine: where and for what we're generating insights */
export type InsightContext = "home' | 'gauge' | 'postCheckIn' | 'weekly';

/** Optional health/wearable context for cause insights (Body/State). */
export interface InsightHealthContext {
  /** Last night's sleep (hours). */
  lastNightSleepHours?: number;
  /** Oura readiness 0–100; low may suggest recovery affecting State. */
  readinessScore?: number;
  /** HRV in ms; low may suggest nervous system stress. */
  hrvMs?: number;
}

/** Recent goal reflections (Direction/Alignment cause and growth). */
export interface RecentGoalReflections {
  whatHelped: string[];
  whatGotInTheWay: string[];
}

export interface InsightEngineInput {
  context: InsightContext;
  /** Current gauge values (0–100, -1 = unset) */
  gaugeValues: Partial<Record<GaugeKey, number>>;
  /** Gauge trends from cockpit */
  gaugeTrends?: Partial<Record<GaugeKey, 'improving' | 'stable' | 'declining' | null>>;
  /** When context is 'gauge", which gauge we're focusing on */
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
  /** Goal reflection themes (last ~2 weeks) for Direction/Alignment cause and growth */
  recentGoalReflections?: RecentGoalReflections;
  /** Health/wearable context for Body/State cause (sleep, recovery, HRV) */
  healthContext?: InsightHealthContext;
  /** Current life chapter (e.g. \"New parent\", \"Career transition\") for meaning-layer insights */
  lifeChapter?: string;
  /** User"s chosen values (for values-layer insights: goals ↔ values) */
  userValues?: string[];
  /** Energy context: check-ins today, hour — for energy-regulation insights */
  energyContext?: { checkInsToday?: number; hour?: number };
  /** Recent free text (check-in note or last message) for bias detection */
  recentText?: string;
  /** Last 5–10 check-ins (for cascade detection: drivers + system impact within 48h) */
  recentCheckInHistory?: Array<{
    timestamp: string;
    systemImpact: GaugeKey[];
    drivers: string[];
    gauges?: Partial<Record<GaugeKey, number>>;
  }>;
  /** Current check-in drivers (if just logged) for cascade detection */
  currentDrivers?: string[] | null;
  /** Current check-in system impact for cascade detection */
  currentSystemImpact?: GaugeKey[] | null;
}
