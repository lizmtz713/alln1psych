/**
 * Unified Insight Engine — Transforms raw gauge data into 5 insight types
 * (Pattern, Cause, Timing, Growth, Meaning) for "the app gets me" moments.
 */

import type { GaugeKey } from '../stores/cockpitStore';
import type {
  GeneratedInsight,
  InsightEngineInput,
  PatternInsight,
  CauseInsight,
  TimingInsight,
  GrowthInsight,
  MeaningInsight,
} from '../types/insights-engine';
import { detectPatterns, type PatternDetectionInput } from './patternDetection';
import type { DetectedPattern } from '../types/forecast';

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

function nanoid(): string {
  return `insight-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

/** Map forecast pattern detection output to PatternInsight */
function patternToInsight(p: DetectedPattern, gauges: GaugeKey[]): PatternInsight {
  return {
    id: nanoid(),
    kind: 'pattern',
    title: p.label,
    body: p.description,
    gauges: gauges.length ? gauges : ['state'],
    confidence: p.confidence,
    generatedAt: now(),
    patternType: p.type,
  };
}

/** Build pattern detection input from engine input (reuse forecast-style data when available) */
function toPatternInput(input: InsightEngineInput): PatternDetectionInput {
  const recent =
    input.recentGaugeByDay?.map((d) => ({
      date: d.date,
      state: d.values.state,
      emotion: d.values.emotion,
      body: d.values.body,
    })) ?? undefined;
  return {
    preFlights: (input.preFlights ?? []) as PatternDetectionInput['preFlights'],
    postFlights: (input.postFlights ?? []) as PatternDetectionInput['postFlights'],
    checkInDates: input.checkInDates ?? [],
    recentGaugeByDay: recent,
    daysSinceConnection: input.daysSinceConnection,
  };
}

/** Which gauges a DetectedPattern most relates to */
function gaugesForPattern(p: DetectedPattern): GaugeKey[] {
  const label = (p.factorLabel ?? '').toLowerCase();
  if (label === 'state') return ['state'];
  if (label === 'emotion') return ['emotion'];
  if (label === 'body') return ['body'];
  if (p.type === 'connection_gaps') return ['connection', 'emotion'];
  return ['state'];
}

/** Generate Pattern insights from already-detected patterns */
function generatePatternInsightsFromDetected(detected: DetectedPattern[]): PatternInsight[] {
  return detected.map((p) => patternToInsight(p, gaugesForPattern(p)));
}

/** Cause insights: "This might be why" */
function generateCauseInsights(input: InsightEngineInput): CauseInsight[] {
  const out: CauseInsight[] = [];
  const { gaugeValues, daysSinceConnection, gauge } = input;
  const activeGauges = (Object.entries(gaugeValues ?? {}) as [GaugeKey, number][])
    .filter(([, v]) => v >= 0 && v < 50)
    .map(([k]) => k);

  if (input.context === 'gauge' && gauge) {
    const v = gaugeValues?.[gauge];
    if (v != null && v < 50) {
      if (gauge === 'state') {
        out.push({
          id: nanoid(),
          kind: 'cause',
          title: 'State dips often have a trigger',
          body: 'Stress, sleep, or overwhelm can lower your nervous system state. Noticing what was different today can help next time.',
          gauges: ['state'],
          confidence: 0.7,
          generatedAt: now(),
          factor: 'Stress / Sleep',
        });
      }
      if (gauge === 'emotion' && (daysSinceConnection ?? 0) >= 2) {
        out.push({
          id: nanoid(),
          kind: 'cause',
          title: 'Connection and emotion are linked',
          body: `It's been ${daysSinceConnection} days since you logged connection. Low connection often shows up as harder emotions.`,
          gauges: ['emotion', 'connection'],
          confidence: 0.75,
          generatedAt: now(),
          factor: 'Connection gap',
        });
      }
      if (gauge === 'body') {
        const sleepByDay = input.sleepByDay ?? [];
        const goodSleepNights = sleepByDay.filter((s) => (s.hours ?? 0) >= 7).length;
        const poorSleepNights = sleepByDay.filter((s) => (s.hours ?? 0) < 6 || (s.quality ?? 3) <= 2).length;
        if (sleepByDay.length >= 3 && (goodSleepNights > 0 || poorSleepNights > 0)) {
          if (poorSleepNights > 0 && v < 50) {
            out.push({
              id: nanoid(),
              kind: 'cause',
              title: 'Sleep and Body are connected',
              body: `You've logged ${poorSleepNights} night${poorSleepNights === 1 ? '' : 's'} with short or poor sleep. When sleep dips, Body often does too. Small improvements in sleep can help.`,
              gauges: ['body'],
              confidence: 0.75,
              generatedAt: now(),
              factor: 'Sleep',
            });
          } else if (goodSleepNights > 0) {
            out.push({
              id: nanoid(),
              kind: 'cause',
              title: 'When you sleep 7+ hours, Body tends to benefit',
              body: `You've had ${goodSleepNights} night${goodSleepNights === 1 ? '' : 's'} with 7+ hours. Keeping a consistent sleep routine supports your Body gauge.`,
              gauges: ['body'],
              confidence: 0.7,
              generatedAt: now(),
              factor: 'Sleep',
            });
          }
        }
        out.push({
          id: nanoid(),
          kind: 'cause',
          title: 'Body gauge reflects basics',
          body: 'Sleep, food, water, and movement directly affect how you feel. Small steps in any of these can shift the needle.',
          gauges: ['body'],
          confidence: 0.8,
          generatedAt: now(),
          factor: 'Sleep / Nutrition / Movement',
        });
      }
    }
  }

  if (input.context === 'home' && activeGauges.length > 0) {
    if (activeGauges.includes('connection') || (activeGauges.includes('emotion') && (daysSinceConnection ?? 0) >= 2)) {
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: 'Connection gaps can show up in emotion',
        body: 'When we go too long without real connection, emotion gauge often dips. Reaching out—even briefly—can help.',
        gauges: ['connection', 'emotion'],
        confidence: 0.7,
        generatedAt: now(),
        factor: 'Connection',
      });
    }
  }

  return out;
}

