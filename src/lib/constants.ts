/**
 * App theme and config.
 * Dark, calm theme — cozy room at night with soft lavender accents.
 */

export const COLORS = {
  background: '#0F0B1E',
  surface: '#1A1625',
  text: '#F5F5F7',
  textMuted: '#A0A0A8',
  accent: '#7C4DFF',
  accentMuted: '#9D7AFF',
} as const;

export const APP_CONFIG = {
  name: 'alln1-psych',
  accentColor: COLORS.accent,
} as const;
