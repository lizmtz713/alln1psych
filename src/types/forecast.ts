/**
 * Life Forecast Engine — Types for patterns, predictions, and suggestions.
 */

import type { GaugeKey } from '../stores/cockpitStore';

export type PatternType =
  | 'day_of_week'
  | 'sleep_state'
  | 'connection_gaps'
  | 'calendar_load'
  | 'sequence'
  | 'trend_momentum';

export interface DetectedPattern {
  type: PatternType;
  label: string;
  description: string;
  confidence: number;
  /** e.g. "Wednesday" for day_of_week, "State" for sleep_state */
  factorLabel?: string;
}

export interface RiskFactor {
  gauge?: GaugeKey;
  label: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ForecastSuggestion {
  text: string;
  icon?: string;
}

export interface DayForecast {
  date: string;
  dayName: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  brightSpots: string[];
  suggestions: ForecastSuggestion[];
  /** Per-gauge risk (optional) */
  gaugeRisks?: Partial<Record<GaugeKey, 'low' | 'medium' | 'high'>>;
}

export interface WeekForecast {
  days: DayForecast[];
  patterns: DetectedPattern[];
}

export interface ForecastContext {
  /** Last night sleep quality 1–5 (from Pre-Flight) */
  sleepQuality?: number;
  /** Hours sleep (optional, if we have it) */
  sleepHours?: number;
  /** Number of meetings/events today (placeholder until calendar) */
  meetingCount?: number;
  /** Days since last logged connection */
  daysSinceConnection?: number;
  /** Current gauge values for trend momentum */
  gaugeValues?: Partial<Record<GaugeKey, number>>;
  /** Recent gauge trends */
  gaugeTrends?: Partial<Record<GaugeKey, 'improving' | 'stable' | 'declining'>>;
}
