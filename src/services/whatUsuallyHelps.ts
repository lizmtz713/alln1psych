/**
 * "What usually helps" — Evidence-based insight copy from suggestedActionsTaken.
 * Only shown when there is enough repeated evidence (3+ takes, 2+ days).
 * Soft, humble wording: "often helps", "tend to respond well to".
 */

import type { GaugeKey } from '../stores/cockpitStore';
import type { SuggestedActionTaken } from './driverAwareSuggestions';
import { getActionTakeCountsByContext } from './driverAwareSuggestions';
import { ALL_DRIVERS } from '../data/driversByGauge';

/** Only show "usually helps" when at least this many takes (with context). */
export const MIN_TAKES_WITH_CONTEXT = 3;
/** Across at least this many distinct days. */
export const MIN_DISTINCT_DAYS = 2;

export type WhatUsuallyHelpsItem = {
  actionId: string;
  /** Short label for the action in insight copy (e.g. "Quick reset"). */
  actionLabel: string;
  /** Context phrase (e.g. "when stress is high"). */
  contextPhrase: string;
  /** Full sentence for display (e.g. "Quick reset often helps when stress is high."). */
  copy: string;
};

/** actionId → short label used in "what usually helps" copy. */
const ACTION_INSIGHT_LABELS: Record<string, string> = {
  'direction-prioritize': 'Prioritizing one task',
  'direction-one-task': 'Prioritizing one task',
  'connection-reach-out': 'Reaching out',
  'body-rest-sleep': 'Quick reset',
  'body-move-hydrate': 'A short walk or hydration',
  'state-quick-reset': 'Quick reset',
  'alignment-values': 'Checking in with your values',
};

/** Gauge → phrase for "when [X]". */
const GAUGE_CONTEXT_PHRASES: Record<GaugeKey, string> = {
  body: 'when Body is run down',
  state: 'when State is strained',
  emotion: 'when Emotion is cloudy',
  connection: 'when Connection feels low',
  direction: 'when Direction feels overloaded',
  alignment: 'when Alignment is off',
};

/** Driver id → phrase (common ones). Fallback: "when [label] affects you". */
const DRIVER_CONTEXT_PHRASES: Record<string, string> = {
  'state-stress': 'when stress is high',
  'state-sleep': 'when sleep is off',
  'body-sleep': 'when sleep is off',
  'dir-work': 'when work feels heavy',
  'emotion-work': 'when work weighs on you',
  'dir-tasks': 'when tasks pile up',
};

function getDriverLabel(driverId: string): string {
  const d = ALL_DRIVERS.find((x) => x.id === driverId);
  return d?.label ?? driverId;
}

function getContextPhraseFromCounts(
  byImpact: Partial<Record<GaugeKey, number>> | undefined,
  byDriver: Record<string, number> | undefined
): string {
  const impactEntries = byImpact
    ? (Object.entries(byImpact) as [GaugeKey, number][])
    : [];
  const driverEntries = byDriver ? Object.entries(byDriver) : [];
  let bestImpact: [GaugeKey, number] | null = null;
  for (const [g, c] of impactEntries) {
    if (!bestImpact || c > bestImpact[1]) bestImpact = [g, c];
  }
  let bestDriver: [string, number] | null = null;
  for (const [id, c] of driverEntries) {
    if (!bestDriver || c > bestDriver[1]) bestDriver = [id, c];
  }
  if (bestDriver && (!bestImpact || bestDriver[1] >= bestImpact[1])) {
    return DRIVER_CONTEXT_PHRASES[bestDriver[0]] ?? `when ${getDriverLabel(bestDriver[0])} affects you`;
  }
  if (bestImpact) return GAUGE_CONTEXT_PHRASES[bestImpact[0]];
  return '';
}

/**
 * Returns "what usually helps" items that meet the evidence threshold.
 * Use for: under primary suggestion, weekly review, insights tab.
 */
export function getWhatUsuallyHelps(
  suggestedActionsTaken: SuggestedActionTaken[]
): WhatUsuallyHelpsItem[] {
  const { byActionId, byActionIdAndImpact, byActionIdAndDriver } =
    getActionTakeCountsByContext(suggestedActionsTaken);
  const takesWithContext = suggestedActionsTaken.filter(
    (t) => (t.systemImpact?.length ?? 0) > 0 || (t.drivers?.length ?? 0) > 0
  );
  const byActionIdDays: Record<string, Set<string>> = {};
  for (const t of takesWithContext) {
    const day = t.takenAt.slice(0, 10);
    if (!byActionIdDays[t.actionId]) byActionIdDays[t.actionId] = new Set();
    byActionIdDays[t.actionId].add(day);
  }

  const out: WhatUsuallyHelpsItem[] = [];
  for (const actionId of Object.keys(byActionId)) {
    const count = byActionId[actionId] ?? 0;
    if (count < MIN_TAKES_WITH_CONTEXT) continue;
    const days = byActionIdDays[actionId];
    if (!days || days.size < MIN_DISTINCT_DAYS) continue;
    const contextPhrase = getContextPhraseFromCounts(
      byActionIdAndImpact[actionId],
      byActionIdAndDriver[actionId]
    );
    if (!contextPhrase) continue;
    const actionLabel = ACTION_INSIGHT_LABELS[actionId] ?? actionId;
    const copy = `${actionLabel} often helps ${contextPhrase}.`;
    out.push({ actionId, actionLabel, contextPhrase, copy });
  }
  return out;
}

/**
 * Returns the "usually helps" line for a single action, if it meets the threshold.
 * Use under the primary suggestion: "This usually helps when work affects your Direction."
 */
export function getWhatUsuallyHelpsForAction(
  actionId: string,
  suggestedActionsTaken: SuggestedActionTaken[]
): string | null {
  const items = getWhatUsuallyHelps(suggestedActionsTaken);
  const item = items.find((i) => i.actionId === actionId);
  if (!item) return null;
  return `This often helps ${item.contextPhrase}.`;
}
