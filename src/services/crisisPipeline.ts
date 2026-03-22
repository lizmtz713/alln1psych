/**
 * Crisis Pipeline — State Persistence Monitoring
 * 
 * Monitors gauge states over time and triggers escalation
 * when dangerous patterns persist.
 * 
 * Based on Abnormal Psychology research (Barlow & Durand):
 * - Persistence is the key indicator of crisis
 * - Early intervention prevents escalation
 * - Reducing burden on user to ask for help
 */

import { useCockpitStore } from '../stores/cockpitStore';
import { useCircleStore } from '../stores/circleStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CRISIS_HISTORY_KEY = 'crisis_gauge_history';
const TETHER_NOTIFIED_KEY = 'tether_last_notified';

export interface GaugeSnapshot {
  timestamp: number;
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
}

export interface CrisisAlert {
  type: 'shutdown_72h' | 'critical_24h' | 'multi_gauge_red';
  severity: 'warning' | 'critical';
  message: string;
  shouldSurfaceResources: boolean;
  shouldNotifyTether: boolean;
}

/**
 * Record current gauge snapshot for longitudinal tracking
 */
export async function recordGaugeSnapshot(): Promise<void> {
  const cockpit = useCockpitStore.getState();
  
  const snapshot: GaugeSnapshot = {
    timestamp: Date.now(),
    body: cockpit.body.value ?? -1,
    state: cockpit.state.value ?? -1,
    emotion: cockpit.emotion.value ?? -1,
    connection: cockpit.connection.value ?? -1,
    direction: cockpit.direction.value ?? -1,
    alignment: cockpit.alignment.value ?? -1,
  };

  try {
    const existing = await AsyncStorage.getItem(CRISIS_HISTORY_KEY);
    const history: GaugeSnapshot[] = existing ? JSON.parse(existing) : [];
    
    // Keep last 7 days of snapshots (max ~168 hourly snapshots)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const filtered = history.filter(s => s.timestamp > sevenDaysAgo);
    filtered.push(snapshot);
    
    await AsyncStorage.setItem(CRISIS_HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('[CrisisPipeline] Failed to record snapshot:', e);
  }
}

/**
 * Get gauge history for analysis
 */
export async function getGaugeHistory(): Promise<GaugeSnapshot[]> {
  try {
    const data = await AsyncStorage.getItem(CRISIS_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Check for crisis patterns
 */
export async function checkCrisisPatterns(): Promise<CrisisAlert | null> {
  const history = await getGaugeHistory();
  if (history.length < 3) return null; // Need some data

  const now = Date.now();
  const h72 = 72 * 60 * 60 * 1000; // 72 hours in ms
  const h24 = 24 * 60 * 60 * 1000; // 24 hours in ms

  // Get recent snapshots
  const last72h = history.filter(s => s.timestamp > now - h72);
  const last24h = history.filter(s => s.timestamp > now - h24);

  // Check: State in shutdown (value <= 1) for 72+ hours
  const shutdownSnapshots = last72h.filter(s => s.state >= 0 && s.state <= 1);
  const shutdownRatio = last72h.length > 0 ? shutdownSnapshots.length / last72h.length : 0;
  
  if (shutdownRatio > 0.7 && last72h.length >= 6) {
    return {
      type: 'shutdown_72h',
      severity: 'critical',
      message: "Your system has been in shutdown mode for an extended period. This is a sign your nervous system needs support.",
      shouldSurfaceResources: true,
      shouldNotifyTether: true,
    };
  }

  // Check: Multiple gauges critical (<=1) for 24+ hours
  const criticalSnapshots = last24h.filter(s => {
    const criticalCount = [s.body, s.state, s.emotion, s.connection]
      .filter(v => v >= 0 && v <= 1).length;
    return criticalCount >= 3;
  });
  const criticalRatio = last24h.length > 0 ? criticalSnapshots.length / last24h.length : 0;

  if (criticalRatio > 0.5 && last24h.length >= 3) {
    return {
      type: 'multi_gauge_red',
      severity: 'critical",
      message: \"Multiple systems have been in the red zone. You don't have to handle this alone.\",
      shouldSurfaceResources: true,
      shouldNotifyTether: true,
    };
  }

  // Check: State critical (<= 1) for 24+ hours (warning level)
  const stateCritical24 = last24h.filter(s => s.state >= 0 && s.state <= 1);
  const stateCriticalRatio = last24h.length > 0 ? stateCritical24.length / last24h.length : 0;

  if (stateCriticalRatio > 0.6 && last24h.length >= 3) {
    return {
      type: "critical_24h',
      severity: 'warning',
      message: "Your nervous system has been struggling. Consider reaching out to someone you trust.",
      shouldSurfaceResources: false,
      shouldNotifyTether: false,
    };
  }

  return null;
}

/**
 * Get designated Safety Tether from Circle
 */
export function getSafetyTether(): { name: string; id: string } | null {
  const circle = useCircleStore.getState();
  // Look for member marked as emergency contact or tether
  const tether = circle.members.find(m => 
    m.relationship === 'partner' || 
    m.relationship === 'parent' ||
    m.sharingLevel === 'full'
  );
  
  if (tether) {
    return { name: tether.name, id: tether.id };
  }
  return null;
}

/**
 * Check if we should notify tether (rate limited to once per 24h)
 */
export async function shouldNotifyTether(): Promise<boolean> {
  try {
    const lastNotified = await AsyncStorage.getItem(TETHER_NOTIFIED_KEY);
    if (!lastNotified) return true;
    
    const lastTime = parseInt(lastNotified, 10);
    const h24 = 24 * 60 * 60 * 1000;
    return Date.now() - lastTime > h24;
  } catch {
    return true;
  }
}

/**
 * Mark tether as notified
 */
export async function markTetherNotified(): Promise<void> {
  try {
    await AsyncStorage.setItem(TETHER_NOTIFIED_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

/**
 * Crisis resources that are always free
 */
export const CRISIS_RESOURCES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    action: 'Call or text 988',
    available: '24/7',
    description: 'Free, confidential support',
  },
  {
    name: 'Crisis Text Line',
    action: 'Text HOME to 741741',
    available: '24/7',
    description: 'Text-based crisis support',
  },
  {
    name: 'Trans Lifeline',
    action: 'Call 877-565-8860',
    available: '24/7',
    description: 'By and for trans people',
  },
  {
    name: 'Trevor Project',
    action: 'Call 1-866-488-7386',
    available: '24/7',
    description: 'LGBTQ+ youth support',
  },
];

/**
 * Run crisis check and return any alerts
 * Call this on app launch and after gauge updates
 */
export async function runCrisisCheck(): Promise<{
  alert: CrisisAlert | null;
  tether: { name: string; id: string } | null;
  canNotifyTether: boolean;
}> {
  await recordGaugeSnapshot();
  const alert = await checkCrisisPatterns();
  const tether = getSafetyTether();
  const canNotifyTether = await shouldNotifyTether();

  return { alert, tether, canNotifyTether };
}
