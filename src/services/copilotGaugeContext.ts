/**
 * CoPilot Gauge Context — Builds the "CURRENT USER STATE" block for the Talk system prompt.
 * Call from prompt builder (non-React) or via useCoPilotGaugeContext in React.
 */

import { useCockpitStore } from '../stores/cockpitStore';
import type { GaugeKey } from '../stores/cockpitStore';
import { getToolsForGauge } from '../data/toolGaugeMappings';
import { GAUGE_CONFIG } from '../utils/gaugeHelpers';

const CRITICAL_THRESHOLD = 35;
const LOW_THRESHOLD = 50;

/** Short descriptions for CoPilot to mention naturally (mention if appropriate) */
const COPILOT_TOOL_DESCRIPTIONS: Partial<Record<string, string>> = {
  'quick-reset': '2-minute nervous system reset',
  'reach-out': 'Connect with someone',
  breathing: 'Box breathing — 4 in, 4 hold, 4 out',
  'emotion-wheel': 'Name what you feel',
  'body-scan': 'Check in with your body',
  'thought-challenger': 'Challenge a tough thought',
  'pre-check': 'Pre-conversation check',
  decode: 'Decode what you are feeling',
  relate: 'Relate to someone in your circle',
  'role-play': 'Practice a hard conversation',
  replay: 'Replay and reflect',
};

const GAUGE_ORDER: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

/**
 * Build the CoPilot gauge context string from current cockpit state.
 * Safe to call from non-React code (reads store via getState()).
 */
export function getCoPilotGaugeContext(): string {
  const cockpit = useCockpitStore.getState();
  const lines: string[] = [];
  const critical: string[] = [];
  const low: string[] = [];
  const toolKeysSeen = new Set<string>();

  lines.push('CURRENT USER STATE:');
  lines.push('');
  lines.push('Gauges:');

  GAUGE_ORDER.forEach((key) => {
    const g = cockpit[key];
    const value = g?.value ?? -1;
    const trend = g?.trend;
    const label = GAUGE_CONFIG[key]?.label ?? key.charAt(0).toUpperCase() + key.slice(1);
    if (value < 0) {
      lines.push(`  ${label}: —`);
      return;
    }
    let suffix = '';
    if (value < CRITICAL_THRESHOLD) {
      critical.push(label);
      suffix = trend === 'declining' ? ' ↓ (critical)' : ' (critical)';
    } else if (value < LOW_THRESHOLD) {
      low.push(label);
      suffix = trend === 'declining' ? ' ↓ (low)' : ' (low)';
    } else if (trend === 'declining') {
      suffix = ' ↓';
    }
    lines.push(`  ${label}: ${value}${suffix}`);
  });

  lines.push('');
  if (critical.length > 0) {
    lines.push(`⚠️ Critical: ${critical.join(', ')}`);
  }
  if (low.length > 0) {
    lines.push(`Low: ${low.join(', ')}`);
  }
  if (critical.length === 0 && low.length === 0) {
    lines.push('No gauges in critical or low range.');
  }

  const labelToKey = (l: string): GaugeKey => {
    const entry = (Object.entries(GAUGE_CONFIG) as [GaugeKey, { label: string }][]).find(([, v]) => v.label === l);
    return entry ? entry[0] : (l.toLowerCase() as GaugeKey);
  };
  const relevantTools: string[] = [];
  [...critical, ...low].forEach((label) => {
    const key = labelToKey(label);
    const tools = getToolsForGauge(key);
    tools.slice(0, 2).forEach((t) => {
      if (toolKeysSeen.has(t.key)) return;
      toolKeysSeen.add(t.key);
      const desc = COPILOT_TOOL_DESCRIPTIONS[t.key] ?? t.label;
      relevantTools.push(`  • ${t.label} — ${desc}`);
    });
  });

  if (relevantTools.length > 0) {
    lines.push('');
    lines.push('RELEVANT TOOLS (mention naturally if appropriate):');
    lines.push(...relevantTools);
  }

  lines.push('');
  lines.push('GUIDELINES:');
  lines.push('- Acknowledge their state if they mention feeling off');
  lines.push("- Don't lead with tool suggestions — let the conversation flow");
  lines.push('- If they seem stuck or ask for help, THEN mention a relevant tool');
  lines.push('- Be warm and present, not prescriptive');

  return lines.join('\n');
}
