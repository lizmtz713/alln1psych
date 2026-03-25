/**
 * Single UI-facing health model (Path A: Apple Health / Oura-via-HealthKit first).
 * Gauges and screens should prefer this over raw HealthKit shapes.
 */
export type HealthDataSource = 'apple_health' | 'oura' | 'mixed';

export type NormalizedHealthSnapshot = {
  sleepHours?: number;
  steps?: number;
  restingHeartRate?: number;
  heartRateVariability?: number;
  latestHeartRate?: number;
  workoutsThisWeek?: number;
  source: HealthDataSource;
  syncedAt: string;
};
