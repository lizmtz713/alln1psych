/**
 * Personal Strategy Loop — Identify what works for this user (action → outcome).
 * Links suggestedActionsTaken (with gaugesAtTime) to later check-in gauges to compute deltas.
 */

import type { GaugeKey } from '../stores/cockpitStore';

const MS_48H = 48 * 60 * 60 * 1000;
const MIN_PAIRS = 2;
const MIN_DELTA = 5;

export type ActionTakenWithGauges = {
  actionId: string;
  takenAt: string;
  gaugesAtTime?: Partial<Record<GaugeKey, number>>;
};

export type CheckInWithGauges = {
  timestamp: string;
  gauges?: Partial<Record<GaugeKey, number>>;
};

export type PersonalStrategyItem = {
  actionId: string;
  actionLabel: string;
  gauge: GaugeKey;
  gaugeLabel: string;
  /** e.g. "Quick reset improves your state." */
  copy: string;
};

const ACTION_LABELS: Record<string, string> = {
  'direction-prioritize': 'Prioritizing one task',
  'direction-one-task': 'Prioritizing one task',
  'connection-reach-out': 'Reaching out',
  'body-rest-sleep': 'Quick reset',
  'body-move-hydrate': 'Moving or hydrating',
  'state-quick-reset': 'Quick reset',
  'alignment-values': 'Checking in with your values',
};

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'state',
  emotion: 'emotion',
  connection: 'connection',
  direction: 'Direction',
  alignment: 'alignment',
};

/**
 * Returns "what works for you" items: action → gauge improved.
 * Only includes actions with at least MIN_PAIRS before/after pairs and average delta >= MIN_DELTA.
 */
export function getPersonalStrategy(
  suggestedActionsTaken: ActionTakenWithGauges[],
  checkInHistory: CheckInWithGauges[]
): PersonalStrategyItem[] {
  const out: PersonalStrategyItem[] = [];
  const takesWithGauges = suggestedActionsTaken.filter((t) => t.gaugesAtTime && Object.keys(t.gaugesAtTime).length > 0);
  const historyWithGauges = checkInHistory.filter((h) => h.gauges && Object.keys(h.gauges).length > 0);

  const byActionAndGauge: Record<string, Record<string, number[]>> = {};

  for (const take of takesWithGauges) {
    const takenAt = new Date(take.takenAt).getTime();
    const later = historyWithGauges.find((h) => {
      const t = new Date(h.timestamp).getTime();
      return t > takenAt && t - takenAt <= MS_48H;
    });
    if (!later?.gauges) continue;

    const before = take.gaugesAtTime!;
    for (const g of Object.keys(before) as GaugeKey[]) {
      const b = before[g];
      const a = later.gauges[g];
      if (b == null || a == null) continue;
      const delta = a - b;
      const key = `${take.actionId}:${g}`;
      if (!byActionAndGauge[take.actionId]) byActionAndGauge[take.actionId] = {};
      if (!byActionAndGauge[take.actionId][g]) byActionAndGauge[take.actionId][g] = [];
      byActionAndGauge[take.actionId][g].push(delta);
    }
  }

  for (const actionId of Object.keys(byActionAndGauge)) {
    for (const gauge of Object.keys(byActionAndGauge[actionId]) as GaugeKey[]) {
      const deltas = byActionAndGauge[actionId][gauge];
      if (deltas.length < MIN_PAIRS) continue;
      const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
      if (avg < MIN_DELTA) continue;
      const actionLabel = ACTION_LABELS[actionId] ?? actionId;
      const gaugeLabel = GAUGE_LABELS[gauge] ?? gauge;
      out.push({
        actionId,
        actionLabel,
        gauge,
        gaugeLabel,
        copy: `${actionLabel} improves your ${gaugeLabel}.`,
      });
    }
  }

  return out;
}
