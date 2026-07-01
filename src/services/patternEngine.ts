/**
 * Pattern Engine — Narrative-first cross-gauge pattern detection
 * 
 * Philosophy:
 * - Patterns must be data-grounded (minimum 7-14 days)
 * - Language is probabilistic: "tends to", "in your recent data"
 * - Focus on cross-gauge relationships (feedback loops)
 * - No universal claims, only self-referential baselines
 */

import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';
import { type GaugeKey } from '../stores/cockpitStore';

export type PatternConfidence = 'early_signal' | 'emerging' | 'established';
export type PatternType = 'feedback_loop' | 'trend' | 'correlation' | 'trigger' | 'direction_correlation';

export interface NarrativePattern {
  id: string;
  type: PatternType;
  confidence: PatternConfidence;
  gauges: GaugeKey[];
  narrative: string;
  frequency?: string; // "5 out of 7 times"
  actionable?: string; // suggestion
  dataPoints: number;
}

export interface PatternAnalysis {
  hasMinimumData: boolean;
  dataPoints: number;
  uniqueDays: number;
  patterns: NarrativePattern[];
  insufficientDataMessage?: string;
}

/**
 * Direction-specific correlation insight
 * Used by "Purpose Through Pattern" feature
 */
export interface DirectionCorrelation {
  id: string;
  category: 'sleep' | 'connection' | 'body' | 'time' | 'pattern';
  narrative: string;
  frequency: string; // e.g., "5 out of 7 times"
  strength: 'strong' | 'moderate' | 'emerging';
}

export interface DirectionInsights {
  hasEnoughData: boolean;
  dataPoints: number;
  correlations: DirectionCorrelation[];
  insufficientDataMessage?: string;
}

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

/**
 * Check if we have enough data for pattern detection
 */
export function checkDataSufficiency(history: GaugeSnapshot[]): {
  hasMinimum: boolean;
  uniqueDays: number;
  message?: string;
} {
  const uniqueDays = new Set(
    history.map(h => new Date(h.timestamp).toDateString())
  ).size;

  if (uniqueDays < 7) {
    return {
      hasMinimum: false,
      uniqueDays,
      message: `Patterns emerge with time. ${7 - uniqueDays} more days of check-ins needed.`,
    };
  }

  return { hasMinimum: true, uniqueDays };
}

/**
 * Get confidence level based on data points
 */
function getConfidence(dataPoints: number): PatternConfidence {
  if (dataPoints < 7) return 'early_signal';
  if (dataPoints < 14) return 'emerging';
  return 'established';
}

/**
 * Detect Body → State feedback loop
 * When Body drops, does State follow within 24h?
 */
function detectBodyStateLoop(history: GaugeSnapshot[]): NarrativePattern | null {
  if (history.length < 7) return null;

  // Sort by timestamp
  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  
  let bodyDrops = 0;
  let stateFollowed = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    // Body dropped below 40
    if (prev.body >= 40 && curr.body < 40 && curr.body >= 0) {
      bodyDrops++;
      
      // Check if State dropped within next 24h
      const next24h = sorted.filter(s => 
        s.timestamp > curr.timestamp && 
        s.timestamp <= curr.timestamp + 24 * 60 * 60 * 1000
      );
      
      if (next24h.some(s => s.state < 40 && s.state >= 0)) {
        stateFollowed++;
      }
    }
  }

  if (bodyDrops >= 3 && stateFollowed / bodyDrops >= 0.6) {
    const confidence = getConfidence(history.length);
    const ratio = `${stateFollowed} out of ${bodyDrops} times`;
    
    return {
      id: 'body-state-loop',
      type: 'feedback_loop',
      confidence,
      gauges: ['body', 'state'],
      narrative: `In your data: When your Body dropped below 40, your State often followed within 24 hours — ${ratio}. Your system tends to have a Body → State feedback loop.`,
      frequency: ratio,
      actionable: 'When your Body runs low, consider regulating your State proactively.',
      dataPoints: history.length,
    };
  }

  return null;
}

/**
 * Detect Connection sustained low
 */
