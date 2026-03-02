/**
 * InGauge Design System v2.0
 * "The Human Cockpit" — Oura for the Mind
 * 
 * Design Philosophy:
 * - Temperature gradient as signature (cool teal → warm coral)
 * - Aurora/flowing aesthetics for the mind (not mountains)
 * - Big bold scores, elegant arcs
 * - Calm confidence, warm intelligence
 * 
 * Based on psychological research:
 * - Nummenmaa et al. (2014): Bodily maps of emotions → temperature metaphor
 * - Bar & Neta (2006): Curved shapes feel safer
 * - Slow animations reduce anxiety
 */

export const COLORS = {
  // ═══════════════════════════════════════════════════════════════════
  // CORE BACKGROUNDS — Deep navy with depth (like Oura)
  // ═══════════════════════════════════════════════════════════════════
  background: '#0A0B0F',           // Deepest - primary bg
  backgroundElevated: '#0E0F14',   // Slightly raised
  surface: '#12131A',              // Cards
  surfaceElevated: '#181920',      // Elevated cards
  surfaceGlass: 'rgba(255, 255, 255, 0.03)',  // Glass effect
  
  // ═══════════════════════════════════════════════════════════════════
  // TEXT HIERARCHY
  // ═══════════════════════════════════════════════════════════════════
  text: '#F7F7F5',                 // Primary - warm white
  textSecondary: 'rgba(247, 247, 245, 0.70)',  // 70% opacity
  textMuted: 'rgba(247, 247, 245, 0.50)',      // 50% opacity  
  textDim: 'rgba(247, 247, 245, 0.35)',        // 35% opacity
  
  // ═══════════════════════════════════════════════════════════════════
  // PRIMARY ACCENT — Ocean Teal (calm, regulation, State gauge)
  // ═══════════════════════════════════════════════════════════════════
  accent: '#0D9488',               // Primary teal
  accentLight: '#2DD4BF',          // Light teal
  accentDark: '#0A7568',           // Dark teal
  accentMuted: 'rgba(13, 148, 136, 0.3)',
  accentBg: 'rgba(13, 148, 136, 0.12)',
  accentBgStrong: 'rgba(13, 148, 136, 0.20)',
  
  // ═══════════════════════════════════════════════════════════════════
  // THE 6 GAUGE COLORS — Each with unique identity
  // ═══════════════════════════════════════════════════════════════════
  gauges: {
    body: '#C9956B',       // Earth Amber — physical, grounded
    state: '#0D9488',      // Ocean Teal — nervous system, regulation
    emotion: '#E07A5F',    // Sunset Coral — feeling, warmth
    connection: '#9B8AA6', // Soft Violet — relational, intuitive
    direction: '#7D9B8C',  // Sage Green — growth, purpose
    alignment: '#B8963E',  // Deep Gold — values, meaning
  },
  
  // Gauge backgrounds (12% opacity)
  gaugeBg: {
    body: 'rgba(201, 149, 107, 0.12)',
    state: 'rgba(13, 148, 136, 0.12)',
    emotion: 'rgba(224, 122, 95, 0.12)',
    connection: 'rgba(155, 138, 166, 0.12)',
    direction: 'rgba(125, 155, 140, 0.12)',
    alignment: 'rgba(184, 150, 62, 0.12)',
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // TEMPERATURE GRADIENT — The signature of InGauge
  // Cool (regulated) → Warm (activated/dysregulated)
  // ═══════════════════════════════════════════════════════════════════
  temperature: {
    cool: '#0D9488',       // Deep Teal — calm, regulated
    coolLight: '#2DD4BF',  // Light Teal
    neutral: '#8B8D8E',    // Neutral gray
    warm: '#D4A574',       // Warm Amber — activated
    hot: '#E07A5F',        // Soft Coral — high activation
  },
  
  // Legacy temperature mappings (for backwards compatibility)
  green: '#4ADE80',
  yellow: '#FACC15', 
  orange: '#FB923C',
  red: '#F87171',
  
  // ═══════════════════════════════════════════════════════════════════
  // STATUS COLORS — "PAY ATTENTION" style alerts
  // ═══════════════════════════════════════════════════════════════════
  success: '#4ADE80',      // Green — all clear
  warning: '#E07A5F',      // Coral (not harsh yellow) — pay attention
  error: '#EF5350',        // Red — critical
  info: '#0D9488',         // Teal — informational
  
  // System mode (Capacity/Stabilization)
  amber: '#D4A574',
  amberBg: 'rgba(212, 165, 116, 0.08)',
  amberBorder: 'rgba(212, 165, 116, 0.20)',
  amberGlow: 'rgba(212, 165, 116, 0.25)',
  
  // ═══════════════════════════════════════════════════════════════════
  // TOOL-SPECIFIC ACCENTS
  // ═══════════════════════════════════════════════════════════════════
  rolePlayAccent: '#E07A5F',   // Coral — Role Play
  loveAccent: '#9B8AA6',       // Violet — Love tool
  athleteAccent: '#7D9B8C',    // Sage — Athlete mode
  spectrumAccent: '#0D9488',   // Teal — Spectrum
  journalAccent: '#B8963E',    // Gold — Journal
  
  // Recording state
  recording: '#EF5350',
  
  // ═══════════════════════════════════════════════════════════════════
  // INPUTS & BORDERS
  // ═══════════════════════════════════════════════════════════════════
  inputSurface: 'rgba(255, 255, 255, 0.04)',
  
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderAccent: 'rgba(13, 148, 136, 0.30)',
  
  // ═══════════════════════════════════════════════════════════════════
  // GRADIENTS — For LinearGradient components
  // ═══════════════════════════════════════════════════════════════════
  gradients: {
    // Primary temperature gradient (horizontal)
    temperature: ['#0D9488', '#2DD4BF', '#8B8D8E', '#D4A574', '#E07A5F'],
    
    // Aurora background gradient (vertical, subtle)
    aurora: ['#0A0B0F', '#0D1117', '#0A1A1A', '#0A0B0F'],
    auroraActive: ['#0A0B0F', '#0D1A1A', '#1A1520', '#0A0B0F'],
    
    // Card gradients
    card: ['rgba(13, 148, 136, 0.06)', 'rgba(13, 148, 136, 0.02)'],
    cardWarm: ['rgba(224, 122, 95, 0.06)', 'rgba(224, 122, 95, 0.02)'],
    
    // Gauge-specific gradients
    body: ['#C9956B', '#D4A574'],
    state: ['#0D9488', '#2DD4BF'],
    emotion: ['#E07A5F', '#F4A98C'],
    connection: ['#9B8AA6', '#B8A6C4'],
    direction: ['#7D9B8C', '#9BB8A8'],
    alignment: ['#B8963E', '#D4B062'],
    
    // Score arc gradient (teal to coral)
    scoreArc: ['#0D9488', '#2DD4BF', '#7D9B8C', '#D4A574', '#E07A5F'],
  },
  
  // Legacy gradient format
  gradientAccent: ['#0D9488', '#2DD4BF'],
  gradientDark: ['#0A0B0F', '#12131A'],
  gradientCard: ['rgba(13, 148, 136, 0.08)', 'rgba(13, 148, 136, 0.02)'],
} as const;

// ═══════════════════════════════════════════════════════════════════════
// SPACING — 8-point grid (Oura uses this)
// ═══════════════════════════════════════════════════════════════════════
export const SPACING = {
  xs: 4,    // Half-step
  sm: 8,    // Small
  md: 12,   // Medium
  lg: 16,   // Large (base)
  xl: 24,   // Extra large
  xxl: 32,  // Section spacing
  xxxl: 48, // Large section spacing
} as const;

// ═══════════════════════════════════════════════════════════════════════
// BORDER RADIUS — Soft, friendly (curved = safe)
// ═══════════════════════════════════════════════════════════════════════
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  input: 12,
  card: 16,
  button: 14,
  lg: 20,      // Increased for softer cards
  xl: 24,
  xxl: 32,     // For large cards/modals
  full: 9999,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// TYPOGRAPHY — Big bold scores, clean hierarchy
// ═══════════════════════════════════════════════════════════════════════
export const TYPOGRAPHY = {
  // SCORE DISPLAY — The big numbers (like Oura's 48, 70, 92)
  scoreXL: { fontSize: 72, fontWeight: '700' as const, lineHeight: 80, letterSpacing: -2 },
  scoreLg: { fontSize: 56, fontWeight: '700' as const, lineHeight: 64, letterSpacing: -1.5 },
  scoreMd: { fontSize: 40, fontWeight: '600' as const, lineHeight: 48, letterSpacing: -1 },
  scoreSm: { fontSize: 32, fontWeight: '600' as const, lineHeight: 40, letterSpacing: -0.5 },
  
  // DISPLAY — Headlines
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  displayMd: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.3 },
  displaySm: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  
  // HEADLINES
  headlineLg: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  headlineMd: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  headlineSm: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  
  // BODY
  bodyLg: { fontSize: 17, fontWeight: '400' as const, lineHeight: 26 },
  bodyMd: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  
  // LABELS — All caps for gauge labels (like Oura)
  labelLg: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 1 },
  labelMd: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.8 },
  labelSm: { fontSize: 10, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.5 },
  
  // ALERT TEXT — "PAY ATTENTION" style
  alert: { fontSize: 11, fontWeight: '700' as const, lineHeight: 14, letterSpacing: 1.5 },
  
  // Legacy mappings
  screenTitle: { fontSize: 28, fontWeight: '700' as const },
  sectionTitle: { fontSize: 20, fontWeight: '600' as const },
  cardTitle: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22 },
  secondary: { fontSize: 13, lineHeight: 18 },
  timestamp: { fontSize: 11, lineHeight: 14 },
} as const;

