/**
 * Merge layer: combine HealthKit and Oura into one canonical record per date.
 * Priority: Oura for sleep + recovery; HealthKit for activity/heart when Oura missing.
 * See docs/WEARABLE-DATA-AUDIT.md.
 */

import type { CanonicalPhysiology, CanonicalHealthDay, HealthDataSource } from '../../types/canonicalHealth';
import { emptyPhysiology, emptyBehavior } from '../../types/canonicalHealth';

function mergePhysiology(
  healthKit: Partial<CanonicalPhysiology>,
  oura: Partial<CanonicalPhysiology>
): CanonicalPhysiology {
  const out = emptyPhysiology();

  const set = <K extends keyof CanonicalPhysiology>(
    key: K,
    hk: CanonicalPhysiology[K] | undefined,
    ou: CanonicalPhysiology[K] | undefined,
    preferOura: boolean
  ) => {
    const v = preferOura ? (ou ?? hk) : (hk ?? ou);
    if (v != null) (out as Record<string, unknown>)[key] = v;
  };

  set('sleepDurationHours', healthKit.sleepDurationHours ?? undefined, oura.sleepDurationHours ?? undefined, true);
  set('sleepQualityScore', healthKit.sleepQualityScore ?? undefined, oura.sleepQualityScore ?? undefined, true);
  set('sleepEfficiencyPercent', undefined, oura.sleepEfficiencyPercent ?? undefined, true);
  set('sleepLatencyMinutes', undefined, oura.sleepLatencyMinutes ?? undefined, true);
  set('remMinutes', undefined, oura.remMinutes ?? undefined, true);
  set('deepMinutes', undefined, oura.deepMinutes ?? undefined, true);
  set('bedTime', healthKit.bedTime ?? undefined, oura.bedTime ?? undefined, true);
  set('wakeTime', healthKit.wakeTime ?? undefined, oura.wakeTime ?? undefined, true);
  set('sleepProvenance', healthKit.sleepProvenance ?? undefined, oura.sleepProvenance ?? undefined, true);

  const ouraHasHeart = oura.hrvMs != null || oura.restingHeartRate != null;
  set('restingHeartRate', healthKit.restingHeartRate ?? undefined, oura.restingHeartRate ?? undefined, ouraHasHeart);
  set('hrvMs', healthKit.hrvMs ?? undefined, oura.hrvMs ?? undefined, ouraHasHeart);
  set('heartRateProvenance', healthKit.heartRateProvenance ?? undefined, oura.heartRateProvenance ?? undefined, ouraHasHeart);

  set('recoveryScore', undefined, oura.recoveryScore ?? undefined, true);
  set('temperatureDeviation', undefined, oura.temperatureDeviation ?? undefined, true);
  set('respiratoryRate', healthKit.respiratoryRate ?? undefined, oura.respiratoryRate ?? undefined, true);
  set('recoveryProvenance', undefined, oura.recoveryProvenance ?? undefined, true);

  const hkHasActivity = (healthKit.steps != null && healthKit.steps > 0) || (healthKit.exerciseMinutes != null && healthKit.exerciseMinutes > 0);
  set('steps', healthKit.steps ?? undefined, oura.steps ?? undefined, !hkHasActivity);
  set('exerciseMinutes', healthKit.exerciseMinutes ?? undefined, oura.exerciseMinutes ?? undefined, !hkHasActivity);
  set('activeCalories', healthKit.activeCalories ?? undefined, oura.activeCalories ?? undefined, !hkHasActivity);
  set('standHours', healthKit.standHours ?? undefined, undefined, false);
  set('activityProvenance', healthKit.activityProvenance ?? undefined, oura.activityProvenance ?? undefined, !hkHasActivity);

  return out;
}

export interface MergeInput {
  date: string;
  healthKit: Partial<CanonicalPhysiology> | null;
  oura: Partial<CanonicalPhysiology> | null;
}

export function mergeIntoCanonicalDay(input: MergeInput): CanonicalHealthDay {
  const physiology = mergePhysiology(input.healthKit ?? {}, input.oura ?? {});
  const sources: HealthDataSource[] = [];
  if (input.healthKit && Object.keys(input.healthKit).length > 0) sources.push('healthkit');
  if (input.oura && Object.keys(input.oura).length > 0) sources.push('oura');

  return {
    date: input.date,
    physiology,
    behavior: emptyBehavior(),
    context: {
      weatherTempF: null,
      weatherDescription: null,
      daylightLevel: null,
      timeOfDayCategory: null,
      date: input.date,
    },
    selfReport: null,
    sources,
  };
}
