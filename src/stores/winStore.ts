/**
 * Win Capture — Persist small wins for growth tracking and Insight Engine.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GaugeKey } from './cockpitStore';

export interface Win {
  id: string;
  text: string;
  tags: string[];
  gauge: GaugeKey | null;
  createdAt: string; // ISO
}

const STORAGE_KEY = 'ingauge_wins';
const MAX_WINS = 500;

function genId(): string {
  return `win-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekStartStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

interface WinState {
  wins: Win[];
  addWin: (win: Omit<Win, 'id' | 'createdAt'>) => void;
  getWinsToday: () => Win[];
  getWinsThisWeek: () => Win[];
  getWinsSince: (dateStr: string) => Win[];
  getTotalCount: () => number;
  clearAll: () => void;
}

export const useWinStore = create<WinState>()(
  persist(
    (set, get) => ({
      wins: [],

      addWin: (win) => {
        const entry: Win = {
          ...win,
          id: genId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          wins: [entry, ...s.wins].slice(0, MAX_WINS),
        }));
      },

      getWinsToday: () => {
        const today = todayStr();
        return get().wins.filter((w) => w.createdAt.slice(0, 10) === today);
      },

      getWinsThisWeek: () => {
        const start = weekStartStr();
        return get().wins.filter((w) => w.createdAt.slice(0, 10) >= start);
      },

      getWinsSince: (dateStr) => {
        return get().wins.filter((w) => w.createdAt.slice(0, 10) >= dateStr);
      },

      getTotalCount: () => get().wins.length,

      clearAll: () => set({ wins: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ wins: s.wins }),
    }
  )
);
