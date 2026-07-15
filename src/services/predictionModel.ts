/**
 * Life Forecast Engine — Multi-factor prediction algorithm.
 */

import type { DayForecast, RiskFactor, ForecastSuggestion, ForecastContext, DetectedPattern } from '../types/forecast';
import type { GaugeKey } from '../stores/cockpitStore';
import { detectPatterns, type PatternDetectionInput } from './patternDetection';
import type { PreFlightEntry, PostFlightEntry } from '../types/rituals';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayName(dateStr: string): string {
  return DAY_NAMES[new Date(dateStr).getDay()];
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build risk factors and suggestions from context + patterns */
export function predictDay(
  dateStr: string,
  context: ForecastContext,
  patterns: DetectedPattern[]
): DayForecast {
  const riskFactors: RiskFactor[] = [];
  const suggestions: ForecastSuggestion[] = [];
  const brightSpots: string[] = [];
  const dayName = getDayName(dateStr);

  // Sleep → State
  if (context.sleepQuality != null && context.sleepQuality <= 2) {
    riskFactors.push({
      gauge: 'state',
      label: 'Poor sleep',
      reason: `You slept poorly (${context.sleepQuality}/5). State may be lower today.`,
      severity: 'medium',
    });
    suggestions.push({ text: 'Build in a midday break', icon: '💡' });
  } else if (context.sleepQuality != null && context.sleepQuality >= 4) {
    brightSpots.push('Good sleep last night');
  }

  // Meeting load
  if ((context.meetingCount ?? 0) >= 4) {
    riskFactors.push({
      gauge: 'state',
      label: 'Heavy day',
      reason: `${context.meetingCount} meetings scheduled. State often dips on busy days.`,
      severity: 'medium',
    });
    suggestions.push({ text: 'Block 15 minutes after lunch', icon: '💡' });
  }

  // Connection gap
  if ((context.daysSinceConnection ?? 0) >= 3) {
    riskFactors.push({
      gauge: 'emotion',
      label: 'Connection gap',
      reason: `It's been ${context.daysSinceConnection} days since you logged a connection.`,
      severity: 'medium',
    });
    suggestions.push({ text: 'Reach out to one person today', icon: '💬' });
  }

  // Day-of-week pattern
  const dowPattern = patterns.find((p) => p.type === 'day_of_week' && p.factorLabel === dayName);
  if (dowPattern) {
    riskFactors.push({
      gauge: 'state',
      label: dayName,
      reason: dowPattern.description,
      severity: 'low',
    });
  }

  // Sequence / trend
  const sequencePattern = patterns.find((p) => p.type === 'sequence');
  if (sequencePattern) {
    riskFactors.push({
      gauge: 'state',
      label: 'Recent drops',
      reason: sequencePattern.description,
      severity: 'high',
    });
    suggestions.push({ text: 'Add one small supportive ritual today', icon: '🌱' });
  }

  const trendPattern = patterns.find((p) => p.type === 'trend_momentum' && p.label.includes('down'));
  if (trendPattern) {
    riskFactors.push({
      gauge: 'state',
      label: 'Trend',
      reason: trendPattern.description,
      severity: 'medium',
    });
  }

  // Default suggestion if none
  if (suggestions.length === 0 && riskFactors.length > 0) {
    suggestions.push({ text: 'Take it one step at a time', icon: '💡' });
  }
  if (riskFactors.length === 0) {
    brightSpots.push('No major risk factors today');
  }

  const highCount = riskFactors.filter((r) => r.severity === 'high').length;
  const mediumCount = riskFactors.filter((r) => r.severity === 'medium').length;
  const riskLevel: DayForecast['riskLevel'] =
    highCount > 0 ? 'high' : mediumCount >= 2 ? 'high' : mediumCount >= 1 ? 'medium' : 'low';

  const gaugeRisks: Partial<Record<GaugeKey, 'low' | 'medium' | 'high'>> = {};
  riskFactors.forEach((r) => {
    if (r.gauge && r.severity !== 'low') gaugeRisks[r.gauge] = r.severity;
  });

  return {
    date: dateStr,
    dayName,
    riskLevel,
    riskFactors,
    brightSpots,
    suggestions,
    gaugeRisks: Object.keys(gaugeRisks).length > 0 ? gaugeRisks : undefined,
  };
}

export interface PredictionModelInput {
  preFlights: PreFlightEntry[];
  postFlights: PostFlightEntry[];
  checkInDates: string[];
  recentGaugeByDay?: PatternDetectionInput['recentGaugeByDay'];
  daysSinceConnection?: number;
  meetingCountByDate?: Record<string, number>;
  /** For tomorrow/today: sleep quality last night, meetings today, etc. */
  contextForDate?: (dateStr: string) => ForecastContext;
}

/** Get forecast for a single day (e.g. tomorrow or today) */
export function getForecastForDay(
  dateStr: string,
  input: PredictionModelInput
): DayForecast {
  const patterns = detectPatterns({
    preFlights: input.preFlights,
    postFlights: input.postFlights,
    checkInDates: input.checkInDates,
    recentGaugeByDay: input.recentGaugeByDay,
    daysSinceConnection: input.daysSinceConnection,
    meetingCountByDate: input.meetingCountByDate,
  });
  const context = input.contextForDate?.(dateStr) ?? {};
  return predictDay(dateStr, context, patterns);
}

/** Get week forecast (next 7 days) */
export function getWeekForecast(input: PredictionModelInput): DayForecast[] {
  const start = addDays(todayStr(), 1);
  const patterns = detectPatterns({
    preFlights: input.preFlights,
    postFlights: input.postFlights,
    checkInDates: input.checkInDates,
    recentGaugeByDay: input.recentGaugeByDay,
    daysSinceConnection: input.daysSinceConnection,
    meetingCountByDate: input.meetingCountByDate,
  });
  const days: DayForecast[] = [];
  for (let i = 0; i < 7; i++) {
    const dateStr = addDays(start, i);
    const context = input.contextForDate?.(dateStr) ?? {};
    days.push(predictDay(dateStr, context, patterns));
  }
  return days;
}
