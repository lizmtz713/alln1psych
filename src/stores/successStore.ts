/**
 * Success Log store — gauge snapshots, success entries, interaction correlations,
 * and analysis (effectiveness per person, what works).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GaugeKey,
  GaugeSnapshot,
  GaugeSnapshotValue,
  SuccessLogEntry,
  InteractionCorrelation,
} from '../types/relationalMemory';

const GAUGE_KEYS: GaugeKey[] = [
  'body',
  'state',
  'emotion',
  'connection',
  'direction',
  'alignment',
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toSnapshotValue(value: number, at: string): GaugeSnapshotValue {
  return { value, at };
}

/** Effectiveness for a specific circle member */
export interface EffectivenessForPerson {
  circleMemberId: string;
  entryCount: number;
  correlationCount: number;
  averageOverallDelta: number | null;
  averageGaugeDeltas: Partial<Record<GaugeKey, number>>;
}

/** What works: activity type or person summary */
export interface WhatWorksItem {
  type: 'by_activity' | 'by_person';
  label: string;
  key: string; // interactionType or circleMemberId
  count: number;
  averageOverallDelta: number;
}

interface SuccessState {
  gaugeSnapshots: GaugeSnapshot[];
  successEntries: SuccessLogEntry[];
  interactionCorrelations: InteractionCorrelation[];

  /** Capture current cockpit gauges into a snapshot; returns snapshot id or null if no user. */
  captureGaugeSnapshot: () => string | null;
  /** Add a success log entry; optionally link a snapshot (e.g. from captureGaugeSnapshot). */
  addSuccessEntry: (
    params: Omit<SuccessLogEntry, 'id' | 'userId' | 'createdAt'> & {
      userId: string;
      createdAt?: string;
      gaugeSnapshotId?: string;
    }
  ) => SuccessLogEntry;
  /** Record a before/after correlation (e.g. after conversation, gauges improved). */
  addInteractionCorrelation: (
    params: Omit<InteractionCorrelation, 'id' | 'userId' | 'at'> & {
      userId: string;
      at?: string;
    }
  ) => InteractionCorrelation;
  /** Get effectiveness metrics for a circle member. */
  getEffectivenessForPerson: (circleMemberId: string) => EffectivenessForPerson;
  /** Get what activities/people tend to improve gauges. */
  getWhatWorks: () => WhatWorksItem[];
  /** Get snapshot by id. */
  getSnapshot: (id: string) => GaugeSnapshot | undefined;
  /** Clear all data (e.g. on sign out). */
  reset: () => void;
}

const initialState = {
  gaugeSnapshots: [] as GaugeSnapshot[],
  successEntries: [] as SuccessLogEntry[],
  interactionCorrelations: [] as InteractionCorrelation[],
};

