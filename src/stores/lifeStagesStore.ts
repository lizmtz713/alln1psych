/**
 * Life Stages — User"s optional orientation markers.
 * \"I'm here\" / \"I"ve passed" / "Preparing for this". Light, no grading.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StageMarker = 'passed' | 'here' | 'preparing';

interface LifeStagesState {
  /** stageId -> marker. Only one stage can be "here". */
  markers: Partial<Record<string, StageMarker>>;
  setMarker: (stageId: string, marker: StageMarker | null) => void;
  getMarker: (stageId: string) => StageMarker | null;
  clearMarkers: () => void;
}

const STORAGE_KEY = 'ingauge_life_stages';

export const useLifeStagesStore = create<LifeStagesState>()(
  persist(
    (set, get) => ({
      markers: {},

      setMarker: (stageId, marker) => {
        set((state) => {
          const next = { ...state.markers };
          if (marker === null) {
            delete next[stageId];
            return { markers: next };
          }
          if (marker === 'here') {
            Object.keys(next).forEach((id) => {
              if (next[id] === 'here') delete next[id];
            });
          }
          next[stageId] = marker;
          return { markers: next };
        });
      },

      getMarker: (stageId) => get().markers[stageId] ?? null,

      clearMarkers: () => set({ markers: {} }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
