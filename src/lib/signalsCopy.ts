/**
 * Signals — Single source of truth for relationship status copy.
 * Use everywhere (Signals tab, person sheet, list rows) for consistency.
 *
 * When momentum is available, it drives the label; otherwise brightness (recency) does.
 */

import type { Light } from '../types/lights';
import { getLightBrightness } from '../services/friendshipMaintenance';
import { getStatusLabelFromMomentum } from '../services/momentumEngine';

export const RELATIONSHIP_STATUS_LABELS = [
  'Doing well',
  'Warm',
  'Could use support',
  'Drifting',
  'Needs attention',
] as const;

export type RelationshipStatusLabel = (typeof RELATIONSHIP_STATUS_LABELS)[number];

const BRIGHTNESS_TO_STATUS: Record<string, RelationshipStatusLabel> = {
  bright: 'Doing well',
  steady: 'Warm',
  dimming: 'Drifting',
  dim: 'Could use support',
  dark: 'Needs attention',
};

export function getRelationshipStatusLabel(light: Light, needsAttention: boolean): RelationshipStatusLabel {
  if (needsAttention) return 'Needs attention';
  if (light.momentumScore != null) return getStatusLabelFromMomentum(light.momentumScore);
  const brightness = getLightBrightness(light.tier, light.daysSinceContact);
  return BRIGHTNESS_TO_STATUS[brightness] ?? 'Warm';
}
