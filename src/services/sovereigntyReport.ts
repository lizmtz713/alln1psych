/**
 * Monthly Sovereignty Report — "The Season Review"
 * 
 * Philosophy:
 * - Power lies in trends, not snapshots (Political Science lens)
 * - Identify external triggers: news cycles, calendar events, people
 * - Lead/Lag indicators: which gauges predict others
 * - Detach identity from stressors — give the "Pilot's perspective"
 * - Frame as "System Maintenance," never "Mental Health Diagnosis"
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';
import { type GaugeKey } from '../stores/cockpitStore';

const REPORT_CACHE_KEY = 'sovereignty_report_cache';

export interface LeadLagRelationship {
  leadGauge: GaugeKey;
  lagGauge: GaugeKey;
  lagHours: number; // How many hours later the lag gauge follows
  correlation: number; // -1 to 1
  confidence: 'emerging' | 'established';
  narrative: string;
}

export interface ExternalTrigger {
  type: 'weekly_pattern' | 'time_of_day' | 'recurring_event';
  description: string;
  affectedGauges: GaugeKey[];
  averageImpact: number; // positive or negative
  frequency: string; // "every Monday", "Sunday evenings", etc.
  suggestion: string;
}

export interface GaugeTrend {
  gauge: GaugeKey;
  monthStart: number;
  monthEnd: number;
  change: number;
  direction: 'improving' | 'stable' | 'declining';
  volatility: 'stable' | 'moderate' | 'volatile';
  bestDay: string;
  worstDay: string;
}

export interface SovereigntyReport {
  generatedAt: number;
  periodStart: number;
  periodEnd: number;
  dataPoints: number;
  
  // Overall health
  systemHealth: 'thriving' | 'stable' | 'strained' | 'recovering';
  systemHealthNarrative: string;
  
  // Individual gauge trends
  gaugeTrends: GaugeTrend[];
  
  // Lead/Lag relationships
  leadLagRelationships: LeadLagRelationship[];
  leadingIndicators: GaugeKey[]; // Gauges that predict others
  
  // External triggers
  externalTriggers: ExternalTrigger[];
  
  // Key insights
  topInsights: string[];
  
  // Maintenance recommendations
  maintenancePlan: {
    priority: 'high' | 'medium' | 'low';
    focus: GaugeKey;
    action: string;
  }[];
  
  // Sovereignty score (0-100)
  sovereigntyScore: number;
  sovereigntyFactors: {
    selfAwareness: number;
    consistency: number;
    resilience: number;
    growth: number;
  };
}

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ============ Lead/Lag Analysis ============

/**
 * Detect lead/lag relationships between gauges
 * "Does a drop in Body predict a drop in Alignment 48 hours later?"
 */
