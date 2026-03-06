/**
 * Life Forecast Engine — Main API for forecasts.
 * Consumes rituals, cockpit, circle, lights; returns tomorrow, today (Pre-Flight), week.
 */

import { useRitualsStore } from '../stores/ritualsStore';
import { useCockpitStore } from '../stores/cockpitStore';
import { useCircleStore } from '../stores/circleStore';
import { useLightsStore } from '../stores/lightsStore';
import { detectPatterns, type PatternDetectionInput } from './patternDetection';
import {
  getForecastForDay,
  getWeekForecast,
  type PredictionModelInput,
} from './predictionModel';
import type { DayForecast, ForecastContext, WeekForecast } from '../types/forecast';
import type { GaugeKey } from '../stores/cockpitStore';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Days since most recent connection log (from lights lastContactByMemberId) */
function getDaysSinceConnection(): number | undefined {
  const state = useLightsStore.getState();
  const lastByMember = state.lastContactByMemberId ?? {};
  const dates = Object.values(lastByMember).filter(Boolean) as string[];
  if (dates.length === 0) return undefined;
  const latest = dates.sort().reverse()[0];
  const d = new Date(latest);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

/** Build context for a given date (e.g. today = last night's sleep, today's meetings) */
function buildContextForDate(dateStr: string): ForecastContext {
  const rituals = useRitualsStore.getState();
  const cockpit = useCockpitStore.getState();
  const ctx: ForecastContext = {};

  const yesterday = addDays(dateStr, -1);
  const preYesterday = rituals.getPreFlightForDate(yesterday);
  if (preYesterday) {
    ctx.sleepQuality = preYesterday.sleepQuality;
  }

  ctx.daysSinceConnection = getDaysSinceConnection();

  // Current gauges (for "today" only) for trend
  if (dateStr === todayStr()) {
    ctx.gaugeValues = {
      body: cockpit.body.value >= 0 ? cockpit.body.value : undefined,
      state: cockpit.state.value >= 0 ? cockpit.state.value : undefined,
      emotion: cockpit.emotion.value >= 0 ? cockpit.emotion.value : undefined,
      connection: cockpit.connection.value >= 0 ? cockpit.connection.value : undefined,
      direction: cockpit.direction.value >= 0 ? cockpit.direction.value : undefined,
      alignment: cockpit.alignment.value >= 0 ? cockpit.alignment.value : undefined,
    };
    ctx.gaugeTrends = {
      body: cockpit.body.trend ?? undefined,
      state: cockpit.state.trend ?? undefined,
      emotion: cockpit.emotion.trend ?? undefined,
      connection: cockpit.connection.trend ?? undefined,
      direction: cockpit.direction.trend ?? undefined,
      alignment: cockpit.alignment.trend ?? undefined,
    };
  }

  return ctx;
}

/** Recent gauge-by-day for sequence/trend (last 7 days from post-flight day ratings as proxy for state) */
function getRecentGaugeByDay(): PatternDetectionInput['recentGaugeByDay'] {
  const rituals = useRitualsStore.getState();
  const cutoff = addDays(todayStr(), -14);
  const posts = rituals.getPostFlightsSince(cutoff);
  if (posts.length < 2) return undefined;
  return posts
    .slice(-7)
    .map((p) => ({
      date: p.date,
      state: p.dayRating != null ? p.dayRating * 20 : undefined,
      emotion: p.dayRating != null ? p.dayRating * 20 : undefined,
    }))
    .reverse();
}

/** Check-in dates from circle mood history */
function getCheckInDates(): string[] {
  const circle = useCircleStore.getState();
  const moodHistory = circle.moodHistory ?? [];
  return moodHistory.map((m) => new Date(m.timestamp).toISOString().slice(0, 10));
}

function getModelInput(): PredictionModelInput {
  const rituals = useRitualsStore.getState();
  const cutoff = addDays(todayStr(), -90);
  return {
    preFlights: rituals.getPreFlightsSince(cutoff),
    postFlights: rituals.getPostFlightsSince(cutoff),
    checkInDates: getCheckInDates(),
    recentGaugeByDay: getRecentGaugeByDay(),
    daysSinceConnection: getDaysSinceConnection(),
    contextForDate: buildContextForDate,
  };
}

/** Tomorrow's forecast (for home card) */
export function getTomorrowForecast(): DayForecast {
  const tomorrow = addDays(todayStr(), 1);
  return getForecastForDay(tomorrow, getModelInput());
}

/** Today's forecast (for Pre-Flight screen) */
export function getTodayForecast(): DayForecast {
  return getForecastForDay(todayStr(), getModelInput());
}

/** Full week forecast (for forecast screen) */
export function getFullWeekForecast(): WeekForecast {
  const input = getModelInput();
  const patterns = detectPatterns({
    preFlights: input.preFlights,
    postFlights: input.postFlights,
    checkInDates: input.checkInDates,
    recentGaugeByDay: input.recentGaugeByDay,
    daysSinceConnection: input.daysSinceConnection,
    meetingCountByDate: input.meetingCountByDate,
  });
  const days = getWeekForecast(input);
  return { days, patterns };
}
