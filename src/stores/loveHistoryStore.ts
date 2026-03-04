/**
 * Love History — local-only store for relationship entries and patterns.
 * Persisted to AsyncStorage. Not synced to cloud.
 * See docs/ingauge-LOVE-HISTORY-FEATURE.md.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  RelationshipEntry,
  LovePattern,
  LoveHistoryStats,
  CurrentStatus,
} from '../types/loveHistory';

const STORAGE_KEY = 'ingauge_love_history';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function computeDurationMonths(start: string, end: string | null): number | null {
  if (!end) return null;
  const a = new Date(start);
  const b = new Date(end);
  if (b < a) return null;
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function computeStats(entries: RelationshipEntry[]): LoveHistoryStats {
  let longestMonths = 0;
  let marriages = 0;
  const sorted = [...entries].sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
  const mostRecent = sorted[0];

  for (const e of entries) {
    const months =
      e.durationMonths ?? (e.endDate ? computeDurationMonths(e.startDate, e.endDate) : null);
    if (months != null && months > longestMonths) longestMonths = months;
    if (e.type === 'married') marriages++;
  }

  let currentStatus: CurrentStatus = 'unknown';
  if (mostRecent) {
    if (mostRecent.endDate == null) currentStatus = 'in-relationship';
    else currentStatus = 'single';
  }

  return {
    total: entries.length,
    longestMonths,
    marriages,
    currentStatus,
  };
}

interface LoveHistoryState {
  entries: RelationshipEntry[];
  patterns: LovePattern[];
  /** User-set current status override (optional) */
  currentStatusOverride: CurrentStatus | null;

  addEntry: (entry: Omit<RelationshipEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, patch: Partial<RelationshipEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => RelationshipEntry | undefined;
  getEntriesSorted: () => RelationshipEntry[];

  addPattern: (pattern: Omit<LovePattern, 'id' | 'createdAt'>) => void;
  updatePattern: (id: string, patch: Partial<LovePattern>) => void;
  deletePattern: (id: string) => void;

  getStats: () => LoveHistoryStats;
  setCurrentStatusOverride: (status: CurrentStatus | null) => void;

  reset: () => void;
}

const defaultState = {
  entries: [] as RelationshipEntry[],
  patterns: [] as LovePattern[],
  currentStatusOverride: null as CurrentStatus | null,
};

export const useLoveHistoryStore = create<LoveHistoryState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addEntry: (entry) => {
        const id = genId();
        const createdAt = now();
        const durationMonths =
          entry.durationMonths ??
          (entry.endDate ? computeDurationMonths(entry.startDate, entry.endDate) : null);
        const full: RelationshipEntry = {
          ...entry,
          id,
          durationMonths,
          createdAt,
          updatedAt: createdAt,
        };
        set((s) => ({ entries: [full, ...s.entries] }));
      },

      updateEntry: (id, patch) => {
        const updatedAt = now();
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...patch,
                  updatedAt,
                  durationMonths:
                    patch.durationMonths ??
                    (patch.endDate !== undefined || patch.startDate !== undefined
                      ? computeDurationMonths(
                          patch.startDate ?? e.startDate,
                          patch.endDate !== undefined ? patch.endDate : e.endDate
                        )
                      : e.durationMonths),
                }
              : e
          ),
        }));
      },

      deleteEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      getEntry: (id) => get().entries.find((e) => e.id === id),

      getEntriesSorted: () =>
        [...get().entries].sort((a, b) => (b.startDate > a.startDate ? 1 : -1)),

      addPattern: (pattern) => {
        const full: LovePattern = {
          ...pattern,
          id: genId(),
          createdAt: now(),
        };
        set((s) => ({ patterns: [full, ...s.patterns] }));
      },

      updatePattern: (id, patch) =>
        set((s) => ({
          patterns: s.patterns.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deletePattern: (id) => set((s) => ({ patterns: s.patterns.filter((p) => p.id !== id) })),

      getStats: () => {
        const s = get();
        const stats = computeStats(s.entries);
        if (s.currentStatusOverride) stats.currentStatus = s.currentStatusOverride;
        return stats;
      },

      setCurrentStatusOverride: (status) => set({ currentStatusOverride: status }),

      reset: () => set(defaultState),
    } as LoveHistoryState),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