function detectLeadLagRelationships(history: GaugeSnapshot[]): LeadLagRelationship[] {
  if (history.length < 14) return []; // Need at least 2 weeks of data
  
  const relationships: LeadLagRelationship[] = [];
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  
  // Check each pair of gauges
  for (const lead of gauges) {
    for (const lag of gauges) {
      if (lead === lag) continue;
      
      // Check various lag times: 12h, 24h, 48h
      for (const lagHours of [12, 24, 48]) {
        const correlation = calculateLagCorrelation(history, lead, lag, lagHours);
        
        if (Math.abs(correlation) > 0.4) {
          const isEstablished = history.length > 30 && Math.abs(correlation) > 0.5;
          
          relationships.push({
            leadGauge: lead,
            lagGauge: lag,
            lagHours,
            correlation,
            confidence: isEstablished ? 'established' : 'emerging',
            narrative: generateLeadLagNarrative(lead, lag, lagHours, correlation),
          });
        }
      }
    }
  }
  
  // Sort by correlation strength and dedupe
  relationships.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  
  // Keep only strongest relationship per gauge pair
  const seen = new Set<string>();
  return relationships.filter(r => {
    const key = `${r.leadGauge}-${r.lagGauge}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function calculateLagCorrelation(
  history: GaugeSnapshot[],
  lead: GaugeKey,
  lag: GaugeKey,
  lagHours: number
): number {
  const lagMs = lagHours * 60 * 60 * 1000;
  const pairs: { lead: number; lag: number }[] = [];
  
  for (let i = 0; i < history.length; i++) {
    const leadSnapshot = history[i];
    // Find snapshot closest to lagHours later
    const targetTime = leadSnapshot.timestamp + lagMs;
    const lagSnapshot = history.find(s => 
      Math.abs(s.timestamp - targetTime) < (6 * 60 * 60 * 1000) // Within 6 hours
    );
    
    if (lagSnapshot && leadSnapshot[lead] !== undefined && lagSnapshot[lag] !== undefined) {
      pairs.push({
        lead: leadSnapshot[lead]!,
        lag: lagSnapshot[lag]!,
      });
    }
  }
  
  if (pairs.length < 5) return 0;
  
  // Calculate Pearson correlation
  const n = pairs.length;
  const sumLead = pairs.reduce((s, p) => s + p.lead, 0);
  const sumLag = pairs.reduce((s, p) => s + p.lag, 0);
  const sumLeadLag = pairs.reduce((s, p) => s + p.lead * p.lag, 0);
  const sumLeadSq = pairs.reduce((s, p) => s + p.lead * p.lead, 0);
  const sumLagSq = pairs.reduce((s, p) => s + p.lag * p.lag, 0);
  
  const numerator = (n * sumLeadLag) - (sumLead * sumLag);
  const denominator = Math.sqrt(
    ((n * sumLeadSq) - (sumLead * sumLead)) *
    ((n * sumLagSq) - (sumLag * sumLag))
  );
  
  return denominator === 0 ? 0 : numerator / denominator;
}

function generateLeadLagNarrative(
  lead: GaugeKey,
  lag: GaugeKey,
  lagHours: number,
  correlation: number
): string {
  const leadLabel = GAUGE_LABELS[lead];
  const lagLabel = GAUGE_LABELS[lag];
  const timeLabel = lagHours < 24 ? `${lagHours} hours` : `${lagHours / 24} day${lagHours > 24 ? 's' : ''}`;
  
  if (correlation > 0) {
    return `When your ${leadLabel} drops, your ${lagLabel} tends to follow about ${timeLabel} later. Consider ${leadLabel} an early warning system.`;
  } else {
    return `Interestingly, when your ${leadLabel} drops, your ${lagLabel} often rises ${timeLabel} later — possibly a compensation pattern.`;
  }
}

// ============ External Trigger Detection ============

function detectExternalTriggers(history: GaugeSnapshot[]): ExternalTrigger[] {
  const triggers: ExternalTrigger[] = [];
  
  // Analyze day-of-week patterns
  const dayPatterns = analyzeDayOfWeekPatterns(history);
  triggers.push(...dayPatterns);
  
  // Analyze time-of-day patterns
  const timePatterns = analyzeTimeOfDayPatterns(history);
  triggers.push(...timePatterns);
  
  return triggers.slice(0, 5);
}

function analyzeDayOfWeekPatterns(history: GaugeSnapshot[]): ExternalTrigger[] {
  const triggers: ExternalTrigger[] = [];
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  
  // Group by day of week
  const byDay: Record<number, GaugeSnapshot[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const snapshot of history) {
    const day = new Date(snapshot.timestamp).getDay();
    byDay[day].push(snapshot);
  }
  
  for (const gauge of gauges) {
    // Calculate average for each day
    const dayAverages: Record<number, number> = {};
    for (let day = 0; day < 7; day++) {
      const snapshots = byDay[day];
      if (snapshots.length >= 2) {
        const values = snapshots.map(s => s[gauge]).filter((v): v is number => v !== undefined);
        dayAverages[day] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    
    // Find significant dips
    const overallAvg = Object.values(dayAverages).reduce((a, b) => a + b, 0) / Object.values(dayAverages).length;
    
    for (let day = 0; day < 7; day++) {
      if (dayAverages[day] !== undefined) {
        const diff = dayAverages[day] - overallAvg;
        if (Math.abs(diff) > 10) {
          triggers.push({
            type: 'weekly_pattern",
            description: diff < 0 
              ? `${GAUGE_LABELS[gauge]} tends to dip on ${DAY_NAMES[day]}s`
              : `${GAUGE_LABELS[gauge]} tends to peak on ${DAY_NAMES[day]}s`,
            affectedGauges: [gauge],
            averageImpact: Math.round(diff),
            frequency: `Every ${DAY_NAMES[day]}`,
            suggestion: diff < 0
              ? `Consider lighter expectations or extra self-care on ${DAY_NAMES[day]}s.`
              : `${DAY_NAMES[day]}s seem to work well for you. Notice what's different.`,
          });
        }
      }
    }
  }
  
  return triggers;
}

