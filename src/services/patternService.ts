/**
 * Pattern Service — Key insights from check-in/ritual data for the Patterns view.
 * Day of week, sleep correlation, volatility, etc.
 */

import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';
import { useRitualsStore } from '../stores/ritualsStore';
import type { GaugeKey } from '../stores/cockpitStore';

export type PatternType =
  | 'day_of_week'
  | 'time_of_day'
  | 'sleep_correlation'
  | 'light_effect'
  | 'gauge_correlation'
  | 'cycle_phase'
  | 'volatility'
  | 'trend';

export interface Pattern {
  id: string;
  type: PatternType;
  title: string;
  insight: string;
  suggestion?: string;
  data?: Record<string, unknown>;
  significance: 'high' | 'medium' | 'low';
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Detect patterns from gauge history + pre/post flight entries */
export async function detectPatterns(): Promise<Pattern[]> {
  const patterns: Pattern[] = [];
  const [gaugeHistory, preFlights] = await Promise.all([
    getGaugeHistory(),
    Promise.resolve(useRitualsStore.getState().preFlightEntries),
  ]);
  const postFlights = useRitualsStore.getState().postFlightEntries;

  const snapshots = gaugeHistory as unknown as GaugeSnapshot[];
  if (!snapshots || snapshots.length < 5) {
    return patterns;
  }

  const byDayOfWeek: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  snapshots.forEach((s) => {
    const day = new Date(s.timestamp).getDay();
    const state = (s as any).state;
    if (state >= 0) byDayOfWeek[day].push(state);
  });

  const dayAverages = DAY_NAMES.map((_, i) => ({
    name: DAY_NAMES[i],
    avg: byDayOfWeek[i].length > 0 ? avg(byDayOfWeek[i]) : 0,
    count: byDayOfWeek[i].length,
  })).filter((d) => d.count >= 2);

  if (dayAverages.length >= 3) {
    const lowest = dayAverages.reduce((a, b) => (a.avg <= b.avg ? a : b));
    const highest = dayAverages.reduce((a, b) => (a.avg >= b.avg ? a : b));
    const diff = highest.avg - lowest.avg;
    if (diff >= 10) {
      patterns.push({
        id: 'day-dip-' + lowest.name,
        type: 'day_of_week',
        title: `${lowest.name} Dip`,
        insight: `Your State drops an average of ${Math.round(diff)} points on ${lowest.name}s. This is common — transitions are hard on the nervous system.`,
        suggestion: `${lowest.name === 'Monday' ? 'Sunday evening wind-down, lighter Monday schedule' : `Try: lighter schedule, extra self-care on ${lowest.name}s`}`,
        data: { lowest: lowest.name, diff, dayAverages },
        significance: diff >= 15 ? 'high' : 'medium',
      });
    }
  }

  // Sleep correlation: pre-flight sleep quality vs next-day feeling (from next pre-flight or gauge)
  if (preFlights.length >= 7) {
    const goodSleepDays = new Set<string>();
    preFlights.forEach((p) => {
      if (p.sleepQuality >= 4) goodSleepDays.add(p.date);
    });
    const goodSleepNextDayState: number[] = [];
    const poorSleepNextDayState: number[] = [];
    snapshots.forEach((s, i) => {
      const date = new Date(s.timestamp).toISOString().slice(0, 10);
      const prevDate = new Date(new Date(s.timestamp).getTime() - 86400000).toISOString().slice(0, 10);
      const state = (s as any).state;
      if (state < 0) return;
      if (goodSleepDays.has(prevDate)) goodSleepNextDayState.push(state);
      else if (preFlights.some((p) => p.date === prevDate && p.sleepQuality <= 2)) {
        poorSleepNextDayState.push(state);
      }
    });
    if (goodSleepNextDayState.length >= 3 && poorSleepNextDayState.length >= 2) {
      const goodAvg = avg(goodSleepNextDayState);
      const poorAvg = avg(poorSleepNextDayState);
      const delta = Math.round(goodAvg - poorAvg);
      if (delta >= 8) {
        patterns.push({
          id: 'sleep-correlation',
          type: 'sleep_correlation',
          title: 'Sleep Correlation',
          insight: `When you sleep "Good" or "Great," your next-day State is ${delta} points higher on average.`,
          suggestion: 'Sleep is your lever.',
          data: { goodAvg, poorAvg, delta },
          significance: 'high',
        });
      }
    }
  }

  // Volatility: which gauge swings most (std dev across recent snapshots)
  const keys: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  const recent = snapshots.slice(-21);
  if (recent.length >= 5) {
    let maxVolatility = 0;
    let maxKey: GaugeKey = 'state';
    keys.forEach((key) => {
      const values = recent.map((s) => (s as any)[key]).filter((v: number) => v >= 0);
      if (values.length < 3) return;
      const mean = avg(values);
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
      const std = Math.sqrt(variance);
      if (std > maxVolatility) {
        maxVolatility = std;
        maxKey = key;
      }
    });
    if (maxVolatility >= 12) {
      const names: Record<GaugeKey, string> = {
        body: 'Body',
        state: 'State',
        emotion: 'Emotion',
        connection: 'Connection',
        direction: 'Direction',
        alignment: 'Alignment',
      };
      patterns.push({
        id: 'volatility-' + maxKey,
        type: 'volatility',
        title: `Volatility: ${names[maxKey]}`,
        insight: `${names[maxKey]} is your most volatile gauge — swings of ${Math.round(maxVolatility)}+ points week to week. Might be worth exploring what drives the swings.`,
        suggestion: `Open ${names[maxKey]} gauge to explore.`,
        significance: 'medium',
      });
    }
  }

  return patterns;
}