/** Timing insights: "When it tends to happen" */
function generateTimingInsights(input: InsightEngineInput, patterns: DetectedPattern[]): TimingInsight[] {
  const out: TimingInsight[] = [];
  const dayPattern = patterns.find((p) => p.type === 'day_of_week');
  if (dayPattern?.factorLabel) {
    out.push({
      id: nanoid(),
      kind: 'timing',
      title: `Your harder days often fall on ${dayPattern.factorLabel}`,
      body: dayPattern.description,
      gauges: ['state'],
      confidence: dayPattern.confidence,
      generatedAt: now(),
      timeLabel: dayPattern.factorLabel,
    });
  }
  const trend = patterns.find((p) => p.type === 'trend_momentum');
  if (trend && trend.label.includes('down')) {
    out.push({
      id: nanoid(),
      kind: 'timing',
      title: 'Right now things are trending down',
      body: 'Trends don’t last forever. Today is a good day to add one small support.',
      gauges: ['state'],
      confidence: trend.confidence,
      generatedAt: now(),
      timeLabel: 'recent trend',
    });
  }
  return out;
}

/** Growth insights: "How you're changing" */
function generateGrowthInsights(input: InsightEngineInput): GrowthInsight[] {
  const out: GrowthInsight[] = [];
  const { gaugeTrends, gaugeValues, checkInDates } = input;
  const improving = (Object.entries(gaugeTrends ?? {}) as [GaugeKey, string][]).filter(
    ([, t]) => t === 'improving'
  );
  if (improving.length > 0) {
    const gauges = improving.map(([g]) => g);
    out.push({
      id: nanoid(),
      kind: 'growth',
      title: `${gauges.map((g) => GAUGE_LABELS[g]).join(' & ')} ${gauges.length === 1 ? 'is' : 'are'} moving up`,
      body: 'You’re building momentum. Small, consistent steps show up over time.',
      gauges,
      confidence: 0.75,
      generatedAt: now(),
      metric: 'trending up',
    });
  }
  const checkInCount = checkInDates?.length ?? 0;
  if (checkInCount >= 3 && input.context === 'home') {
    out.push({
      id: nanoid(),
      kind: 'growth',
      title: `${checkInCount} check-ins recently`,
      body: 'Showing up for yourself consistently is a real skill. You’re doing it.',
      gauges: ['state'],
      confidence: 0.8,
      generatedAt: now(),
      metric: `${checkInCount} check-ins`,
    });
  }
  const winsThisWeek = input.winsThisWeek ?? 0;
  if (winsThisWeek >= 1 && input.context === 'home') {
    out.push({
      id: nanoid(),
      kind: 'growth',
      title: winsThisWeek === 1 ? 'You logged a win this week' : `${winsThisWeek} wins captured this week`,
      body: 'Noticing what goes right builds a clearer picture of your growth.',
      gauges: ['direction'],
      confidence: 0.8,
      generatedAt: now(),
      metric: `${winsThisWeek} wins`,
    });
  }
  return out;
}

