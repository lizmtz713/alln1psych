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
  InsightType,
  SourceType,
  InsightTheme,
} from '../types/insights-engine';
import { detectPatterns, type PatternDetectionInput } from './patternDetection';
import type { DetectedPattern } from '../types/forecast';
import { getLifeChapterLabel } from '../data/lifeChapters';
import { detectBiasesInText } from './biasDetection';
import { getBiasById } from '../data/biases';
import { detectCascade } from './cascadeDetection';

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
  const { gaugeValues, daysSinceConnection, gauge, recentGoalReflections, healthContext } = input;
  const activeGauges = (Object.entries(gaugeValues ?? {}) as [GaugeKey, number][])
    .filter(([, v]) => v >= 0 && v < 50)
    .map(([k]) => k);

  // Health/wearable cause: Body or State low + sleep/recovery/HRV (one theme; dedupe picks one; variety in phrasing)
  const daySeed = new Date().getDate() + new Date().getMonth() * 31;
  const bodyLow = (gaugeValues?.body ?? -1) >= 0 && (gaugeValues?.body ?? 100) < 50;
  const stateLow = (gaugeValues?.state ?? -1) >= 0 && (gaugeValues?.state ?? 100) < 50;
  if (healthContext && (bodyLow || stateLow)) {
    const sleepHours = healthContext.lastNightSleepHours;
    if (sleepHours != null && sleepHours < 6) {
      const useDriverPhrasing = daySeed % 3 === 0; // Occasionally: driver → system → gauge
      const sleepVariants = useDriverPhrasing
        ? [
            { title: 'Sleep has been low', body: `You had about ${sleepHours.toFixed(1)} hours last night, which may be affecting your recovery and energy. Rest or an earlier bedtime tonight may help.` },
            { title: 'Sleep has been low this week', body: `About ${sleepHours.toFixed(1)} hours last night, which may be affecting your recovery, body, and state. A bit of rest or an earlier night can help.` },
          ]
        : [
            { title: 'Recovery has been low', body: `You had about ${sleepHours.toFixed(1)} hours last night, which may be affecting your energy. Rest or an earlier bedtime tonight may help.` },
            { title: 'Recovery has been low this week', body: `About ${sleepHours.toFixed(1)} hours last night, which may be affecting your body and state. A bit of rest or an earlier night can help.` },
          ];
      const v = sleepVariants[daySeed % sleepVariants.length];
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: v.title,
        body: v.body,
        gauges: bodyLow ? ['body'] : ['state'],
        confidence: 0.75,
        generatedAt: now(),
        factor: 'Sleep',
      });
    }
    if (stateLow && healthContext.readinessScore != null && healthContext.readinessScore < 50) {
      const recoveryVariants = [
        { title: 'Recovery has been low', body: 'Your readiness is lower than usual, which may be affecting your state. Rest, light movement, or a short reset can support your nervous system today.' },
        { title: 'Recovery may need attention', body: 'Readiness is down, which often shows up in your state. Easing up—rest, a short walk, or a breathing reset—can help.' },
      ];
      const v = recoveryVariants[daySeed % recoveryVariants.length];
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: v.title,
        body: v.body,
        gauges: ['state'],
        confidence: 0.7,
        generatedAt: now(),
        factor: 'Recovery',
      });
    }
    if (stateLow && healthContext.hrvMs != null && healthContext.hrvMs < 35) {
      const hrvVariants = [
        { title: 'Recovery has been strained', body: 'HRV suggests your nervous system could use support, which may be affecting your state. Gentle breathing, rest, or reducing load today may help.' },
        { title: 'Recovery (nervous system) is low', body: 'HRV is lower than usual, which often shows up in state. A short reset—breathing or rest—can help.' },
      ];
      const v = hrvVariants[daySeed % hrvVariants.length];
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: v.title,
        body: v.body,
        gauges: ['state'],
        confidence: 0.65,
        generatedAt: now(),
        factor: 'HRV',
      });
    }
  }

  // Goal reflections → Direction/Alignment cause
  const directionLow = (gaugeValues?.direction ?? -1) >= 0 && (gaugeValues?.direction ?? 100) < 50;
  const alignmentLow = (gaugeValues?.alignment ?? -1) >= 0 && (gaugeValues?.alignment ?? 100) < 50;
  if (recentGoalReflections && (directionLow || alignmentLow)) {
    const barriers = recentGoalReflections.whatGotInTheWay;
    const helped = recentGoalReflections.whatHelped;
    if (barriers.length > 0) {
      const theme = barriers.length === 1 ? barriers[0] : barriers.slice(0, 2).join('; ');
      const short = theme.length > 60 ? theme.slice(0, 57) + '…' : theme;
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: 'Your reflections point to what gets in the way",
        body: `You've noted that ${short} tends to get in the way. Naming it is the first step; choosing one small priority today may help.`,
        gauges: directionLow ? ["direction'] : ['alignment'],
        confidence: 0.72,
        generatedAt: now(),
        factor: 'Goal reflection',
      });
    }
    if (helped.length > 0 && (directionLow || alignmentLow)) {
      const theme = helped.length === 1 ? helped[0] : helped.slice(0, 2).join('; ');
      const short = theme.length > 60 ? theme.slice(0, 57) + '…' : theme;
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: 'Building on what helps',
        body: `Your reflections show that ${short} has been helping. Doing more of that may support your direction and alignment.`,
        gauges: ['direction', 'alignment'],
        confidence: 0.75,
        generatedAt: now(),
        factor: 'Goal reflection',
      });
    }
  }

  if (input.context === 'gauge' && gauge) {
    const v = gaugeValues?.[gauge];
    if (v != null && v < 50) {
      if (gauge === 'state') {
        out.push({
          id: nanoid(),
          kind: 'cause',
          title: 'Recovery or Attention may be affecting State',
          body: 'Stress, sleep, or overwhelm can lower your nervous system state, which may be affecting you today. Noticing what was different can help next time.',
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
          title: 'Connection and emotion are linked",
          body: `It's been ${daysSinceConnection} days since you logged connection, which often shows up as harder emotions.`,
          gauges: ["emotion', 'connection'],
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
              title: 'Recovery has been low this week",
              body: `You've logged ${poorSleepNights} night${poorSleepNights === 1 ? "' : 's'} with short or poor sleep, which may be affecting your body. Small improvements in recovery can help.`,
              gauges: ['body'],
              confidence: 0.75,
              generatedAt: now(),
              factor: 'Sleep',
            });
          } else if (goodSleepNights > 0) {
            out.push({
              id: nanoid(),
              kind: 'cause',
              title: 'Recovery supports Body",
              body: `You've had ${goodSleepNights} night${goodSleepNights === 1 ? "' : 's'} with 7+ hours, which often shows up in your body gauge. Keeping a consistent sleep routine helps.`,
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
          title: 'Recovery affects Body',
          body: 'Sleep, food, water, and movement are part of recovery; when recovery is low, that may be affecting your body. Small steps in any of these can help.',
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
        title: 'Connection reciprocity may be low',
        body: 'Connection has been quiet recently, which may be affecting your mood. Reaching out—even briefly—can help.',
        gauges: ['connection', 'emotion'],
        confidence: 0.7,
        generatedAt: now(),
        factor: 'Connection',
      });
    }
  }

  // Meaning layer: life chapter — during transitions, connection and direction often fluctuate
  const lifeChapter = input.lifeChapter?.trim();
  if (lifeChapter && (directionLow || (gaugeValues?.connection ?? 100) < 50)) {
    const label = getLifeChapterLabel(lifeChapter) || lifeChapter;
    out.push({
      id: nanoid(),
      kind: 'cause',
      title: 'Life chapters affect your gauges",
      body: `During \"${label}\", it's common for connection and direction to fluctuate. You're not broken — you're in transition.`,
      gauges: directionLow ? ['direction'] : ['connection'],
      confidence: 0.72,
      generatedAt: now(),
      factor: 'Life chapter',
    });
  }

  // Values layer: goals align with a value, or a value may be crowded out
  const userValues = input.userValues ?? [];
  if (userValues.length > 0 && (directionLow || alignmentLow)) {
    const topValue = userValues[0];
    if (recentGoalReflections?.whatHelped?.length) {
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: 'Your goals and your values',
        body: `Your recent reflections align with your value of ${topValue}. Naming what helps supports both direction and alignment.`,
        gauges: ['direction', 'alignment'],
        confidence: 0.74,
        generatedAt: now(),
        factor: 'Values',
      });
    }
  }

  // Energy layer: lots of inputs today → suggest break
  const energyCtx = input.energyContext;
  if (stateLow && energyCtx && (energyCtx.checkInsToday ?? 0) >= 2) {
    out.push({
      id: nanoid(),
      kind: 'cause',
      title: 'You\'ve had a lot of inputs today',
      body: 'Several check-ins can mean a busy or heavy day. A short break or a few minutes of rest may help your nervous system.',
      gauges: ['state'],
      confidence: 0.68,
      generatedAt: now(),
      factor: 'Energy',
    });
  }
  if (energyCtx && (energyCtx.hour ?? 12) >= 21 && (gaugeValues?.state ?? 100) < 60) {
    out.push({
      id: nanoid(),
      kind: 'cause',
      title: 'Late check-ins often mean a full day',
      body: 'Checking in late can reflect a packed day. Rest supports tomorrow; small wind-down steps help.',
      gauges: ['state'],
      confidence: 0.65,
      generatedAt: now(),
      factor: 'Energy',
    });
  }

  // Cognitive bias layer: recent text suggests a thinking pattern → one insight + tool suggestion
  const recentText = input.recentText?.trim();
  if (recentText && recentText.length >= 10) {
    const detected = detectBiasesInText(recentText);
    if (detected.length > 0) {
      const first = detected[0];
      const biasDef = getBiasById(first.biasId);
      const name = biasDef?.shortDescription ?? first.biasName;
      out.push({
        id: nanoid(),
        kind: 'cause',
        title: 'Your thoughts may be leaning toward a pattern',
        body: `${name} — Noticing it is the first step. Trying a different angle can help.`,
        gauges: ['emotion', 'state'],
        confidence: 0.7,
        generatedAt: now(),
        factor: 'Thinking',
        suggestedToolRoute: '/(modals)/activity?id=thought-challenger',
        suggestedToolLabel: 'Thought Challenger',
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
      timeLabel: 'recent trend",
    });
  }
  return out;
}

