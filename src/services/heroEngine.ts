/**
 * Hero Intelligence Engine
 *
 * Chooses who the system nudges you toward: who most deserves your attention today.
 * Uses momentum, contact gap, circle weight, and life events (birthday, anniversary).
 */

import type { Light } from '../types/lights';
import { MOMENTUM_BANDS } from './momentumEngine';

export const HERO_COOLDOWN_DAYS = 5;
const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

/** Life event: today is a key date for this person */
export interface LifeEventToday {
  type: 'birthday' | 'anniversary' | 'milestone';
  label: string; // e.g. "Celebrate with Sarah", "Transmit appreciation"
}

export function getLifeEventToday(light: Light): LifeEventToday | null {
  const today = TODAY_ISO();
  const monthDay = today.slice(5, 10); // MM-DD

  if (light.birthday) {
    const b = light.birthday.trim();
    if (b.length >= 10 && b.slice(5, 10) === monthDay) {
      return { type: 'birthday', label: `Celebrate with ${light.name}` };
    }
  }

  if (light.anniversary) {
    const a = String(light.anniversary).trim();
    if (a.length >= 10 && a.slice(5, 10) === monthDay) {
      return { type: 'anniversary', label: `Transmit appreciation to ${light.name}` };
    }
  }

  return null;
}

/** Circle weight for hero ranking (inner circle = higher) */
export const HERO_CIRCLE_WEIGHT: Record<string, number> = {
  five: 30,
  fifteen: 20,
  fifty: 10,
  network: 5,
  archived: 0,
};

/**
 * Hero score: higher = more deserving of the nudge today.
 * heroScore = momentumDrop * 3 + daysSinceContact * 2 + circleWeight + lifeEventWeight
 */
export function getHeroScore(
  light: Light,
  options: { momentumScore?: number }
): { score: number; lifeEvent: LifeEventToday | null } {
  const lifeEvent = getLifeEventToday(light);
  const lifeEventWeight = lifeEvent ? 80 : 0; // Strong override

  const circleWeight = HERO_CIRCLE_WEIGHT[light.tier] ?? 0;
  const daysScore = Math.min(light.daysSinceContact * 2, 60); // Cap gap contribution

  // Momentum drop: low momentum = needs attention (higher hero score)
  const momentum = options.momentumScore ?? 50;
  const momentumBand = MOMENTUM_BANDS.find((b) => momentum >= b.min && momentum <= b.max);
  const momentumDrop = momentumBand?.label === 'Needs attention' ? 30
    : momentumBand?.label === 'Drifting' ? 20
    : momentumBand?.label === 'Could use support' ? 10
    : 0;

  const score =
    momentumDrop * 3 +
    daysScore +
    circleWeight +
    lifeEventWeight;

  return { score, lifeEvent };
}

/**
 * Pick the best hero from candidates, respecting cooldown unless critical.
 */
export function selectHero(
  lights: Light[],
  options: {
    momentumByMemberId: Record<string, number>;
    lastHeroByMemberId: Record<string, string>;
  }
): { light: Light; lifeEventLabel?: string } | null {
  const today = TODAY_ISO();
  const cooldownOk = (memberId: string) => {
    const last = options.lastHeroByMemberId[memberId];
    if (!last) return true;
    const d = new Date(last);
    const daysSince = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (daysSince >= HERO_COOLDOWN_DAYS) return true;
    // Override cooldown if momentum is critical (Needs attention)
    const score = options.momentumByMemberId[memberId];
    return score !== undefined && score < 20;
  };

  const withScores = lights
    .filter((l) => l.tier !== 'archived' && l.season !== 'archived' && cooldownOk(l.id))
    .map((light) => {
      const momentumScore = options.momentumByMemberId[light.id] ?? light.momentumScore;
      let { score, lifeEvent } = getHeroScore(light, { momentumScore });
      if (light.season === 'dormant') score *= 0.4; // Occasional nudges only
      return { light, score, lifeEvent };
    })
    .sort((a, b) => b.score - a.score);

  const top = withScores[0];
  if (!top) return null;

  return {
    light: top.light,
    lifeEventLabel: top.lifeEvent?.label,
  };
}
