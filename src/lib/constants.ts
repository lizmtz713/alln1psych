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
  /** Athlete mode accent — energetic blue-green */
  athleteAccent: '#00BFA5',
  /** Spectrum mode accent — calming soft blue */
  spectrumAccent: '#64B5F6',
} as const;

/** Muted/softer color palette for Spectrum Mode accessibility */
export const COLORS_MUTED = {
  background: '#1A1A24',
  surface: '#242430',
  inputSurface: '#242430',
  text: '#E0E0E5',
  textMuted: '#9090A0',
  textSecondary: '#808090',
  accent: '#8B7BD8',
  accentMuted: '#A090D8',
  recording: '#E08080',
  temperature: {
    green: '#7BBF7B',
    yellow: '#E0C860',
    orange: '#E0A070',
    red: '#E08080',
  },
  rolePlayAccent: '#E0B070',
  athleteAccent: '#70C0B0',
  spectrumAccent: '#80B0E0',
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
