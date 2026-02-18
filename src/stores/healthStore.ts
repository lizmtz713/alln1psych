/**
 * Health data store
 * Caches Apple HealthKit data and manages sync
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { healthKitService, type HealthSnapshot } from '../services/healthKit';

interface HealthState {
  // Authorization
  isAvailable: boolean;
  isAuthorized: boolean;
  
  // Cached data
  snapshot: HealthSnapshot | null;
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
        if (!isAuthorized) {
          set({ syncError: 'Not authorized' });
          return;
        }

        set({ lastSyncAttempt: new Date().toISOString(), syncError: null });

        try {
          const snapshot = await healthKitService.getFullSnapshot();
          const bodyScore = healthKitService.calculateBodyScore(snapshot);
          const stateContribution = healthKitService.calculateStateContribution(snapshot);

          set({
            snapshot,
            bodyScoreFromHealth: bodyScore,
            stateContributionFromHealth: stateContribution,
            syncError: null,
          });
          
          // Auto-update cockpit gauges from health data
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
          bodyScoreFromHealth: null,
          stateContributionFromHealth: null,
          lastSyncAttempt: null,
          syncError: null,
        });
      },
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthorized: state.isAuthorized,
        snapshot: state.snapshot,
        lastSyncAttempt: state.lastSyncAttempt,
        bodyScoreFromHealth: state.bodyScoreFromHealth,
        stateContributionFromHealth: state.stateContributionFromHealth,
      }),
    }
  )
);

// Helper hook for components
export function useHealthData() {
  const snapshot = useHealthStore((s) => s.snapshot);
  const bodyScore = useHealthStore((s) => s.bodyScoreFromHealth);
  const stateContribution = useHealthStore((s) => s.stateContributionFromHealth);
  const isAuthorized = useHealthStore((s) => s.isAuthorized);
  const sync = useHealthStore((s) => s.syncHealthData);

  return {
    snapshot,
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
