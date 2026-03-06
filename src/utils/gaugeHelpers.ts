export const GAUGE_CONFIG: Record<string, { label: string; subtitle: string; icon: string; description: string; color: string }> = {
  body: {
    label: 'Body',
    subtitle: 'Sleep · Fuel · Movement',
    icon: '🫀',
    description: 'Your biological regulation. If this is off, everything feels off.',
    color: '#34D399',
  },
  state: {
    label: 'State',
    subtitle: 'Nervous System',
    icon: '⚡',
    description: 'Your nervous system regulation. Calm, alert, threatened, or overstimulated.',
    color: '#FBBF24',
  },
  emotion: {
    label: 'Emotion',
    subtitle: 'Emotional Clarity',
    icon: '💎',
    description: 'How clearly you can identify what you actually feel.',
    color: '#60A5FA',
  },
  connection: {
    label: 'Connection',
    subtitle: 'Belonging & Support',
    icon: '🤝',
    description: 'Your sense of belonging, safety, and being seen by others.',
    color: '#2DD4BF',
  },
  direction: {
    label: 'Direction',
    subtitle: 'Purpose & Momentum',
    icon: '🧭',
    description: 'Your sense of agency, purpose, and forward movement.',
    color: '#A78BFA',
  },
  alignment: {
    label: 'Alignment',
    subtitle: 'Integrity & Congruence',
    icon: '⚖️',
    description: 'Whether your actions match your values.',
    color: '#E0E0E0',
  },
};

export function getGaugeStatusLabel(value: number): string {
  if (value < 0) return '—';
  if (value >= 80) return 'Strong';
  if (value >= 60) return 'Steady';
  if (value >= 40) return 'Caution';
  if (value >= 20) return 'Low';
  return 'Critical';
}

export function getOverallStatusLabel(value: number): string {
  if (value < 0) return 'Check In';
  if (value >= 80) return 'Optimal';
  if (value >= 60) return 'Stable';
  if (value >= 40) return 'Needs Care';
  if (value >= 20) return 'Strained';
  return 'Critical';
}

/** Cockpit center: Human System Score bands (80–100 Thriving, 60–79 Stable, 40–59 Strained, 0–39 Needs support) */
export const SYSTEM_SCORE_BANDS = [
  { min: 80, max: 100, label: 'Thriving' },
  { min: 60, max: 79, label: 'Stable' },
  { min: 40, max: 59, label: 'Strained' },
  { min: 0, max: 39, label: 'Needs support' },
] as const;

export function getSystemScoreLabel(value: number): string {
  if (value < 0) return 'Check In';
  if (value >= 80) return 'Thriving';
  if (value >= 60) return 'Stable';
  if (value >= 40) return 'Strained';
  return 'Needs support';
}

/**
 * Temperature colors — used by both Gauges and Lights for consistency
 */
export const TEMPERATURE_COLORS = {
  green: '#34D399',   // 75-100: Good / Doing well
  yellow: '#FBBF24',  // 50-74: Okay / Could use love
  orange: '#FB923C',  // 25-49: Needs attention / Having hard time
  red: '#F87171',     // 0-24: Critical / Really struggling
  dim: '#2A2A3A',     // Unset / Off / No data
} as const;

/**
 * Get color for a gauge value (0-100)
 */
export function getGaugeColor(value: number): string {
  if (value < 0) return TEMPERATURE_COLORS.dim;
  if (value >= 75) return TEMPERATURE_COLORS.green;
  if (value >= 50) return TEMPERATURE_COLORS.yellow;
  if (value >= 25) return TEMPERATURE_COLORS.orange;
  return TEMPERATURE_COLORS.red;
}

/**
 * Get color for a temperature string ('green' | 'yellow' | 'orange' | 'red')
 * Used by Lights/Circle for relationship temperature
 */
export function getTemperatureColor(temp: 'green' | 'yellow' | 'orange' | 'red' | string): string {
  return TEMPERATURE_COLORS[temp as keyof typeof TEMPERATURE_COLORS] || TEMPERATURE_COLORS.dim;
}

/**
 * Convert gauge value to temperature string
 */
export function valueToTemperature(value: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (value >= 75) return 'green';
  if (value >= 50) return 'yellow';
  if (value >= 25) return 'orange';
  return 'red';
}
