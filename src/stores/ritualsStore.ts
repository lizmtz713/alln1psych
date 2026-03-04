/**
 * Rituals Store — Pre-Flight (morning) and Post-Flight (evening) entries + settings.
 * Persisted to AsyncStorage. Used by pre-flight.tsx, post-flight.tsx, Flight Log, patterns.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PreFlightEntry,
  PostFlightEntry,
  RitualsSettings,
} from '../types/rituals';
import { DEFAULT_RITUALS_SETTINGS } from '../types/rituals';

const SETTINGS_KEY = 'ingauge_rituals_settings';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface RitualsState {
  preFlightEntries: PreFlightEntry[];
  postFlightEntries: PostFlightEntry[];
  settings: RitualsSettings;

  addPreFlight: (entry: Omit<PreFlightEntry, 'id' | 'completedAt'>) => void;
  addPostFlight: (entry: Omit<PostFlightEntry, 'id' | 'completedAt'>) => void;
  getPreFlightForDate: (date: string) => PreFlightEntry | undefined;
  getPostFlightForDate: (date: string) => PostFlightEntry | undefined;
  getTodayPreFlight: () => PreFlightEntry | undefined;
  getTodayPostFlight: () => PostFlightEntry | undefined;
  getMorningIntentionForDate: (date: string) => string | undefined;
  getPreFlightsSince: (date: string) => PreFlightEntry[];
  getPostFlightsSince: (date: string) => PostFlightEntry[];

  setSettings: (s: Partial<RitualsSettings>) => void;
  reset: () => void;
}

const defaultState = {
  preFlightEntries: [] as PreFlightEntry[],
  postFlightEntries: [] as PostFlightEntry[],
  settings: DEFAULT_RITUALS_SETTINGS,
};

export const useRitualsStore = create<RitualsState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addPreFlight: (entry) => {
        const full: PreFlightEntry = {
          ...entry,
          id: genId(),
          completedAt: new Date().toISOString(),
        };
        set((s) => ({
          preFlightEntries: [...s.preFlightEntries.filter((e) => e.date !== entry.date), full],
        }));
      },

      addPostFlight: (entry) => {
        const full: PostFlightEntry = {
          ...entry,
          id: genId(),
          completedAt: new Date().toISOString(),
        };
        set((s) => ({
          postFlightEntries: [...s.postFlightEntries.filter((e) => e.date !== entry.date), full],
        }));
      },

      getPreFlightForDate: (date) =>
        get().preFlightEntries.find((e) => e.date === date),

      getPostFlightForDate: (date) =>
        get().postFlightEntries.find((e) => e.date === date),

      getTodayPreFlight: () => get().getPreFlightForDate(today()),

      getTodayPostFlight: () => get().getPostFlightForDate(today()),

      getMorningIntentionForDate: (date) =>
        get().getPreFlightForDate(date)?.intention,

      getPreFlightsSince: (date) =>
        get().preFlightEntries.filter((e) => e.date >= date).sort((a, b) => a.date.localeCompare(b.date)),

      getPostFlightsSince: (date) =>
        get().postFlightEntries.filter((e) => e.date >= date).sort((a, b) => a.date.localeCompare(b.date)),

      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      reset: () => set(defaultState),
    } as RitualsState),
    {
      name: SETTINGS_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 365);
        const cutoffStr = cutoff.toISOString().slice(0, 10);
        return {
          settings: s.settings,
          preFlightEntries: s.preFlightEntries.filter((e) => e.date >= cutoffStr),
          postFlightEntries: s.postFlightEntries.filter((e) => e.date >= cutoffStr),
        };
      },
    }
  )
);
