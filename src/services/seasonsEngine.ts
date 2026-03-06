/**
 * Relationship Seasons Engine
 *
 * Seasons explain why a relationship might change over time without assuming something is wrong.
 * Growth / Active / Dormant / Archived — context states, not value judgments.
 */

import type { RelationshipSeason } from '../types/seasons';
import { DORMANT_DAYS_THRESHOLD } from '../types/seasons';

export interface LightSeasonInput {
  tier: string;
  daysSinceContact: number;
  momentumScore?: number;
  /** Life context: e.g. life_transition (moving, new job, new parent) shifts to dormant so it feels empathetic, not mechanical */
  relationshipContext?: 'life_transition';
}

/** Derive season from light state when no explicit override. */
export function deriveSeason(
  light: LightSeasonInput,
  options: { seasonOverride?: RelationshipSeason | null }
): RelationshipSeason {
  if (options.seasonOverride) return options.seasonOverride;
  if (light.tier === 'archived') return 'archived';
  if (light.relationshipContext === 'life_transition') return 'dormant';

  const days = light.daysSinceContact;
  const momentum = light.momentumScore ?? 50;

  if (days >= DORMANT_DAYS_THRESHOLD && momentum < 50) return 'dormant';
  if (momentum >= 70 && days <= 14) return 'growth';
  return 'active';
}
