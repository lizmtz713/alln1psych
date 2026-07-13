/**
 * Friendship Maintenance System
 *
 * Based on Robin Dunbar's research on social relationships:
 * - Your 5 (intimate): Weekly contact needed
 * - Your 15 (close): Every 2-3 weeks
 * - Your 50 (friends): Monthly
 * - Your 150 (acquaintances): Quarterly
 *
 * Key insight: Relationships decay ~15% per month without contact.
 * The system nudges you to maintain connections before they fade.
 */

import type { Light, LightTier } from '../types/lights';

// === CONTACT FREQUENCY THRESHOLDS (days) ===

export const IDEAL_CONTACT_DAYS: Record<Exclude<LightTier, 'archived'>, number> = {
  five: 7,      // Weekly for your closest
  fifteen: 18,  // Every 2-3 weeks
  fifty: 30,    // Monthly
  network: 90,  // Quarterly
};

export const WARNING_CONTACT_DAYS: Record<Exclude<LightTier, 'archived'>, number> = {
  five: 10,     // Getting stale after 10 days
  fifteen: 25,  //
  fifty: 45,    //
  network: 120, //
};

export const CRITICAL_CONTACT_DAYS: Record<Exclude<LightTier, 'archived'>, number> = {
  five: 14,     // 2 weeks = relationship at risk
  fifteen: 42,  // 6 weeks = fading fast
  fifty: 60,    // 2 months
  network: 180, // 6 months
};

// === LIGHT BRIGHTNESS LEVELS ===

export type LightBrightness = 'bright' | 'steady' | 'dimming' | 'dim' | 'dark';

export function getLightBrightness(tier: LightTier, daysSinceContact: number): LightBrightness {
  if (tier === 'archived') return 'dark';

  const ideal = IDEAL_CONTACT_DAYS[tier];
  const warning = WARNING_CONTACT_DAYS[tier];
  const critical = CRITICAL_CONTACT_DAYS[tier];

  if (daysSinceContact <= ideal) return 'bright';
  if (daysSinceContact <= warning) return 'steady';
  if (daysSinceContact <= critical) return 'dimming';
  if (daysSinceContact <= critical * 2) return 'dim';
  return 'dark';
}

export const BRIGHTNESS_CONFIG = {
  bright: { color: '#FBBF24', glow: 0.5, label: 'Strong', emoji: '✨' },
  steady: { color: '#A1A1AA', glow: 0.25, label: 'Good', emoji: '💡' },
  dimming: { color: '#71717A', glow: 0.15, label: 'Fading', emoji: '🕯️' },
  dim: { color: '#52525B', glow: 0.08, label: 'Dim', emoji: '◌' },
  dark: { color: '#27272A', glow: 0, label: 'Dark', emoji: '○' },
};

// === NUDGE SYSTEM ===

export type NudgeUrgency = 'none' | 'gentle' | 'nudge' | 'urgent';

export interface ConnectionNudge {
  light: Light;
  urgency: NudgeUrgency;
  message: string;
  daysOverdue: number;
  suggestedAction: 'text' | 'call' | 'meet' | 'mindmail';
}

export function getNudgeForLight(light: Light): ConnectionNudge | null {
  if (light.tier === 'archived') return null;

  const ideal = IDEAL_CONTACT_DAYS[light.tier];
  const warning = WARNING_CONTACT_DAYS[light.tier];
  const critical = CRITICAL_CONTACT_DAYS[light.tier];
  const days = light.daysSinceContact;

  if (days <= ideal) return null;

  const daysOverdue = days - ideal;

  let urgency: NudgeUrgency;
  let message: string;
  let suggestedAction: 'text' | 'call' | 'meet' | 'mindmail';

  if (days <= warning) {
    urgency = 'gentle';
    message = `It's been ${days} days since you connected with ${light.name}`;
    suggestedAction = 'text';
  } else if (days <= critical) {
    urgency = 'nudge';
    message = `${light.name}'s light is dimming — reach out soon`;
    suggestedAction = light.tier === 'five' ? 'call' : 'text';
  } else {
    urgency = 'urgent';
    message = `Don't lose ${light.name} — it's been ${days} days`;
    suggestedAction = light.tier === 'five' || light.tier === 'fifteen' ? 'call' : 'text';
  }

  return { light, urgency, message, daysOverdue, suggestedAction };
}