function detectConnectionSustained(history: GaugeSnapshot[]): NarrativePattern | null {
  if (history.length < 5) return null;

  const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const recent = history.filter(h => h.timestamp > threeDaysAgo && h.connection >= 0);
  
  if (recent.length < 3) return null;

  const lowCount = recent.filter(h => h.connection < 40).length;
  const ratio = lowCount / recent.length;

  if (ratio >= 0.7) {
    const days = Math.ceil((Date.now() - Math.min(...recent.map(r => r.timestamp))) / (24 * 60 * 60 * 1000));
    
    return {
      id: 'connection-sustained-low',
      type: 'trend',
      confidence: getConfidence(history.length),
      gauges: ['connection'],
      narrative: `In your last ${days} days: Your Connection has stayed below 40. For your system, sustained isolation often pulls other gauges down.`,
      actionable: 'Even one real conversation can shift this. Who might you reach out to?',
      dataPoints: history.length,
    };
  }

  return null;
}

/**
 * Detect State-Emotion correlation
 * Does activated State correlate with lower Emotion clarity?
 */
function detectStateEmotionCorrelation(history: GaugeSnapshot[]): NarrativePattern | null {
  if (history.length < 7) return null;

  const readings = history.filter(h => h.state >= 0 && h.emotion >= 0);
  if (readings.length < 5) return null;

  // Count when low State correlates with low Emotion
  const lowStateLowEmotion = readings.filter(h => h.state < 40 && h.emotion < 50).length;
  const lowStateCount = readings.filter(h => h.state < 40).length;

  if (lowStateCount >= 3 && lowStateLowEmotion / lowStateCount >= 0.6) {
    const ratio = `${lowStateLowEmotion} out of ${lowStateCount} times`;
    
    return {
      id: 'state-emotion-correlation',
      type: 'correlation',
      confidence: getConfidence(history.length),
      gauges: ['state', 'emotion'],
      narrative: `In your data: When your State dropped below 40, your Emotion clarity also tended to fall — ${ratio}. Your emotional processing seems to work better when your nervous system is regulated.`,
      frequency: ratio,
      actionable: 'Consider regulating your State before processing difficult emotions.',
      dataPoints: history.length,
    };
  }

  return null;
}

/**
 * Detect Direction-Alignment correlation
 * Low purpose often correlates with feeling misaligned
 */
function detectDirectionAlignmentCorrelation(history: GaugeSnapshot[]): NarrativePattern | null {
  if (history.length < 7) return null;

  const readings = history.filter(h => h.direction >= 0 && h.alignment >= 0);
  if (readings.length < 5) return null;

  const bothLow = readings.filter(h => h.direction < 50 && h.alignment < 50).length;
  const ratio = bothLow / readings.length;

  if (ratio >= 0.5 && bothLow >= 3) {
    return {
      id: 'direction-alignment-correlation',
      type: 'correlation',
      confidence: getConfidence(history.length),
      gauges: ['direction', 'alignment'],
      narrative: `In your data: Direction and Alignment tend to move together. When your sense of purpose is unclear, living your values also seems harder — and the reverse appears true too.`,
      actionable: 'For you, these gauges seem connected. Addressing one may help the other.',
      dataPoints: history.length,
    };
  }

  return null;
}

/**
 * Detect overall trend for a single gauge
 */
function detectGaugeTrend(history: GaugeSnapshot[], gauge: GaugeKey): NarrativePattern | null {
  if (history.length < 7) return null;

  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const values = sorted.map(h => h[gauge]).filter(v => v >= 0);
  
  if (values.length < 5) return null;

  // Simple trend detection: compare first half to second half
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  const label = GAUGE_LABELS[gauge];

  if (diff >= 15) {
    return {
      id: `${gauge}-trend-up`,
      type: 'trend',
      confidence: getConfidence(history.length),
      gauges: [gauge],
      narrative: `In your recent check-ins: Your ${label} has been trending upward. Whatever you're doing seems to be working.`,
      dataPoints: history.length,
    };
  }

  if (diff <= -15) {
    return {
      id: `${gauge}-trend-down`,
      type: 'trend',
      confidence: getConfidence(history.length),
      gauges: [gauge],
      narrative: `In your recent check-ins: Your ${label} has been trending downward. This might be worth your attention.`,
      dataPoints: history.length,
    };
  }

  return null;
}

