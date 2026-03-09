/**
 * Gauge intelligence: map canonical health data to gauge inputs (Body, State).
 * Emotion, Connection, Direction, Alignment are NOT derived from wearables;
 * they use self-report first. Wearables only provide context/probabilistic support.
 * See docs/WEARABLES-HUMAN-OS.md and docs/WEARABLE-DATA-AUDIT.md.
 */

import type { CanonicalPhysiology, CanonicalHealthDay } from '../../types/canonicalHealth';

export interface BodyStateInputs {
  /** 0-100 suggested Body gauge from physiology only. */
  bodyScore: number | null;
  /** 0-100 suggested State gauge from physiology (HRV, recovery). */
  stateScore: number | null;
  /** Human-readable note for UI (e.g. "Based on sleep + activity"). */
  note: string | null;
}

/**
 * Compute Body gauge input from canonical physiology.
 * Primary: sleep, activity, exercise, recovery. Do not use raw metrics as score without interpretation.
 */
export function physiologyToBodyInput(p: CanonicalPhysiology): BodyStateInputs['bodyScore'] {
  let score = 50;
  let factors = 0;

  if (p.sleepDurationHours != null && p.sleepDurationHours > 0) {
    const sleepScore = Math.min(100, (p.sleepDurationHours / 8) * 100);
    score += (sleepScore - 50) * 0.4;
    factors++;
  } else if (p.sleepQualityScore != null) {
    score += (p.sleepQualityScore - 50) * 0.4;
    factors++;
  }

  if (p.steps != null && p.steps > 0) {
    const stepsScore = Math.min(100, (p.steps / 10000) * 100);
    score += (stepsScore - 50) * 0.2;
    factors++;
  }
  if (p.exerciseMinutes != null && p.exerciseMinutes > 0) {
    const exScore = Math.min(100, (p.exerciseMinutes / 30) * 100);
    score += (exScore - 50) * 0.2;
    factors++;
  }

  if (p.recoveryScore != null) {
    score += (p.recoveryScore - 50) * 0.2;
    factors++;
  }

  if (factors === 0) return null;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Compute State gauge input from canonical physiology.
 * Primary: HRV, resting HR, sleep quality, recovery. Nervous system regulation.
 */
export function physiologyToStateInput(p: CanonicalPhysiology): BodyStateInputs['stateScore'] {
  if (p.hrvMs == null && p.recoveryScore == null) return null;

  let score = 50;

  if (p.hrvMs != null) {
    if (p.hrvMs < 30) score = 35;
    else if (p.hrvMs < 40) score = 45;
    else if (p.hrvMs < 50) score = 60;
    else if (p.hrvMs < 60) score = 75;
    else score = 85;
  }
  if (p.recoveryScore != null) {
    score = Math.round((score + p.recoveryScore) / 2);
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Full mapping: canonical day → Body + State inputs for cockpit/insight.
 */
export function canonicalDayToBodyStateInputs(day: CanonicalHealthDay): BodyStateInputs {
  const bodyScore = physiologyToBodyInput(day.physiology);
  const stateScore = physiologyToStateInput(day.physiology);
  const parts: string[] = [];
  if (day.physiology.sleepDurationHours != null || day.physiology.sleepQualityScore != null) parts.push('sleep');
  if (day.physiology.steps != null || day.physiology.exerciseMinutes != null) parts.push('activity');
  if (day.physiology.hrvMs != null || day.physiology.recoveryScore != null) parts.push('recovery');
  const note = parts.length > 0 ? `Based on ${parts.join(' + ')}` : null;

  return {
    bodyScore: bodyScore ?? null,
    stateScore: stateScore ?? null,
    note,
  };
}
