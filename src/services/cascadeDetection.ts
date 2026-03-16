/**
 * Cascade Detection — Detect chains of influence across gauges.
 * One part of the system fails → chain reaction. Rule-based; no AI.
 * Integrates with existing insight engine as cause-type insights.
 * @see docs/LIFE-OS-INFLUENCING-SYSTEMS.md, cascade concept
 */

import type { GaugeKey } from '../stores/cockpitStore';
import type { CauseInsight } from '../types/insights-engine';

const MS_48H = 48 * 60 * 60 * 1000;
const LOW = 50;   // gauge < this = low
const MIN_CONFIDENCE = 0.6;

export type CascadeInput = {
  gaugeValues: Partial<Record<GaugeKey, number>>;
  healthContext?: {
    lastNightSleepHours?: number;
    readinessScore?: number;
    hrvMs?: number;
  };
  sleepByDay?: Array<{ date: string; hours?: number; quality?: number }>;
  daysSinceConnection?: number;
  /** Last 5–10 check-ins with drivers and system impact (within ~48h for cascade relevance) */
  recentCheckInHistory?: Array<{
    timestamp: string;
    systemImpact: GaugeKey[];
    drivers: string[];
    gauges?: Partial<Record<GaugeKey, number>>;
  }>;
  currentDrivers?: string[] | null;
  currentSystemImpact?: GaugeKey[] | null;
};

function low(g: Partial<Record<GaugeKey, number>>, key: GaugeKey): boolean {
  const v = g[key];
  return v != null && v >= 0 && v < LOW;
}

function countLow(g: Partial<Record<GaugeKey, number>>, keys: GaugeKey[]): number {
  return keys.filter((k) => low(g, k)).length;
}

/** Work/overload/task drivers */
function hasAttentionDrivers(drivers: string[]): boolean {
  return drivers.some(
    (id) =>
      id === 'dir-work' ||
      id === 'dir-tasks' ||
      id === 'dir-overload' ||
      id === 'emotion-work' ||
      id === 'state-stress'
  );
}

/** Sleep/recovery drivers */
function hasRecoveryDrivers(drivers: string[]): boolean {
  return drivers.some(
    (id) => id === 'body-sleep' || id === 'state-sleep' || id === 'state-stress'
  );
}

function nanoid(): string {
  return `cascade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Returns at most one cascade insight when a chain is detected with sufficient confidence.
 * Recovery, Attention, Reciprocity, Meaning (Environment skipped until we have data).
 */
export function detectCascade(input: CascadeInput): CauseInsight | null {
  const {
    gaugeValues,
    healthContext,
    sleepByDay,
    daysSinceConnection,
    recentCheckInHistory = [],
    currentDrivers,
    currentSystemImpact,
  } = input;
  const driversList = currentDrivers ?? [];
  const systemImpactList = currentSystemImpact ?? [];
  const drivers = driversList.length > 0 ? driversList : recentCheckInHistory.flatMap((h) => (h.drivers ?? []) as string[]);
  const recent48h = recentCheckInHistory.filter((h) => {
    const t = new Date(h.timestamp).getTime();
    return Date.now() - t <= MS_48H;
  });

  // ─── Recovery cascade: sleep/recovery low → body/state/emotion low ───
  const sleepHours = healthContext?.lastNightSleepHours;
  const readinessLow = healthContext?.readinessScore != null && healthContext.readinessScore < 50;
  const hrvLow = healthContext?.hrvMs != null && healthContext.hrvMs < 35;
  const poorSleepNights =
    sleepByDay?.filter((s) => (s.hours ?? 0) < 6 || (s.quality ?? 3) <= 2).length ?? 0;
  const recoverySignals = (sleepHours != null && sleepHours < 6) || readinessLow || hrvLow || poorSleepNights >= 2;
  const bodyStateEmotionLow = countLow(gaugeValues, ['body', 'state', 'emotion']) >= 2;
  if (recoverySignals && bodyStateEmotionLow) {
    const confidence = (sleepHours != null && sleepHours < 6 ? 0.75 : 0.65) + (countLow(gaugeValues, ['body', 'state', 'emotion']) >= 3 ? 0.08 : 0);
    if (confidence >= MIN_CONFIDENCE) {
      return {
        id: nanoid(),
        kind: 'cause',
        title: 'Recovery cascade',
        body: 'Low sleep → lower energy → higher stress. This chain may already be unfolding. Rest or an earlier night can help slow it.',
        gauges: (['body', 'state', 'emotion'] as GaugeKey[]).filter((k) => low(gaugeValues, k)),
        confidence: Math.min(0.92, confidence),
        generatedAt: now(),
        factor: 'Cascade (Recovery)',
      };
    }
  }

  // ─── Attention cascade: work/overload drivers + direction/state strain ───
  const attentionDrivers = hasAttentionDrivers(drivers) || recent48h.some((h) => hasAttentionDrivers(h.drivers ?? []));
  const directionStateLow = low(gaugeValues, 'direction') && low(gaugeValues, 'state');
  if (attentionDrivers && directionStateLow) {
    const confidence = 0.68 + (systemImpactList.includes('direction') ? 0.07 : 0);
    if (confidence >= MIN_CONFIDENCE) {
      return {
        id: nanoid(),
        kind: 'cause',
        title: 'Attention cascade',
        body: 'Task switching and overload → direction strain → stress. This may already be playing out. Picking one priority and protecting rest can help slow it.',
        gauges: ['direction', 'state'],
        confidence: Math.min(0.9, confidence),
        generatedAt: now(),
        factor: 'Cascade (Attention)',
      };
    }
  }

  // ─── Reciprocity cascade / social disconnection: connection low + emotion low (with connection gap) ───
  const connectionGap = (daysSinceConnection ?? 0) >= 2;
  const connectionEmotionLow = low(gaugeValues, 'connection') && low(gaugeValues, 'emotion');
  if (connectionGap && connectionEmotionLow) {
    const confidence = 0.7;
    const useQuietPhrasing = (daysSinceConnection ?? 0) >= 3; // "Connection has been quiet recently" when drift is longer
    return {
      id: nanoid(),
      kind: 'cause',
      title: useQuietPhrasing ? 'Connection has been quiet recently' : 'Reciprocity cascade',
      body: useQuietPhrasing
        ? 'Reaching out to someone important could help.'
        : 'Connection gaps → emotional strain. This chain may already be unfolding. Reaching out to one person can slow it.',
      gauges: ['connection', 'emotion'],
      confidence,
      generatedAt: now(),
      factor: 'Cascade (Reciprocity)',
    };
  }

  // ─── Meaning cascade: alignment low + direction low (+ optional state) ───
  const alignmentDirectionLow = low(gaugeValues, 'alignment') && low(gaugeValues, 'direction');
  const stateAlsoLow = low(gaugeValues, 'state');
  if (alignmentDirectionLow && (stateAlsoLow || countLow(gaugeValues, ['alignment', 'direction']) === 2)) {
    const confidence = 0.65 + (stateAlsoLow ? 0.05 : 0);
    if (confidence >= MIN_CONFIDENCE) {
      return {
        id: nanoid(),
        kind: 'cause',
        title: 'Meaning cascade',
        body: 'Low alignment → direction loss → stress. This may already be playing out. Reconnecting with one value or goal can help slow it.',
        gauges: (['alignment', 'direction', 'state'] as GaugeKey[]).filter((k) => low(gaugeValues, k)),
        confidence: Math.min(0.88, confidence),
        generatedAt: now(),
        factor: 'Cascade (Meaning)',
      };
    }
  }

  return null;
}
