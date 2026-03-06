/**
 * Sleep Insights — Store for sleep data (manual, Pre-Flight, and HealthKit cache).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SleepData, SleepQuality } from '../types/sleep';

const STORAGE_KEY = 'ingauge_sleep';
const MAX_DAYS = 365;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function now(): string {
  return new Date().toISOString();
}

/** Quality 1–5 to label */
export function sleepQualityLabel(q: SleepQuality): string {
  const labels: Record<SleepQuality, string> = {
    1: 'Rough',
    2: 'Meh',
    3: 'Okay',
    4: 'Good',
    5: 'Great',
  };
  return labels[q] ?? '—';
}

interface SleepState {
  /** By date (YYYY-MM-DD, morning-of). Manual and Pre-Flight entries; HealthKit can be merged in memory. */
  byDate: Record<string, SleepData>;
  /** Last HealthKit fetch result (in-memory or persist): date -> SleepData. Optional. */
  healthKitCache: Record<string, SleepData>;

  addManual: (date: string, hours: number, quality: SleepQuality) => void;
  addFromPreFlight: (date: string, quality: SleepQuality, hours?: number) => void;
  setHealthKitCache: (date: string, data: SleepData) => void;
  getNight: (date: string) => SleepData | undefined;
  /** Last night = today (if morning) or yesterday. */
  getLastNight: () => SleepData | undefined;
  getRecent: (days: number) => SleepData[];
  reset: () => void;
}

const defaultState = {
  byDate: {} as Record<string, SleepData>,
  healthKitCache: {} as Record<string, SleepData>,
};

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addManual: (date, hours, quality) => {
        set((s) => {
          const next = { ...s.byDate };
          next[date] = {
            date,
            hours,
            quality,
            source: 'manual',
            updatedAt: now(),
          };
          const keys = Object.keys(next).sort();
          if (keys.length > MAX_DAYS) {
            keys.slice(0, keys.length - MAX_DAYS).forEach((k) => delete next[k]);
          }
          return { byDate: next };
        });
      },

      addFromPreFlight: (date, quality, hours) => {
        set((s) => {
          const next = { ...s.byDate };
          const existing = next[date];
          const hrs = hours ?? existing?.hours ?? 0;
          next[date] = {
            date,
            hours: hrs,
            quality,
            source: 'preflight',
            updatedAt: now(),
          };
          const keys = Object.keys(next).sort();
          if (keys.length > MAX_DAYS) {
            keys.slice(0, keys.length - MAX_DAYS).forEach((k) => delete next[k]);
          }
          return { byDate: next };
        });
      },

      setHealthKitCache: (date, data) => {
        set((s) => ({
          healthKitCache: { ...s.healthKitCache, [date]: data },
        }));
      },

      getNight: (date) => {
        const s = get();
        return s.healthKitCache[date] ?? s.byDate[date];
      },

      getLastNight: () => {
        const t = today();
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yesterday = y.toISOString().slice(0, 10);
        return get().getNight(t) ?? get().getNight(yesterday);
      },

      getRecent: (days) => {
        const s = get();
        const out: SleepData[] = [];
        const d = new Date();
        for (let i = 0; i < days; i++) {
          const dateStr = d.toISOString().slice(0, 10);
          const rec = s.healthKitCache[dateStr] ?? s.byDate[dateStr];
          if (rec) out.push(rec);
          d.setDate(d.getDate() - 1);
        }
        return out.sort((a, b) => b.date.localeCompare(a.date));
      },

      reset: () => set(defaultState),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ byDate: s.byDate }),
    }
  )
);
