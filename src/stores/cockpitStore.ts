import { create } from 'zustand';
import { generateCrossSystemInsight } from '../services/cockpitAI';

export interface GaugeState {
  value: number; // 0-100, -1 = unset/dim
  lastUpdated: string | null;
  trend: 'improving' | 'stable' | 'declining' | null;
}

export type GaugeKey = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

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

  getOverallRegulation: () => number;
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
  runDailyDecayIfNeeded: () => void;
  setLastCheckInDate: (date: string) => void;
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

export const useCockpitStore = create<CockpitState>((set, get) => ({
  body: { ...defaultGauge },
  state: { ...defaultGauge },
  emotion: { ...defaultGauge },
  connection: { ...defaultGauge },
  direction: { ...defaultGauge },
  alignment: { ...defaultGauge },
  lastCheckInDate: null,
  crossSystemInsight: null,

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
    const insight = await generateCrossSystemInsight(gauges);
    set({ crossSystemInsight: insight });
  },

  setLastCheckInDate: (date) => set({ lastCheckInDate: date }),

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
    }),
}));
