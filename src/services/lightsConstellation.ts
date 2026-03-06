/**
 * Lights Constellation — Compute nodes with 5-signal encoding and clusters.
 */

import type { Light } from '../types/lights';
import type { ConstellationNode, RelationshipClusterId } from '../types/lightsConstellation';
import { getLightBrightness } from './friendshipMaintenance';
import { FLICKER_DAYS } from '../types/lights';

const TIER_ORDER: Array<Exclude<Light['tier'], 'archived'>> = ['five', 'fifteen', 'fifty', 'network'];

/** Radii (normalized 0–1) for each tier ring */
const TIER_RADII: Record<(typeof TIER_ORDER)[number], number> = {
  five: 0.22,
  fifteen: 0.42,
  fifty: 0.65,
  network: 0.92,
};

/** Map relationshipType (or similar) to cluster */
export function relationshipTypeToCluster(relationshipType?: string): RelationshipClusterId {
  if (!relationshipType) return 'other';
  const t = relationshipType.toLowerCase();
  if (t.includes('parent') || t.includes('child') || t.includes('sibling') || t.includes('family')) return 'family';
  if (t.includes('friend') || t.includes('partner')) return 'close-friends';
  if (t.includes('work') || t.includes('colleague') || t.includes('professional')) return 'work';
  if (t.includes('community') || t.includes('faith') || t.includes('hobby')) return 'community';
  return 'other';
}

/** Size ratio from recency: recent contact = larger (max 1.4), old = smaller (min 0.6) */
function sizeRatioFromDays(days: number): number {
  if (days <= 1) return 1.4;
  if (days <= 7) return 1.2;
  if (days <= 14) return 1.0;
  if (days <= 30) return 0.85;
  return Math.max(0.6, 0.9 - (days - 30) * 0.005);
}

/** Brightness 0–1 from tier + days */
function brightnessFromLight(light: Light): number {
  const level = getLightBrightness(light.tier, light.daysSinceContact);
  const map: Record<string, number> = {
    bright: 1,
    steady: 0.75,
    dimming: 0.5,
    dim: 0.3,
    dark: 0.15,
  };
  return map[level] ?? 0.5;
}

/** Convert Light to ConstellationNode with position (by tier ring + angle within cluster) */
export function lightToConstellationNode(
  light: Light,
  indexInTier: number,
  totalInTier: number,
  clusterAngleOffset: Record<RelationshipClusterId, number>
): ConstellationNode {
  const tier = light.tier === 'archived' ? 'network' : light.tier;
  const radius = TIER_RADII[tier];
  const cluster = relationshipTypeToCluster(light.relationshipType);
  const baseAngle = totalInTier <= 0 ? 0 : (indexInTier / totalInTier) * Math.PI * 2 - Math.PI / 2;
  const offset = clusterAngleOffset[cluster] ?? 0;
  const angle = baseAngle + offset * 0.1;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const flickering = light.status === 'flickering';
  const brightness = brightnessFromLight(light);
  const sizeRatio = sizeRatioFromDays(light.daysSinceContact);

  return {
    id: light.id,
    name: light.name,
    tier: light.tier,
    temperature: light.temperature,
    brightness,
    x,
    y,
    flickering,
    daysSinceContact: light.daysSinceContact,
    cluster,
    sizeRatio,
    note: light.notes?.slice(0, 60),
    phone: light.phone,
    relationshipType: light.relationshipType,
  };
}

/** Build all constellation nodes from lights (excluding archived) */
export function computeConstellationNodes(lights: Light[]): ConstellationNode[] {
  const active = lights.filter((l) => l.tier !== 'archived');
  const byTier: Record<string, Light[]> = { five: [], fifteen: [], fifty: [], network: [] };
  active.forEach((l) => {
    const t = l.tier === 'archived' ? 'network' : l.tier;
    if (byTier[t]) byTier[t].push(l);
  });

  const clusters: RelationshipClusterId[] = ['family', 'close-friends', 'work', 'community', 'other'];
  const clusterAngleOffset: Record<RelationshipClusterId, number> = {
    family: 0,
    'close-friends': 0.3,
    work: 0.6,
    community: 0.9,
    other: 1.2,
  };

  const nodes: ConstellationNode[] = [];
  TIER_ORDER.forEach((tier) => {
    const list = byTier[tier] ?? [];
    list.forEach((light, i) =>
      nodes.push(lightToConstellationNode(light, i, list.length, clusterAngleOffset))
    );
  });
  return nodes;
}

/** Get nodes that need attention (flickering) */
export function getConstellationAttentionIds(nodes: ConstellationNode[]): string[] {
  return nodes.filter((n) => n.flickering).map((n) => n.id);
}