function analyzeTimeOfDayPatterns(history: GaugeSnapshot[]): ExternalTrigger[] {
  const triggers: ExternalTrigger[] = [];
  const gauges: GaugeKey[] = ["state', 'emotion']; // Most time-sensitive gauges
  
  // Group by time of day: morning (5-12), afternoon (12-17), evening (17-21), night (21-5)
  const timeSlots = {
    morning: { start: 5, end: 12, snapshots: [] as GaugeSnapshot[] },
    afternoon: { start: 12, end: 17, snapshots: [] as GaugeSnapshot[] },
    evening: { start: 17, end: 21, snapshots: [] as GaugeSnapshot[] },
    night: { start: 21, end: 5, snapshots: [] as GaugeSnapshot[] },
  };
  
  for (const snapshot of history) {
    const hour = new Date(snapshot.timestamp).getHours();
    if (hour >= 5 && hour < 12) timeSlots.morning.snapshots.push(snapshot);
    else if (hour >= 12 && hour < 17) timeSlots.afternoon.snapshots.push(snapshot);
    else if (hour >= 17 && hour < 21) timeSlots.evening.snapshots.push(snapshot);
    else timeSlots.night.snapshots.push(snapshot);
  }
  
  for (const gauge of gauges) {
    const slotAverages: Record<string, number> = {};
    
    for (const [slot, data] of Object.entries(timeSlots)) {
      if (data.snapshots.length >= 3) {
        const values = data.snapshots.map(s => s[gauge]).filter((v): v is number => v !== undefined);
        if (values.length > 0) {
          slotAverages[slot] = values.reduce((a, b) => a + b, 0) / values.length;
        }
      }
    }
    
    const slots = Object.keys(slotAverages);
    if (slots.length >= 2) {
      const overallAvg = Object.values(slotAverages).reduce((a, b) => a + b, 0) / slots.length;
      
      for (const slot of slots) {
        const diff = slotAverages[slot] - overallAvg;
        if (Math.abs(diff) > 8) {
          triggers.push({
            type: 'time_of_day',
            description: diff < 0
              ? `Your ${GAUGE_LABELS[gauge]} tends to dip in the ${slot}`
              : `Your ${GAUGE_LABELS[gauge]} peaks in the ${slot}`,
            affectedGauges: [gauge],
            averageImpact: Math.round(diff),
            frequency: `Most ${slot}s`,
            suggestion: diff < 0
              ? `The ${slot} seems harder. Build in regulation breaks or lighter tasks.`
              : `The ${slot} is your strong time. Schedule important things here.`,
          });
        }
      }
    }
  }
  
  return triggers;
}

// ============ Gauge Trends ============

function calculateGaugeTrends(history: GaugeSnapshot[]): GaugeTrend[] {
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  const trends: GaugeTrend[] = [];
  
  if (history.length < 7) return [];
  
  const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const firstWeek = sortedHistory.slice(0, Math.min(7, Math.floor(sortedHistory.length / 2)));
  const lastWeek = sortedHistory.slice(-Math.min(7, Math.floor(sortedHistory.length / 2)));
  
  for (const gauge of gauges) {
    const firstValues = firstWeek.map(s => s[gauge]).filter((v): v is number => v !== undefined);
    const lastValues = lastWeek.map(s => s[gauge]).filter((v): v is number => v !== undefined);
    
    if (firstValues.length === 0 || lastValues.length === 0) continue;
    
    const monthStart = Math.round(firstValues.reduce((a, b) => a + b, 0) / firstValues.length);
    const monthEnd = Math.round(lastValues.reduce((a, b) => a + b, 0) / lastValues.length);
    const change = monthEnd - monthStart;
    
    // Calculate volatility (standard deviation)
    const allValues = sortedHistory.map(s => s[gauge]).filter((v): v is number => v !== undefined);
    const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    const variance = allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Find best and worst days
    const byDay = new Map<string, number[]>();
    for (const s of sortedHistory) {
      const day = DAY_NAMES[new Date(s.timestamp).getDay()];
      const val = s[gauge];
      if (val !== undefined) {
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day)!.push(val);
      }
    }
    
    let bestDay = 'N/A';
    let worstDay = 'N/A';
    let bestAvg = -Infinity;
    let worstAvg = Infinity;
    
    for (const [day, values] of byDay) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      if (avg > bestAvg) { bestAvg = avg; bestDay = day; }
      if (avg < worstAvg) { worstAvg = avg; worstDay = day; }
    }
    
    trends.push({
      gauge,
      monthStart,
      monthEnd,
      change,
      direction: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      volatility: stdDev > 20 ? 'volatile' : stdDev > 10 ? 'moderate' : 'stable',
      bestDay,
      worstDay,
    });
  }
  
  return trends;
}

