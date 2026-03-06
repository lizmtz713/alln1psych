/**
 * Lights Map — Constellation view types (nodes, tiers, temperatures).
 */

import type { LightTier, LightTemperature } from './lights';

export interface MapNode {
  id: string;
  name: string;
  tier: LightTier;
  temperature: LightTemperature;
  /** 0–1 brightness from connection frequency */
  brightness: number;
  x: number;
  y: number;
  /** Needs attention (flickering) */
  flickering: boolean;
  daysSinceContact: number;
}

export interface LightsMapData {
  nodes: MapNode[];
  /** Center (you) position for drawing */
  center: { x: number; y: number };
}

export type MapFormat = 'square' | 'story';

export interface TierBreakdown {
  tier: LightTier;
  label: string;
  count: number;
  max: number;
}

export interface TemperatureSummary {
  warm: number;
  neutral: number;
  cool: number;
  unknown: number;
}
