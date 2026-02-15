/**
 * App theme and config.
 * Dark, calm theme — cozy room at night with soft lavender accents.
 */

export const COLORS = {
  background: '#0F0B1E',
  surface: '#1A1625',
  inputSurface: '#1A1528',
  text: '#F5F5F7',
  textMuted: '#A0A0A8',
  accent: '#7C4DFF',
  accentMuted: '#9D7AFF',
} as const;

export const BORDER_RADIUS = {
  card: 16,
  button: 24,
  input: 12,
} as const;

export const APP_CONFIG = {
  name: 'alln1-psych',
  accentColor: COLORS.accent,
} as const;
