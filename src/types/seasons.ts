/**
 * Relationship Seasons — Context states for how a relationship exists over time.
 * Not value judgments; grounded in Developmental and Social Psychology.
 * Prevents the app from pushing every connection at the same intensity.
 */

export type RelationshipSeason = 'growth' | 'active' | 'dormant' | 'archived';

export const SEASON_LABELS: Record<RelationshipSeason, string> = {
  growth: 'Growth',
  active: 'Active',
  dormant: 'Dormant',
  archived: 'Archived',
};

/** Gentle helper copy (no guilt) */
export const SEASON_HELPERS: Record<RelationshipSeason, string> = {
  growth: 'This connection is forming or deepening.',
  active: 'A stable, regularly maintained connection.',
  dormant: 'Some relationships stay meaningful even when quiet.',
  archived: 'No longer active in your day-to-day life.',
};

/** Friendship seasons — emojis for UI (relationship phases) */
export const SEASON_EMOJI: Record<RelationshipSeason, string> = {
  growth: '🌱',
  active: '🔥',
  dormant: '🍂',
  archived: '📁',
};

/** Days without meaningful interaction before we consider Dormant (momentum low + time) */
export const DORMANT_DAYS_THRESHOLD = 60;

/** Growth: +20% momentum gain */
export const GROWTH_MOMENTUM_MULTIPLIER = 1.2;

/** Dormant: decay 70% slower (effective periods *= 0.3) */
export const DORMANT_DECAY_FACTOR = 0.3;
