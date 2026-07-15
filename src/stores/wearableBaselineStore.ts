import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CanonicalHealthDay } from '../types/canonicalHealth';

export type WearableDailySample = {
  date: string;
  sleepHours: number | null;
  hrvMs: number | null;
  restingHeartRate: number | null;
  recoveryScore: number | null;
  sources: CanonicalHealthDay['sources'];
};

type WearableBaselineState = {
  samples: WearableDailySample[];
  recordCanonicalDay: (day: CanonicalHealthDay) => void;
  clear: () => void;
};

/**
 * Keeps only a small, derived 30-day physiology history on device. Raw HealthKit
 * samples and audio never enter this store. This is enough to compare a person
 * with their own recent pattern without comparing them with population norms.
 */
export const useWearableBaselineStore = create<WearableBaselineState>()(
  persist(
    (set) => ({
      samples: [],
      recordCanonicalDay: (day) =>
        set((state) => {
          const sample: WearableDailySample = {
            date: day.date,
            sleepHours: day.physiology.sleepDurationHours,
            hrvMs: day.physiology.hrvMs,
            restingHeartRate: day.physiology.restingHeartRate,
            recoveryScore: day.physiology.recoveryScore,
            sources: day.sources,
          };
          return {
            samples: [sample, ...state.samples.filter((item) => item.date !== sample.date)]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 30),
          };
        }),
      clear: () => set({ samples: [] }),
    }),
    {
      name: 'wearable-baseline-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ samples: state.samples }),
    }
  )
);

