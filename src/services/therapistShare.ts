/**
 * Therapist Share Service
 * 
 * Generate professional reports for sharing with therapists,
 * psychiatrists, and other healthcare providers.
 */

import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { useUserStore } from '../stores/userStore';
import { useInsightsStore } from '../stores/insightsStore';
import { useCycleStore } from '../stores/cycleStore';
import { useCircleStore } from '../stores/circleStore';
import { getGaugeHistory } from './crisisPipeline';
import { getCachedPatternSync } from './systemicDrift';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format, subDays, differenceInDays } from 'date-fns';

// ============ Types ============

export interface ReportConfig {
  // Time range
  startDate: Date;
  endDate: Date;
  
  // Data to include
  includeGauges: boolean;
  includePatterns: boolean;
  includeCrisisEvents: boolean;
  includeCircleContext: boolean;
  includeCycleData: boolean;
  includeJournalSummary: boolean;
  
  // Recipient info
  providerName?: string;
  providerType?: 'therapist' | 'psychiatrist' | 'counselor' | 'other';
  
  // Privacy
  anonymizeNames: boolean;
  patientIdentifier?: string;
}

export interface GaugeSnapshot {
  date: string;
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
  overall: number;
}

export interface TherapistReport {
  // Meta
  generatedAt: string;
  reportPeriod: { start: string; end: string };
  providerName?: string;
  patientIdentifier?: string;
  
  // User context (anonymized if needed)
  userContext: {
    ageGroup: string;
    checkInStreak: number;
    daysActive: number;
    totalCheckIns: number;
  };
  
  // Summary stats
  summary: {
    averageOverall: number;
    lowestGauge: { name: string; average: number };
    highestGauge: { name: string; average: number };
    volatility: 'low' | 'moderate' | 'high';
    trend: 'improving' | 'stable' | 'declining';
  };
  
  // Detailed data
  gaugeHistory: GaugeSnapshot[];
  patterns: string[];
  crisisEvents: Array<{
    date: string;
    type: string;
    gaugesAtTime: Record<string, number>;
  }>;
  
  // Insights
  keyObservations: string[];
  suggestedFocusAreas: string[];
  
  // Cycle data (if included)
  cycleData?: {
    averageCycleLength: number;
    phaseCorrelations: Record<string, Record<string, number>>;
  };
}

// ============ Report Generation ============