// ============================================================================
// PURPOSE THROUGH PATTERN — Direction-specific correlation analysis
// ============================================================================

const DIRECTION_MINIMUM_DATA_POINTS = 14; // Need 14+ check-ins for Direction insights

/**
 * Analyze what tends to happen BEFORE Direction rises
 * This is the core of "Purpose Through Pattern" — reverse-engineering what lifts purpose
 */
export async function analyzeDirectionCorrelations(): Promise<DirectionInsights> {
  const history = await getGaugeHistory();
  
  // Need minimum 14 data points for Direction-specific insights
  if (history.length < DIRECTION_MINIMUM_DATA_POINTS) {
    const remaining = DIRECTION_MINIMUM_DATA_POINTS - history.length;
    return {
      hasEnoughData: false,
      dataPoints: history.length,
      correlations: [],
      insufficientDataMessage: `Direction patterns emerge with more data. ${remaining} more check-ins needed.`,
    };
  }

  // Filter to snapshots that have Direction values
  const withDirection = history.filter(h => h.direction >= 0);
  if (withDirection.length < 10) {
    return {
      hasEnoughData: false,
      dataPoints: withDirection.length,
      correlations: [],
      insufficientDataMessage: `Keep rating your Direction gauge to unlock these insights.`,
    };
  }

  const correlations: DirectionCorrelation[] = [];
  const sorted = [...withDirection].sort((a, b) => a.timestamp - b.timestamp);

  // Find Direction rises: moments where Direction increased by 15+ from previous
  const directionRises: { prev: GaugeSnapshot; curr: GaugeSnapshot }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.direction - prev.direction >= 15 && prev.direction >= 0 && curr.direction >= 60) {
      directionRises.push({ prev, curr });
    }
  }

  // Also find sustained high Direction periods
  const highDirectionPeriods = sorted.filter(h => h.direction >= 65);

  // ===== SLEEP/BODY CORRELATION =====
  // Does Direction rise after Body is high (proxy for good sleep)?
  const bodyBeforeRise = directionRises.filter(({ prev }) => prev.body >= 60);
  if (directionRises.length >= 3 && bodyBeforeRise.length >= Math.ceil(directionRises.length * 0.6)) {
    const ratio = `${bodyBeforeRise.length} out of ${directionRises.length}`;
    correlations.push({
      id: 'direction-body-correlation',
      category: 'sleep',
      narrative: `Direction tends to rise when your Body gauge is above 60 — ${ratio} times.`,
      frequency: ratio,
      strength: bodyBeforeRise.length / directionRises.length >= 0.75 ? 'strong' : 'moderate',
    });
  }

  // High Body + High Direction co-occurrence
  const highBodyHighDirection = highDirectionPeriods.filter(h => h.body >= 60).length;
  if (highDirectionPeriods.length >= 5 && highBodyHighDirection / highDirectionPeriods.length >= 0.6) {
    const pct = Math.round((highBodyHighDirection / highDirectionPeriods.length) * 100);
    correlations.push({
      id: 'direction-body-cooccur',
      category: 'body',
      narrative: `When your Body is above 60, your Direction tends to follow — ${pct}% correlation.`,
      frequency: `${pct}%`,
      strength: pct >= 75 ? 'strong' : 'moderate',
    });
  }

  // ===== CONNECTION CORRELATION =====
  // Does Direction rise after Connection improves?
  const connectionBeforeRise = directionRises.filter(({ prev }) => prev.connection >= 55);
  if (directionRises.length >= 3 && connectionBeforeRise.length >= Math.ceil(directionRises.length * 0.5)) {
    const ratio = `${connectionBeforeRise.length} out of ${directionRises.length}`;
    correlations.push({
      id: 'direction-connection-correlation',
      category: 'connection',
      narrative: `Direction often rises after social connection — ${ratio} times you felt more purposeful after connecting with others.`,
      frequency: ratio,
      strength: connectionBeforeRise.length / directionRises.length >= 0.7 ? 'strong' : 'moderate',
    });
  }

  // High Connection + High Direction co-occurrence
  const highConnectionHighDirection = highDirectionPeriods.filter(h => h.connection >= 60).length;
  if (highDirectionPeriods.length >= 5 && highConnectionHighDirection / highDirectionPeriods.length >= 0.55) {
    correlations.push({
      id: 'direction-connection-cooccur',
      category: 'connection',
      narrative: `Your sense of purpose tends to be clearer when you're feeling connected to others.`,
      frequency: `${Math.round((highConnectionHighDirection / highDirectionPeriods.length) * 100)}%`,
      strength: 'moderate',
    });
  }

  // ===== TIME-OF-WEEK PATTERNS =====
  // Does Direction peak on certain days?
  const dayOfWeekCounts: Record<number, { total: number; highDirection: number }> = {};
  for (let i = 0; i <= 6; i++) {
    dayOfWeekCounts[i] = { total: 0, highDirection: 0 };
  }
  
  sorted.forEach(snapshot => {
    const day = new Date(snapshot.timestamp).getDay();
    dayOfWeekCounts[day].total++;
    if (snapshot.direction >= 60) {
      dayOfWeekCounts[day].highDirection++;
    }
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = -1;
  let bestDayRatio = 0;
  
  Object.entries(dayOfWeekCounts).forEach(([day, counts]) => {
    if (counts.total >= 2) {
      const ratio = counts.highDirection / counts.total;
      if (ratio > bestDayRatio && ratio >= 0.5) {
        bestDayRatio = ratio;
        bestDay = parseInt(day);
      }
    }
  });

  if (bestDay >= 0 && bestDayRatio >= 0.55) {
    const pct = Math.round(bestDayRatio * 100);
    correlations.push({
      id: 'direction-day-pattern',
      category: 'time',
      narrative: `Your Direction tends to peak on ${dayNames[bestDay]}s — ${pct}% of those check-ins showed high purpose.`,
      frequency: `${pct}%`,
      strength: bestDayRatio >= 0.7 ? 'strong' : 'emerging',
    });
  }

  // Weekend vs weekday
  const weekdaySnapshots = sorted.filter(h => {
    const day = new Date(h.timestamp).getDay();
    return day >= 1 && day <= 5;
  });
  const weekendSnapshots = sorted.filter(h => {
    const day = new Date(h.timestamp).getDay();
    return day === 0 || day === 6;
  });

  const weekdayHighDir = weekdaySnapshots.filter(h => h.direction >= 60).length;
  const weekendHighDir = weekendSnapshots.filter(h => h.direction >= 60).length;

  if (weekdaySnapshots.length >= 5 && weekendSnapshots.length >= 3) {
    const weekdayRatio = weekdayHighDir / weekdaySnapshots.length;
    const weekendRatio = weekendHighDir / weekendSnapshots.length;
    
    if (weekdayRatio > weekendRatio + 0.2 && weekdayRatio >= 0.5) {
      correlations.push({
        id: 'direction-weekday-pattern',
        category: 'time',
        narrative: `Your Direction tends to be higher during the work week than on weekends.`,
        frequency: `${Math.round(weekdayRatio * 100)}% vs ${Math.round(weekendRatio * 100)}%`,
        strength: 'emerging',
      });
    } else if (weekendRatio > weekdayRatio + 0.2 && weekendRatio >= 0.5) {
      correlations.push({
        id: 'direction-weekend-pattern',
        category: 'time',
        narrative: `Your Direction tends to be higher on weekends than during the work week.`,
        frequency: `${Math.round(weekendRatio * 100)}% vs ${Math.round(weekdayRatio * 100)}%`,
        strength: 'emerging',
      });
    }
  }

  // ===== STATE CORRELATION =====
  // Regulated nervous system → clearer direction
  const stateBeforeRise = directionRises.filter(({ prev }) => prev.state >= 50);
  if (directionRises.length >= 3 && stateBeforeRise.length >= Math.ceil(directionRises.length * 0.6)) {
    const ratio = `${stateBeforeRise.length} out of ${directionRises.length}`;
    correlations.push({
      id: 'direction-state-correlation',
      category: 'pattern',
      narrative: `Direction rises more often when your nervous system is regulated (State ≥ 50) — ${ratio} times.`,
      frequency: ratio,
      strength: stateBeforeRise.length / directionRises.length >= 0.75 ? 'strong' : 'moderate',
    });
  }

  // ===== ALIGNMENT LEADING INDICATOR =====
  // Does high Alignment precede high Direction?
  const alignmentBeforeRise = directionRises.filter(({ prev }) => prev.alignment >= 55);
  if (directionRises.length >= 3 && alignmentBeforeRise.length >= Math.ceil(directionRises.length * 0.5)) {
    correlations.push({
      id: 'direction-alignment-leading',
      category: 'pattern',
      narrative: `Living aligned with your values seems to precede clearer Direction — purpose follows integrity.`,
      frequency: `${alignmentBeforeRise.length} out of ${directionRises.length}`,
      strength: 'moderate',
    });
  }

  // Sort by strength
  const strengthOrder = { strong: 0, moderate: 1, emerging: 2 };
  correlations.sort((a, b) => strengthOrder[a.strength] - strengthOrder[b.strength]);

  return {
    hasEnoughData: true,
    dataPoints: withDirection.length,
    correlations,
  };
}

/**
 * Get current Direction gauge value (for UI decisions)
 */
export function getCurrentDirectionValue(): number {
  // Import dynamically to avoid circular dependency issues
  const { useCockpitStore } = require('../stores/cockpitStore');
  return useCockpitStore.getState().direction.value ?? -1;
}

/**
 * Main pattern analysis function
 */
export async function analyzePatterns(): Promise<PatternAnalysis> {
  const history = await getGaugeHistory();
  
  const sufficiency = checkDataSufficiency(history);
  
  if (!sufficiency.hasMinimum) {
    return {
      hasMinimumData: false,
      dataPoints: history.length,
      uniqueDays: sufficiency.uniqueDays,
      patterns: [],
      insufficientDataMessage: sufficiency.message,
    };
  }

  const patterns: NarrativePattern[] = [];

  // Run all pattern detectors
  const bodyStateLoop = detectBodyStateLoop(history);
  if (bodyStateLoop) patterns.push(bodyStateLoop);

  const connectionSustained = detectConnectionSustained(history);
  if (connectionSustained) patterns.push(connectionSustained);

  const stateEmotionCorr = detectStateEmotionCorrelation(history);
  if (stateEmotionCorr) patterns.push(stateEmotionCorr);

  const directionAlignmentCorr = detectDirectionAlignmentCorrelation(history);
  if (directionAlignmentCorr) patterns.push(directionAlignmentCorr);

  // Check individual gauge trends
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  for (const gauge of gauges) {
    const trend = detectGaugeTrend(history, gauge);
    if (trend) patterns.push(trend);
  }

  // Sort by confidence (established first) and type (feedback loops first)
  patterns.sort((a, b) => {
    const confidenceOrder = { established: 0, emerging: 1, early_signal: 2 };
    const typeOrder = { feedback_loop: 0, correlation: 1, trend: 2, trigger: 3, direction_correlation: 4 };
    
    const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    if (confDiff !== 0) return confDiff;
    
    return typeOrder[a.type] - typeOrder[b.type];
  });

  return {
    hasMinimumData: true,
    dataPoints: history.length,
    uniqueDays: sufficiency.uniqueDays,
    patterns,
  };
}

/**
 * Format confidence for display
 */
export function formatConfidence(confidence: PatternConfidence): string {
  switch (confidence) {
    case 'early_signal':
      return 'Early signal';
    case 'emerging':
      return 'Emerging pattern';
    case 'established':
      return 'Established in your data';
  }
}
