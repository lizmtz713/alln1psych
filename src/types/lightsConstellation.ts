/**
 * Lights Constellation — "A radar for human connection"
 * Types for 5-signal encoding, clusters, timeline, and view state.
 */

import type { LightTier, LightTemperature } from './lights';

/** Life domain / relationship cluster for grouping on the radar */
export type RelationshipClusterId =
  | 'family'
  | 'close-friends'
  | 'work'
  | 'community'
  | 'other';

export interface RelationshipCluster {
  id: RelationshipClusterId;
  label: string;
  /** Optional tint for cluster region */
  color?: string;
  nodeIds: string[];
}

/** Single node on the constellation (5-signal encoding) */
export interface ConstellationNode {
  id: string;
  name: string;
  tier: LightTier;
  temperature: LightTemperature;
  /** 0–1 brightness from recency/closeness */
  brightness: number;
  /** Normalized position (origin center), -1..1 */
  x: number;
  y: number;
  /** Needs attention → pulse/flicker */
  flickering: boolean;
  daysSinceContact: number;
  /** Life domain for clustering */
  cluster: RelationshipClusterId;
  /** Size ratio for recency (recent = larger), 0.5–1.5 */
  sizeRatio: number;
  /** Optional one-line note for card */
  note?: string;
  phone?: string;
  relationshipType?: string;
}

/** Snapshot for timeline (constellation state at a point in time) */
export interface ConstellationSnapshot {
  nodes: ConstellationNode[];
  /** ISO date string or "all" */
  timestamp: string;
  label: string;
}

/** Timeline range for slider */
export type TimelineRange = '7d' | '30d' | 'all';

/** View state for radar (zoom, pan, selection) */
export interface ConstellationViewState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodeId: string | null;
  timelineRange: TimelineRange;
  /** Progressive reveal: which tiers to show */
  visibleTiers: LightTier[];
}

export const CONSTELLATION_CLUSTER_LABELS: Record<RelationshipClusterId, string> = {
  family: 'Family',
  'close-friends': 'Close friends',
  work: 'Work',
  community: 'Community',
  other: 'Other',
};
