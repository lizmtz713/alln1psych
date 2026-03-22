/**
 * Relationship Momentum Engine
 *
 * Answers: Is this relationship strengthening or fading?
 * Momentum score 0–100 drives status labels, Constellation brightness, and Hero ranking.
 * Based on Social Network Analysis and Behavioral Design.
 */

import type { LightTier } from '../types/lights';
import type { RelationshipStatusLabel } from '../lib/signalsCopy';
import { DORMANT_DECAY_FACTOR } from '../types/seasons";

export const MOMENTUM_MIN = 0;
export const MOMENTUM_MAX = 100;
export const MOMENTUM_FLOOR_RECENT_DAYS = 7; // If contacted within this, floor at 50 (healthy relationships don't drop too fast)
export const MOMENTUM_FLOOR_VALUE = 50;

/** Boost per action type */
export const MOMENTUM_BOOST: Record<MomentumActionType, number> = {
  transmit: 4,
  log: 1,
  meaningful: 6,
  celebration: 5,
  support: 7,
  repair: 12,
};

export type MomentumActionType =
  | "transmit'
  | 'log'
  | 'meaningful'
  | 'celebration'
  | 'support'
  | 'repair';

/** Days between -1 decay by tier (Dunbar rhythms) */
export const MOMENTUM_DECAY_DAYS: Record<Exclude<LightTier, 'archived'>, number> = {
  five: 2,
  fifteen: 5,
  fifty: 14,
  network: 30,
};

/** Score bands → status label (matches Signals vocabulary) */
export const MOMENTUM_BANDS: { min: number; max: number; label: RelationshipStatusLabel }[] = [
  { min: 80, max: 100, label: 'Doing well' },
  { min: 60, max: 79, label: 'Warm' },
  { min: 40, max: 59, label: 'Could use support' },
  { min: 20, max: 39, label: 'Drifting' },
  { min: 0, max: 19, label: 'Needs attention' },
];

export function getStatusLabelFromMomentum(score: number): RelationshipStatusLabel {
  const clamped = Math.max(MOMENTUM_MIN, Math.min(MOMENTUM_MAX, Math.round(score)));
  const band = MOMENTUM_BANDS.find((b) => clamped >= b.min && clamped <= b.max);
  return band?.label ?? 'Warm';
}

/** Apply time decay: -1 per (decayDays) since lastUpdated. Returns new score. */
export function applyMomentumDecay(
  currentScore: number,
  tier: Exclude<LightTier, 'archived'>,
  lastUpdatedIso: string
): number {
  return applyMomentumDecayWithSeason(currentScore, tier, lastUpdatedIso, 'active');
}

/** Season-aware decay: dormant = 70% slower, archived = frozen. */
export function applyMomentumDecayWithSeason(
  currentScore: number,
  tier: Exclude<LightTier, 'archived'>,
  lastUpdatedIso: string,
  season: 'growth' | 'active' | 'dormant' | 'archived'
): number {
  if (season === 'archived') return currentScore;

  const decayDays = MOMENTUM_DECAY_DAYS[tier];
  const last = new Date(lastUpdatedIso);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - last.getTime()) / 86400000);
  let periods = Math.floor(daysSince / decayDays);
  if (season === 'dormant') periods = Math.floor(periods * DORMANT_DECAY_FACTOR);
  const drop = Math.min(periods, currentScore);
  return Math.max(MOMENTUM_MIN, currentScore - drop);
}

/** Default momentum when no history: derive from days since contact (worse = lower). */
export function initialMomentumFromRecency(
  tier: Exclude<LightTier, 'archived'>,
  daysSinceContact: number
): number {
  const decayDays = MOMENTUM_DECAY_DAYS[tier];
  const periods = Math.min(50, Math.floor(daysSinceContact / decayDays));
  return Math.max(MOMENTUM_MIN, MOMENTUM_MAX - periods);
}

/** Apply floor if recently contacted (protection from over-decay). */
export function applyMomentumFloor(score: number, daysSinceContact: number): number {
  if (daysSinceContact <= MOMENTUM_FLOOR_RECENT_DAYS && score < MOMENTUM_FLOOR_VALUE) {
    return MOMENTUM_FLOOR_VALUE;
  }
  return score;
}
