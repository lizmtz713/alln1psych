/**
 * Check-in pattern insights — Simple rule engine over checkInHistory.
 * "Work has influenced your system often this week." / "Sleep is often connected to your state."
 */

import type { GaugeKey } from '../stores/cockpitStore';
import { ALL_DRIVERS } from '../data/driversByGauge';
import { GAUGE_CONFIG } from '../utils/gaugeHelpers';
import { driversToSystems, getInfluencingSystemLabel } from '../lib/influencingSystems';

export type CheckInEntry = { timestamp: string; systemImpact: GaugeKey[]; drivers: string[] };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Entries from the last N days. */
function lastNDays(history: CheckInEntry[], days: number): CheckInEntry[] {
  const cutoff = Date.now() - days * MS_PER_DAY;
  return history.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

/** Driver id → human label. */
function driverLabel(id: string): string {
  const d = ALL_DRIVERS.find((x) => x.id === id);
  return d?.label ?? id;
}

/**
 * Returns 1–3 short pattern insight strings for display.
 * Uses last 7 days of check-in history.
 */
export function getPatternInsights(history: CheckInEntry[]): string[] {
  const recent = lastNDays(history, 7);
  if (recent.length < 2) return [];

  const insights: string[] = [];

  // Count driver mentions
  const driverCounts: Record<string, number> = {};
  recent.forEach((e) => {
    e.drivers.forEach((id) => {
      driverCounts[id] = (driverCounts[id] ?? 0) + 1;
    });
  });
  const driverEntries = Object.entries(driverCounts).filter(([, c]) => c >= 2);
  driverEntries.sort((a, b) => b[1] - a[1]);
  const topDriver = driverEntries[0];
  if (topDriver) {
    const driverId = topDriver[0];
    const systems = driversToSystems([driverId]);
    const systemLabel = systems.length > 0 ? getInfluencingSystemLabel(systems[0]) : null;
    const label = systemLabel ?? driverLabel(driverId);
    insights.push(`${label} has influenced your system ${topDriver[1]} time${topDriver[1] > 1 ? 's' : ''} this week.`);
  }

  // System impact frequency: which gauge is most often "affected"
  const impactCounts: Record<string, number> = {};
  recent.forEach((e) => {
    e.systemImpact.forEach((g) => {
      impactCounts[g] = (impactCounts[g] ?? 0) + 1;
    });
  });
  const impactEntries = Object.entries(impactCounts).filter(([, c]) => c >= 2);
  impactEntries.sort((a, b) => b[1] - a[1]);
  const topImpact = impactEntries[0];
  if (topImpact && insights.length < 2) {
    const label = GAUGE_CONFIG[topImpact[0]]?.label ?? topImpact[0];
    insights.push(`${label} has been on your mind in ${topImpact[1]} check-in${topImpact[1] > 1 ? 's' : ''} this week.`);
  }

  // Sleep + state connection (common pattern)
  const sleepDriverCount = recent.filter((e) =>
    e.drivers.some((id) => id === 'body-sleep' || id === 'state-sleep')
  ).length;
  if (sleepDriverCount >= 2 && insights.length < 3) {
    insights.push(`${getInfluencingSystemLabel('recovery')} is often connected to how you feel.`);
  }

  return insights.slice(0, 3);
}

/** One-line summary for weekly card: \"Work influenced your system most this week.\" */
export function getTopDriverThisWeek(history: CheckInEntry[]): string | null {
  const recent = lastNDays(history, 7);
  if (recent.length === 0) return null;
  const driverCounts: Record<string, number> = {};
  recent.forEach((e) => {
    e.drivers.forEach((id) => {
      driverCounts[id] = (driverCounts[id] ?? 0) + 1;
    });
  });
  const top = Object.entries(driverCounts).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 2) return null;
  const systems = driversToSystems([top[0]]);
  const systemLabel = systems.length > 0 ? getInfluencingSystemLabel(systems[0]) : null;
  const label = systemLabel ?? driverLabel(top[0]);
  return `${label} influenced your system most this week.`;
}

/**
 * Whether to show the weekly driver line in the influencing card.
 * Skip when we already show a pattern insight (avoids duplicate \"this week\" lines).
 */
export function weeklyLineAddsNewInfo(
  primaryPatternLine: string | null,
  weeklyLine: string | null
): boolean {
  if (!weeklyLine) return false;
  if (!primaryPatternLine) return true;
  // If pattern already mentions \"this week\" / same theme, don't repeat
  const patternLower = primaryPatternLine.toLowerCase();
  const weeklyLower = weeklyLine.toLowerCase();
  if (patternLower.includes('this week') && weeklyLower.includes('this week')) return false;
  const patternDriver = primaryPatternLine.split(' ')[0];
  const weeklyDriver = weeklyLine.split(' ')[0];
  return patternDriver !== weeklyDriver;
}
