/**
 * CoPilot Gauge Context — Builds a string block for the AI system prompt
 * from current cockpit gauge state. Used by ai.ts and useCoPilotGaugeContext.
 */

import { useCockpitStore } from '../stores/cockpitStore';
import type { GaugeKey } from '../stores/cockpitStore';
import { GAUGE_CONFIG, getGaugeStatusLabel } from '../utils/gaugeHelpers';

const GAUGE_KEYS: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

/**
 * Returns current gauge context as a string for the CoPilot system prompt.
 * Call from non-React code (e.g. prompt builder in ai.ts).
 */
export function getCoPilotGaugeContext(): string {
  const state = useCockpitStore.getState();
  const parts: string[] = [];

  for (const key of GAUGE_KEYS) {
    const gauge = state[key];
    const config = GAUGE_CONFIG[key];
    const label = config?.label ?? key;
    if (gauge.value >= 0) {
      const status = getGaugeStatusLabel(gauge.value);
      parts.push(`${label}: ${gauge.value} (${status})`);
    } else {
      parts.push(`${label}: unset`);
    }
  }

  const line = parts.join(' | ');
  return `CURRENT GAUGE CONTEXT (use to acknowledge how they're doing; suggest tools for low/unset gauges when relevant):\n${line}`;
}