export async function generateTherapistReport(
  config: ReportConfig
): Promise<TherapistReport> {
  const userStore = useUserStore.getState();
  const cockpitStore = useCockpitStore.getState();
  const insightsStore = useInsightsStore.getState();
  const cycleStore = useCycleStore.getState();
  
  // Get gauge history
  const history = await getGaugeHistory();
  const patterns = getCachedPatternSync();
  
  // Filter to date range
  const startMs = config.startDate.getTime();
  const endMs = config.endDate.getTime();
  
  const filteredHistory = history.filter(h => 
    h.timestamp >= startMs && h.timestamp <= endMs
  );
  
  // Calculate summary stats
  const gaugeAverages: Record<string, number> = {
    body: 0, state: 0, emotion: 0, connection: 0, direction: 0, alignment: 0
  };
  
  const gaugeKeys: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  
  if (filteredHistory.length > 0) {
    gaugeKeys.forEach(key => {
      const values = filteredHistory.map(h => h[key]).filter(v => v >= 0);
      if (values.length > 0) {
        gaugeAverages[key] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
    });
  }
  
  // Find lowest and highest gauges
  const gaugeAvgEntries = Object.entries(gaugeAverages).filter(([_, v]) => v > 0);
  const sortedGauges = gaugeAvgEntries.sort((a, b) => a[1] - b[1]);
  
  const lowestGauge = sortedGauges[0] || ['body', 50];
  const highestGauge = sortedGauges[sortedGauges.length - 1] || ['body', 50];
  
  // Calculate volatility
  let volatility: 'low' | 'moderate' | 'high' = 'moderate';
  if (filteredHistory.length >= 3) {
    const overallValues = filteredHistory.map(h => {
      const vals = gaugeKeys.map(k => h[k]).filter(v => v >= 0);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 50;
    });
    
    const stdDev = calculateStdDev(overallValues);
    if (stdDev < 10) volatility = 'low';
    else if (stdDev > 25) volatility = 'high';
  }
  
  // Calculate trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (filteredHistory.length >= 5) {
    const recentHalf = filteredHistory.slice(-Math.floor(filteredHistory.length / 2));
    const olderHalf = filteredHistory.slice(0, Math.floor(filteredHistory.length / 2));
    
    const recentAvg = calculateAvgOverall(recentHalf, gaugeKeys);
    const olderAvg = calculateAvgOverall(olderHalf, gaugeKeys);
    
    if (recentAvg - olderAvg > 5) trend = 'improving';
    else if (olderAvg - recentAvg > 5) trend = 'declining';
  }
  
  // Format gauge history
  const gaugeHistory: GaugeSnapshot[] = filteredHistory.map(h => ({
    date: format(new Date(h.timestamp), 'yyyy-MM-dd'),
    body: h.body >= 0 ? h.body : -1,
    state: h.state >= 0 ? h.state : -1,
    emotion: h.emotion >= 0 ? h.emotion : -1,
    connection: h.connection >= 0 ? h.connection : -1,
    direction: h.direction >= 0 ? h.direction : -1,
    alignment: h.alignment >= 0 ? h.alignment : -1,
    overall: calculateOverall(h, gaugeKeys),
  }));
  
  // Extract patterns as strings
  const patternStrings = patterns.map(p => 
    `${p.pattern} (${p.frequency} occurrences, ${Math.round(p.confidence * 100)}% confidence)`
  );
  
  // Generate key observations
  const keyObservations = generateKeyObservations({
    lowestGauge,
    highestGauge,
    volatility,
    trend,
    patterns,
    gaugeAverages,
  });
  
  // Suggested focus areas
  const suggestedFocusAreas = generateFocusAreas({
    lowestGauge,
    patterns,
    gaugeAverages,
  });
  
  // Build report
  const report: TherapistReport = {
    generatedAt: new Date().toISOString(),
    reportPeriod: {
      start: format(config.startDate, 'yyyy-MM-dd'),
      end: format(config.endDate, 'yyyy-MM-dd'),
    },
    providerName: config.providerName,
    patientIdentifier: config.patientIdentifier,
    
    userContext: {
      ageGroup: userStore.ageGroup || 'Not specified',
      checkInStreak: insightsStore.getCheckInStreak(),
      daysActive: differenceInDays(config.endDate, config.startDate),
      totalCheckIns: filteredHistory.length,
    },
    
    summary: {
      averageOverall: Math.round(
        gaugeAvgEntries.reduce((sum, [_, v]) => sum + v, 0) / Math.max(1, gaugeAvgEntries.length)
      ),
      lowestGauge: { name: lowestGauge[0], average: lowestGauge[1] as number },
      highestGauge: { name: highestGauge[0], average: highestGauge[1] as number },
      volatility,
      trend,
    },
    
    gaugeHistory: config.includeGauges ? gaugeHistory : [],
    patterns: config.includePatterns ? patternStrings : [],
    crisisEvents: [], // Would come from crisis detection logs
    
    keyObservations,
    suggestedFocusAreas,
  };
  
  // Add cycle data if enabled
  if (config.includeCycleData && cycleStore.trackingEnabled) {
    report.cycleData = {
      averageCycleLength: cycleStore.cycleLength,
      phaseCorrelations: buildPhaseCorrelations(cycleStore.patterns),
    };
  }
  
  return report;
}

// ============ Export Functions ============

