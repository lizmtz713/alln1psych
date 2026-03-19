/**
 * Driver-aware suggestions — Combine system impact + drivers for context-aware guidance.
 * Human, specific wording. Each action has an id for follow-through tracking.
 */

import type { GaugeKey } from '../stores/cockpitStore';

export type SuggestedAction = { id: string; label: string; route: string };

function add(
  out: SuggestedAction[],
  used: Set<string>,
  id: string,
  label: string,
  route: string
): void {
  if (used.has(route)) return;
  used.add(route);
  out.push({ id, label, route });
}

/**
 * Returns contextual suggestions (strongest first). Card should use [0] as primary.
 * Wording: human, specific, one clear action per line.
 */
export function getDriverAwareSuggestions(
  systemImpact: GaugeKey[] | null,
  driverIds: string[] | null
): SuggestedAction[] {
  const impact = systemImpact ?? [];
  const drivers = driverIds ?? [];
  const out: SuggestedAction[] = [];
  const used = new Set<string>();

  const a = (id: string, label: string, route: string) => add(out, used, id, label, route);

  // —— Driver + impact (context-aware, human copy) ——
  const hasWork = drivers.some((id) => id === 'dir-work' || id === 'emotion-work');
  const hasFamily = drivers.some((id) => id === 'conn-family');
  const hasFriends = drivers.some((id) => id === 'conn-friends');
  const hasPartner = drivers.some((id) => id === 'conn-partner');
  const hasSleep = drivers.some((id) => id === 'body-sleep' || id === 'state-sleep');
  const hasTasks = drivers.some((id) => id === 'dir-tasks');
  const hasStress = drivers.some((id) => id === 'state-stress');

  if (impact.includes('direction') && (hasWork || hasTasks)) {
    a('direction-prioritize', 'Pick one thing to move — it can ease the pressure.', '/(modals)/decode');
  }
  if (impact.includes('connection') && (hasFamily || hasFriends || hasPartner)) {
    a('connection-reach-out', 'Send a quick text to someone who matters to you.', '/(tabs)/people');
  }
  if ((impact.includes('body') || impact.includes('state')) && hasSleep) {
    a('body-rest-sleep', 'A short rest or an earlier night could help.', '/tools/quick-reset');
  }
  if (impact.includes('direction') && hasTasks && !hasWork) {
    a('direction-one-task', 'Choose one task and give it 20 minutes.', '/(modals)/decode');
  }
  if ((impact.includes('state') || impact.includes('emotion')) && hasStress) {
    a('state-quick-reset', 'Try a quick reset or a few deep breaths.', '/tools/quick-reset');
  }

  // —— Fallbacks: impact-only, same human tone ——
  if (out.length < 2 && impact.includes('connection')) {
    a('connection-reach-out', 'Reach out to one person today.', '/(tabs)/people');
  }
  if (out.length < 2 && impact.includes('body')) {
    a('body-move-hydrate', 'A short walk or a glass of water.', '/tools/quick-reset');
  }
  if (out.length < 2 && impact.includes('direction')) {
    a('direction-prioritize', 'Pick one task to focus on.', '/(modals)/decode');
  }
  if (out.length < 2 && (impact.includes('state') || impact.includes('emotion'))) {
    a('state-quick-reset', 'Try a quick reset or a few deep breaths.', '/tools/quick-reset');
  }
  if (out.length < 2 && impact.includes('alignment')) {
    a('alignment-values', 'Check in with what matters to you.', '/(tabs)/talk');
  }

  return out.slice(0, 3);
}

/** Primary suggestion for the card (strongest only). No personalization. */
export function getPrimarySuggestion(
  systemImpact: GaugeKey[] | null,
  driverIds: string[] | null
): SuggestedAction | null {
  const list = getDriverAwareSuggestions(systemImpact, driverIds);
  return list[0] ?? null;
}

/** Past action with optional context (for personalization). */
export type SuggestedActionTaken = {
  actionId: string;
  route: string;
  label?: string;
  takenAt: string;
  systemImpact?: GaugeKey[];
  drivers?: string[];
};

const BOOST_PER_SIMILAR_TAKE = 0.3;
const MAX_PERSONALIZATION_BOOST = 1.5;

/** True when past context is present and overlaps current (impact or drivers). */
function isSimilarContext(
  currentImpact: GaugeKey[],
  currentDrivers: string[],
  pastImpact: GaugeKey[] | undefined,
  pastDrivers: string[] | undefined
): boolean {
  if (!pastImpact?.length && !pastDrivers?.length) return false;
  const impactOverlap =
    pastImpact?.length && currentImpact.some((g) => pastImpact!.includes(g));
  const driversOverlap =
    pastDrivers?.length && currentDrivers.some((d) => pastDrivers!.includes(d));
  return !!impactOverlap || !!driversOverlap;
}

/**
 * Primary suggestion with lightweight personalization: prefers actions the user
 * has taken in similar contexts. Soft boost only; base order still dominates.
 */
export function getPrimarySuggestionWithPersonalization(
  systemImpact: GaugeKey[] | null,
  driverIds: string[] | null,
  suggestedActionsTaken: SuggestedActionTaken[]
): SuggestedAction | null {
  const list = getDriverAwareSuggestions(systemImpact, driverIds);
  if (list.length === 0) return null;
  const impact = systemImpact ?? [];
  const drivers = driverIds ?? [];

  const scored = list.map((action, index) => {
    const baseScore = 10 - index;
    const similarCount = suggestedActionsTaken.filter(
      (t) =>
        t.actionId === action.id &&
        isSimilarContext(impact, drivers, t.systemImpact, t.drivers)
    ).length;
    const boost = Math.min(
      MAX_PERSONALIZATION_BOOST,
      similarCount * BOOST_PER_SIMILAR_TAKE
    );
    return { action, score: baseScore + boost };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].action;
}

/**
 * For future insights: count how often an action was taken in contexts that
 * included a given gauge or driver. Enables copy like "Quick reset often helps
 * when stress is high" or "You tend to respond well to prioritizing one task
 * when Direction is strained."
 */
export function getActionTakeCountsByContext(
  suggestedActionsTaken: SuggestedActionTaken[]
): {
  byActionId: Record<string, number>;
  byActionIdAndImpact: Record<string, Partial<Record<GaugeKey, number>>>;
  byActionIdAndDriver: Record<string, Record<string, number>>;
} {
  const byActionId: Record<string, number> = {};
  const byActionIdAndImpact: Record<string, Partial<Record<GaugeKey, number>>> = {};
  const byActionIdAndDriver: Record<string, Record<string, number>> = {};
  for (const t of suggestedActionsTaken) {
    byActionId[t.actionId] = (byActionId[t.actionId] ?? 0) + 1;
    for (const g of t.systemImpact ?? []) {
      if (!byActionIdAndImpact[t.actionId]) byActionIdAndImpact[t.actionId] = {};
      const m = byActionIdAndImpact[t.actionId]!;
      m[g] = (m[g] ?? 0) + 1;
    }
    for (const d of t.drivers ?? []) {
      if (!byActionIdAndDriver[t.actionId]) byActionIdAndDriver[t.actionId] = {};
      byActionIdAndDriver[t.actionId][d] = (byActionIdAndDriver[t.actionId][d] ?? 0) + 1;
    }
  }
  return { byActionId, byActionIdAndImpact, byActionIdAndDriver };
}
