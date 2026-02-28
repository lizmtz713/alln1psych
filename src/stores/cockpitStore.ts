import { create } from 'zustand';
import { generateCrossSystemInsight } from '../services/cockpitAI';
import { recordGaugeEvent, refreshDriftCache } from '../services/systemicDrift';
import { getGaugeHistory } from '../services/crisisPipeline';
import { useCycleStore } from './cycleStore';

export interface GaugeState {
  value: number; // 0-100, -1 = unset/dim
  lastUpdated: string | null;
  trend: 'improving' | 'stable' | 'declining' | null;
}

export type GaugeKey = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

/**
 * System Mode — reflects overall system stability
 * - capacity: System stable, all tools available normally
 * - stabilization: Foundation needs attention, protective messaging enabled
 */
export type SystemMode = 'capacity' | 'stabilization';

/**
 * Gauge tier hierarchy for weighted scoring and override logic
 * Tier 1 (foundational): Body, State — can trigger hard mode switch
 * Tier 2 (relational): Connection — can trigger mode switch if sustained
 * Tier 3 (executive): Emotion, Direction, Alignment — influence score but no override
 */
export const GAUGE_TIERS: Record<GaugeKey, 1 | 2 | 3> = {
  body: 1,
  state: 1,
  connection: 2,
  emotion: 3,
  direction: 3,
  alignment: 3,
};

/** Thresholds for mode triggers */
const STABILIZATION_THRESHOLD = 40; // Body/State below this triggers stabilization
const CONNECTION_CRITICAL_THRESHOLD = 30; // Connection below this for 3+ days triggers
const CRITICAL_THRESHOLD = 30; // For multi-gauge critical check

interface CockpitState {
  body: GaugeState;
  state: GaugeState;
  emotion: GaugeState;
  connection: GaugeState;
  direction: GaugeState;
  alignment: GaugeState;
  lastCheckInDate: string | null;
  /** Cached AI-generated cross-system insight; set by fetchCrossSystemInsight() */
  crossSystemInsight: string | null;
  /** Current system mode: capacity (stable) or stabilization (under strain) */
  systemMode: SystemMode;
  /** Which gauges triggered stabilization mode */
  stabilizationTriggers: GaugeKey[];
  /** Weighted center score (0-100) accounting for tier hierarchy */
  centerScore: number;

  getOverallRegulation: () => number;
  /** Compute system mode based on current gauges + history */
  computeSystemMode: () => Promise<void>;
  /** Get weighted center score with conditional stability logic */
  getCenterScore: () => number;
  /** Get gauges in priority order (triggers first in stabilization mode) */
  getOrderedGauges: () => GaugeKey[];
  updateBody: (value: number) => void;
  updateState: (value: number) => void;
  updateEmotion: (value: number) => void;
  updateConnection: (value: number) => void;
  updateDirection: (value: number) => void;
  updateAlignment: (value: number) => void;
  setBodyCheckIn: (sleep: boolean, food: boolean, water: boolean, movement: boolean) => void;
  getGaugeColor: (gauge: GaugeKey) => string;
  /** Sync getter for cached insight (use after fetchCrossSystemInsight or for initial render). */
  getCrossSystemInsight: () => string | null;
  /** Async: fetches AI insight (or fallback), stores in crossSystemInsight. Call when 3+ gauges active. */
  fetchCrossSystemInsight: () => Promise<void>;
  addLessonBonus: () => void;
  runDailyDecayIfNeeded: () => void;
  setLastCheckInDate: (date: string) => void;
  /** Record gauges for systemic drift analysis */
  recordGaugesForDrift: () => Promise<void>;
  /** Sync Body gauge from Apple Health data */
  syncBodyFromHealth: () => void;
  reset: () => void;
}

const defaultGauge: GaugeState = {
  value: -1,
  lastUpdated: null,
  trend: null,
};

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function decayToward50(value: number): number {
  if (value < 0) return -1;
  const decayed = value * 0.8 + 50 * 0.2;
  return Math.round(decayed);
}

