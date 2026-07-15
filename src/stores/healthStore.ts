/**
 * Health data store — caches Apple HealthKit data and manages sync.
 * Feeds Body and State gauges (see docs/WEARABLES-HUMAN-OS.md for wearable → gauge mapping).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { healthKitService, type HealthSnapshot } from '../services/healthKit';
import type { NormalizedHealthSnapshot } from '../types/normalizedHealthSnapshot';
import type { CanonicalHealthDay } from '../types/canonicalHealth';
import type { OuraSnapshot } from '../services/ouraIntegration';
import { isOuraConnected, syncOuraData } from '../services/ouraIntegration';
import { healthKitToCanonical, ouraToCanonical, mergeIntoCanonicalDay, getAggregatedBodyState } from '../services/healthData';
import { useWearableBaselineStore } from './wearableBaselineStore';

interface HealthState {
  // Authorization
  isAvailable: boolean;
  isAuthorized: boolean;
  
  // Cached data
  snapshot: HealthSnapshot | null;
  /** Flat model for UI — sleep, steps, HR, HRV, workouts; prefer this for new screens. */
  normalizedSnapshot: NormalizedHealthSnapshot | null;
  canonicalDay: CanonicalHealthDay | null;
  ouraSnapshot: OuraSnapshot | null;
  lastSyncAttempt: string | null;
  syncError: string | null;
  
  // Computed scores
  bodyScoreFromHealth: number | null;
  stateContributionFromHealth: number | null;
  
  // Actions
  initialize: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  syncHealthData: () => Promise<void>;
  clearHealthData: () => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      isAvailable: false,
      isAuthorized: false,
      snapshot: null,
      normalizedSnapshot: null,
      canonicalDay: null,
      ouraSnapshot: null,
      lastSyncAttempt: null,
      syncError: null,
      bodyScoreFromHealth: null,
      stateContributionFromHealth: null,

      initialize: async () => {
        const available = await healthKitService.initialize();
        set({ isAvailable: available });
        return available;
      },

      requestPermissions: async () => {
        const { isAvailable } = get();
        if (!isAvailable) return false;

        const authorized = await healthKitService.requestAuthorization();
        set({ isAuthorized: authorized });

        if (authorized) {
          // Auto-sync after authorization
          get().syncHealthData();
        }

        return authorized;
      },

      syncHealthData: async () => {
        const { isAuthorized } = get();
        const ouraConnected = await isOuraConnected();
        if (!isAuthorized && !ouraConnected) {
          set({ syncError: 'Not authorized' });
          return;
        }

        set({ lastSyncAttempt: new Date().toISOString(), syncError: null });

        try {
          const snapshot = isAuthorized ? await healthKitService.getFullSnapshot() : null;
          const normalizedSnapshot = snapshot
            ? await healthKitService.buildNormalizedSnapshot(snapshot)
            : null;
          const ouraSnapshot = ouraConnected ? await syncOuraData() : null;
          const date = new Date().toISOString().slice(0, 10);
          const canonicalDay = mergeIntoCanonicalDay({
            date,
            healthKit: snapshot ? healthKitToCanonical(snapshot) : null,
            oura: ouraSnapshot?.connected ? ouraToCanonical(ouraSnapshot) : null,
          });
          const aggregated = getAggregatedBodyState(snapshot, ouraSnapshot, date);
          const bodyScore = aggregated.bodyScore ?? (snapshot ? healthKitService.calculateBodyScore(snapshot) : null);
          const stateContribution = aggregated.stateScore ?? (snapshot ? healthKitService.calculateStateContribution(snapshot) : null);

          useWearableBaselineStore.getState().recordCanonicalDay(canonicalDay);

          set({
            snapshot,
            normalizedSnapshot,
            canonicalDay,
            ouraSnapshot,
            bodyScoreFromHealth: bodyScore,
            stateContributionFromHealth: stateContribution,
            syncError: null,
          });

          try {
            const cockpitStore = require('./cockpitStore').useCockpitStore.getState();
            cockpitStore.syncBodyFromHealth();
          } catch (e) {
            // Cockpit store not available
          }
        } catch (e) {
          set({ syncError: (e as Error).message });
        }
      },

      clearHealthData: () => {
        set({
          snapshot: null,
          normalizedSnapshot: null,
          canonicalDay: null,
          ouraSnapshot: null,
          bodyScoreFromHealth: null,
          stateContributionFromHealth: null,
          lastSyncAttempt: null,
          syncError: null,
        });
      },
    }),
    {
      name: 'health-storage',
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<HealthState>;
        if (version < 2) {
          return {
            isAuthorized: state.isAuthorized ?? false,
            lastSyncAttempt: state.lastSyncAttempt ?? null,
          } as HealthState;
        }
        return state as HealthState;
      },
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthorized: state.isAuthorized,
        lastSyncAttempt: state.lastSyncAttempt,
      }),
    }
  )
);

// Helper hook for components
export function useHealthData() {
  const snapshot = useHealthStore((s) => s.snapshot);
  const normalizedSnapshot = useHealthStore((s) => s.normalizedSnapshot);
  const canonicalDay = useHealthStore((s) => s.canonicalDay);
  const ouraSnapshot = useHealthStore((s) => s.ouraSnapshot);
  const bodyScore = useHealthStore((s) => s.bodyScoreFromHealth);
  const stateContribution = useHealthStore((s) => s.stateContributionFromHealth);
  const isAuthorized = useHealthStore((s) => s.isAuthorized);
  const sync = useHealthStore((s) => s.syncHealthData);

  return {
    snapshot,
    normalizedSnapshot,
    canonicalDay,
    ouraSnapshot,
    bodyScore,
    stateContribution,
    isAuthorized,
    sync,
    // Convenience getters
    sleep: snapshot?.sleep ?? null,
    activity: snapshot?.activity ?? null,
    nutrition: snapshot?.nutrition ?? null,
    menstruation: snapshot?.menstruation ?? null,
    heart: snapshot?.heart ?? null,
  };
}
