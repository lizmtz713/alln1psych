/**
 * Apple Watch Connectivity Service
 * 
 * Handles communication between the iOS app and Apple Watch.
 * Uses WatchConnectivity framework via native module.
 * 
 * NOTE: This requires a native iOS module to be implemented.
 * The React Native side prepares the data format and handles
 * state management. Native implementation is in ios/WatchBridge.
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { create } from 'zustand';
import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { useHealthStore } from '../stores/healthStore';

// ============ Types ============

export interface WatchGaugeReading {
  gauge: GaugeKey;
  value: number; // 0-100
  timestamp: string;
}

export interface WatchCheckIn {
  id: string;
  readings: WatchGaugeReading[];
  source: 'watch' | 'phone';
  timestamp: string;
}

export interface WatchHealthSnapshot {
  hrv?: number;
  heartRate?: number;
  steps?: number;
  activeCalories?: number;
  standHours?: number;
  sleepHours?: number;
  mindfulMinutes?: number;
  timestamp: string;
}

export interface WatchComplicationData {
  gaugeType: GaugeKey;
  value: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  lastUpdated: string;
}

export interface WatchState {
  isWatchPaired: boolean;
  isWatchReachable: boolean;
  isAppInstalled: boolean;
  lastSyncTimestamp: string | null;
  pendingCheckIns: WatchCheckIn[];
}

// ============ Native Module Interface ============

interface WatchConnectivityModule {
  checkPairingStatus(): Promise<{
    isPaired: boolean;
    isReachable: boolean;
    isAppInstalled: boolean;
  }>;
  
  sendGaugeData(data: string): Promise<void>;
  sendComplicationData(data: string): Promise<void>;
  requestHealthSnapshot(): Promise<string>;
  
  transferUserInfo(data: string): Promise<void>;
  updateApplicationContext(data: string): Promise<void>;
}

const WatchBridge: WatchConnectivityModule | null = 
  Platform.OS === 'ios' ? NativeModules.WatchBridge : null;

// ============ Store ============

interface WatchConnectivityState {
  isPaired: boolean;
  isReachable: boolean;
  isAppInstalled: boolean;
  lastSync: string | null;
  pendingCheckIns: WatchCheckIn[];
  
  // Actions
  checkStatus: () => Promise<void>;
  syncGauges: () => Promise<void>;
  updateComplications: () => Promise<void>;
  processWatchCheckIn: (checkIn: WatchCheckIn) => Promise<void>;
  requestHealthData: () => Promise<WatchHealthSnapshot | null>;
}

export const useWatchStore = create<WatchConnectivityState>((set, get) => ({
  isPaired: false,
  isReachable: false,
  isAppInstalled: false,
  lastSync: null,
  pendingCheckIns: [],

  checkStatus: async () => {
    if (!WatchBridge) {
      set({ isPaired: false, isReachable: false, isAppInstalled: false });
      return;
    }

    try {
      const status = await WatchBridge.checkPairingStatus();
      set({
        isPaired: status.isPaired,
        isReachable: status.isReachable,
        isAppInstalled: status.isAppInstalled,
      });
    } catch (e) {
      console.log('[Watch] Status check failed:', e);
    }
  },

  syncGauges: async () => {
    if (!WatchBridge) return;
    
    const { isPaired, isReachable } = get();
    if (!isPaired || !isReachable) return;

    try {
      const cockpit = useCockpitStore.getState();
      const gaugeData = {
        body: cockpit.body.value,
        state: cockpit.state.value,
        emotion: cockpit.emotion.value,
        connection: cockpit.connection.value,
        direction: cockpit.direction.value,
        alignment: cockpit.alignment.value,
        overall: cockpit.getOverallRegulation(),
        timestamp: new Date().toISOString(),
      };

      await WatchBridge.sendGaugeData(JSON.stringify(gaugeData));
      set({ lastSync: new Date().toISOString() });
    } catch (e) {
      console.log('[Watch] Gauge sync failed:', e);
    }
  },

  updateComplications: async () => {
    if (!WatchBridge) return;
    
    const { isPaired } = get();
    if (!isPaired) return;

    try {
      const cockpit = useCockpitStore.getState();
      
      const complications: WatchComplicationData[] = [
        {
          gaugeType: 'body',
          value: cockpit.body.value,
          trend: cockpit.body.trend === 'improving' ? 'up' : 
                 cockpit.body.trend === 'declining' ? 'down' : 'stable',
          color: getGaugeColor(cockpit.body.value),
          lastUpdated: cockpit.body.lastUpdated || new Date().toISOString(),
        },
        {
          gaugeType: 'state',
          value: cockpit.state.value,
          trend: cockpit.state.trend === 'improving' ? 'up' : 
                 cockpit.state.trend === 'declining' ? 'down' : 'stable',
          color: getGaugeColor(cockpit.state.value),
          lastUpdated: cockpit.state.lastUpdated || new Date().toISOString(),
        },
        // ... other gauges would follow the same pattern
      ];

      await WatchBridge.sendComplicationData(JSON.stringify(complications));
    } catch (e) {
      console.log('[Watch] Complication update failed:', e);
    }
  },

  processWatchCheckIn: async (checkIn: WatchCheckIn) => {
    const cockpit = useCockpitStore.getState();
    
    // Apply each reading from the watch
    for (const reading of checkIn.readings) {
      switch (reading.gauge) {
        case 'body':
          cockpit.updateBody(reading.value);
          break;
        case 'state':
          cockpit.updateState(reading.value);
          break;
        case 'emotion':
          cockpit.updateEmotion(reading.value);
          break;
        case 'connection':
          cockpit.updateConnection(reading.value);
          break;
        case 'direction':
          cockpit.updateDirection(reading.value);
          break;
        case 'alignment':
          cockpit.updateAlignment(reading.value);
          break;
      }
    }

    // Record the check-in
    await cockpit.recordGaugesForDrift();
    
    set({ lastSync: new Date().toISOString() });
  },

  requestHealthData: async () => {
    if (!WatchBridge) return null;
    
    const { isPaired, isReachable } = get();
    if (!isPaired || !isReachable) return null;

    try {
      const dataStr = await WatchBridge.requestHealthSnapshot();
      const data = JSON.parse(dataStr) as WatchHealthSnapshot;
      return data;
    } catch (e) {
      console.log('[Watch] Health data request failed:', e);
      return null;
    }
  },
}));

// ============ Event Listener Setup ============

let eventEmitter: NativeEventEmitter | null = null;

export function initializeWatchConnectivity(): () => void {
  if (Platform.OS !== 'ios' || !WatchBridge) {
    return () => {};
  }

  // Initialize event emitter
  eventEmitter = new NativeEventEmitter(NativeModules.WatchBridge);

  // Listen for watch events
  const checkInSubscription = eventEmitter.addListener(
    'WatchCheckIn',
    (data: string) => {
      try {
        const checkIn = JSON.parse(data) as WatchCheckIn;
        useWatchStore.getState().processWatchCheckIn(checkIn);
      } catch (e) {
        console.log('[Watch] Failed to process check-in:', e);
      }
    }
  );

  const reachabilitySubscription = eventEmitter.addListener(
    'WatchReachabilityChanged',
    (data: { isReachable: boolean }) => {
      useWatchStore.setState({ isReachable: data.isReachable });
      
      // Sync if watch became reachable
      if (data.isReachable) {
        useWatchStore.getState().syncGauges();
      }
    }
  );

  // Initial status check
  useWatchStore.getState().checkStatus();

  // Cleanup function
  return () => {
    checkInSubscription.remove();
    reachabilitySubscription.remove();
  };
}

// ============ Helpers ============

function getGaugeColor(value: number): string {
  if (value < 0) return '#6B6B80'; // Muted
  if (value < 30) return '#EF4444'; // Red
  if (value < 50) return '#F59E0B'; // Orange
  if (value < 70) return '#FBBF24'; // Yellow
  return '#10B981'; // Green
}

// ============ Watch App Data Formatters ============

/**
 * Format data for watch complications
 */