/** Growth insights: \"How you're changing\" */
function generateGrowthInsights(input: InsightEngineInput): GrowthInsight[] {
  const out: GrowthInsight[] = [];
  const { gaugeTrends, gaugeValues, checkInDates, recentGoalReflections } = input;
  const improving = (Object.entries(gaugeTrends ?? {}) as [GaugeKey, string][]).filter(
    ([, t]) => t === "improving'
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
  const isHomeOrWeekly = input.context === 'home' || input.context === 'weekly';
  if (checkInCount >= 3 && isHomeOrWeekly) {
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
  if (winsThisWeek >= 1 && isHomeOrWeekly) {
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
  if (recentGoalReflections && recentGoalReflections.whatHelped.length > 0 && isHomeOrWeekly) {
    const directionImproving = gaugeTrends?.direction === 'improving';
    const checkInsOk = checkInCount >= 2;
    if (directionImproving || checkInsOk) {
      out.push({
        id: nanoid(),
        kind: 'growth',
        title: 'Your goal reflections show what\'s working',
        body: 'You\'ve been naming what helps. That awareness supports direction and alignment over time.',
        gauges: ['direction', 'alignment'],
        confidence: 0.78,
        generatedAt: now(),
        metric: 'reflections',
      });
    }
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

// ---------- Metadata, theme, ranking & deduplication ----------

function kindToInsightType(kind: GeneratedInsight['kind']): InsightType {
  switch (kind) {
    case 'pattern':
    case 'timing':
      return 'pattern';
    case 'cause':
      return 'cause';
    case 'growth':
      return 'growth';
    case 'meaning':
      return 'awareness';
    default:
      return 'pattern';
  }
}

function getThemeForInsight(insight: GeneratedInsight): InsightTheme {
  const factor = 'factor' in insight ? (insight as CauseInsight).factor : undefined;
  const gauges = insight.gauges;
  if (factor === 'Sleep' || factor === 'Recovery' || factor === 'HRV') return 'sleep_recovery';
  if (factor?.startsWith('Cascade')) return 'cascade';
  if (factor === 'Goal reflection' || factor === 'Values') return 'direction_friction';
  if (factor === 'Connection' || factor === 'Connection gap') return 'connection_support';
  if (factor === 'Stress / Sleep' || factor === 'Sleep / Nutrition / Movement') return 'body_basics';
  if (factor === 'Energy') return 'energy_regulation';
  if (factor === 'Thinking') return 'emotional_support';
  if (factor === 'Life chapter') return 'general';
  if (insight.kind === 'cause' && (gauges[0] === 'state' || gauges[0] === 'body')) return 'energy_regulation';
  if (insight.kind === 'growth' && (gauges.includes('direction') || gauges.includes('alignment'))) return 'direction_friction';
  if (insight.kind === 'growth') return 'general';
  if (insight.kind === 'meaning') return 'emotional_support';
  if (insight.kind === 'pattern' || insight.kind === 'timing') return 'energy_regulation';
  return 'general';
}

function getSourceTypesForInsight(insight: GeneratedInsight, input: InsightEngineInput): SourceType[] {
  const factor = 'factor' in insight ? (insight as CauseInsight).factor : undefined;
  const out: SourceType[] = ['self-report'];
  if (factor === 'Sleep' || factor === 'Recovery' || factor === 'HRV') {
    if (input.healthContext?.lastNightSleepHours != null) out.push('health');
    if (input.healthContext?.readinessScore != null || input.healthContext?.hrvMs != null) out.push('oura');
  }
  if (factor === 'Goal reflection' || factor === 'Values' || (insight.kind === 'growth' && insight.gauges.includes('direction'))) {
    if (input.recentGoalReflections || input.userValues?.length) out.push('goals');
  }
  if (factor === 'Connection' || factor === 'Connection gap') {
    out.push('signals');
  }
  if (factor?.startsWith('Cascade')) {
    out.push('self-report');
    if (input.healthContext) out.push('health');
    if ((input.daysSinceConnection ?? 0) >= 2) out.push('signals');
  }
  if (factor === 'Life chapter' && input.lifeChapter) out.push('context');
  if (factor === 'Energy') out.push('context');
  if (factor === 'Thinking' && input.recentText) out.push('self-report');
  if (insight.kind === 'growth' && (input.winsThisWeek ?? 0) > 0) out.push('wins');
  if (insight.kind === 'pattern' || insight.kind === 'timing') {
    if (input.postFlights?.length || input.preFlights?.length) out.push('context');
  }
  return [...new Set(out)];
}

function enrichWithMetadata(insight: GeneratedInsight, input: InsightEngineInput): GeneratedInsight {
  const primaryGauge = insight.gauges[0] ?? 'state';
  const secondaryGauge = insight.gauges[1];
  const insightType = kindToInsightType(insight.kind);
  const sourceTypes = getSourceTypesForInsight(insight, input);
  const theme = getThemeForInsight(insight);
  return {
    ...insight,
    primaryGauge,
    secondaryGauge,
    insightType,
    sourceTypes,
    theme,
  };
}

/** Rank by evidence strength, low-gauge relevance, pattern strength, actionability. Higher = better. */
function rankScore(insight: GeneratedInsight, input: InsightEngineInput): number {
  const g = input.gaugeValues ?? {};
  const primary = insight.primaryGauge ?? insight.gauges[0];
  const lowGaugeBonus = primary && (g[primary] ?? 100) >= 0 && (g[primary] ?? 100) < 50 ? 20 : 0;
  const supportingSignals = (insight.sourceTypes?.length ?? 1) * 8 + (insight.confidence ?? 0.5) * 40;
  const actionabilityBonus = ['cause', 'action', 'growth'].includes(insight.insightType ?? '') ? 15 : 0;
  const patternStrengthBonus = insight.insightType === 'pattern' ? 12 : 0;
  const weeklyPatternGrowthBonus =
    input.context === 'weekly' && (insight.insightType === 'pattern' || insight.insightType === 'growth') ? 25 : 0;
  const cascadeBonus = insight.theme === 'cascade' ? 18 : 0;
  return supportingSignals + lowGaugeBonus + actionabilityBonus + patternStrengthBonus + weeklyPatternGrowthBonus + cascadeBonus;
}

/** Keep one insight per theme (highest rank). Prevents duplicate sleep/recovery, direction, connection, etc. */
function dedupeByTheme(insights: GeneratedInsight[], input: InsightEngineInput): GeneratedInsight[] {
  const byTheme = new Map<InsightTheme, GeneratedInsight>();
  const withRank = insights.map((i) => ({ i, rank: rankScore(i, input) }));
  withRank.sort((a, b) => b.rank - a.rank);
  for (const { i } of withRank) {
    const theme = i.theme ?? 'general';
    if (!byTheme.has(theme)) byTheme.set(theme, i);
  }
  return Array.from(byTheme.values());
}

/**
 * Generate all insights for the given context.
 * Enriches with metadata, dedupes by theme, ranks by evidence, applies weekly prioritization, then applies caps.
 */
export function generateInsights(input: InsightEngineInput): GeneratedInsight[] {
  const patternInput = toPatternInput(input);
  const detectedPatterns = detectPatterns(patternInput);

  const pattern: GeneratedInsight[] = generatePatternInsightsFromDetected(detectedPatterns);
  const cause: GeneratedInsight[] = generateCauseInsights(input);
  const cascadeInsight = detectCascade({
    gaugeValues: input.gaugeValues,
    healthContext: input.healthContext,
    sleepByDay: input.sleepByDay,
    daysSinceConnection: input.daysSinceConnection,
    recentCheckInHistory: input.recentCheckInHistory,
    currentDrivers: input.currentDrivers,
    currentSystemImpact: input.currentSystemImpact,
  });
  const timing: GeneratedInsight[] = generateTimingInsights(input, detectedPatterns);
  const growth: GeneratedInsight[] = generateGrowthInsights(input);
  const meaning: GeneratedInsight[] = generateMeaningInsights(input);

  let combined = [
    ...pattern,
    ...cause,
    ...(cascadeInsight ? [cascadeInsight] : []),
    ...timing,
    ...growth,
    ...meaning,
  ];
  combined = combined.map((i) => enrichWithMetadata(i, input));

  combined = dedupeByTheme(combined, input);
  combined.sort((a, b) => rankScore(b, input) - rankScore(a, input));

  const limit =
    input.context === 'home' || input.context === 'postCheckIn' ? 2
    : input.context === 'weekly' ? 5
    : input.context === 'gauge' ? 4
    : 2;
  return combined.slice(0, limit);
}
