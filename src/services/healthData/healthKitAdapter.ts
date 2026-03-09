/**
 * HealthKit → Canonical health adapter.
 * Maps Apple Health snapshot into CanonicalPhysiology for the merge layer.
 * See docs/WEARABLE-DATA-AUDIT.md.
 */

import type { HealthSnapshot } from '../../services/healthKit';
import type { CanonicalPhysiology, DataProvenance } from '../../types/canonicalHealth';

const SOURCE: DataProvenance['source'] = 'healthkit';

function prov(updatedAt: Date): DataProvenance {
  return { source: SOURCE, updatedAt: updatedAt.toISOString() };
}

export function healthKitToCanonical(snapshot: HealthSnapshot): Partial<CanonicalPhysiology> {
  const at = snapshot.lastSynced;
  const p: Partial<CanonicalPhysiology> = {};

  if (snapshot.sleep?.lastNight?.duration != null && snapshot.sleep.lastNight.duration > 0) {
    p.sleepDurationHours = snapshot.sleep.lastNight.duration;
    p.sleepQualityScore =
      snapshot.sleep.lastNight.quality === 'excellent' ? 90 :
      snapshot.sleep.lastNight.quality === 'good' ? 75 :
      snapshot.sleep.lastNight.quality === 'fair' ? 50 : 25;
    p.bedTime = snapshot.sleep.lastNight.bedTime?.toISOString() ?? null;
    p.wakeTime = snapshot.sleep.lastNight.wakeTime?.toISOString() ?? null;
    p.sleepProvenance = prov(at);
  }

  if (snapshot.heart?.restingHR != null) {
    p.restingHeartRate = snapshot.heart.restingHR;
    p.heartRateProvenance = prov(at);
  }
  if (snapshot.heart?.hrv != null) {
    p.hrvMs = snapshot.heart.hrv;
    if (!p.heartRateProvenance) p.heartRateProvenance = prov(at);
  }

  if (snapshot.activity) {
    p.steps = snapshot.activity.steps ?? null;
    p.exerciseMinutes = snapshot.activity.exerciseMinutes ?? null;
    p.activeCalories = snapshot.activity.activeCalories ?? null;
    p.standHours = snapshot.activity.standHours ?? null;
    p.activityProvenance = prov(at);
  }

  return p;
}
