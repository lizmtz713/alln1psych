/**
 * Predictive Warnings — Trajectory-based crash prevention
 * 
 * Philosophy:
 * - Predict state changes before they happen using 48-hour trends
 * - Explicit, actionable warnings: "Current trajectory suggests X by Y time"
 * - Empower, don't alarm: offer tools alongside predictions
 * - Probabilistic language: "suggests", "trending toward", not "will"
 */

import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';
import { type GaugeKey, GAUGE_TIERS } from '../stores/cockpitStore';

export type WarningUrgency = 'advisory' | 'caution' | 'warning';
export type TrajectoryDirection = 'declining' | 'stable' | 'improving';

export interface PredictiveWarning {
  id: string;
  gauge: GaugeKey;
  urgency: WarningUrgency;
  currentValue: number;
  predictedValue: number;
  predictedTime: string; // e.g., "4:00 PM today", "tomorrow morning"
  trajectory: TrajectoryDirection;
  message: string;
  suggestion: string;
  suggestedTool?: string;
}

export interface TrajectoryAnalysis {
  hasEnoughData: boolean;
  warnings: PredictiveWarning[];
  overallStatus: 'stable' | 'watch' | 'concern';
  nextCheckRecommendation?: string;
}

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

const GAUGE_CRASH_THRESHOLDS: Record<GaugeKey, number> = {
  body: 30,
  state: 30,
  emotion: 35,
  connection: 30,
  direction: 40,
  alignment: 40,
};

const GAUGE_TOOLS: Record<GaugeKey, string> = {
  body: 'quick-reset',
  state: 'quick-reset',
  emotion: 'replay',
  connection: 'relate',
  direction: 'journal',
  alignment: 'journal',
};

/**
 * Calculate rate of change per hour over the last 48 hours
 */
function calculateTrajectory(
  history: GaugeSnapshot[],
  gauge: GaugeKey
): { ratePerHour: number; direction: TrajectoryDirection; confidence: number } {
  if (history.length < 3) {
    return { ratePerHour: 0, direction: 'stable', confidence: 0 };
  }

  // Get last 48 hours of data
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = history.filter(h => h.timestamp > cutoff);
  
  if (recent.length < 2) {
    return { ratePerHour: 0, direction: 'stable', confidence: 0 };
  }

  // Calculate weighted moving average of changes
  // More recent changes weighted higher
  let totalChange = 0;
  let totalWeight = 0;
  
  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];
    const timeDiffHours = (curr.timestamp - prev.timestamp) / (1000 * 60 * 60);
    
    if (timeDiffHours > 0 && timeDiffHours < 24) { // Skip gaps > 24h
      const change = (curr[gauge] ?? 0) - (prev[gauge] ?? 0);
      const ratePerHour = change / timeDiffHours;
      const weight = i / recent.length; // More recent = higher weight
      
      totalChange += ratePerHour * weight;
      totalWeight += weight;
    }
  }

  const avgRatePerHour = totalWeight > 0 ? totalChange / totalWeight : 0;
  
  // Determine direction
  let direction: TrajectoryDirection = 'stable';
  if (avgRatePerHour < -0.5) direction = 'declining';
  if (avgRatePerHour > 0.5) direction = 'improving';

  // Confidence based on data points
  const confidence = Math.min(recent.length / 10, 1);

  return { ratePerHour: avgRatePerHour, direction, confidence };
}

/**
 * Predict future value based on current trajectory
 */
function predictFutureValue(
  currentValue: number,
  ratePerHour: number,
  hoursAhead: number
): number {
  const predicted = currentValue + (ratePerHour * hoursAhead);
  return Math.max(0, Math.min(100, predicted));
}

/**
 * Get human-readable time prediction
 */
function getTimeLabel(hoursFromNow: number): string {
  const now = new Date();
  const future = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
  
  const isToday = future.getDate() === now.getDate();
  const isTomorrow = future.getDate() === now.getDate() + 1;
  
  const hour = future.getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  if (hour >= 21 || hour < 5) timeOfDay = 'night';
  
  const hourLabel = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
  
  if (isToday) return `around ${hourLabel} today`;
  if (isTomorrow) return `tomorrow ${timeOfDay}`;
  return `within ${Math.round(hoursFromNow / 24)} days`;
}

/**
 * Generate warning message based on trajectory
 */
