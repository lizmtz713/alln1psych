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
  /** Secondary / timestamps, captions */
  textSecondary: '#8E8E93',
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

/** Typography: screen titles 28 bold, section 20 semibold, card 17 semibold, body 15, secondary 13, timestamps 11 */
export const TYPOGRAPHY = {
  screenTitle: { fontSize: 28, fontWeight: '700' as const },
  sectionTitle: { fontSize: 20, fontWeight: '600' as const },
  cardTitle: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 21 },
  secondary: { fontSize: 13, lineHeight: 18 },
  timestamp: { fontSize: 11, lineHeight: 14 },
} as const;

export const APP_CONFIG = {
  name: 'alln1-psych',
  accentColor: COLORS.accent,
} as const;