/** Meaning insights: "What it might mean for you" — gentle reframes */
function generateMeaningInsights(input: InsightEngineInput): MeaningInsight[] {
  const out: MeaningInsight[] = [];
  const { gaugeValues, context, gauge } = input;
  const low = (Object.entries(gaugeValues ?? {}) as [GaugeKey, number][]).filter(
    ([, v]) => v >= 0 && v < 45
  );
  if (context === 'gauge' && gauge) {
    const v = gaugeValues?.[gauge];
    if (v != null && v < 45) {
      const reframes: Record<GaugeKey, string> = {
        body: 'Your body is giving you data, not a grade. Rest and basics count.',
        state: 'A low state doesn’t mean you’re failing. It means your system could use support.',
        emotion: 'Hard feelings are information. You’re allowed to feel them.',
        connection: 'Wanting connection is human. Reaching out is a strength.',
        direction: 'Clarity doesn’t have to be big. One small intention can be enough.',
        alignment: 'When actions and values feel off, that’s your compass talking.',
      };
      out.push({
        id: nanoid(),
        kind: 'meaning',
        title: 'What this might mean',
        body: reframes[gauge],
        gauges: [gauge],
        confidence: 0.85,
        generatedAt: now(),
        reframe: reframes[gauge],
      });
    }
  }
  if (context === 'postCheckIn' && low.length > 0) {
    const g = low[0][0];
    const reframes: Record<GaugeKey, string> = {
      body: 'Your body is giving you data, not a grade. Rest and basics count.',
      state: 'A low state doesn’t mean you’re failing. It means your system could use support.',
      emotion: 'Hard feelings are information. You’re allowed to feel them.',
      connection: 'Wanting connection is human. Reaching out is a strength.',
      direction: 'Clarity doesn’t have to be big. One small intention can be enough.',
      alignment: 'When actions and values feel off, that’s your compass talking.',
    };
    out.push({
      id: nanoid(),
      kind: 'meaning',
      title: 'What this might mean',
      body: reframes[g],
      gauges: low.map(([k]) => k),
      confidence: 0.85,
      generatedAt: now(),
      reframe: reframes[g],
    });
  }
  return out;
}

/**
 * Generate all insights for the given context.
 * Call from useGeneratedInsights or directly with prepared input.
 */
export function generateInsights(input: InsightEngineInput): GeneratedInsight[] {
  const patternInput = toPatternInput(input);
  const detectedPatterns = detectPatterns(patternInput);

  const pattern: GeneratedInsight[] = generatePatternInsightsFromDetected(detectedPatterns);
  const cause: GeneratedInsight[] = generateCauseInsights(input);
  const timing: GeneratedInsight[] = generateTimingInsights(input, detectedPatterns);
  const growth: GeneratedInsight[] = generateGrowthInsights(input);
  const meaning: GeneratedInsight[] = generateMeaningInsights(input);

  const combined = [...pattern, ...cause, ...timing, ...growth, ...meaning];
  combined.sort((a, b) => b.confidence - a.confidence);

  // Limit by context
  const limit =
    input.context === 'home' ? 3 : input.context === 'gauge' ? 4 : 2;
  return combined.slice(0, limit);
}
