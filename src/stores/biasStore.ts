/**
 * Bias Detector — Store for bias check history and patterns.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BiasCheckEntry, DetectedBias } from '../types/bias';

const STORAGE_KEY = 'ingauge_bias';
const MAX_ENTRIES = 100;

function genId(): string {
  return `bias-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const now = () => new Date().toISOString();

interface BiasState {
  entries: BiasCheckEntry[];

  addEntry: (inputText: string, detected: DetectedBias[]) => string;
  getEntries: () => BiasCheckEntry[];
  getEntry: (id: string) => BiasCheckEntry | undefined;
  deleteEntry: (id: string) => void;
  reset: () => void;
}

export const useBiasStore = create<BiasState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (inputText, detected) => {
        const id = genId();
        const entry: BiasCheckEntry = {
          id,
          inputText,
          detected,
          createdAt: now(),
        };
        set((s) => ({
          entries: [entry, ...s.entries].slice(0, MAX_ENTRIES),
        }));
        return id;
      },

      getEntries: () => get().entries,
      getEntry: (id) => get().entries.find((e) => e.id === id),
      deleteEntry: (id) =>
        set((s) => ({
          entries: s.entries.filter((e) => e.id !== id),
        })),

      reset: () => set({ entries: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ entries: s.entries }),
    }
  )
);