export const useSuccessStore = create<SuccessState>()(
  persist(
    (set, get) => ({
      ...initialState,

      captureGaugeSnapshot: () => {
        const { useAuthStore } = require('./authStore');
        const { useCockpitStore } = require('./cockpitStore');
        const userId = useAuthStore.getState().userId;
        if (!userId) return null;

        const cockpit = useCockpitStore.getState();
        const at = new Date().toISOString();

        const toVal = (g: { value: number; lastUpdated: string | null }) =>
          toSnapshotValue(g.value, g.lastUpdated ?? at);

        const snapshot: GaugeSnapshot = {
          id: generateId(),
          userId,
          at,
          body: toVal(cockpit.body),
          state: toVal(cockpit.state),
          emotion: toVal(cockpit.emotion),
          connection: toVal(cockpit.connection),
          direction: toVal(cockpit.direction),
          alignment: toVal(cockpit.alignment),
          overall: cockpit.getOverallRegulation(),
        };

        set((s) => ({
          gaugeSnapshots: [...s.gaugeSnapshots, snapshot],
        }));
        return snapshot.id;
      },

      addSuccessEntry: (params) => {
        const createdAt = params.createdAt ?? new Date().toISOString();
        const entry: SuccessLogEntry = {
          ...params,
          id: generateId(),
          userId: params.userId,
          createdAt,
          gaugeSnapshotId: params.gaugeSnapshotId,
        };
        set((s) => ({
          successEntries: [...s.successEntries, entry],
        }));
        return entry;
      },

      addInteractionCorrelation: (params) => {
        const at = params.at ?? new Date().toISOString();
        const correlation: InteractionCorrelation = {
          ...params,
          id: generateId(),
          userId: params.userId,
          at,
        };
        set((s) => ({
          interactionCorrelations: [...s.interactionCorrelations, correlation],
        }));
        return correlation;
      },

      getEffectivenessForPerson: (circleMemberId: string) => {
        const { gaugeSnapshots, successEntries, interactionCorrelations } =
          get();
        const entries = successEntries.filter(
          (e) => e.circleMemberId === circleMemberId
        );
        const correlations = interactionCorrelations.filter(
          (c) => c.circleMemberId === circleMemberId
        );

        const deltas: { overall: number; gauges: Partial<Record<GaugeKey, number>> }[] = [];
        for (const c of correlations) {
          const before = gaugeSnapshots.find(
            (s) => s.id === c.gaugeSnapshotBeforeId
          );
          const after = gaugeSnapshots.find(
            (s) => s.id === c.gaugeSnapshotAfterId
          );
          if (!before || !after) continue;
          const overallDelta =
            after.overall >= 0 && before.overall >= 0
              ? after.overall - before.overall
              : 0;
          const gauges: Partial<Record<GaugeKey, number>> = {};
          for (const k of GAUGE_KEYS) {
            const b = before[k].value;
            const a = after[k].value;
            if (b >= 0 && a >= 0) gauges[k] = a - b;
          }
          deltas.push({ overall: overallDelta, gauges });
        }

        const count = deltas.length;
        const averageOverallDelta =
          count > 0
            ? deltas.reduce((s, d) => s + d.overall, 0) / count
            : null;
        const averageGaugeDeltas: Partial<Record<GaugeKey, number>> = {};
        for (const k of GAUGE_KEYS) {
          const values = deltas
            .map((d) => d.gauges[k])
            .filter((v): v is number => typeof v === 'number');
          if (values.length > 0)
            averageGaugeDeltas[k] =
              values.reduce((a, b) => a + b, 0) / values.length;
        }

        return {
          circleMemberId,
          entryCount: entries.length,
          correlationCount: count,
          averageOverallDelta,
          averageGaugeDeltas,
        };
      },

      getWhatWorks: () => {
        const { gaugeSnapshots, interactionCorrelations } = get();
        const byType: Record<string, { sum: number; count: number }> = {};
        const byPerson: Record<string, { sum: number; count: number }> = {};

        for (const c of interactionCorrelations) {
          const before = gaugeSnapshots.find(
            (s) => s.id === c.gaugeSnapshotBeforeId
          );
          const after = gaugeSnapshots.find(
            (s) => s.id === c.gaugeSnapshotAfterId
          );
          if (!before || !after) continue;
          const delta =
            after.overall >= 0 && before.overall >= 0
              ? after.overall - before.overall
              : 0;

          byType[c.interactionType] = byType[c.interactionType] ?? {
            sum: 0,
            count: 0,
          };
          byType[c.interactionType].sum += delta;
          byType[c.interactionType].count += 1;

          if (c.circleMemberId) {
            byPerson[c.circleMemberId] = byPerson[c.circleMemberId] ?? {
              sum: 0,
              count: 0,
            };
            byPerson[c.circleMemberId].sum += delta;
            byPerson[c.circleMemberId].count += 1;
          }
        }

        const typeLabels: Record<string, string> = {
          conversation: 'Conversations',
          reach_out: 'Reach-outs',
          journal_about: 'Journaling about',
          activity: 'Activities',
          other: 'Other',
        };

        const result: WhatWorksItem[] = [];
        for (const [key, { sum, count }] of Object.entries(byType)) {
          result.push({
            type: 'by_activity',
            label: typeLabels[key] ?? key,
            key,
            count,
            averageOverallDelta: sum / count,
          });
        }
        for (const [key, { sum, count }] of Object.entries(byPerson)) {
          result.push({
            type: 'by_person',
            label: key, // caller can resolve to name via circleStore
            key,
            count,
            averageOverallDelta: sum / count,
          });
        }
        return result.sort((a, b) => b.averageOverallDelta - a.averageOverallDelta);
      },

      getSnapshot: (id: string) => get().gaugeSnapshots.find((s) => s.id === id),

      reset: () => set(initialState),
    }),
    {
      name: 'success-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gaugeSnapshots: state.gaugeSnapshots,
        successEntries: state.successEntries,
        interactionCorrelations: state.interactionCorrelations,
      }),
    }
  )
);
