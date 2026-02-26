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
export type PatternType = 'feedback_loop' | 'trend' | 'correlation' | 'trigger';

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
      narrative: `In your recent data: When your Body dropped below 40, your State followed within 24 hours — this happened ${ratio}. Your system may have a Body → State feedback loop.`,
      frequency: ratio,
      actionable: 'When Body runs low, proactively regulate State before it drops.',
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
      narrative: `In your recent data: Your Connection gauge has been below 40 for ${days} days. Sustained isolation tends to pull other gauges down over time.`,
      actionable: 'Even one real conversation can shift this. Who could you reach out to?',
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
      narrative: `In your recent data: When your State was activated (below 40), your Emotion clarity also dropped — ${ratio}. This suggests your emotional processing works better when your nervous system is regulated.`,
      frequency: ratio,
      actionable: 'Regulate State before trying to process emotions.',
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
      narrative: `In your recent data: Direction and Alignment tend to move together for you. When purpose feels unclear, living your values also feels harder — and vice versa.`,
      actionable: 'These gauges are connected. Addressing one often helps the other.',
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
      narrative: `In your recent data: Your ${label} gauge has been trending upward. Whatever you're doing is working.`,
      dataPoints: history.length,
    };
  }

  if (diff <= -15) {
    return {
      id: `${gauge}-trend-down`,
      type: 'trend',
      confidence: getConfidence(history.length),
      gauges: [gauge],
      narrative: `In your recent data: Your ${label} gauge has been trending downward. This might be worth attention.`,
      dataPoints: history.length,
    };
  }

  return null;
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
    const typeOrder = { feedback_loop: 0, correlation: 1, trend: 2, trigger: 3 };
    
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
      return 'Early signal (not enough data to confirm)';
    case 'emerging':
      return 'Emerging pattern';
    case 'established':
      return 'Established pattern';
  }
}