/**
 * Compute weighted center score based on tier hierarchy.
 * 
 * Capacity Mode weights:
 *   Body: 0.25, State: 0.25, Connection: 0.20
 *   Emotion: 0.10, Direction: 0.10, Alignment: 0.10
 * 
 * Stabilization Mode weights (Tier 1 dominates):
 *   Body: 0.35, State: 0.35, Connection: 0.15
 *   Emotion: 0.05, Direction: 0.05, Alignment: 0.05
 */
function computeWeightedScore(
  state: { body: GaugeState; state: GaugeState; emotion: GaugeState; connection: GaugeState; direction: GaugeState; alignment: GaugeState },
  mode: SystemMode
): number {
  const gauges = {
    body: state.body.value >= 0 ? state.body.value : 50,
    state: state.state.value >= 0 ? state.state.value : 50,
    emotion: state.emotion.value >= 0 ? state.emotion.value : 50,
    connection: state.connection.value >= 0 ? state.connection.value : 50,
    direction: state.direction.value >= 0 ? state.direction.value : 50,
    alignment: state.alignment.value >= 0 ? state.alignment.value : 50,
  };

  // Check if any active gauges
  const activeGauges = [state.body, state.state, state.emotion, state.connection, state.direction, state.alignment]
    .filter(g => g.value >= 0);
  if (activeGauges.length === 0) return -1;

  if (mode === 'stabilization') {
    // Stabilization: Tier 1 dominates
    return Math.round(
      gauges.body * 0.35 +
      gauges.state * 0.35 +
      gauges.connection * 0.15 +
      gauges.emotion * 0.05 +
      gauges.direction * 0.05 +
      gauges.alignment * 0.05
    );
  }

  // Capacity: Standard weights
  return Math.round(
    gauges.body * 0.25 +
    gauges.state * 0.25 +
    gauges.connection * 0.20 +
    gauges.emotion * 0.10 +
    gauges.direction * 0.10 +
    gauges.alignment * 0.10
  );
}

