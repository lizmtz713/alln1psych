/**
 * Gauge display helpers — colors and status labels for 0–100 cockpit scores.
 */

export function getGaugeColor(score: number): string {
  if (score < 0) return '#55556A';
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  if (score >= 25) return '#f97316';
  return '#ef4444';
}

export function getGaugeStatusLabel(score: number): string {
  if (score < 0) return 'Not checked';
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Steady';
  if (score >= 25) return 'Needs attention';
  return 'Prioritize';
}
