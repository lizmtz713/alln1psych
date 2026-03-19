/**
 * Forecast Loop + Human Weather Forecast — Predict likely system states from current signals.
 * Uses Life OS influencing systems (Recovery, Attention, etc.) in copy where relevant.
 * getTomorrowForecast / getFullWeekForecast = "Human Weather" — how you'll likely feel tomorrow.
 */

import type { GaugeKey } from '../stores/cockpitStore';
import { getInfluencingSystemLabel } from '../lib/influencingSystems';
import type { DayForecast, RiskFactor, ForecastSuggestion, WeekForecast, DetectedPattern } from '../types/forecast';

export type ForecastInput = {
  gauges: Partial<Record<GaugeKey, number>>;
  checkInContext: { sleep?: string; social?: string; stressSource?: string } | null;
  checkInHistory?: Array<{ timestamp: string; systemImpact: GaugeKey[]; drivers: string[] }>;
  /** Optional: for Human Weather (tomorrow's forecast) */
  healthContext?: { lastNightSleepHours?: number; readinessScore?: number };
  daysSinceConnection?: number;
};

export type ForecastItem = {
  id: string;
  /** Short line for strip/card (e.g. "Likely low energy tomorrow") */
  line: string;
  /** Optional suggestion (e.g. "Prioritize rest tonight") */
  suggestion?: string;
};

const SLEEP_POOR = ['Poor', 'Very poor', 'Okay'];
const STRESS_HIGH = ['Work', 'Relationships', 'Health', 'Uncertainty', 'Financial'];

function tomorrowDayName(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

function dayNameForOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : days[d.getDay()];
}

function dateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns 0–2 forecast items based on current gauges and context.
 * Used for: cockpit alert strip, ritual prompts, Forecast card.
 */
export function getForecast(input: ForecastInput): ForecastItem[] {
  const { gauges, checkInContext } = input;
  const out: ForecastItem[] = [];
  const body = gauges.body ?? -1;
  const state = gauges.state ?? -1;
  const connection = gauges.connection ?? -1;
  const direction = gauges.direction ?? -1;
  const sleep = checkInContext?.sleep ?? '';
  const stress = checkInContext?.stressSource ?? '';

  // Recovery (sleep deficit) → tomorrow may feel lower energy
  if (SLEEP_POOR.includes(sleep) || (body >= 0 && body < 45)) {
    const recoveryLabel = getInfluencingSystemLabel('recovery');
    out.push({
      id: 'body-energy',
      line: `Tomorrow may feel heavier if ${recoveryLabel.toLowerCase()} stays low tonight.`,
      suggestion: 'Prioritize rest or an earlier night.',
    });
  }

  // Sustained low connection → tomorrow may feel more distant
  if (connection >= 0 && connection < 40) {
    out.push({
      id: 'connection-isolation',
      line: 'Connection has been low — tomorrow may feel easier to drift from people.',
      suggestion: 'Reach out to one person today.',
    });
  }

  // Attention (direction overload + stress) → state may strain in 1–2 days
  if ((direction >= 0 && direction < 50) && (state >= 0 && state < 55) && STRESS_HIGH.some(s => stress.includes(s))) {
    const attentionLabel = getInfluencingSystemLabel('attention');
    out.push({
      id: 'direction-state-drop',
      line: `${attentionLabel} may strain your state in 1–2 days.`,
      suggestion: 'Pick one task to move; protect rest.',
    });
  }

  return out.slice(0, 2);
}

/** Human Weather Forecast — How you'll likely feel tomorrow. Used by ForecastCard and /forecast. */
export function getTomorrowForecast(input: ForecastInput): DayForecast {
  const { gauges, checkInContext, healthContext, daysSinceConnection } = input;
  const body = gauges.body ?? -1;
  const state = gauges.state ?? -1;
  const connection = gauges.connection ?? -1;
  const direction = gauges.direction ?? -1;
  const emotion = gauges.emotion ?? -1;
  const sleep = checkInContext?.sleep ?? '';
  const stress = checkInContext?.stressSource ?? '';
  const sleepHours = healthContext?.lastNightSleepHours;

  const riskFactors: RiskFactor[] = [];
  const brightSpots: string[] = [];
  const suggestions: ForecastSuggestion[] = [];

  // Recovery: low sleep / body → tomorrow may feel lower energy
  if (SLEEP_POOR.includes(sleep) || (body >= 0 && body < 45) || (sleepHours != null && sleepHours < 6)) {
    riskFactors.push({
      gauge: 'body',
      label: 'Energy',
      reason: 'Recovery has been low. Tomorrow may feel lower on energy.',
      severity: sleepHours != null && sleepHours < 5 ? 'high' : 'medium',
    });
    suggestions.push({ text: 'Prioritize rest or an earlier night.' });
  } else if (body >= 60 && state >= 50) {
    brightSpots.push('Your body and state are in a good range — tomorrow can build on that.');
  }

  // Attention: direction + stress → state may strain tomorrow
  if ((direction >= 0 && direction < 50) && (state >= 0 && state < 55) && STRESS_HIGH.some((s) => stress.includes(s))) {
    riskFactors.push({
      gauge: 'state',
      label: 'State',
      reason: 'Attention (overload, task switching) may strain your state tomorrow.',
      severity: 'medium',
    });
    if (!suggestions.some((s) => s.text.includes('one task'))) {
      suggestions.push({ text: 'Pick one task to move; protect rest.' });
    }
  }

  // Connection: low connection → tomorrow may feel easier to drift
  if (connection >= 0 && connection < 40) {
    riskFactors.push({
      gauge: 'connection',
      label: 'Connection',
      reason: 'Connection has been low — tomorrow may feel easier to drift from people.',
      severity: 'medium',
    });
    suggestions.push({ text: 'Reach out to one person today or tomorrow.' });
  } else if (connection >= 60 && (emotion < 0 || emotion >= 50)) {
    brightSpots.push('Connection is in a good place — can support emotion.');
  }

  if (riskFactors.length === 0 && brightSpots.length === 0) {
    brightSpots.push('No major risk factors. Take it one step at a time.');
  }
  if (suggestions.length === 0) {
    suggestions.push({ text: 'Take it one step at a time.' });
  }

  const riskLevel: 'low' | 'medium' | 'high' =
    riskFactors.some((f) => f.severity === 'high') ? 'high'
    : riskFactors.length >= 2 ? 'medium'
    : 'low';

  return {
    date: dateStr(1),
    dayName: tomorrowDayName(),
    riskLevel,
    riskFactors,
    brightSpots,
    suggestions,
  };
}

