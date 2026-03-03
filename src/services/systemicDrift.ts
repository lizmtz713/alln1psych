/**
 * Systemic Drift Detection
 * 
 * Analyzes gauge patterns over time to identify:
 * - Recurring drops (e.g., "Alignment drops every Monday")
 * - Post-event patterns (e.g., "State spikes after family calls")
 * - Gradual drift (e.g., "Direction has been declining for 2 weeks")
 * 
 * Based on longitudinal psychology research and pattern recognition.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type GaugeKey } from '../stores/cockpitStore';

const DRIFT_HISTORY_KEY = 'systemic_drift_history';
const DRIFT_INSIGHTS_KEY = 'systemic_drift_insights';

export interface GaugeEvent {
  timestamp: number;
  gauge: GaugeKey;
  value: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number;
  context?: string; // Optional: "after_meeting", "morning", etc.
}

export interface DriftPattern {
  type: 'weekly_drop' | 'time_of_day' | 'gradual_decline' | 'volatility' | 'correlation';
  gauge: GaugeKey;
  description: string;
  confidence: number; // 0-1
  insight: string;
  recommendation: string;
  /** Short pattern label for summaries (e.g. "Monday drops") */
  pattern: string;
  /** Number of occurrences observed */
  frequency: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const GAUGE_NAMES: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

/**
 * Record a gauge check-in for pattern analysis
 */
