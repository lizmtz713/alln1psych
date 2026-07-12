import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateCrossSystemInsight } from '../services/cockpitAI';
import { recordGaugeEvent, refreshDriftCache } from '../services/systemicDrift';
import { getGaugeHistory } from '../services/crisisPipeline';
import { useCycleStore } from './cycleStore';
import { updateWidget } from '../native/WidgetBridge';

export interface GaugeState {
  value: number; // 0-100, -1 = unset/dim
  lastUpdated: string | null;
  trend: 'improving' | 'stable' | 'declining' | null;
}

export type GaugeKey = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

/** Tier 1 = highest priority (body, state, emotion); 2 = connection, direction; 3 = alignment. Used for predictive warnings. */
export const GAUGE_TIERS: Record<GaugeKey, number> = {
  body: 1,
  state: 1,
  emotion: 1,
  connection: 2,
  direction: 2,
  alignment: 3,
};

/** Capacity = normal mode; Stabilization = user asked for lower intensity / safety first */
export type SystemMode = 'capacity' | 'stabilization';

interface CockpitState {
  body: GaugeState;
  state: GaugeState;
  emotion: GaugeState;
  connection: GaugeState;
  direction: GaugeState;
  alignment: GaugeState;
  lastCheckInDate: string | null;
  /** Dates (YYYY-MM-DD) when user completed a check-in; for streak and pattern analysis. Max 400. */
  checkInDates: string[];
  /** Optional context from last check-in (sleep, social, stress) for insights. */
  checkInContext: { sleep?: string; social?: string; stressSource?: string } | null;
  /** Which gauges user said were affected (quick log / system impact). For pattern detection and actions. */
  checkInSystemImpact: GaugeKey[] | null;
  /** Which drivers (influences) user tagged. For pattern detection and actions. */
  checkInDrivers: string[] | null;
  /** Unified snapshot for AI: one blob per check-in. Set when saving quick log or full check-in. */
  lastCheckInSnapshot: {
    state: number;
    emotion: number;
    systemImpact: GaugeKey[];
    drivers: string[];
    timestamp: string;
    /** Gauge values at check-in (for Personal Strategy: outcome linkage). */
    gauges?: Partial<Record<GaugeKey, number>>;
  } | null;
  /** Last N check-in snapshots (systemImpact + drivers + gauges) for pattern insights. Max 30. */
  checkInHistory: Array<{
    timestamp: string;
    systemImpact: GaugeKey[];
    drivers: string[];
    gauges?: Partial<Record<GaugeKey, number>>;
  }>;
  /** When user taps a suggested action (for learning what helps). Max 50. Context used for personalization. */
  suggestedActionsTaken: Array<{
    actionId: string;
    route: string;
    label?: string;
    takenAt: string;
    systemImpact?: GaugeKey[];
    drivers?: string[];
    /** Gauge values at time of action (for Personal Strategy: before/after). */
    gaugesAtTime?: Partial<Record<GaugeKey, number>>;
  }>;
  /** Cached AI-generated cross-system insight; set by fetchCrossSystemInsight() */
  crossSystemInsight: string | null;
  /** Capacity vs stabilization mode (affects Share Insight, JIT lessons, etc.) */
  systemMode: SystemMode;
  /** Gauge keys that triggered stabilization mode (e.g. ['state', 'emotion']) */
  stabilizationTriggers: GaugeKey[];
  /** 0-100 overall regulation score (convenience for Share Insight); derived from gauges */
  centerScore: number;