export function formatForComplication(gauge: GaugeKey, value: number): string {
  if (value < 0) return '—';
  return `${value}`;
}

/**
 * Get suggested Body gauge value from health data
 */
export function suggestBodyFromHealth(snapshot: WatchHealthSnapshot): number {
  let score = 50; // Base
  let factors = 0;

  // HRV contribution (good HRV = higher body score)
  if (snapshot.hrv !== undefined) {
    const hrvScore = Math.min(100, (snapshot.hrv / 70) * 100);
    score += (hrvScore - 50) * 0.3;
    factors++;
  }

  // Sleep contribution
  if (snapshot.sleepHours !== undefined) {
    const sleepScore = Math.min(100, (snapshot.sleepHours / 8) * 100);
    score += (sleepScore - 50) * 0.3;
    factors++;
  }

  // Activity contribution
  if (snapshot.steps !== undefined) {
    const stepsScore = Math.min(100, (snapshot.steps / 10000) * 100);
    score += (stepsScore - 50) * 0.2;
    factors++;
  }

  // Mindfulness contribution
  if (snapshot.mindfulMinutes !== undefined && snapshot.mindfulMinutes > 0) {
    score += 5; // Small bonus for any mindfulness
    factors++;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Prepare sync payload for watch
 */
export function prepareSyncPayload() {
  const cockpit = useCockpitStore.getState();
  const health = useHealthStore.getState();

  return {
    gauges: {
      body: cockpit.body,
      state: cockpit.state,
      emotion: cockpit.emotion,
      connection: cockpit.connection,
      direction: cockpit.direction,
      alignment: cockpit.alignment,
    },
    overall: cockpit.getOverallRegulation(),
    systemMode: cockpit.systemMode,
    healthSynced: health.isAuthorized,
    lastUpdate: new Date().toISOString(),
  };
}