// === DAILY REACH OUT SUGGESTIONS ===

export interface DailyReachOut {
  priority: Light[];
  suggested: Light[];
  rotate: Light[];
}

export function getDailyReachOuts(lights: Light[], maxSuggestions: number = 5): DailyReachOut {
  const activeLights = lights.filter((l): l is Light & { tier: Exclude<LightTier, 'archived'> } => l.tier !== 'archived');

  const nudges = activeLights
    .map(getNudgeForLight)
    .filter((n): n is ConnectionNudge => n !== null);

  const urgencyOrder = { urgent: 0, nudge: 1, gentle: 2, none: 3 };
  nudges.sort((a, b) => {
    const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.daysOverdue - a.daysOverdue;
  });

  const priority = nudges
    .filter(n => n.urgency === 'urgent' || n.urgency === 'nudge')
    .slice(0, 3)
    .map(n => n.light);

  const suggested = nudges
    .filter(n => n.urgency === 'gentle')
    .slice(0, 2)
    .map(n => n.light);

  const alreadySuggested = new Set([...priority, ...suggested].map(l => l.id));
  const dayOfYear = Math.floor(Date.now() / 86400000);
  const rotate = activeLights
    .filter(l => !alreadySuggested.has(l.id))
    .sort((a, b) => b.daysSinceContact - a.daysSinceContact)
    .slice(0, 10)
    .sort(() => Math.sin(dayOfYear) - 0.5)
    .slice(0, Math.max(0, maxSuggestions - priority.length - suggested.length));

  return { priority, suggested, rotate };
}

// === DRIFT WARNING (relationship GPS) ===

export interface DriftWarning {
  light: Light;
  normalRhythmDays: number;
  daysSinceContact: number;
}

/** Top drifter: someone past their normal contact rhythm. For "X is drifting" card. */
export function getDriftWarning(lights: Light[]): DriftWarning | null {
  const active = lights.filter((l): l is Light & { tier: Exclude<LightTier, 'archived'> } => l.tier !== 'archived');
  let best: DriftWarning | null = null;
  for (const light of active) {
    const normalRhythm = light.averageContactDays ?? IDEAL_CONTACT_DAYS[light.tier];
    if (light.daysSinceContact <= normalRhythm) continue;
    const drift = light.daysSinceContact - normalRhythm;
    if (!best || drift > best.daysSinceContact - best.normalRhythmDays) {
      best = { light, normalRhythmDays: normalRhythm, daysSinceContact: light.daysSinceContact };
    }
  }
  return best;
}

// === RELATIONSHIP DECAY ===

export function estimateRelationshipStrength(
  tier: LightTier,
  daysSinceContact: number,
  baseStrength: number = 100
): number {
  if (tier === 'archived') return 0;

  const ideal = IDEAL_CONTACT_DAYS[tier];
  const missedWindows = Math.max(0, Math.floor(daysSinceContact / ideal) - 1);

  const decayFactor = Math.pow(0.85, missedWindows);
  return Math.round(baseStrength * decayFactor);
}

// === TIER HEALTH ===

export interface TierHealth {
  tier: LightTier;
  total: number;
  healthy: number;
  dimming: number;
  needsAttention: number;
  healthPercent: number;
}