  getOverallRegulation: () => number;
  recordGaugesForDrift: () => Promise<void>;
  updateBody: (value: number) => void;
  updateState: (value: number) => void;
  updateEmotion: (value: number) => void;
  updateConnection: (value: number) => void;
  updateDirection: (value: number) => void;
  updateAlignment: (value: number) => void;
  /** Ritual completion loop: add a small delta to a gauge (e.g. Hydrate → Body +2). Uses 50 as baseline if gauge unset. */
  addGaugeDelta: (gauge: GaugeKey, delta: number) => void;
  setBodyCheckIn: (sleep: boolean, food: boolean, water: boolean, movement: boolean) => void;
  getGaugeColor: (gauge: GaugeKey) => string;
  /** Sync getter for cached insight (use after fetchCrossSystemInsight or for initial render). */
  getCrossSystemInsight: () => string | null;
  /** Async: fetches AI insight (or fallback), stores in crossSystemInsight. Call when 3+ gauges active. */
  fetchCrossSystemInsight: () => Promise<void>;
  addLessonBonus: () => void;
  runDailyDecayIfNeeded: () => void;
  setLastCheckInDate: (date: string) => void;
  /** Set context from check-in (Sleep, Social, Stress source). */
  setCheckInContext: (ctx: { sleep?: string; social?: string; stressSource?: string } | null) => void;
  /** Set which gauges were reported affected (quick log). */
  setCheckInSystemImpact: (gauges: GaugeKey[] | null) => void;
  /** Set which drivers were tagged (quick log). */
  setCheckInDrivers: (driverIds: string[] | null) => void;
  /** Set unified check-in snapshot (state, emotion, systemImpact, drivers, timestamp, gauges) for AI analysis. */
  setLastCheckInSnapshot: (snapshot: {
    state: number;
    emotion: number;
    systemImpact: GaugeKey[];
    drivers: string[];
    timestamp: string;
    gauges?: Partial<Record<GaugeKey, number>>;
  } | null) => void;
  /** Record when user tapped a suggested action (for future insight learning). Pass context and gaugesAtTime for personalization/strategy. */
  recordSuggestedActionTaken: (payload: {
    actionId: string;
    route: string;
    label?: string;
    systemImpact?: GaugeKey[] | null;
    drivers?: string[] | null;
    gaugesAtTime?: Partial<Record<GaugeKey, number>> | null;
  }) => void;
  /** Consecutive days with check-in ending today. Rewards consistency; never punishes missed days. */
  getCheckInStreak: () => number;
  /** Sync Body gauge from Apple Health data */
  syncBodyFromHealth: () => void;
  /** Data source for Body gauge (for BiometricIndicator) */
  bodyDataSource: 'oura' | 'apple_health' | null;
  /** Data source for State gauge */
  stateDataSource: 'oura' | 'apple_health' | null;
  setBodyDataSource: (source: 'oura' | 'apple_health' | null) => void;
  setStateDataSource: (source: 'oura' | 'apple_health' | null) => void;
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

export const useCockpitStore = create<CockpitState>()(
  persist(
    (set, get) => ({
  body: { ...defaultGauge },
  state: { ...defaultGauge },
  emotion: { ...defaultGauge },
  connection: { ...defaultGauge },
  direction: { ...defaultGauge },
  alignment: { ...defaultGauge },
  lastCheckInDate: null,
  checkInDates: [],
  checkInContext: null,
  checkInSystemImpact: null,
  checkInDrivers: null,
  lastCheckInSnapshot: null,
  checkInHistory: [],
  suggestedActionsTaken: [],
  crossSystemInsight: null,
  systemMode: 'capacity' as SystemMode,
  stabilizationTriggers: [],
  centerScore: 0,

  getOverallRegulation: () => {
    const s = get();
    const gauges = [s.body, s.state, s.emotion, s.connection, s.direction, s.alignment];
    const active = gauges.filter((g) => g.value >= 0);
    if (active.length === 0) return -1;
    return Math.round(active.reduce((sum, g) => sum + g.value, 0) / active.length);
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

  addGaugeDelta: (gauge, delta) => {
    const s = get();
    const g = s[gauge];
    const current = g.value >= 0 ? g.value : 50;
    const next = clamp(current + delta);
    const updaters: Record<GaugeKey, (v: number) => void> = {
      body: get().updateBody,
      state: get().updateState,
      emotion: get().updateEmotion,
      connection: get().updateConnection,
      direction: get().updateDirection,
      alignment: get().updateAlignment,
    };
    updaters[gauge](next);
  },

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
    
    // Get health data: merged HealthKit + Oura when both available (see docs/WEARABLE-DATA-AUDIT.md)
    let healthData;
    try {
      const healthStore = require('./healthStore').useHealthStore.getState();
      const snapshot = healthStore.snapshot;
      const { getCachedOuraData } = require('../services/ouraIntegration');
      const { buildAggregatedHealthContext } = require('../services/healthData');
      const ouraSnapshot = await getCachedOuraData();
      healthData = buildAggregatedHealthContext(snapshot ?? null, ouraSnapshot ?? null);
      if (!healthData && snapshot) {
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
      // Health store or Oura not available
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

    // Resolve check-in drivers and system impact for AI (driver-aware insights)
    let driverContext: { driverLabels: string[]; systemImpactLabels: string[] } | undefined;
    if (s.checkInDrivers?.length || s.checkInSystemImpact?.length) {
      const { ALL_DRIVERS } = require('../data/driversByGauge');
      const { GAUGE_CONFIG } = require('../utils/gaugeHelpers');
      const driverLabels =
        (s.checkInDrivers ?? [])
          .map((id: string) => ALL_DRIVERS.find((d: { id: string; label: string }) => d.id === id)?.label)
          .filter(Boolean) as string[];
      const systemImpactLabels =
        (s.checkInSystemImpact ?? []).map((key: GaugeKey) => GAUGE_CONFIG[key]?.label ?? key);
      if (driverLabels.length || systemImpactLabels.length) {
        driverContext = { driverLabels, systemImpactLabels };
      }
    }

    try {
      const insight = await generateCrossSystemInsight(gauges, healthData, spotifyData, weatherData, driverContext);
      set({ crossSystemInsight: insight });
    } catch (err) {
      if (__DEV__) console.warn('[Cockpit] AI insight unavailable', err);
      set({ crossSystemInsight: 'Your system snapshot is updated. Small steps count.' });
    }
  },

  setLastCheckInDate: (date) =>
    set((s) => {
      const dates = s.checkInDates.includes(date)
        ? s.checkInDates
        : [date, ...s.checkInDates].slice(0, 400);
      return { lastCheckInDate: date, checkInDates: dates };
    }),

  setCheckInContext: (ctx) => set({ checkInContext: ctx }),
  setCheckInSystemImpact: (gauges) => set({ checkInSystemImpact: gauges }),
  setCheckInDrivers: (driverIds) => set({ checkInDrivers: driverIds }),
  setLastCheckInSnapshot: (snapshot) =>
    set((s) => {
      const history = snapshot
        ? [{
            timestamp: snapshot.timestamp,
            systemImpact: snapshot.systemImpact,
            drivers: snapshot.drivers,
            gauges: snapshot.gauges,
          }, ...s.checkInHistory].slice(0, 30)
        : s.checkInHistory;
      return { lastCheckInSnapshot: snapshot, checkInHistory: history };
    }),

  recordSuggestedActionTaken: (payload) =>
    set((s) => {
      const entry = {
        actionId: payload.actionId,
        route: payload.route,
        label: payload.label,
        takenAt: new Date().toISOString(),
        systemImpact: payload.systemImpact ?? undefined,
        drivers: payload.drivers ?? undefined,
        gaugesAtTime: payload.gaugesAtTime ?? undefined,
      };
      const next = [entry, ...s.suggestedActionsTaken].slice(0, 50);
      return { suggestedActionsTaken: next };
    }),

  getCheckInStreak: () => {
    const dateSet = new Set(get().checkInDates);
    if (dateSet.size === 0) return 0;
    const d = new Date();
    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const key = d.toISOString().slice(0, 10);
      if (dateSet.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  },

  /** Record current gauges for systemic drift analysis. Call after check-ins. */
  recordGaugesForDrift: async () => {
    const state = useCockpitStore.getState();
    const gauges: Array<{ key: GaugeKey; value: number }> = [
      { key: 'body', value: state.body.value },
      { key: 'state', value: state.state.value },
      { key: 'emotion', value: state.emotion.value },
      { key: 'connection', value: state.connection.value },
      { key: 'direction', value: state.direction.value },
      { key: 'alignment', value: state.alignment.value },
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
    
    // Update home screen widget
    const state2 = useCockpitStore.getState();
    updateWidget({
      body: state2.body.value >= 0 ? state2.body.value : null,
      state: state2.state.value >= 0 ? state2.state.value : null,
      emotion: state2.emotion.value >= 0 ? state2.emotion.value : null,
      connection: state2.connection.value >= 0 ? state2.connection.value : null,
      direction: state2.direction.value >= 0 ? state2.direction.value : null,
      alignment: state2.alignment.value >= 0 ? state2.alignment.value : null,
      lastCheckIn: new Date().toISOString(),
      insight: state2.crossSystemInsight,
    });
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

  bodyDataSource: null as 'oura' | 'apple_health' | null,
  stateDataSource: null as 'oura' | 'apple_health' | null,

  setBodyDataSource: (source) => set({ bodyDataSource: source }),
  setStateDataSource: (source) => set({ stateDataSource: source }),

  syncBodyFromHealth: () => {
    try {
      const healthStore = require('./healthStore').useHealthStore.getState();
      const bodyScore = healthStore.bodyScoreFromHealth;
      if (bodyScore !== null && bodyScore !== undefined) {
        get().updateBody(bodyScore);
        set({ bodyDataSource: 'apple_health' });
        // Also update State if HRV data available
        const stateContribution = healthStore.stateContributionFromHealth;
        if (stateContribution !== null && stateContribution !== undefined) {
          const currentState = get().state.value;
          if (currentState < 0) {
            get().updateState(stateContribution);
          }
          set({ stateDataSource: 'apple_health' });
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
    set((s) => {
      const next = {
        body: { ...defaultGauge },
        state: { ...defaultGauge },
        emotion: { ...defaultGauge },
        connection: { ...defaultGauge },
        direction: { ...defaultGauge },
        alignment: { ...defaultGauge },
        lastCheckInDate: null,
        checkInDates: s.checkInDates,
        checkInContext: null,
        checkInSystemImpact: null,
        checkInDrivers: null,
        lastCheckInSnapshot: null,
        checkInHistory: s.checkInHistory,
        suggestedActionsTaken: s.suggestedActionsTaken,
        crossSystemInsight: null,
        systemMode: 'capacity' as SystemMode,
        stabilizationTriggers: [] as GaugeKey[],
        centerScore: 0,
        bodyDataSource: null,
        stateDataSource: null,
      };
      return next;
    }),
}),
    {
      name: 'cockpit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Check-in fields are server-owned via mood_checkins + useCockpitMoodHydration.
        // Do not rehydrate them from AsyncStorage on reopen (avoids cross-account bleed).
        body: state.body,
        state: state.state,
        emotion: state.emotion,
        connection: state.connection,
        direction: state.direction,
        alignment: state.alignment,
        suggestedActionsTaken: state.suggestedActionsTaken,
        systemMode: state.systemMode,
        stabilizationTriggers: state.stabilizationTriggers,
        centerScore: state.centerScore,
        bodyDataSource: state.bodyDataSource,
        stateDataSource: state.stateDataSource,
      }),
    }
  )
);

/** Compute system mode from current gauge values; call when gauges change. Sets stabilization if any gauge is below threshold. */
const STABILIZATION_THRESHOLD = 35;
export function computeSystemMode(): void {
  const state = useCockpitStore.getState();
  const triggers: GaugeKey[] = [];
  const keys: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  for (const k of keys) {
    if (state[k].value >= 0 && state[k].value < STABILIZATION_THRESHOLD) triggers.push(k);
  }
  useCockpitStore.setState({
    systemMode: triggers.length > 0 ? 'stabilization' : 'capacity',
    stabilizationTriggers: triggers,
  });
}
