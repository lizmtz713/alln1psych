/**
 * Lights Map — Position calculation, brightness, attention (flickering) detection.
 */

import type { Light } from '../types/lights';
import type { MapNode, TierBreakdown, TemperatureSummary } from '../types/lightsMap';
import { getLightBrightness, BRIGHTNESS_CONFIG } from './friendshipMaintenance';
import { TIER_LABELS } from '../types/lights';

const BRIGHTNESS_TO_VALUE: Record<string, number> = {
  bright: BRIGHTNESS_CONFIG.bright.glow * 2,
  steady: 0.8,
  dimming: 0.5,
  dim: 0.3,
  dark: 0.15,
};

const TIER_ORDER: Array<Exclude<Light['tier'], 'archived'>> = ['five', 'fifteen', 'fifty', 'network'];

/** Radii (normalized 0–1) for each tier ring */
const TIER_RADII: Record<typeof TIER_ORDER[number], number> = {
  five: 0.18,
  fifteen: 0.38,
  fifty: 0.62,
  network: 0.92,
};

/** Convert light to map node with position (normalized coordinates, origin center) */
export function lightToMapNode(light: Light, indexInTier: number, totalInTier: number): MapNode {
  const tier = light.tier === 'archived' ? 'network' : light.tier;
  const radius = TIER_RADII[tier];
  const angle = totalInTier <= 0 ? 0 : (indexInTier / totalInTier) * Math.PI * 2 - Math.PI / 2;
  const brightnessLevel = getLightBrightness(light.tier, light.daysSinceContact);
  const brightnessValue = BRIGHTNESS_TO_VALUE[brightnessLevel] ?? 0.2;

  return {
    id: light.id,
    name: light.name,
    tier: light.tier,
    temperature: light.temperature,
    brightness: brightnessValue,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    flickering: light.status === 'flickering',
    daysSinceContact: light.daysSinceContact,
  };
}

/** Build all map nodes from lights (excluding archived) */
export function computeMapNodes(lights: Light[]): MapNode[] {
  const active = lights.filter((l) => l.tier !== 'archived');
  const byTier: Record<string, Light[]> = { five: [], fifteen: [], fifty: [], network: [] };
  active.forEach((l) => {
    const t = l.tier === 'archived' ? 'network' : l.tier;
    if (byTier[t]) byTier[t].push(l);
  });

  const nodes: MapNode[] = [];
  TIER_ORDER.forEach((tier) => {
    const list = byTier[tier] ?? [];
    list.forEach((light, i) => nodes.push(lightToMapNode(light, i, list.length)));
  });
  return nodes;
}

/** Tier breakdown for summary cards */
export function getTierBreakdown(lights: Light[]): TierBreakdown[] {
  const maxByTier: Record<string, number> = { five: 5, fifteen: 15, fifty: 50, network: 150 };
  const count: Record<string, number> = { five: 0, fifteen: 0, fifty: 0, network: 0 };
  lights.filter((l) => l.tier !== 'archived').forEach((l) => { count[l.tier] = (count[l.tier] ?? 0) + 1; });

  return TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    count: count[tier] ?? 0,
    max: maxByTier[tier] ?? 0,
  }));
}

/** Temperature summary counts */
export function getTemperatureSummary(lights: Light[]): TemperatureSummary {
  const s: TemperatureSummary = { warm: 0, neutral: 0, cool: 0, unknown: 0 };
  lights.filter((l) => l.tier !== 'archived').forEach((l) => {
    const t = l.temperature === 'unknown' ? 'unknown' : l.temperature;
    s[t]++;
  });
  return s;
}

/** Nodes that need attention (flickering) */
export function getAttentionNodeIds(nodes: MapNode[]): string[] {
  return nodes.filter((n) => n.flickering).map((n) => n.id);
}