export async function exportReportAsText(report: TherapistReport): Promise<string> {
  let text = '';
  
  text += '═══════════════════════════════════════════════════════════════\n';
  text += '                    INGAUGE WELLNESS REPORT                    \n';
  text += '═══════════════════════════════════════════════════════════════\n\n';
  
  if (report.providerName) {
    text += `Prepared for: ${report.providerName}\n`;
  }
  if (report.patientIdentifier) {
    text += `Patient ID: ${report.patientIdentifier}\n`;
  }
  text += `Report Period: ${report.reportPeriod.start} to ${report.reportPeriod.end}\n`;
  text += `Generated: ${format(new Date(report.generatedAt), 'MMMM d, yyyy h:mm a')}\n\n`;
  
  text += '───────────────────────────────────────────────────────────────\n';
  text += '                         EXECUTIVE SUMMARY                      \n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  
  text += `Overall Wellness Score: ${report.summary.averageOverall}/100\n`;
  text += `Trend: ${report.summary.trend.toUpperCase()}\n`;
  text += `Volatility: ${report.summary.volatility.toUpperCase()}\n`;
  text += `Strongest Area: ${capitalize(report.summary.highestGauge.name)} (avg ${report.summary.highestGauge.average})\n`;
  text += `Area for Growth: ${capitalize(report.summary.lowestGauge.name)} (avg ${report.summary.lowestGauge.average})\n\n`;
  
  text += `Check-ins this period: ${report.userContext.totalCheckIns}\n`;
  text += `Current streak: ${report.userContext.checkInStreak} days\n\n`;
  
  if (report.keyObservations.length > 0) {
    text += '───────────────────────────────────────────────────────────────\n';
    text += '                       KEY OBSERVATIONS                        \n';
    text += '───────────────────────────────────────────────────────────────\n\n';
    
    report.keyObservations.forEach((obs, i) => {
      text += `${i + 1}. ${obs}\n\n`;
    });
  }
  
  if (report.suggestedFocusAreas.length > 0) {
    text += '───────────────────────────────────────────────────────────────\n';
    text += '                     SUGGESTED FOCUS AREAS                     \n';
    text += '───────────────────────────────────────────────────────────────\n\n';
    
    report.suggestedFocusAreas.forEach((area, i) => {
      text += `• ${area}\n`;
    });
    text += '\n';
  }
  
  if (report.patterns.length > 0) {
    text += '───────────────────────────────────────────────────────────────\n';
    text += '                      DETECTED PATTERNS                        \n';
    text += '───────────────────────────────────────────────────────────────\n\n';
    
    report.patterns.forEach(p => {
      text += `• ${p}\n`;
    });
    text += '\n';
  }
  
  if (report.gaugeHistory.length > 0) {
    text += '───────────────────────────────────────────────────────────────\n';
    text += '                    DETAILED GAUGE HISTORY                     \n';
    text += '───────────────────────────────────────────────────────────────\n\n';
    
    text += 'Date       | Body | State | Emotion | Connect | Direct | Align | Overall\n';
    text += '-----------|------|-------|---------|---------|--------|-------|--------\n';
    
    report.gaugeHistory.slice(-30).forEach(h => {
      const fmt = (v: number) => v >= 0 ? String(v).padStart(4) : '  - ';
      text += `${h.date} | ${fmt(h.body)} | ${fmt(h.state)}  | ${fmt(h.emotion)}    | ${fmt(h.connection)}    | ${fmt(h.direction)}   | ${fmt(h.alignment)}  | ${fmt(h.overall)}\n`;
    });
    text += '\n';
  }
  
  if (report.cycleData) {
    text += '───────────────────────────────────────────────────────────────\n';
    text += '                       CYCLE CORRELATION                       \n';
    text += '───────────────────────────────────────────────────────────────\n\n';
    
    text += `Average cycle length: ${report.cycleData.averageCycleLength} days\n`;
    text += 'Gauge averages by menstrual phase are tracked for personalized insights.\n\n';
  }
  
  text += '═══════════════════════════════════════════════════════════════\n';
  text += '                           DISCLAIMER                           \n';
  text += '═══════════════════════════════════════════════════════════════\n\n';
  text += 'This report is generated by InGauge based on user self-reported data.\n';
  text += 'It is intended to support, not replace, professional clinical judgment.\n';
  text += 'All data was voluntarily provided by the user for this specific share.\n\n';
  
  text += 'Generated by InGauge — The Human Cockpit\n';
  text += 'https://getingauge.com\n';
  
  return text;
}

export async function shareReport(report: TherapistReport): Promise<void> {
  const text = await exportReportAsText(report);
  
  const fileName = `InGauge_Report_${format(new Date(), 'yyyy-MM-dd')}.txt`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;
  
  await FileSystem.writeAsStringAsync(filePath, text);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/plain',
      dialogTitle: 'Share InGauge Report',
    });
  }
}