function generateWarning(
  gauge: GaugeKey,
  currentValue: number,
  predictedValue: number,
  hoursToThreshold: number,
  ratePerHour: number
): PredictiveWarning | null {
  const threshold = GAUGE_CRASH_THRESHOLDS[gauge];
  const tier = GAUGE_TIERS[gauge];
  
  // Only warn if declining toward threshold
  if (ratePerHour >= 0 || currentValue < threshold) {
    return null; // Already below or not declining
  }

  // Calculate urgency based on time to threshold and tier
  let urgency: WarningUrgency = 'advisory';
  if (hoursToThreshold < 12 || (tier === 1 && hoursToThreshold < 24)) {
    urgency = 'warning';
  } else if (hoursToThreshold < 24 || tier === 1) {
    urgency = 'caution';
  }

  // Skip minor advisories for Tier 3 gauges
  if (urgency === 'advisory' && tier === 3) {
    return null;
  }

  const timeLabel = getTimeLabel(hoursToThreshold);
  const gaugeLabel = GAUGE_LABELS[gauge];

  // Generate contextual message
  let message: string;
  let suggestion: string;
  
  if (urgency === 'warning') {
    message = `⚠️ Trajectory alert: ${gaugeLabel} (currently ${currentValue}%) is trending toward ${Math.round(predictedValue)}% ${timeLabel}. This could affect your regulation capacity.`;
    suggestion = `Consider a ${gaugeLabel === 'Body' || gaugeLabel === 'State' ? 'Quick Reset now' : 'check-in with yourself'} before this builds.`;
  } else if (urgency === 'caution') {
    message = `📉 Heads up: ${gaugeLabel} has been declining. Current trajectory suggests ${Math.round(predictedValue)}% ${timeLabel}.`;
    suggestion = `You have time to course-correct. What might help your ${gaugeLabel.toLowerCase()} right now?`;
  } else {
    message = `📊 ${gaugeLabel} has a slight downward trend. Watching it.`;
    suggestion = `No action needed yet — just awareness.`;
  }

  return {
    id: `warn-${gauge}-${Date.now()}`,
    gauge,
    urgency,
    currentValue,
    predictedValue: Math.round(predictedValue),
    predictedTime: timeLabel,
    trajectory: 'declining',
    message,
    suggestion,
    suggestedTool: urgency !== 'advisory' ? GAUGE_TOOLS[gauge] : undefined,
  };
}

/**
 * Analyze trajectories and generate predictive warnings
 */
export async function analyzeTrajectories(): Promise<TrajectoryAnalysis> {
  const history = await getGaugeHistory();
  
  if (history.length < 5) {
    return {
      hasEnoughData: false,
      warnings: [],
      overallStatus: 'stable',
      nextCheckRecommendation: 'Keep checking in — predictive insights unlock after 5+ check-ins.',
    };
  }

  const warnings: PredictiveWarning[] = [];
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  
  // Get current values from most recent snapshot
  const current = history[history.length - 1];

  for (const gauge of gauges) {
    const currentValue = current[gauge] ?? 50;
    const { ratePerHour, direction, confidence } = calculateTrajectory(history, gauge);
    
    if (direction === 'declining' && confidence > 0.3) {
      const threshold = GAUGE_CRASH_THRESHOLDS[gauge];
      
      // Calculate hours until threshold
      if (currentValue > threshold && ratePerHour < 0) {
        const hoursToThreshold = (currentValue - threshold) / Math.abs(ratePerHour);
        
        // Only warn for crashes within 48 hours
        if (hoursToThreshold < 48) {
          const predictedValue = predictFutureValue(currentValue, ratePerHour, hoursToThreshold);
          const warning = generateWarning(gauge, currentValue, predictedValue, hoursToThreshold, ratePerHour);
          
          if (warning) {
            warnings.push(warning);
          }
        }
      }
    }
  }

  // Sort by urgency
  const urgencyOrder = { warning: 0, caution: 1, advisory: 2 };
  warnings.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  // Determine overall status
  let overallStatus: 'stable' | 'watch' | 'concern' = 'stable';
  if (warnings.some(w => w.urgency === 'warning')) {
    overallStatus = 'concern';
  } else if (warnings.some(w => w.urgency === 'caution')) {
    overallStatus = 'watch';
  }

  return {
    hasEnoughData: true,
    warnings: warnings.slice(0, 3), // Max 3 warnings
    overallStatus,
  };
}

/**
 * Get the most urgent warning (if any) for display
 */
export async function getMostUrgentWarning(): Promise<PredictiveWarning | null> {
  const analysis = await analyzeTrajectories();
  return analysis.warnings[0] || null;
}

/**
 * Check if user should be notified about trajectory
 * (For use in background checks or post-checkin)
 */
export async function shouldNotifyAboutTrajectory(): Promise<{
  shouldNotify: boolean;
  warning?: PredictiveWarning;
}> {
  const warning = await getMostUrgentWarning();
  
  if (!warning) {
    return { shouldNotify: false };
  }

  // Only notify for caution or warning level
  if (warning.urgency === 'advisory') {
    return { shouldNotify: false };
  }

  return { shouldNotify: true, warning };
}

/**
 * Get a summary for the cockpit display
 */
export async function getTrajectoryStatus(): Promise<{
  status: 'clear' | 'watching' | 'alert';
  message?: string;
  affectedGauges?: GaugeKey[];
}> {
  const analysis = await analyzeTrajectories();

  if (!analysis.hasEnoughData) {
    return { status: 'clear' };
  }

  if (analysis.overallStatus === 'concern') {
    return {
      status: 'alert',
      message: analysis.warnings[0]?.message,
      affectedGauges: analysis.warnings.map(w => w.gauge),
    };
  }

  if (analysis.overallStatus === 'watch') {
    return {
      status: 'watching',
      message: `Watching ${analysis.warnings.map(w => GAUGE_LABELS[w.gauge]).join(', ')}`,
      affectedGauges: analysis.warnings.map(w => w.gauge),
    };
  }

  return { status: 'clear' };
}
