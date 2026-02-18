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

export function getGaugeColor(value: number): string {
  if (value < 0) return '#2A2A3A';
  if (value >= 75) return '#34D399';
  if (value >= 50) return '#FBBF24';
  if (value >= 25) return '#FB923C';
  return '#F87171';
}