/** Today's forecast (Pre-Flight). Same logic as tomorrow but framed for "today". */
export function getTodayForecast(input: ForecastInput): DayForecast {
  const { gauges, checkInContext, healthContext, daysSinceConnection } = input;
  const body = gauges.body ?? -1;
  const state = gauges.state ?? -1;
  const connection = gauges.connection ?? -1;
  const direction = gauges.direction ?? -1;
  const sleep = checkInContext?.sleep ?? '';
  const stress = checkInContext?.stressSource ?? '';
  const sleepHours = healthContext?.lastNightSleepHours;

  const riskFactors: RiskFactor[] = [];
  const brightSpots: string[] = [];
  const suggestions: ForecastSuggestion[] = [];

  if (SLEEP_POOR.includes(sleep) || (body >= 0 && body < 45) || (sleepHours != null && sleepHours < 6)) {
    riskFactors.push({
      gauge: 'body',
      label: 'Energy',
      reason: 'Recovery has been low. Today may feel lower on energy.',
      severity: sleepHours != null && sleepHours < 5 ? 'high' : 'medium',
    });
    suggestions.push({ text: 'A short rest or lighter load today can help.' });
  }
  if ((direction >= 0 && direction < 50) && (state >= 0 && state < 55) && STRESS_HIGH.some((s) => stress.includes(s))) {
    riskFactors.push({
      gauge: 'state',
      label: 'State',
      reason: 'Attention and stress may strain your state today.',
      severity: 'medium',
    });
    suggestions.push({ text: 'Pick one priority; protect rest.' });
  }
  if (connection >= 0 && connection < 40) {
    riskFactors.push({
      gauge: 'connection',
      label: 'Connection',
      reason: 'Connection has been low — reaching out may help today.',
      severity: 'medium',
    });
    suggestions.push({ text: 'Reach out to one person.' });
  }
  if (riskFactors.length === 0) {
    brightSpots.push('No major risk factors today. You\'re good to go.');
  }
  if (suggestions.length === 0) {
    suggestions.push({ text: 'Take it one step at a time.' });
  }

  const riskLevel =
    riskFactors.some((f) => f.severity === 'high') ? 'high'
    : riskFactors.length >= 2 ? 'medium'
    : 'low';

  return {
    date: dateStr(0),
    dayName: 'Today',
    riskLevel,
    riskFactors,
    brightSpots,
    suggestions,
  };
}

/** Full week forecast. Tomorrow from signals; other days from simple extrapolation / stability. */
export function getFullWeekForecast(input: ForecastInput): WeekForecast {
  const tomorrow = getTomorrowForecast(input);
  const days: DayForecast[] = [tomorrow];

  for (let offset = 2; offset <= 7; offset++) {
    const dayName = dayNameForOffset(offset);
    const date = dateStr(offset);
    days.push({
      date,
      dayName,
      riskLevel: 'low',
      riskFactors: [],
      brightSpots: ['Patterns beyond tomorrow depend on how you check in. Stay consistent.'],
      suggestions: [{ text: 'Take it one step at a time.' }],
    });
  }

  const patterns: DetectedPattern[] = [];
  const body = input.gauges?.body ?? -1;
  const connection = input.gauges?.connection ?? -1;
  if (body >= 0 && body < 50) {
    patterns.push({
      type: 'sleep_state',
      label: 'Recovery and energy',
      description: 'When recovery is low, Body and State often stay low the next day. Rest helps.',
      confidence: 0.75,
    });
  }
  if (connection >= 0 && connection < 45) {
    patterns.push({
      type: 'connection_gaps',
      label: 'Connection and emotion',
      description: 'Low connection can lead to emotional drift. Reaching out tends to help.',
      confidence: 0.7,
    });
  }
  if (patterns.length === 0) {
    patterns.push({
      type: 'trend_momentum',
      label: 'Your system',
      description: 'Check in regularly to see how your signals affect the next day.',
      confidence: 0.5,
    });
  }

  return { days, patterns };
}
