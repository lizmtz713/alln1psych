/**
 * Emergency Mode service — auto-trigger checks, prompt, trusted contact notification.
 */

import { getGaugeHistory } from './crisisPipeline';
import { useEmergencyStore } from '../stores/emergencyStore';
import { useCircleStore } from '../stores/circleStore';
import { useUserStore } from '../stores/userStore';

const CRISIS_KEYWORDS = new Set([
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm', 'hurt myself',
  'not safe', 'cant go on', 'no way out', 'better off dead', '988', 'crisis',
]);

/** Check if State has been below threshold for 2+ days (by day, not 48h continuous) */
export async function shouldSuggestEmergencyMode(): Promise<boolean> {
  const { settings } = useEmergencyStore.getState();
  if (!settings.autoSuggestWhenStateLow) return false;

  const history = await getGaugeHistory();
  if (history.length < 2) return false;

  const threshold = settings.stateThreshold;
  const dayAgo = 24 * 60 * 60 * 1000;
  const twoDaysAgo = Date.now() - 2 * dayAgo;

  const recent = history.filter((s) => s.timestamp >= twoDaysAgo);
  const byDay = new Map<string, number[]>();
  recent.forEach((s) => {
    const date = new Date(s.timestamp).toISOString().slice(0, 10);
    if (s.state >= 0) {
      if (!byDay.has(date)) byDay.set(date, []);
      byDay.get(date)!.push(s.state);
    }
  });

  const dayAverages = Array.from(byDay.entries()).map(([date, vals]) => ({
    date,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  }));

  const lowDays = dayAverages.filter((d) => d.avg < threshold).length;
  return lowDays >= 2;
}

/** Check if text contains crisis-related keywords */
export function containsCrisisKeywords(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return Array.from(CRISIS_KEYWORDS).some((kw) => lower.includes(kw));
}

/** Record that user requested trusted contact notification. Actual delivery would use backend/SMS in production. */
export async function notifyTrustedContact(): Promise<boolean> {
  const { settings, currentSession } = useEmergencyStore.getState();
  if (!settings.trustedContactEnabled || !settings.trustedContactId || !currentSession) return false;

  const members = useCircleStore.getState().members ?? [];
  const contact = members.find((m) => m.id === settings.trustedContactId);
  if (!contact?.name) return false;

  useEmergencyStore.getState().recordTrustedContactNotified();
  return true;
}