// ═══════════════════════════════════════════════════════════════════════
// SHADOWS — Subtle depth, not harsh
// ═══════════════════════════════════════════════════════════════════════
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  // Gauge glow (uses gauge color)
  glow: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  // Card float effect
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION — Slow = calm (300-500ms, not snappy)
// ═══════════════════════════════════════════════════════════════════════
export const ANIMATION = {
  // Durations
  fast: 200,
  normal: 350,      // Increased from 250
  slow: 500,        // Increased from 400
  slower: 800,      // For score reveals
  
  // Gauge fill animation
  gaugeFill: 800,
  
  // Background aurora drift
  auroraCycle: 15000,  // 15 seconds
  
  // Breathing pulse (4 seconds = calm breathing)
  breathingCycle: 4000,
  
  // Spring configs
  spring: { damping: 20, stiffness: 120 },  // Softer spring
  springBouncy: { damping: 12, stiffness: 150 },
  springGentle: { damping: 25, stiffness: 100 },
  
  // Easing
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ═══════════════════════════════════════════════════════════════════════
// GAUGE CONFIG — Arc ring settings
// ═══════════════════════════════════════════════════════════════════════
export const GAUGE_CONFIG = {
  // Arc dimensions
  arcWidth: 8,           // Stroke width
  arcWidthLarge: 12,     // For detail view
  arcRadius: 100,        // Default radius
  arcRadiusSmall: 40,    // For compact cockpit view
  
  // Arc angles (for SVG)
  startAngle: 135,       // Bottom-left
  endAngle: 405,         // Bottom-right (270° arc)
  
  // Score thresholds for color shifts
  thresholds: {
    low: 30,
    medium: 50,
    good: 70,
    excellent: 85,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════
// COMPONENT STYLES — Pre-composed
// ═══════════════════════════════════════════════════════════════════════
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
  cardGlass: {
    backgroundColor: COLORS.surfaceGlass,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    backdropFilter: 'blur(10px)',
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: 16,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════
// APP CONFIG
// ═══════════════════════════════════════════════════════════════════════
export const APP_CONFIG = {
  name: 'InGauge',
  tagline: 'The Human Cockpit',
  accentColor: COLORS.accent,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// MUTED COLORS — Spectrum Mode / Accessibility
// ═══════════════════════════════════════════════════════════════════════
export const COLORS_MUTED = {
  background: '#12121A',
  backgroundElevated: '#18181F',
  surface: '#1E1E26',
  surfaceElevated: '#242430',
  text: '#E0E0E5',
  textSecondary: '#9090A0',
  textMuted: '#707085',
  textDim: '#505065',
  accent: '#5BA8A0',          // Muted teal
  accentLight: '#7BC0B8',
  accentDark: '#4A8880',
  accentBg: 'rgba(91, 168, 160, 0.12)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  temperature: {
    cool: '#5BA8A0',
    neutral: '#909090',
    warm: '#C0A080',
    hot: '#C09080',
  },
  gauges: {
    body: '#B89878',
    state: '#5BA8A0',
    emotion: '#C09080',
    connection: '#908898',
    direction: '#7A9888',
    alignment: '#A89050',
  },
} as const;
