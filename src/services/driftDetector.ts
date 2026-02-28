/**
 * Drift Detector Service — Weekly Value Alignment Reflection
 * 
 * Philosophy:
 * - "Just noticing" — curious, not judgmental
 * - Correlates gauge data with value-consistent actions
 * - Builds patterns over time: "When sleep < 6h, alignment tends to drop"
 * - Empowers user to see their own patterns, not prescribe behavior
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';
import { type GaugeKey } from '../stores/cockpitStore';

const DRIFT_HISTORY_KEY = 'drift_reflection_history';
const LAST_REFLECTION_KEY = 'drift_last_reflection';

export type AlignmentResponse = 'yes' | 'mostly' | 'not_really';

export interface ValueReflection {
  id: string;
  timestamp: number;
  value: string;
  response: AlignmentResponse;
  weekStartDate: string;
  weekEndDate: string;
}

export interface DriftPattern {
  id: string;
  type: 'correlation' | 'trend';
  gauge: GaugeKey;
  condition: 'low' | 'high';
  threshold: number;
  alignmentImpact: 'positive' | 'negative';
  frequency: string;
  narrative: string;
  dataPoints: number;
}

export interface DriftInsight {
  pattern: DriftPattern;
  confidence: 'early' | 'emerging' | 'established';
  suggestion?: string;
}

export interface WeekData {
  gaugeSnapshots: GaugeSnapshot[];
  averages: Record<GaugeKey, number>;
  sleepAverage?: number;
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
 * Get the start of the current week (Sunday)
 */
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the current week (Saturday)
 */
function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check when the last reflection was completed
 */