// ============ Sovereignty Score ============

function calculateSovereigntyScore(
  history: GaugeSnapshot[],
  trends: GaugeTrend[],
  triggers: ExternalTrigger[]
): {
  score: number;
  factors: { selfAwareness: number; consistency: number; resilience: number; growth: number };
} {
  // Self-awareness: How often do they check in?
  const checkInFrequency = history.length / 30; // Per day average
  const selfAwareness = Math.min(100, Math.round(checkInFrequency * 50));
  
  // Consistency: Low volatility across gauges
  const avgVolatility = trends.reduce((sum, t) => {
    const vol = t.volatility === 'stable' ? 100 : t.volatility === 'moderate' ? 60 : 30;
    return sum + vol;
  }, 0) / (trends.length || 1);
  const consistency = Math.round(avgVolatility);
  
  // Resilience: Recovery from dips
  const resilience = 60; // Placeholder — would need more sophisticated analysis
  
  // Growth: Positive trends
  const improving = trends.filter(t => t.direction === 'improving').length;
  const declining = trends.filter(t => t.direction === 'declining').length;
  const growth = Math.round(50 + ((improving - declining) / (trends.length || 1)) * 50);
  
  const score = Math.round((selfAwareness + consistency + resilience + growth) / 4);
  
  return { score, factors: { selfAwareness, consistency, resilience, growth } };
}

// ============ Main Report Generation ============

/**
 * Generate the Monthly Sovereignty Report
 */