// ============ Helper Functions ============

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculateAvgOverall(snapshots: any[], gaugeKeys: string[]): number {
  if (snapshots.length === 0) return 50;
  
  const overalls = snapshots.map(h => {
    const vals = gaugeKeys.map(k => h[k]).filter(v => v >= 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 50;
  });
  
  return overalls.reduce((a, b) => a + b, 0) / overalls.length;
}

function calculateOverall(snapshot: any, gaugeKeys: string[]): number {
  const vals = gaugeKeys.map(k => snapshot[k]).filter(v => v >= 0);
  return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : -1;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateKeyObservations(data: {
  lowestGauge: [string, number];
  highestGauge: [string, number];
  volatility: string;
  trend: string;
  patterns: any[];
  gaugeAverages: Record<string, number>;
}): string[] {
  const observations: string[] = [];
  
  // Lowest gauge observation
  if (data.lowestGauge[1] < 40) {
    observations.push(
      `The ${data.lowestGauge[0].toUpperCase()} gauge averaged ${data.lowestGauge[1]}/100, indicating this may be an area requiring attention.`
    );
  }
  
  // Trend observation
  if (data.trend === 'improving') {
    observations.push('Overall wellness scores show an improving trend over this period.');
  } else if (data.trend === 'declining') {
    observations.push('Overall wellness scores show a declining trend. This may warrant discussion.');
  }
  
  // Volatility observation
  if (data.volatility === 'high') {
    observations.push('High volatility in scores suggests significant daily fluctuations in reported wellness.');
  }
  
  // Cross-gauge observations
  if (data.gaugeAverages.body < 40 && data.gaugeAverages.state < 40) {
    observations.push(
      'Both BODY and STATE gauges are low, which may indicate a physiological foundation affecting emotional regulation.'
    );
  }
  
  if (data.gaugeAverages.connection < 40 && data.gaugeAverages.emotion < 50) {
    observations.push(
      'Low CONNECTION paired with diminished EMOTION scores may suggest isolation impacting mood.'
    );
  }
  
  if (data.gaugeAverages.direction < 40 && data.gaugeAverages.alignment < 40) {
    observations.push(
      'Both DIRECTION and ALIGNMENT are low, which sometimes presents as existential distress or loss of meaning.'
    );
  }
  
  // Pattern observations
  if (data.patterns.length > 0) {
    observations.push(
      `${data.patterns.length} recurring pattern(s) have been detected in check-in data. See Patterns section for details.`
    );
  }
  
  return observations;
}

function generateFocusAreas(data: {
  lowestGauge: [string, number];
  patterns: any[];
  gaugeAverages: Record<string, number>;
}): string[] {
  const areas: string[] = [];
  
  const gaugeDescriptions: Record<string, string> = {
    body: 'Physical wellness (sleep, nutrition, movement, energy)',
    state: 'Nervous system regulation (stress, activation, calm)',
    emotion: 'Emotional awareness and processing',
    connection: 'Social bonds and relationship quality',
    direction: 'Sense of purpose and motivation',
    alignment: 'Living according to personal values',
  };
  
  // Primary focus: lowest gauge
  areas.push(`Primary: ${gaugeDescriptions[data.lowestGauge[0]]}`);
  
  // Secondary focus: any other low gauges
  Object.entries(data.gaugeAverages)
    .filter(([k, v]) => k !== data.lowestGauge[0] && v < 45)
    .slice(0, 2)
    .forEach(([k, _]) => {
      areas.push(`Secondary: ${gaugeDescriptions[k]}`);
    });
  
  return areas;
}

function buildPhaseCorrelations(patterns: any[]): Record<string, Record<string, number>> {
  const correlations: Record<string, Record<string, number>> = {};
  
  patterns.forEach(p => {
    if (!correlations[p.phase]) {
      correlations[p.phase] = {};
    }
    correlations[p.phase][p.gaugeType] = p.avgValue;
  });
  
  return correlations;
}

// ============ Quick Share Presets ============

export const REPORT_PRESETS = {
  fullReport: {
    includeGauges: true,
    includePatterns: true,
    includeCrisisEvents: true,
    includeCircleContext: false,
    includeCycleData: true,
    includeJournalSummary: true,
    anonymizeNames: true,
  },
  briefSummary: {
    includeGauges: true,
    includePatterns: false,
    includeCrisisEvents: false,
    includeCircleContext: false,
    includeCycleData: false,
    includeJournalSummary: false,
    anonymizeNames: true,
  },
  psychiatristReport: {
    includeGauges: true,
    includePatterns: true,
    includeCrisisEvents: true,
    includeCircleContext: false,
    includeCycleData: true,
    includeJournalSummary: false,
    anonymizeNames: true,
  },
} as const;

export type ReportPreset = keyof typeof REPORT_PRESETS;