export function getTierHealth(lights: Light[]): TierHealth[] {
  const tiers: Exclude<LightTier, 'archived'>[] = ['five', 'fifteen', 'fifty', 'network'];

  return tiers.map(tier => {
    const tierLights = lights.filter(l => l.tier === tier);
    const total = tierLights.length;

    const healthy = tierLights.filter(l => {
      const b = getLightBrightness(tier, l.daysSinceContact);
      return b === 'bright' || b === 'steady';
    }).length;

    const dimming = tierLights.filter(l => {
      const b = getLightBrightness(tier, l.daysSinceContact);
      return b === 'dimming';
    }).length;

    const needsAttention = tierLights.filter(l => {
      const b = getLightBrightness(tier, l.daysSinceContact);
      return b === 'dim' || b === 'dark';
    }).length;

    const healthPercent = total > 0 ? Math.round((healthy / total) * 100) : 100;

    return { tier, total, healthy, dimming, needsAttention, healthPercent };
  });
}

// === SOCIAL HEALTH SCORE (Apple Health for relationships) ===

export type TierHealthStatus = 'strong' | 'stable' | 'fading';

export interface TierSummary {
  tier: LightTier;
  label: string;
  count: number;
  max: number;
  status: TierHealthStatus;
  statusLabel: string;
}

export interface SocialHealthResult {
  score: number;
  tierSummaries: TierSummary[];
  suggestions: string[];
}

const TIER_DISPLAY_ORDER: Exclude<LightTier, 'archived'>[] = ['five', 'fifteen', 'fifty', 'network'];
const TIER_NAMES: Record<Exclude<LightTier, 'archived'>, string> = {
  five: 'Inner circle',
  fifteen: 'Close friends',
  fifty: 'Community',
  network: 'Network',
};

export function getSocialHealthScore(lights: Light[]): SocialHealthResult {
  const tierHealth = getTierHealth(lights);
  const activeLights = lights.filter((l): l is Light & { tier: Exclude<LightTier, 'archived'> } => l.tier !== 'archived');
  const tierSummaries: TierSummary[] = TIER_DISPLAY_ORDER.map((tier) => {
    const th = tierHealth.find((t) => t.tier === tier);
    const total = th?.total ?? 0;
    const max = tier === 'five' ? 5 : tier === 'fifteen' ? 15 : tier === 'fifty' ? 50 : 150;
    let status: TierHealthStatus = 'stable';
    let statusLabel = 'Stable';
    if (th) {
      if (th.healthPercent >= 80 && th.needsAttention === 0) {
        status = 'strong';
        statusLabel = 'Strong';
      } else if (th.needsAttention > 0 || th.healthPercent < 50) {
        status = 'fading';
        statusLabel = 'Fading';
      } else {
        statusLabel = 'Stable';
      }
    }
    return {
      tier,
      label: TIER_NAMES[tier],
      count: total,
      max,
      status,
      statusLabel,
    };
  });

  const totalWeight = tierSummaries.reduce((acc, t) => acc + (t.max > 0 ? 1 : 0), 0);
  const scorePerTier = tierSummaries.map((t) => {
    if (t.max === 0) return 100;
    const th = tierHealth.find((x) => x.tier === t.tier);
    const healthPct = th?.healthPercent ?? 100;
    const fillPct = Math.min(100, (t.count / t.max) * 100);
    return (healthPct * 0.7 + fillPct * 0.3);
  });
  const score = totalWeight > 0
    ? Math.round(
        scorePerTier.reduce((a, b) => a + b, 0) / scorePerTier.length
      )
    : 100;
  const clampedScore = Math.max(0, Math.min(100, score));

  const suggestions: string[] = [];
  const priority = getDailyReachOuts(lights, 3).priority;
  if (priority.length > 0) {
    suggestions.push(`Reach out to ${priority[0].name}`);
  }
  const drifting = activeLights.filter((l) => {
    const ideal = l.averageContactDays ?? IDEAL_CONTACT_DAYS[l.tier];
    return l.daysSinceContact > ideal;
  });
  if (drifting.length >= 2) {
    suggestions.push(`Strengthen ${drifting.length} drifting friendships`);
  }
  const dimming = tierHealth.filter((t) => t.dimming > 0);
  if (dimming.length > 0 && suggestions.length < 3) {
    suggestions.push('Plan a group hangout');
  }

  return {
    score: clampedScore,
    tierSummaries,
    suggestions: suggestions.slice(0, 3),
  };
}
