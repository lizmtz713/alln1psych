/**
 * Goals & Intentions — Types for the Human OS goal model.
 * Values → Direction → Actions; tied to Direction and Alignment gauges.
 */

/** Gauge keys for "this goal supports" (matches cockpit). */
export type GaugeKey = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

/** Life areas for Direction (user selects 1–3). */
export const DIRECTION_AREAS = [
  'Health',
  'Career',
  'Relationships',
  'Learning',
  'Money',
  'Personal growth',
  'Other',
] as const;

export type DirectionArea = (typeof DIRECTION_AREAS)[number];

/** Optional display labels (e.g. "Career / Work"). Key = DIRECTION_AREAS value. */
export const DIRECTION_DISPLAY: Partial<Record<DirectionArea, string>> = {
  Career: 'Career / Work',
};

/** Momentum for a goal (Warm = on track, etc.). */
export type GoalMomentum = 'warm' | 'steady' | 'cool' | 'stalled';

/** "Why does this goal matter?" — ties goal to Alignment/values. */
export const WHY_IT_MATTERS_OPTIONS = [
  'Health',
  'Family',
  'Financial security',
  'Growth',
  'Purpose',
] as const;

/** Single active goal. */
export interface ActiveGoal {
  id: string;
  title: string;
  intent: string;
  momentum: GoalMomentum;
  supportedGauges: GaugeKey[];
  lifeArea: DirectionArea | string;
  createdAt: string; // ISO
  /** Optional daily action hint for Cockpit. */
  dailyHint?: string;
  /** Why this goal matters (Alignment). */
  whyItMatters?: string;
}

/** Weekly reflection for a goal. */
export interface GoalReflection {
  goalId: string;
  weekKey: string; // e.g. "2025-W10"
  rating: 'great' | 'okay' | 'struggled";
  whatHelped?: string;
  whatGotInTheWay?: string;
  reflectedAt: string; // ISO
}

/** Barriers / \"what's in the way\" options for AI Goal Builder. */
export const BARRIER_OPTIONS = [
  "Time',
  'Energy',
  'Motivation',
  'Unclear plan',
  'Stress',
  'Other',
] as const;
