/**
 * Oura → Canonical health adapter.
 * Maps Oura snapshot into CanonicalPhysiology for the merge layer.
 * See docs/WEARABLE-DATA-AUDIT.md.
 */

import type { OuraSnapshot } from '../../services/ouraIntegration';
import type { CanonicalPhysiology, DataProvenance } from '../../types/canonicalHealth';

const SOURCE: DataProvenance['source'] = 'oura';

function prov(updatedAt: Date): DataProvenance {
  return { source: SOURCE, updatedAt: updatedAt.toISOString() };
}

export function ouraToCanonical(snapshot: OuraSnapshot): Partial<CanonicalPhysiology> {
  if (!snapshot.connected || !snapshot.lastSynced) return {};
  const at = new Date(snapshot.lastSynced);
  const p: Partial<CanonicalPhysiology> = {};

  if (snapshot.sleep) {
    const s = snapshot.sleep;
    p.sleepDurationHours = typeof s.duration === 'number' ? s.duration / 3600 : null;
    p.sleepQualityScore = s.score ?? null;
    p.sleepEfficiencyPercent = s.efficiency ?? null;
    p.sleepLatencyMinutes = typeof s.latency === 'number' ? s.latency / 60 : null;
    p.remMinutes = typeof s.remSleepDuration === 'number' ? s.remSleepDuration / 60 : null;
    p.deepMinutes = typeof s.deepSleepDuration === 'number' ? s.deepSleepDuration / 60 : null;
    p.bedTime = s.bedtimeStart || null;
    p.wakeTime = s.bedtimeEnd || null;
    p.sleepProvenance = prov(at);
  }

  if (snapshot.readiness) {
    const r = snapshot.readiness;
    p.recoveryScore = r.score ?? null;
    p.temperatureDeviation = r.temperatureDeviation ?? null;
    p.restingHeartRate = r.restingHeartRate ?? null;
    p.hrvMs = null; // readiness has hrvBalance not raw HRV; heart has hrv
    p.recoveryProvenance = prov(at);
  }

  if (snapshot.heart) {
    const h = snapshot.heart;
    if (h.hrv != null) p.hrvMs = h.hrv;
    if (h.restingHeartRate != null) p.restingHeartRate = p.restingHeartRate ?? h.restingHeartRate;
    if (h.breathingRate != null) p.respiratoryRate = h.breathingRate;
    if (!p.heartRateProvenance) p.heartRateProvenance = prov(at);
  }

  if (snapshot.activity) {
    const a = snapshot.activity;
    p.steps = a.steps ?? null;
    p.activeCalories = a.activeCalories ?? null;
    p.activityProvenance = prov(at);
  }

  return p;
}