export async function recordGaugeEvent(gauge: GaugeKey, value: number, context?: string): Promise<void> {
  const now = new Date();
  const event: GaugeEvent = {
    timestamp: Date.now(),
    gauge,
    value,
    dayOfWeek: now.getDay(),
    hour: now.getHours(),
    context,
  };

  try {
    const existing = await AsyncStorage.getItem(DRIFT_HISTORY_KEY);
    const history: GaugeEvent[] = existing ? JSON.parse(existing) : [];
    
    // Keep last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filtered = history.filter(e => e.timestamp > thirtyDaysAgo);
    filtered.push(event);
    
    await AsyncStorage.setItem(DRIFT_HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('[SystemicDrift] Failed to record event:', e);
  }
}

/**
 * Get gauge history
 */
export async function getGaugeHistory(): Promise<GaugeEvent[]> {
  try {
    const data = await AsyncStorage.getItem(DRIFT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Analyze for weekly patterns (e.g., "Mondays are hard")
 */
function analyzeWeeklyPatterns(history: GaugeEvent[]): DriftPattern[] {
  const patterns: DriftPattern[] = [];
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

  for (const gauge of gauges) {
    const gaugeEvents = history.filter(e => e.gauge === gauge);
    if (gaugeEvents.length < 7) continue;

    // Group by day of week
    const byDay: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    gaugeEvents.forEach(e => byDay[e.dayOfWeek].push(e.value));

    // Calculate averages per day
    const avgByDay = Object.entries(byDay).map(([day, values]) => ({
      day: parseInt(day),
      avg: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : -1,
      count: values.length,
    })).filter(d => d.count >= 2);

    if (avgByDay.length < 3) continue;

    // Find significantly low days (1+ point below average)
    const overallAvg = avgByDay.reduce((sum, d) => sum + d.avg, 0) / avgByDay.length;
    const lowDays = avgByDay.filter(d => d.avg < overallAvg - 1);

    for (const lowDay of lowDays) {
      const dayName = DAY_NAMES[lowDay.day];
      const gaugeName = GAUGE_NAMES[gauge];
      const diff = (overallAvg - lowDay.avg).toFixed(1);
      
      patterns.push({
        type: 'weekly_drop',
        gauge,
        description: `${gaugeName} tends to drop on ${dayName}s`,
        confidence: Math.min(0.9, lowDay.count / 4), // More data = more confidence
        insight: `Your ${gaugeName} gauge averages ${diff} points lower on ${dayName}s compared to other days.`,
        recommendation: `Consider what happens on ${dayName}s that might affect your ${gaugeName.toLowerCase()}. Is there a recurring meeting, obligation, or pattern?`,
        pattern: `${dayName} drops`,
        frequency: lowDay.count,
      });
    }
  }

  return patterns;
}

/**
 * Analyze for time-of-day patterns
 */
function analyzeTimePatterns(history: GaugeEvent[]): DriftPattern[] {
  const patterns: DriftPattern[] = [];
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

  for (const gauge of gauges) {
    const gaugeEvents = history.filter(e => e.gauge === gauge);
    if (gaugeEvents.length < 10) continue;

    // Group by time period
    const morning = gaugeEvents.filter(e => e.hour >= 5 && e.hour < 12);
    const afternoon = gaugeEvents.filter(e => e.hour >= 12 && e.hour < 17);
    const evening = gaugeEvents.filter(e => e.hour >= 17 && e.hour < 22);

    const periods = [
      { name: 'mornings', events: morning },
      { name: 'afternoons', events: afternoon },
      { name: 'evenings', events: evening },
    ].filter(p => p.events.length >= 3);

    if (periods.length < 2) continue;

    const avgByPeriod = periods.map(p => ({
      name: p.name,
      avg: p.events.reduce((sum, e) => sum + e.value, 0) / p.events.length,
      count: p.events.length,
    }));

    const overallAvg = avgByPeriod.reduce((sum, p) => sum + p.avg, 0) / avgByPeriod.length;
    const lowPeriods = avgByPeriod.filter(p => p.avg < overallAvg - 0.8);

    for (const lowPeriod of lowPeriods) {
      const gaugeName = GAUGE_NAMES[gauge];
      
      patterns.push({
        type: 'time_of_day',
        gauge,
        description: `${gaugeName} dips in the ${lowPeriod.name}`,
        confidence: Math.min(0.85, lowPeriod.count / 5),
        insight: `Your ${gaugeName} gauge tends to be lower in the ${lowPeriod.name}.`,
        recommendation: gauge === 'body'
          ? `This might be related to energy cycles. Check your sleep, meals, and caffeine timing.`
          : `Notice what typically happens in the ${lowPeriod.name} that might affect your ${gaugeName.toLowerCase()}.`,
        pattern: `${lowPeriod.name} dip`,
        frequency: lowPeriod.count,
      });
    }
  }

  return patterns;
}

/**
 * Analyze for gradual drift over time
 */
function analyzeGradualDrift(history: GaugeEvent[]): DriftPattern[] {
  const patterns: DriftPattern[] = [];
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  for (const gauge of gauges) {
    const gaugeEvents = history.filter(e => e.gauge === gauge);
    
    const olderEvents = gaugeEvents.filter(e => e.timestamp < oneWeekAgo && e.timestamp > twoWeeksAgo);
    const recentEvents = gaugeEvents.filter(e => e.timestamp >= oneWeekAgo);

    if (olderEvents.length < 3 || recentEvents.length < 3) continue;

    const olderAvg = olderEvents.reduce((sum, e) => sum + e.value, 0) / olderEvents.length;
    const recentAvg = recentEvents.reduce((sum, e) => sum + e.value, 0) / recentEvents.length;
    const drift = recentAvg - olderAvg;

    // Significant drift = 1+ point change
    if (Math.abs(drift) >= 1) {
      const gaugeName = GAUGE_NAMES[gauge];
      const direction = drift < 0 ? 'declining' : 'improving';
      const driftAbs = Math.abs(drift).toFixed(1);

      patterns.push({
        type: 'gradual_decline',
        gauge,
        description: `${gaugeName} has been ${direction} over 2 weeks`,
        confidence: 0.75,
        insight: `Your ${gaugeName} gauge has shifted ${driftAbs} points ${drift < 0 ? 'down' : 'up'} compared to two weeks ago.`,
        recommendation: drift < 0
          ? `This gradual ${direction} suggests something systemic. What's changed in the past two weeks?`
          : `Nice trend! What's been working for your ${gaugeName.toLowerCase()} lately?`,
        pattern: `2-week ${direction}`,
        frequency: recentEvents.length,
      });
    }
  }

  return patterns;
}

/**
 * Analyze for gauge correlations (when one drops, another follows)
 */
function analyzeCorrelations(history: GaugeEvent[]): DriftPattern[] {
  const patterns: DriftPattern[] = [];
  
  // Known correlations from psychology research
  const correlationPairs: Array<{ a: GaugeKey; b: GaugeKey; insight: string }> = [
    { a: 'body', b: 'state', insight: 'Low Body often triggers State activation (running on fumes)' },
    { a: 'body', b: 'emotion', insight: 'Physical depletion amplifies emotional reactivity' },
    { a: 'connection', b: 'direction', insight: 'Isolation can make purpose feel unclear' },
    { a: 'alignment', b: 'state', insight: 'Living against your values creates chronic stress' },
  ];

  for (const pair of correlationPairs) {
    const aEvents = history.filter(e => e.gauge === pair.a);
    const bEvents = history.filter(e => e.gauge === pair.b);

    if (aEvents.length < 5 || bEvents.length < 5) continue;

    // Check if low A correlates with low B (within same day)
    let bothLowCount = 0;
    let aLowCount = 0;

    for (const aEvent of aEvents) {
      if (aEvent.value <= 2) {
        aLowCount++;
        const sameDay = bEvents.find(b => 
          Math.abs(b.timestamp - aEvent.timestamp) < 24 * 60 * 60 * 1000 &&
          b.value <= 2
        );
        if (sameDay) bothLowCount++;
      }
    }

    if (aLowCount >= 3 && bothLowCount / aLowCount >= 0.6) {
      patterns.push({
        type: 'correlation',
        gauge: pair.b,
        description: `${GAUGE_NAMES[pair.b]} drops when ${GAUGE_NAMES[pair.a]} is low`,
        confidence: bothLowCount / aLowCount,
        insight: pair.insight,
        recommendation: `When your ${GAUGE_NAMES[pair.a]} drops, prioritize it first — it's likely affecting your ${GAUGE_NAMES[pair.b]} too.`,
        pattern: `${GAUGE_NAMES[pair.a]} → ${GAUGE_NAMES[pair.b]}`,
        frequency: bothLowCount,
      });
    }
  }

  return patterns;
}

/**
 * Run full drift analysis and return patterns
 */
export async function analyzeSystemicDrift(): Promise<DriftPattern[]> {
  const history = await getGaugeHistory();
  
  if (history.length < 10) {
    return []; // Need more data
  }

  const allPatterns: DriftPattern[] = [
    ...analyzeWeeklyPatterns(history),
    ...analyzeTimePatterns(history),
    ...analyzeGradualDrift(history),
    ...analyzeCorrelations(history),
  ];

  // Sort by confidence and limit
  const sorted = allPatterns
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Top 5 patterns

  // Cache insights
  try {
    await AsyncStorage.setItem(DRIFT_INSIGHTS_KEY, JSON.stringify(sorted));
  } catch {}

  return sorted;
}

/**
 * Get cached drift insights
 */
export async function getCachedDriftInsights(): Promise<DriftPattern[]> {
  try {
    const data = await AsyncStorage.getItem(DRIFT_INSIGHTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Format a pattern for display in AI context
 */
export function formatPatternForAI(patterns: DriftPattern[]): string {
  if (patterns.length === 0) return '';
  
  let context = '\n\nSYSTEMIC DRIFT PATTERNS (patterns detected in this user\'s gauge history):\n';
  
  for (const p of patterns) {
    context += `• ${p.description}: ${p.insight}\n`;
  }
  
  context += '\nUse these patterns to provide more personalized insights. Reference them when relevant.\n';
  
  return context;
}

// Module-level cache for sync access
let cachedPatterns: DriftPattern[] = [];

/**
 * Get patterns synchronously (from memory cache)
 */
export function getCachedPatternSync(): DriftPattern[] {
  return cachedPatterns;
}

/**
 * Refresh the cache (call on app launch and after check-ins)
 */
export async function refreshDriftCache(): Promise<void> {
  cachedPatterns = await analyzeSystemicDrift();
}