export async function generateSovereigntyReport(): Promise<SovereigntyReport | null> {
  const history = await getGaugeHistory();
  
  if (history.length < 7) {
    return null; // Need at least a week of data
  }
  
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const recentHistory = history.filter(h => h.timestamp > thirtyDaysAgo);
  
  if (recentHistory.length < 5) {
    return null;
  }
  
  // Calculate all components
  const trends = calculateGaugeTrends(recentHistory);
  const leadLag = detectLeadLagRelationships(recentHistory);
  const triggers = detectExternalTriggers(recentHistory);
  const sovereignty = calculateSovereigntyScore(recentHistory, trends, triggers);
  
  // Determine system health
  const avgGauge = trends.reduce((sum, t) => sum + t.monthEnd, 0) / (trends.length || 1);
  const decliningCount = trends.filter(t => t.direction === 'declining').length;
  
  let systemHealth: 'thriving' | 'stable' | 'strained' | 'recovering';
  let systemHealthNarrative: string;
  
  if (avgGauge > 70 && decliningCount === 0) {
    systemHealth = 'thriving';
    systemHealthNarrative = 'Your system is running well. All gauges are stable or improving.';
  } else if (avgGauge > 50 && decliningCount <= 1) {
    systemHealth = 'stable';
    systemHealthNarrative = 'Your system is generally stable with minor fluctuations.';
  } else if (decliningCount >= 3 || avgGauge < 40) {
    systemHealth = 'strained';
    systemHealthNarrative = 'Your system is under strain. Focus on foundational gauges (Body, State) first.';
  } else {
    systemHealth = 'recovering';
    systemHealthNarrative = 'Your system shows signs of recovery. Keep maintaining current practices.';
  }
  
  // Generate top insights
  const topInsights: string[] = [];
  
  // Add lead/lag insight
  if (leadLag.length > 0) {
    topInsights.push(`📊 Leading indicator: ${leadLag[0].narrative}`);
  }
  
  // Add trigger insight
  if (triggers.length > 0) {
    topInsights.push(`⚡ Pattern detected: ${triggers[0].description}`);
  }
  
  // Add trend insight
  const biggestChange = trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
  if (biggestChange && Math.abs(biggestChange.change) > 5) {
    const direction = biggestChange.change > 0 ? 'up' : 'down';
    topInsights.push(`📈 Biggest shift: ${GAUGE_LABELS[biggestChange.gauge]} moved ${direction} ${Math.abs(biggestChange.change)} points`);
  }
  
  // Generate maintenance plan
  const maintenancePlan: { priority: 'high' | 'medium' | 'low'; focus: GaugeKey; action: string }[] = [];
  
  const declining = trends.filter(t => t.direction === 'declining').sort((a, b) => a.monthEnd - b.monthEnd);
  for (const t of declining.slice(0, 2)) {
    maintenancePlan.push({
      priority: t.monthEnd < 40 ? 'high' : 'medium',
      focus: t.gauge,
      action: getMaintenanceAction(t.gauge, t.monthEnd),
    });
  }
  
  if (maintenancePlan.length === 0) {
    const lowest = trends.sort((a, b) => a.monthEnd - b.monthEnd)[0];
    if (lowest) {
      maintenancePlan.push({
        priority: 'low',
        focus: lowest.gauge,
        action: `Maintain current ${GAUGE_LABELS[lowest.gauge]} practices.`,
      });
    }
  }
  
  return {
    generatedAt: now,
    periodStart: thirtyDaysAgo,
    periodEnd: now,
    dataPoints: recentHistory.length,
    systemHealth,
    systemHealthNarrative,
    gaugeTrends: trends,
    leadLagRelationships: leadLag,
    leadingIndicators: leadLag.map(l => l.leadGauge).filter((v, i, a) => a.indexOf(v) === i),
    externalTriggers: triggers,
    topInsights,
    maintenancePlan,
    sovereigntyScore: sovereignty.score,
    sovereigntyFactors: sovereignty.factors,
  };
}

function getMaintenanceAction(gauge: GaugeKey, value: number): string {
  const actions: Record<GaugeKey, string> = {
    body: value < 40 
      ? 'Prioritize sleep and physical recovery this week.'
      : 'Maintain current body care routines.',
    state: value < 40
      ? 'Your nervous system needs attention. Try daily regulation practices.'
      : 'Continue practices that keep your state regulated.',
    emotion: value < 40
      ? 'Process what you\'re feeling. Replay or Journal may help.'
      : 'Keep checking in with your emotional landscape.',
    connection: value < 40
      ? 'Reach out to your Circle. You don\'t have to do this alone.'
      : 'Nurture your key relationships.',
    direction: value < 40
      ? 'Reconnect with what matters. Even small steps count.'
      : 'Stay connected to your sense of purpose.',
    alignment: value < 40
      ? 'Check where your actions don\'t match your values. Small realignments help.'
      : 'Your actions and values are aligned. Keep it up.',
  };
  
  return actions[gauge];
}

/**
 * Get cached report or generate new one if stale
 */
export async function getSovereigntyReport(forceRefresh = false): Promise<SovereigntyReport | null> {
  if (!forceRefresh) {
    const cached = await AsyncStorage.getItem(REPORT_CACHE_KEY);
    if (cached) {
      const report = JSON.parse(cached) as SovereigntyReport;
      // Cache for 24 hours
      if (Date.now() - report.generatedAt < 24 * 60 * 60 * 1000) {
        return report;
      }
    }
  }
  
  const report = await generateSovereigntyReport();
  if (report) {
    await AsyncStorage.setItem(REPORT_CACHE_KEY, JSON.stringify(report));
  }
  return report;
}
