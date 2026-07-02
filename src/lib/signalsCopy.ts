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

/** Human, relational phrase for cards (no raw \"999d\"). Use in horizontal strips and cards. */
export function getRelationalPhrase(light: Light, needsAttention: boolean): string {
  const brightness = getLightBrightness(light.tier, light.daysSinceContact);
  if (needsAttention) {
    if (light.daysSinceContact >= 30) return "Haven't talked in a while";
    if (light.daysSinceContact >= 14) return 'Could use a moment';
    return 'Needs a moment';
  }
  if (brightness === 'dark' || brightness === 'dim') return "Haven't talked in a while";
  if (brightness === 'dimming') return 'Cooling off';
  if (brightness === 'steady') return 'Warm';
  return 'Doing well';
}

/** Ring color: person temperature when shared; 'neutral' when not shared (completion only). */
export type RelationshipRingColor = 'green' | 'yellow' | 'orange' | 'red' | 'neutral';

const RELATIONSHIP_STATUS_TO_RING: Record<RelationshipStatusLabel, RelationshipRingColor> = {
  'Doing well': 'green',
  'Warm': 'yellow',
  'Could use support': 'yellow',
  'Drifting': 'orange',
  'Needs attention': 'red',
};

export function getRelationshipRingColor(status: RelationshipStatusLabel): RelationshipRingColor {
  return RELATIONSHIP_STATUS_TO_RING[status] ?? 'yellow';
}

/** Person temperature: five states (human system load, not granular emotion). */
export const PERSON_TEMP_LABELS = ['Thriving', 'Good', 'Busy', 'Stressed', 'Needs support'] as const;

const PERSON_TEMP_STATE_DISPLAY: Record<
  NonNullable<Light['personTemperatureState']>,
  { label: string; color: string }
> = {
  thriving: { label: 'Thriving', color: '#0d9488' },   // deep green
  good: { label: 'Good', color: '#34D399' },            // green
  busy: { label: 'Busy', color: '#FBBF24' },            // yellow
  stressed: { label: 'Stressed', color: '#FB923C' },    // orange
  needs_support: { label: 'Needs support', color: '#F87171' }, // red
};

/** Fallback when only legacy warm/neutral/cool is set. */
const LIGHT_TEMP_TO_PERSON: Record<Exclude<Light['temperature'], 'unknown'>, { label: string; color: string }> = {
  warm: { label: 'Good', color: '#34D399' },
  neutral: { label: 'Busy', color: '#FBBF24' },
  cool: { label: 'Needs support', color: '#F87171' },
};

export function getPersonTemperatureDisplay(light: Light): { label: string; color: string } | null {
  if (light.personTemperatureState) return PERSON_TEMP_STATE_DISPLAY[light.personTemperatureState];
  if (light.temperature === 'unknown') return null;
  return LIGHT_TEMP_TO_PERSON[light.temperature] ?? null;
}

/** Map momentum 0–100 to relationship score 1–5 for ring fill. 5 = strongest. */
export function getRelationshipScoreFromMomentum(momentumScore: number | undefined): number {
  if (momentumScore == null) return 3;
  const s = Math.max(0, Math.min(100, Math.round(momentumScore)));
  if (s >= 80) return 5;
  if (s >= 60) return 4;
  if (s >= 40) return 3;
  if (s >= 20) return 2;
  return 1;
}

/** Ring color from person temperature when shared; otherwise neutral (relationship completion only). */
export function getTemperatureRingColorForLight(light: Light, needsAttention: boolean): RelationshipRingColor {
  const person = getPersonTemperatureDisplay(light);
  if (person) {
    if (person.color === '#0d9488' || person.color === '#34D399') return 'green';
    if (person.color === '#FBBF24') return 'yellow';
    if (person.color === '#FB923C') return 'orange';
    if (person.color === '#F87171') return 'red';
  }
  return 'neutral';
}

/** Interaction balance from connection log (when initiatedBy is set). Returns You % and Them %. */
export function getInteractionBalance(light: Light): { you: number; them: number } | null {
  const withInitiated = (light.connectionLog ?? []).filter((e) => e.initiatedBy);
  if (withInitiated.length === 0) return null;
  const me = withInitiated.filter((e) => e.initiatedBy === 'me').length;
  const them = withInitiated.filter((e) => e.initiatedBy === 'them').length;
  const total = me + them;
  if (total === 0) return null;
  return {
    you: Math.round((me / total) * 100),
    them: Math.round((them / total) * 100),
  };
}

/** Relationship strength 1–5 for ring fill. Momentum 0–100 → 5=strong, 1=weak. When no momentum, derive from brightness. */
export function getRelationshipScoreFromLight(light: Light): number {
  if (light.momentumScore != null) {
    const s = Math.max(0, Math.min(100, Math.round(light.momentumScore)));
    if (s >= 80) return 5;
    if (s >= 60) return 4;
    if (s >= 40) return 3;
    if (s >= 20) return 2;
    return 1;
  }
  const brightness = getLightBrightness(light.tier, light.daysSinceContact);
  const status = BRIGHTNESS_TO_STATUS[brightness] ?? 'Warm';
  if (status === 'Doing well') return 5;
  if (status === 'Warm') return 4;
  if (status === 'Could use support') return 3;
  if (status === 'Drifting') return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Widget / Watch reuse — minimal payload, no Light required
// ---------------------------------------------------------------------------

/** Minimal data for RelationshipRing in widgets or watch. Store or receive this from a small API. */
export interface RelationshipRingPayload {
  /** 0–100; when omitted, ring uses score 3 (60% fill) */
  momentumScore?: number;
  /** Person temperature; when omitted, derived from momentumScore */
  temperatureColor?: RelationshipRingColor;
  /** When true, ring pulses gently */
  attentionNeeded?: boolean;
}

/** Build RelationshipRing props from minimal payload. Use in widgets/watch so you don't need a full Light. */
export function getRelationshipRingPropsForWidget(
  payload: RelationshipRingPayload
): {
  relationshipScore: number;
  temperatureColor: RelationshipRingColor;
  attentionNeeded: boolean;
} {
  const momentumScore = payload.momentumScore;
  const relationshipScore = getRelationshipScoreFromMomentum(momentumScore);
  const temperatureColor =
    payload.temperatureColor ??
    getRelationshipRingColor(getStatusLabelFromMomentum(momentumScore ?? 50));
  const attentionNeeded = payload.attentionNeeded ?? false;
  return { relationshipScore, temperatureColor, attentionNeeded };
}