export const useCockpitStore = create<CockpitState>((set, get) => ({
  body: { ...defaultGauge },
  state: { ...defaultGauge },
  emotion: { ...defaultGauge },
  connection: { ...defaultGauge },
  direction: { ...defaultGauge },
  alignment: { ...defaultGauge },
  lastCheckInDate: null,
  crossSystemInsight: null,
  systemMode: 'capacity',
  stabilizationTriggers: [],
  centerScore: -1,

  getOverallRegulation: () => {
    const s = get();
    const gauges = [s.body, s.state, s.emotion, s.connection, s.direction, s.alignment];
    const active = gauges.filter((g) => g.value >= 0);
    if (active.length === 0) return -1;
    return Math.round(active.reduce((sum, g) => sum + g.value, 0) / active.length);
  },

  /**
   * Compute system mode based on current gauges + historical data.
   * Triggers:
   * - Body < 40 OR State < 40 → stabilization
   * - Connection < 30 sustained >= 3 days → stabilization
   * - 2+ Tier 1/2 gauges critical (<30) → stabilization
   */
  computeSystemMode: async () => {
    const s = get();
    const triggers: GaugeKey[] = [];

    // Check Tier 1: Body and State
    if (s.body.value >= 0 && s.body.value < STABILIZATION_THRESHOLD) {
      triggers.push('body');
    }
    if (s.state.value >= 0 && s.state.value < STABILIZATION_THRESHOLD) {
      triggers.push('state');
    }

    // Check Tier 2: Connection sustained for 3+ days
    if (s.connection.value >= 0 && s.connection.value < CONNECTION_CRITICAL_THRESHOLD) {
      try {
        const history = await getGaugeHistory();
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
        const recentSnapshots = history.filter(h => h.timestamp > threeDaysAgo);
        
        // Check if we have at least 3 days of data
        const uniqueDays = new Set(
          recentSnapshots.map(h => new Date(h.timestamp).toDateString())
        );
        
        if (uniqueDays.size >= 3) {
          // Check if Connection was consistently low
          const connectionReadings = recentSnapshots.filter(h => h.connection >= 0);
          const lowConnectionDays = connectionReadings.filter(h => h.connection < CONNECTION_CRITICAL_THRESHOLD);
          
          if (lowConnectionDays.length >= connectionReadings.length * 0.7) {
            triggers.push('connection');
          }
        }
      } catch (e) {
        // History unavailable, skip sustained check
      }
    }

    // Check multi-gauge critical: 2+ Tier 1/2 gauges at critical (<30)
    const tier1and2Gauges: GaugeKey[] = ['body', 'state', 'connection'];
    const criticalCount = tier1and2Gauges.filter(key => {
      const val = s[key].value;
      return val >= 0 && val < CRITICAL_THRESHOLD;
    }).length;
    
    if (criticalCount >= 2 && triggers.length === 0) {
      // Add first two critical gauges as triggers
      tier1and2Gauges.forEach(key => {
        const val = s[key].value;
        if (val >= 0 && val < CRITICAL_THRESHOLD && !triggers.includes(key)) {
          triggers.push(key);
        }
      });
    }

    const mode: SystemMode = triggers.length > 0 ? 'stabilization' : 'capacity';
    
    // Compute center score with mode-aware weights
    const centerScore = computeWeightedScore(s, mode);

    set({ systemMode: mode, stabilizationTriggers: triggers, centerScore });
  },

  /**
   * Get weighted center score with conditional stability logic.
   * In stabilization mode, Tier 1 gauges get higher weight.
   */
  getCenterScore: () => {
    const s = get();
    return computeWeightedScore(s, s.systemMode);
  },

  /**
   * Get gauges in priority order.
   * In stabilization mode, triggered gauges come first.
   */
  getOrderedGauges: (): GaugeKey[] => {
    const s = get();
    const baseOrder: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
    
    if (s.systemMode !== 'stabilization' || s.stabilizationTriggers.length === 0) {
      return baseOrder;
    }
    
    // Move triggers to front, then other Tier 1/2, then Tier 3
    const triggers = s.stabilizationTriggers;
    const tier1and2 = baseOrder.filter(g => GAUGE_TIERS[g] <= 2 && !triggers.includes(g));
    const tier3 = baseOrder.filter(g => GAUGE_TIERS[g] === 3);
    
    return [...triggers, ...tier1and2, ...tier3];
  },

  updateBody: (value) =>
    set((s) => ({
      body: {
        value: clamp(value),
        lastUpdated: new Date().toISOString(),
        trend:
          s.body.value >= 0
            ? value > s.body.value
              ? 'improving'
              : value < s.body.value
                ? 'declining'
                : 'stable'
            : null,
      },
    })),

  updateState: (value) =>
    set((s) => ({
      state: {
        value: clamp(value),
        lastUpdated: new Date().toISOString(),
        trend:
          s.state.value >= 0
            ? value > s.state.value
              ? 'improving'
              : value < s.state.value
                ? 'declining'
                : 'stable'
            : null,
      },
    })),

  updateEmotion: (value) =>
    set((s) => ({
      emotion: {
        value: clamp(value),
        lastUpdated: new Date().toISOString(),
        trend:
          s.emotion.value >= 0
            ? value > s.emotion.value
              ? 'improving'
              : value < s.emotion.value
                ? 'declining'
                : 'stable'
            : null,
      },
    })),

  updateConnection: (value) =>
    set((s) => ({
      connection: {
        value: clamp(value),
        lastUpdated: new Date().toISOString(),
        trend:
          s.connection.value >= 0
            ? value > s.connection.value
              ? 'improving'
              : value < s.connection.value
                ? 'declining'
                : 'stable'
            : null,
      },
    })),

  updateDirection: (value) =>
    set((s) => ({
      direction: {
        value: clamp(value),
        lastUpdated: new Date().toISOString(),
        trend:
          s.direction.value >= 0
            ? value > s.direction.value
              ? 'improving'
              : value < s.direction.value
                ? 'declining'
                : 'stable'
            : null,
      },
    })),

  updateAlignment: (value) =>
    set((s) => ({
      alignment: {
        value: clamp(value),
        lastUpdated: new Date().toISOString(),
        trend:
          s.alignment.value >= 0
            ? value > s.alignment.value
              ? 'improving'
              : value < s.alignment.value
                ? 'declining'
                : 'stable'
            : null,
      },
    })),

  setBodyCheckIn: (sleep, food, water, movement) => {
    const score = [sleep, food, water, movement].filter(Boolean).length * 25;
    get().updateBody(score);
  },

  getGaugeColor: (gauge) => {
    const g = get()[gauge];
    if (!g || g.value < 0) return '#2A2A3A';
    if (g.value >= 75) return '#34D399';
    if (g.value >= 50) return '#FBBF24';
    if (g.value >= 25) return '#FB923C';
    return '#F87171';
  },

  getCrossSystemInsight: () => get().crossSystemInsight,

  fetchCrossSystemInsight: async () => {
    const s = get();
    const gauges = {
      body: s.body.value,
      state: s.state.value,
      emotion: s.emotion.value,
      connection: s.connection.value,
      direction: s.direction.value,
      alignment: s.alignment.value,
    };
    
    // Get health data if available
    let healthData;
    try {
      const healthStore = require('./healthStore').useHealthStore.getState();
      const snapshot = healthStore.snapshot;
      if (snapshot) {
        healthData = {
          sleepHours: snapshot.sleep?.lastNight?.duration,
          sleepQuality: snapshot.sleep?.lastNight?.quality,
          steps: snapshot.activity?.steps,
          exerciseMinutes: snapshot.activity?.exerciseMinutes,
          waterOz: snapshot.nutrition?.waterOz,
          hrv: snapshot.heart?.hrv ?? undefined,
          cyclePhase: snapshot.menstruation?.currentPhase ?? undefined,
          cycleDay: snapshot.menstruation?.dayOfCycle ?? undefined,
        };
      }
    } catch (e) {
      // Health store not available
    }

    // Get Spotify listening data if available
    let spotifyData;
    try {
      const spotifyStore = require('./spotifyStore').useSpotifyStore.getState();
      if (spotifyStore.isConnected && spotifyStore.listeningMood) {
        spotifyData = {
          averageValence: spotifyStore.listeningMood.averageValence,
          averageEnergy: spotifyStore.listeningMood.averageEnergy,
          moodLabel: spotifyStore.listeningMood.moodLabel,
          trackCount: spotifyStore.listeningMood.trackCount,
          moodScore: spotifyStore.moodScore ?? undefined,
        };
      }
    } catch (e) {
      // Spotify store not available
    }

    // Get weather data if available
    let weatherData;
    try {
      const weatherStore = require('./weatherStore').useWeatherStore.getState();
      if (weatherStore.isConfigured && weatherStore.weather) {
        weatherData = {
          temperature: weatherStore.weather.temperature,
          humidity: weatherStore.weather.humidity,
          pressure: weatherStore.weather.pressure,
          description: weatherStore.weather.description,
          lightLevel: weatherStore.weather.lightLevel,
          moodImpact: weatherStore.weather.moodImpact,
        };
      }
    } catch (e) {
      // Weather store not available
    }
    
    const insight = await generateCrossSystemInsight(gauges, healthData, spotifyData, weatherData);
    set({ crossSystemInsight: insight });
  },

  setLastCheckInDate: (date) => set({ lastCheckInDate: date }),

  /** Record current gauges for systemic drift analysis. Call after check-ins. */
  recordGaugesForDrift: async () => {
    const s = useCockpitStore.getState();
    const gauges: Array<{ key: GaugeKey; value: number }> = [
      { key: 'body', value: s.body.value },
      { key: 'state', value: s.state.value },
      { key: 'emotion', value: s.emotion.value },
      { key: 'connection', value: s.connection.value },
      { key: 'direction', value: s.direction.value },
      { key: 'alignment', value: s.alignment.value },
    ];
    
    // Record each active gauge
    for (const g of gauges) {
      if (g.value >= 0) {
        await recordGaugeEvent(g.key, g.value);
      }
    }
    
    // Record for cycle pattern learning (if cycle tracking enabled)
    try {
      const cycleStore = useCycleStore.getState();
      if (cycleStore.trackingEnabled && cycleStore.currentPhase) {
        for (const g of gauges) {
          if (g.value >= 0) {
            cycleStore.recordGaugeForPattern(g.key, g.value);
          }
        }
      }
    } catch (e) {
      // Cycle store not available, skip
    }
    
    // Refresh drift analysis cache
    await refreshDriftCache();
  },

  /** Add a small bonus (+5) to all gauges that are already set. Call after completing a lesson. */
  addLessonBonus: () => {
    set((s) => ({
      body: s.body.value >= 0 ? { ...s.body, value: clamp(s.body.value + 5) } : s.body,
      state: s.state.value >= 0 ? { ...s.state, value: clamp(s.state.value + 5) } : s.state,
      emotion: s.emotion.value >= 0 ? { ...s.emotion, value: clamp(s.emotion.value + 5) } : s.emotion,
      connection: s.connection.value >= 0 ? { ...s.connection, value: clamp(s.connection.value + 5) } : s.connection,
      direction: s.direction.value >= 0 ? { ...s.direction, value: clamp(s.direction.value + 5) } : s.direction,
      alignment: s.alignment.value >= 0 ? { ...s.alignment, value: clamp(s.alignment.value + 5) } : s.alignment,
    }));
  },

  syncBodyFromHealth: () => {
    try {
      const healthStore = require('./healthStore').useHealthStore.getState();
      const bodyScore = healthStore.bodyScoreFromHealth;
      if (bodyScore !== null && bodyScore !== undefined) {
        get().updateBody(bodyScore);
        // Also update State if HRV data available
        const stateContribution = healthStore.stateContributionFromHealth;
        if (stateContribution !== null && stateContribution !== undefined) {
          // Blend with existing state or use HRV-based value
          const currentState = get().state.value;
          if (currentState < 0) {
            get().updateState(stateContribution);
          }
        }
      }
    } catch (e) {
      // Health store not available
    }
  },

  runDailyDecayIfNeeded: () => {
    const today = new Date().toDateString();
    const last = get().lastCheckInDate;
    if (last === today) return;
    const lastDate = last ? new Date(last) : null;
    const daysSince = lastDate ? Math.floor((Date.now() - lastDate.getTime()) / (24 * 60 * 60 * 1000)) : 999;
    set((s) => {
      if (daysSince >= 2) {
        return {
          body: { ...defaultGauge },
          state: { ...defaultGauge },
          emotion: { ...defaultGauge },
          connection: { ...defaultGauge },
          direction: { ...defaultGauge },
          alignment: { ...defaultGauge },
        };
      }
      if (daysSince === 1) {
        return {
          body: { ...s.body, value: s.body.value >= 0 ? decayToward50(s.body.value) : -1 },
          state: { ...s.state, value: s.state.value >= 0 ? decayToward50(s.state.value) : -1 },
          emotion: { ...s.emotion, value: s.emotion.value >= 0 ? decayToward50(s.emotion.value) : -1 },
          connection: { ...s.connection, value: s.connection.value >= 0 ? decayToward50(s.connection.value) : -1 },
          direction: { ...s.direction, value: s.direction.value >= 0 ? decayToward50(s.direction.value) : -1 },
          alignment: { ...s.alignment, value: s.alignment.value >= 0 ? decayToward50(s.alignment.value) : -1 },
        };
      }
      return {};
    });
  },

  reset: () =>
    set({
      body: { ...defaultGauge },
      state: { ...defaultGauge },
      emotion: { ...defaultGauge },
      connection: { ...defaultGauge },
      direction: { ...defaultGauge },
      alignment: { ...defaultGauge },
      lastCheckInDate: null,
      crossSystemInsight: null,
      systemMode: 'capacity',
      stabilizationTriggers: [],
      centerScore: -1,
    }),
}));
