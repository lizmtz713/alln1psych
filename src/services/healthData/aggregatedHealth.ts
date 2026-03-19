/**
 * Aggregated health: merge HealthKit + Oura into one canonical day and Body/State scores.
 * Used by healthStore (sync) and cockpitStore (insight context).
 * See docs/WEARABLE-DATA-AUDIT.md.
 */

import type { HealthSnapshot } from '../healthKit';
import type { OuraSnapshot } from '../ouraIntegration';
import { healthKitToCanonical } from './healthKitAdapter';
import { ouraToCanonical } from './ouraAdapter';
import { mergeIntoCanonicalDay } from './mergeLayer';
import { canonicalDayToBodyStateInputs } from './gaugeMapping';
import type { HealthContext } from '../cockpitAI';

function todayYYYYMMDD(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface AggregatedHealthResult {
  bodyScore: number | null;
  stateScore: number | null;
  note: string | null;
  sources: ('healthkit' | 'oura' | 'health_connect')[];
}

/**
 * Merge HealthKit + Oura for the given date and compute Body/State gauge inputs.
 * When Oura is connected, merged result prefers Oura for sleep/recovery, HealthKit for activity when missing.
 */
export function getAggregatedBodyState(
  healthSnapshot: HealthSnapshot | null,
  ouraSnapshot: OuraSnapshot | null,
  date: string = todayYYYYMMDD()
): AggregatedHealthResult {
  const hk = healthSnapshot ? healthKitToCanonical(healthSnapshot) : null;
  const ou = ouraSnapshot?.connected ? ouraToCanonical(ouraSnapshot) : null;

  const canonicalDay = mergeIntoCanonicalDay({
    date,
    healthKit: hk,
    oura: ou,
  });

  const inputs = canonicalDayToBodyStateInputs(canonicalDay);

  return {
    bodyScore: inputs.bodyScore,
    stateScore: inputs.stateScore,
    note: inputs.note,
    sources: canonicalDay.sources as ('healthkit' | 'oura')[],
  };
}

/**
 * Build a single HealthContext for the insight engine from HealthKit + Oura.
 * Used by fetchCrossSystemInsight so AI gets both sources when available.
 */
export function buildAggregatedHealthContext(
  healthSnapshot: HealthSnapshot | null,
  ouraSnapshot: OuraSnapshot | null
): HealthContext | undefined {
  const parts: HealthContext = {};

  // Prefer Oura sleep/readiness when available
  if (ouraSnapshot?.connected) {
    if (ouraSnapshot.sleep) {
      const dur = ouraSnapshot.sleep.duration;
      parts.sleepHours = typeof dur === 'number' ? dur / 3600 : undefined;
      if (ouraSnapshot.sleep.score != null) {
        parts.ouraSleepScore = ouraSnapshot.sleep.score;
      }
    }
    if (ouraSnapshot.readiness?.score != null) {
      parts.readinessScore = ouraSnapshot.readiness.score;
    }
    if (ouraSnapshot.heart?.hrv != null) {
      parts.hrv = ouraSnapshot.heart.hrv;
    }
    if (ouraSnapshot.heart?.restingHeartRate != null) {
      parts.restingHeartRate = ouraSnapshot.heart.restingHeartRate;
    }
    if (ouraSnapshot.activity) {
      parts.steps = ouraSnapshot.activity.steps ?? undefined;
      parts.exerciseMinutes = undefined; // Oura uses activity time, not exercise minutes directly
    }
  }

  // Fill in from HealthKit where we don't have Oura or for nutrition/cycle
  if (healthSnapshot) {
    if (parts.sleepHours == null && healthSnapshot.sleep?.lastNight?.duration != null) {
      parts.sleepHours = healthSnapshot.sleep.lastNight.duration;
      parts.sleepQuality = healthSnapshot.sleep.lastNight.quality;
    }
    if (parts.steps == null && healthSnapshot.activity?.steps != null) {
      parts.steps = healthSnapshot.activity.steps;
    }
    if (healthSnapshot.activity?.exerciseMinutes != null) {
      parts.exerciseMinutes = healthSnapshot.activity.exerciseMinutes;
    }
    if (healthSnapshot.nutrition?.waterOz != null && healthSnapshot.nutrition.waterOz > 0) {
      parts.waterOz = healthSnapshot.nutrition.waterOz;
    }
    if (parts.hrv == null && healthSnapshot.heart?.hrv != null) {
      parts.hrv = healthSnapshot.heart.hrv;
    }
    if (healthSnapshot.menstruation) {
      parts.cyclePhase = healthSnapshot.menstruation.currentPhase ?? undefined;
      parts.cycleDay = healthSnapshot.menstruation.dayOfCycle ?? undefined;
    }
  }

  if (Object.keys(parts).length === 0) return undefined;
  return parts;
}
