/**
 * Life Forecast Engine — Learns 6 pattern types from history.
 */

import type { DetectedPattern, PatternType } from '../types/forecast';
import type { PreFlightEntry, PostFlightEntry } from '../types/rituals';
import type { GaugeKey } from '../stores/cockpitStore';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface PatternDetectionInput {
  preFlights: PreFlightEntry[];
  postFlights: PostFlightEntry[];
  /** Mood check-in dates (YYYY-MM-DD) for engagement */
  checkInDates: string[];
  /** Last N days of gauge deltas for sequence/trend (e.g. state: [50, 45, 40] = declining) */
  recentGaugeByDay?: Array<{ date: string; state?: number; emotion?: number; body?: number }>;
  /** Days since last connection log (for connection_gaps) */
  daysSinceConnection?: number;
  /** Meeting counts per day when available (placeholder) */
  meetingCountByDate?: Record<string, number>;
}

/** Map sleep 1–5 to "poor" / "ok" / "good" */
function sleepCategory(q: number): string {
  if (q <= 2) return 'poor';
  if (q <= 4) return 'ok';
  return 'good';
}

/** Detect day-of-week: which weekday has lowest state/emotion on average */
function detectDayOfWeek(
  postFlights: PostFlightEntry[],
  preFlights: PreFlightEntry[]
): DetectedPattern | null {
  if (postFlights.length < 7) return null;
  const byDay: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  postFlights.forEach((e) => {
    const d = new Date(e.date);
    const day = d.getDay();
    const score = e.dayRating ? e.dayRating * 20 : 50;
    byDay[day].push(score);
  });
  let worstDay = -1;
  let worstAvg = 100;
  for (let day = 0; day < 7; day++) {
    if (byDay[day].length < 2) continue;
    const avg = byDay[day].reduce((a, b) => a + b, 0) / byDay[day].length;
    if (avg < worstAvg) {
      worstAvg = avg;
      worstDay = day;
    }
  }
  if (worstDay < 0) return null;
  return {
    type: 'day_of_week',
    label: `${DAY_NAMES[worstDay]}s are often your hardest`,
    description: `Your ratings tend to be lower on ${DAY_NAMES[worstDay]}.`,
    confidence: 0.7,
    factorLabel: DAY_NAMES[worstDay],
  };
}

/** Sleep → State: poor sleep correlates with lower next-day state */
function detectSleepState(preFlights: PreFlightEntry[], postFlights: PostFlightEntry[]): DetectedPattern | null {
  if (preFlights.length < 5) return null;
  const nextDayRatingBySleep: Record<string, number[]> = { poor: [], ok: [], good: [] };
  preFlights.forEach((pre) => {
    const cat = sleepCategory(pre.sleepQuality);
    const nextDate = new Date(pre.date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextStr = nextDate.toISOString().slice(0, 10);
    const post = postFlights.find((p) => p.date === nextStr);
    if (post?.dayRating) nextDayRatingBySleep[cat].push(post.dayRating * 20);
  });
  const poorAvg = nextDayRatingBySleep.poor.length ? nextDayRatingBySleep.poor.reduce((a, b) => a + b, 0) / nextDayRatingBySleep.poor.length : 60;
  const goodAvg = nextDayRatingBySleep.good.length ? nextDayRatingBySleep.good.reduce((a, b) => a + b, 0) / nextDayRatingBySleep.good.length : 70;
  if (nextDayRatingBySleep.poor.length >= 2 && poorAvg < goodAvg - 10) {
    return {
      type: 'sleep_state',
      label: 'Poor sleep → lower State next day',
      description: 'When you sleep poorly, your next-day state tends to dip.',
      confidence: 0.75,
      factorLabel: 'State',
    };
  }
  return null;
}

/** Connection gaps: 3+ days no contact → Emotion drops */
function detectConnectionGaps(daysSinceConnection: number | undefined): DetectedPattern | null {
  if (daysSinceConnection == null || daysSinceConnection < 3) return null;
  return {
    type: 'connection_gaps',
    label: 'Long gaps without connection → Emotion can drop',
    description: `It's been ${daysSinceConnection} days since you logged a connection. Reaching out often helps.`,
    confidence: 0.7,
    factorLabel: 'Emotion',
  };
}

/** Calendar load: 4+ meetings → State dips (placeholder) */
function detectCalendarLoad(meetingCountByDate?: Record<string, number>): DetectedPattern | null {
  if (!meetingCountByDate) return null;
  const entries = Object.entries(meetingCountByDate).filter(([, n]) => n >= 4);
  if (entries.length < 2) return null;
  return {
    type: 'calendar_load',
    label: 'Heavy meeting days → State can dip',
    description: 'On days with 4+ meetings, State often drops. Build in breaks.',
    confidence: 0.65,
    factorLabel: 'State',
  };
}

/** Sequence: 2 drops often lead to a 3rd */
function detectSequence(recentGaugeByDay?: PatternDetectionInput['recentGaugeByDay']): DetectedPattern | null {
  if (!recentGaugeByDay || recentGaugeByDay.length < 3) return null;
  const stateVals = recentGaugeByDay.map((d) => d.state).filter((v): v is number => v != null);
  if (stateVals.length < 3) return null;
  const drops = stateVals.slice(-3);
  if (drops[0] > drops[1] && drops[1] > drops[2]) {
    return {
      type: 'sequence',
      label: 'State has dropped 2 days in a row',
      description: 'Two drops in a row often lead to a third. Today is a good day to add support.',
      confidence: 0.7,
      factorLabel: 'State',
    };
  }
  return null;
}

/** Trend momentum: recent direction continues */
function detectTrendMomentum(recentGaugeByDay?: PatternDetectionInput['recentGaugeByDay']): DetectedPattern | null {
  if (!recentGaugeByDay || recentGaugeByDay.length < 2) return null;
  const stateVals = recentGaugeByDay.map((d) => d.state).filter((v): v is number => v != null);
  if (stateVals.length < 2) return null;
  const last = stateVals[stateVals.length - 1];
  const prev = stateVals[stateVals.length - 2];
  if (last < prev - 5) {
    return {
      type: 'trend_momentum',
      label: 'State is trending down',
      description: 'Recent trend is declining. Small steps today can help.',
      confidence: 0.65,
      factorLabel: 'State',
    };
  }
  if (last > prev + 5) {
    return {
      type: 'trend_momentum',
      label: 'State is trending up',
      description: 'Momentum is positive. Good day to build on.',
      confidence: 0.65,
      factorLabel: 'State',
    };
  }
  return null;
}

export function detectPatterns(input: PatternDetectionInput): DetectedPattern[] {
  const out: DetectedPattern[] = [];
  const p = detectDayOfWeek(input.postFlights, input.preFlights);
  if (p) out.push(p);
  const s = detectSleepState(input.preFlights, input.postFlights);
  if (s) out.push(s);
  const c = detectConnectionGaps(input.daysSinceConnection);
  if (c) out.push(c);
  const cal = detectCalendarLoad(input.meetingCountByDate);
  if (cal) out.push(cal);
  const seq = detectSequence(input.recentGaugeByDay);
  if (seq) out.push(seq);
  const trend = detectTrendMomentum(input.recentGaugeByDay);
  if (trend) out.push(trend);
  return out;
}
