/**
 * InGauge Design System
 * Premium dark theme — deep space with violet energy
 * Fortune 500 quality, Apple-level polish
 */

export const COLORS = {
  // Core backgrounds (deep to surface)
  background: '#09090F',
  backgroundElevated: '#0F0F17',
  surface: '#111118',
  surfaceElevated: '#18181F',
  
  // Text hierarchy
  text: '#F0F0F5',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  textDim: '#45455A',
  
  // Accent - signature violet
  accent: '#7C4DFF',
  accentLight: '#9D7AFF',
  accentDark: '#5C3ACC',
  accentBg: 'rgba(124, 77, 255, 0.12)',
  accentBgStrong: 'rgba(124, 77, 255, 0.20)',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderAccent: 'rgba(124, 77, 255, 0.30)',
  
  // Status/Temperature colors
  temperature: {
    green: '#4ADE80',
    yellow: '#FACC15',
    orange: '#FB923C',
    red: '#F87171',
  },
  
  // Semantic colors
  success: '#4ADE80',
  warning: '#FACC15',
  error: '#F87171',
  info: '#60A5FA',
  
  // Tool-specific accents
  rolePlayAccent: '#FFB74D',
  loveAccent: '#EC4899',
  athleteAccent: '#14B8A6',
  spectrumAccent: '#60A5FA',
  
  // Recording state
  recording: '#EF5350',
  
  // Gradients (as array for LinearGradient)
  gradientAccent: ['#7C4DFF', '#9D7AFF'],
  gradientDark: ['#09090F', '#111118'],
  gradientCard: ['rgba(124, 77, 255, 0.08)', 'rgba(124, 77, 255, 0.02)'],
} as const;

// Spacing scale (4px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Typography scale
export const TYPOGRAPHY = {
  // Display
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  displayMd: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.3 },
  displaySm: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  
  // Headlines
  headlineLg: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  headlineMd: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  headlineSm: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  
  // Body
  bodyLg: { fontSize: 17, fontWeight: '400' as const, lineHeight: 26 },
  bodyMd: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  
  // Labels & Captions
  labelLg: { fontSize: 15, fontWeight: '500' as const, lineHeight: 20 },
  labelMd: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  labelSm: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
  
  // Legacy mappings (for backwards compatibility)
  screenTitle: { fontSize: 28, fontWeight: '700' as const },
  sectionTitle: { fontSize: 20, fontWeight: '600' as const },
  cardTitle: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22 },
  secondary: { fontSize: 13, lineHeight: 18 },
  timestamp: { fontSize: 11, lineHeight: 14 },
} as const;

// Shadow styles
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Animation timings
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: { damping: 15, stiffness: 150 },
} as const;

// Common component styles
export const COMPONENT_STYLES = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  cardElevated: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: 16,
  },
} as const;

export const APP_CONFIG = {
  name: 'InGauge',
  accentColor: COLORS.accent,
} as const;

/** Muted/softer color palette for Spectrum Mode accessibility */
export const COLORS_MUTED = {
  background: '#12121A',
  backgroundElevated: '#18181F',
  surface: '#1E1E26',
  surfaceElevated: '#242430',
  text: '#E0E0E5',
  textSecondary: '#9090A0',
  textMuted: '#707085',
  textDim: '#505065',
  accent: '#8B7BD8',
  accentLight: '#A090D8',
  accentDark: '#6B5BA8',
  accentBg: 'rgba(139, 123, 216, 0.12)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
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
