/**
 * Canonical health data model for InGauge.
 * All wearable/source data is normalized into this schema so the gauge
 * intelligence layer and insight engine stay source-agnostic.
 *
 * See docs/WEARABLE-DATA-AUDIT.md and docs/WEARABLES-HUMAN-OS.md.
 */

export type HealthDataSource = 'healthkit' | 'oura' | 'health_connect';

/** Provenance for a value: which source provided it (for merge/conflict and transparency). */
export interface DataProvenance {
  source: HealthDataSource;
  sourceId?: string;
  updatedAt: string; // ISO
}

/** Physiology: sleep, heart, activity, recovery. */
export interface CanonicalPhysiology {
  // Sleep
  sleepDurationHours: number | null;
  sleepQualityScore: number | null; // 0-100 if available
  sleepEfficiencyPercent: number | null;
  sleepLatencyMinutes: number | null;
  remMinutes: number | null;
  deepMinutes: number | null;
  bedTime: string | null; // ISO
  wakeTime: string | null; // ISO
  sleepProvenance: DataProvenance | null;

  // Heart
  restingHeartRate: number | null;
  hrvMs: number | null;
  heartRateProvenance: DataProvenance | null;

  // Activity (day-level)
  steps: number | null;
  exerciseMinutes: number | null;
  activeCalories: number | null;
  standHours: number | null;
  walkingRunningDistanceKm: number | null;
  activityProvenance: DataProvenance | null;

  // Recovery / readiness (Oura-style; optional from HealthKit)
  recoveryScore: number | null; // 0-100
  temperatureDeviation: number | null;
  respiratoryRate: number | null;
  bloodOxygenPercent: number | null;
  vo2Max: number | null;
  recoveryProvenance: DataProvenance | null;
}

/** Behavior: movement patterns, routine regularity (derived or from sources). */
export interface CanonicalBehavior {
  movementRegularityScore: number | null; // 0-100 if computed
  sedentaryMinutes: number | null;
  sleepWakeRegularityScore: number | null;
  workoutFrequencyPerWeek: number | null;
  lastUpdated: string | null; // ISO
}

/** Environment/context: weather, time, optional location. */
export interface CanonicalContext {
  weatherTempF: number | null;
  weatherDescription: string | null;
  daylightLevel: string | null;
  timeOfDayCategory: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  date: string; // YYYY-MM-DD
}

/** Self-report stays in check-ins and cockpit; this is a reference shape for insight engine. */
export interface CanonicalSelfReport {
  checkInDate: string | null; // YYYY-MM-DD
  bodySelfReport: number | null; // 0-100 if from check-in
  stateSelfReport: number | null;
  emotionSelfReport: number | null;
  connectionSelfReport: number | null;
  directionSelfReport: number | null;
  alignmentSelfReport: number | null;
  checkInContextSleep: string | null; // e.g. "Great", "Poor"
  checkInContextSocial: string | null;
  checkInContextStressSource: string | null;
}

/** One canonical record per date: physiology + behavior + context; self-report linked by date. */
export interface CanonicalHealthDay {
  date: string; // YYYY-MM-DD
  physiology: CanonicalPhysiology;
  behavior: CanonicalBehavior;
  context: CanonicalContext;
  selfReport: CanonicalSelfReport | null;
  sources: HealthDataSource[]; // which sources contributed
}

/** Default empty physiology for a day. */
export function emptyPhysiology(): CanonicalPhysiology {
  return {
    sleepDurationHours: null,
    sleepQualityScore: null,
    sleepEfficiencyPercent: null,
    sleepLatencyMinutes: null,
    remMinutes: null,
    deepMinutes: null,
    bedTime: null,
    wakeTime: null,
    sleepProvenance: null,
    restingHeartRate: null,
    hrvMs: null,
    heartRateProvenance: null,
    steps: null,
    exerciseMinutes: null,
    activeCalories: null,
    standHours: null,
    walkingRunningDistanceKm: null,
    activityProvenance: null,
    recoveryScore: null,
    temperatureDeviation: null,
    respiratoryRate: null,
    bloodOxygenPercent: null,
    vo2Max: null,
    recoveryProvenance: null,
  };
}

/** Default empty behavior. */
export function emptyBehavior(): CanonicalBehavior {
  return {
    movementRegularityScore: null,
    sedentaryMinutes: null,
    sleepWakeRegularityScore: null,
    workoutFrequencyPerWeek: null,
    lastUpdated: null,
  };
}