export async function getLastReflectionDate(): Promise<Date | null> {
  try {
    const stored = await AsyncStorage.getItem(LAST_REFLECTION_KEY);
    return stored ? new Date(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Check if it's time for a weekly reflection
 */
export async function isWeeklyReflectionDue(): Promise<boolean> {
  const lastReflection = await getLastReflectionDate();
  const currentWeekStart = getWeekStart();
  
  if (!lastReflection) {
    // First time — wait until user has at least 3 days of data
    const history = await getGaugeHistory();
    const uniqueDays = new Set(
      history.map(h => new Date(h.timestamp).toDateString())
    ).size;
    return uniqueDays >= 3;
  }
  
  // Due if last reflection was before current week started
  return lastReflection < currentWeekStart;
}

/**
 * Get week data for analysis
 */
export async function getWeekData(): Promise<WeekData> {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd(weekStart);
  const history = await getGaugeHistory();
  
  const weekSnapshots = history.filter(s => {
    const date = new Date(s.timestamp);
    return date >= weekStart && date <= weekEnd;
  });

  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  const averages = {} as Record<GaugeKey, number>;

  for (const gauge of gauges) {
    const validValues = weekSnapshots
      .map(s => s[gauge])
      .filter(v => v >= 0);
    
    averages[gauge] = validValues.length > 0
      ? validValues.reduce((a, b) => a + b, 0) / validValues.length
      : -1;
  }

  return {
    gaugeSnapshots: weekSnapshots,
    averages,
  };
}

/**
 * Check value alignment based on user's stated values and week data
 */
export function checkValueAlignment(
  userId: string,
  values: string[],
  weekData: WeekData
): { value: string; prompt: string }[] {
  // Generate prompts for each value
  return values.map(value => ({
    value,
    prompt: generateValuePrompt(value, weekData),
  }));
}

/**
 * Generate a reflection prompt for a specific value
 */
function generateValuePrompt(value: string, weekData: WeekData): string {
  const prompts: Record<string, string> = {
    // Common values with contextual prompts
    'honesty': 'Were you honest with yourself and others this week?',
    'kindness': 'Did you show kindness — to yourself and others?',
    'growth': 'Did you take steps toward growth, even small ones?',
    'connection': 'Did you prioritize meaningful connection?',
    'health': 'Did your actions support your wellbeing?',
    'creativity': 'Did you make space for creativity?',
    'courage': 'Did you act with courage when it mattered?',
    'presence': 'Were you present in the moments that counted?',
    'authenticity': 'Did you show up as yourself?',
    'compassion': 'Did you practice compassion — especially toward yourself?',
    'balance': 'Did you maintain balance across your life domains?',
    'integrity': 'Did your actions align with your word?',
    'curiosity': 'Did you stay curious and open?',
    'gratitude': 'Did you notice what you\'re grateful for?',
    'patience': 'Did you practice patience when tested?',
  };

  return prompts[value.toLowerCase()] || 
    `Did your actions align with your value of ${value}?`;
}

/**
 * Get weekly reflection prompt for a set of values
 */
export function getWeeklyReflectionPrompt(values: string[]): string {
  if (values.length === 0) {
    return "Let's check in on how you've been living this week.";
  }
  
  if (values.length === 1) {
    return `This week, let's reflect on your value of ${values[0]}.`;
  }
  
  const formatted = values.slice(0, -1).join(', ') + ' and ' + values[values.length - 1];
  return `Time to check in on your values: ${formatted}.`;
}

/**
 * Record a value reflection response
 */
export async function recordValueReflection(
  value: string,
  response: AlignmentResponse
): Promise<void> {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd(weekStart);
  
  const reflection: ValueReflection = {
    id: `vr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    value,
    response,
    weekStartDate: weekStart.toISOString(),
    weekEndDate: weekEnd.toISOString(),
  };

  try {
    const existing = await AsyncStorage.getItem(DRIFT_HISTORY_KEY);
    const history: ValueReflection[] = existing ? JSON.parse(existing) : [];
    
    // Keep last 12 weeks of reflections
    const twelveWeeksAgo = Date.now() - (12 * 7 * 24 * 60 * 60 * 1000);
    const filtered = history.filter(r => r.timestamp > twelveWeeksAgo);
    filtered.push(reflection);
    
    await AsyncStorage.setItem(DRIFT_HISTORY_KEY, JSON.stringify(filtered));
    await AsyncStorage.setItem(LAST_REFLECTION_KEY, new Date().toISOString());
  } catch (e) {
    console.warn('[DriftDetector] Failed to record reflection:', e);
  }
}

/**
 * Get all value reflections history
 */
export async function getReflectionHistory(): Promise<ValueReflection[]> {
  try {
    const data = await AsyncStorage.getItem(DRIFT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Analyze drift patterns from historical data
 * Correlates gauge readings with value alignment responses
 */
export async function getValueDriftPatterns(): Promise<DriftPattern[]> {
  const reflections = await getReflectionHistory();
  const gaugeHistory = await getGaugeHistory();
  
  if (reflections.length < 4) {
    // Need at least 4 weeks of data to find patterns
    return [];
  }

  const patterns: DriftPattern[] = [];
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

  // Group reflections by week
  const weeklyData: Map<string, {
    reflections: ValueReflection[];
    gaugeAvg: Record<GaugeKey, number>;
  }> = new Map();

  for (const reflection of reflections) {
    const weekKey = reflection.weekStartDate;
    if (!weeklyData.has(weekKey)) {
      // Calculate gauge averages for that week
      const weekStart = new Date(reflection.weekStartDate).getTime();
      const weekEnd = new Date(reflection.weekEndDate).getTime();
      const weekSnapshots = gaugeHistory.filter(s => 
        s.timestamp >= weekStart && s.timestamp <= weekEnd
      );

      const avgGauges = {} as Record<GaugeKey, number>;
      for (const gauge of gauges) {
        const values = weekSnapshots.map(s => s[gauge]).filter(v => v >= 0);
        avgGauges[gauge] = values.length > 0 
          ? values.reduce((a, b) => a + b, 0) / values.length 
          : -1;
      }

      weeklyData.set(weekKey, {
        reflections: [],
        gaugeAvg: avgGauges,
      });
    }
    weeklyData.get(weekKey)!.reflections.push(reflection);
  }

  // Look for correlations between gauge averages and alignment responses
  for (const gauge of gauges) {
    // Check if low gauge correlates with "not_really" responses
    let lowGaugeDriftCount = 0;
    let lowGaugeWeeks = 0;
    let highGaugeAlignedCount = 0;
    let highGaugeWeeks = 0;

    for (const [, data] of weeklyData) {
      const gaugeAvg = data.gaugeAvg[gauge];
      if (gaugeAvg < 0) continue;

      const hadDrift = data.reflections.some(r => r.response === 'not_really');
      const wasAligned = data.reflections.some(r => r.response === 'yes');

      if (gaugeAvg < 40) {
        lowGaugeWeeks++;
        if (hadDrift) lowGaugeDriftCount++;
      } else if (gaugeAvg >= 60) {
        highGaugeWeeks++;
        if (wasAligned) highGaugeAlignedCount++;
      }
    }

    // Pattern: Low gauge correlates with drift
    if (lowGaugeWeeks >= 3 && lowGaugeDriftCount / lowGaugeWeeks >= 0.6) {
      patterns.push({
        id: `${gauge}-low-drift`,
        type: 'correlation',
        gauge,
        condition: 'low',
        threshold: 40,
        alignmentImpact: 'negative',
        frequency: `${lowGaugeDriftCount} out of ${lowGaugeWeeks} weeks`,
        narrative: `When your ${GAUGE_LABELS[gauge]} runs below 40, value-consistent actions tend to drop.`,
        dataPoints: weeklyData.size,
      });
    }

    // Pattern: High gauge correlates with alignment
    if (highGaugeWeeks >= 3 && highGaugeAlignedCount / highGaugeWeeks >= 0.6) {
      patterns.push({
        id: `${gauge}-high-aligned`,
        type: 'correlation',
        gauge,
        condition: 'high',
        threshold: 60,
        alignmentImpact: 'positive',
        frequency: `${highGaugeAlignedCount} out of ${highGaugeWeeks} weeks`,
        narrative: `When your ${GAUGE_LABELS[gauge]} is above 60, you tend to live more aligned with your values.`,
        dataPoints: weeklyData.size,
      });
    }
  }

  return patterns;
}

/**
 * Generate human-readable insights from drift patterns
 */
export function generateDriftInsight(patterns: DriftPattern[]): DriftInsight[] {
  return patterns.map(pattern => {
    const confidence: DriftInsight['confidence'] = 
      pattern.dataPoints >= 8 ? 'established' :
      pattern.dataPoints >= 5 ? 'emerging' : 'early';

    let suggestion: string | undefined;
    
    if (pattern.alignmentImpact === 'negative') {
      switch (pattern.gauge) {
        case 'body':
          suggestion = 'Your physical foundation affects everything. Sleep, food, movement — small investments here ripple outward.';
          break;
        case 'state':
          suggestion = 'When your nervous system is dysregulated, it\'s harder to act from your values. Regulation first.';
          break;
        case 'connection':
          suggestion = 'Isolation makes it harder to stay aligned. Even one meaningful connection can shift this.';
          break;
        case 'emotion':
          suggestion = 'Unprocessed emotions can cloud your compass. Make space to feel what\'s there.';
          break;
        case 'direction':
          suggestion = 'Without a sense of where you\'re going, it\'s hard to know if your actions align. Reconnect with your "why."';
          break;
        case 'alignment':
          suggestion = 'This is a feedback loop: feeling misaligned makes it harder to act aligned. Start with one small value-consistent choice.';
          break;
      }
    }

    return { pattern, confidence, suggestion };
  });
}

/**
 * Get a gentle, curious response based on alignment
 */
export function getAlignmentResponse(response: AlignmentResponse): string {
  switch (response) {
    case 'yes':
      return 'That\'s something to acknowledge. Living your values isn\'t always easy.';
    case 'mostly':
      return 'Progress, not perfection. Noticing the gap is half the work.';
    case 'not_really':
      return 'No judgment. Just noticing. What got in the way?';
  }
}

/**
 * Default values to suggest if user hasn't set any
 */
export const SUGGESTED_VALUES = [
  { value: 'Honesty', emoji: '💎' },
  { value: 'Kindness', emoji: '💝' },
  { value: 'Growth', emoji: '🌱' },
  { value: 'Connection', emoji: '🤝' },
  { value: 'Health', emoji: '💪' },
  { value: 'Creativity', emoji: '🎨' },
  { value: 'Courage', emoji: '🦁' },
  { value: 'Presence', emoji: '🧘' },
  { value: 'Authenticity', emoji: '✨' },
  { value: 'Compassion', emoji: '🫂' },
  { value: 'Balance', emoji: '⚖️' },
  { value: 'Integrity', emoji: '🎯' },
];

/**
 * Mark reflection as complete for this week
 */
export async function markReflectionComplete(): Promise<void> {
  await AsyncStorage.setItem(LAST_REFLECTION_KEY, new Date().toISOString());
}
