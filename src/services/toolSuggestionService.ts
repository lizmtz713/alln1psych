/**
 * Gauge-Triggered Tools — Suggestion engine.
 * Ranks tools by urgency (gauges low or declining).
 */

import type { GaugeKey } from '../stores/cockpitStore';
import { TOOL_GAUGE_MAPPINGS } from '../data/toolGaugeMappings';

export interface GaugeSnapshot {
  value: number;
  trend: 'improving' | 'stable' | 'declining' | null;
}

export interface ToolSuggestion {
  toolKey: string;
  label: string;
  icon: string;
  route: string;
  reason: string;
  /** Primary gauge this suggestion targets */
  gauge: GaugeKey;
}

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

/** Threshold below which a gauge is "low" */
const LOW_THRESHOLD = 50;
/** Critical threshold */
const CRITICAL_THRESHOLD = 35;

/** Urgency score for a gauge (higher = more urgent) */
function gaugeUrgency(
  value: number,
  trend: 'improving' | 'stable' | 'declining' | null
): number {
  if (value < 0) return 0;
  let score = 0;
  if (value < CRITICAL_THRESHOLD) score += 30;
  else if (value < LOW_THRESHOLD) score += 20;
  else if (value < 60) score += 5;
  if (trend === 'declining') score += 15;
  if (trend === 'stable' && value < LOW_THRESHOLD) score += 5;
  return score;
}

/** Get ranked tool suggestions from current gauge state */
export function getToolSuggestions(
  gauges: Partial<Record<GaugeKey, GaugeSnapshot>>,
  options: { limit?: number; focusGauge?: GaugeKey } = {}
): ToolSuggestion[] {
  const limit = options.limit ?? 5;
  const focusGauge = options.focusGauge;

  const urgencyByGauge: Record<GaugeKey, number> = {
    body: 0,
    state: 0,
    emotion: 0,
    connection: 0,
    direction: 0,
    alignment: 0,
  };

  (Object.keys(urgencyByGauge) as GaugeKey[]).forEach((g) => {
    const snap = gauges[g];
    if (snap && snap.value >= 0) {
      urgencyByGauge[g] = gaugeUrgency(snap.value, snap.trend);
    }
  });

  const scored = TOOL_GAUGE_MAPPINGS.map((tool) => {
    let score = 0;
    let bestGauge: GaugeKey = 'body';
    let bestUrgency = 0;
    for (const g of tool.gauges) {
      const u = urgencyByGauge[g];
      if (u > bestUrgency) {
        bestUrgency = u;
        bestGauge = g;
      }
      score += u;
    }
    if (focusGauge && tool.gauges.includes(focusGauge)) {
      score += urgencyByGauge[focusGauge] + 10;
      bestGauge = focusGauge;
    }
    return { tool, score, bestGauge };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, limit);

  const snap = focusGauge ? gauges[focusGauge] : null;
  const value = snap?.value ?? 0;
  const trend = snap?.trend;

  return top.map(({ tool, bestGauge }) => {
    const label = GAUGE_LABELS[bestGauge];
    let reason: string;
    if (value >= 0 && value < CRITICAL_THRESHOLD) {
      reason = `${label} needs support — try ${tool.label}`;
    } else if (value < LOW_THRESHOLD) {
      reason = `${label} could use a boost — try ${tool.label}`;
    } else if (trend === 'declining') {
      reason = `${label} is trending down — ${tool.label} can help`;
    } else {
      reason = `Good for ${label} — ${tool.label}`;
    }
    return {
      toolKey: tool.key,
      label: tool.label,
      icon: tool.icon,
      route: tool.route,
      reason,
      gauge: bestGauge,
    };
  });
}

/** Check if we have at least one gauge with data (for showing "Suggested for you") */
export function hasAnyGaugeData(gauges: Partial<Record<GaugeKey, GaugeSnapshot>>): boolean {
  return (Object.keys(gauges) as GaugeKey[]).some((g) => {
    const v = gauges[g]?.value;
    return v != null && v >= 0;
  });
}
