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
  recording: '#EF5350',
  temperature: {
    green: '#66BB6A',
    yellow: '#FDD835',
    orange: '#FFA726',
    red: '#EF5350',
  },
  /** Role play / Practice Life — warm gold to distinguish from main Talk accent */
  rolePlayAccent: '#FFB74D',
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
