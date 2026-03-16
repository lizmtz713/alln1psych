/**
 * Quick Reset tool — Tracks completed reset sessions by exercise type.
 * Used for history, streaks, and "last done" hints.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type QuickResetExerciseId =
  | 'box-breathing'
  | 'physiological-sigh'
  | '5-4-3-2-1-grounding'
  | 'cold-reset'
  | 'shake-it-out'
  | 'short-walk';

export interface ResetSession {
  id: string;
  exerciseId: QuickResetExerciseId;
  completedAt: string; // ISO
  durationSeconds: number;
}

interface ResetState {
  sessions: ResetSession[];
  addSession: (exerciseId: QuickResetExerciseId, durationSeconds: number) => void;
  getSessionsForExercise: (exerciseId: QuickResetExerciseId) => ResetSession[];
  getLastSession: (exerciseId?: QuickResetExerciseId) => ResetSession | null;
  getTotalSessions: () => number;
  clearHistory: () => void;
}

function genId(): string {
  return `reset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const MAX_SESSIONS = 200;

export const useResetStore = create<ResetState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (exerciseId, durationSeconds) => {
        const session: ResetSession = {
          id: genId(),
          exerciseId,
          completedAt: new Date().toISOString(),
          durationSeconds,
        };
        set((s) => ({
          sessions: [session, ...s.sessions].slice(0, MAX_SESSIONS),
        }));
      },

      getSessionsForExercise: (exerciseId) => {
        return get().sessions.filter((s) => s.exerciseId === exerciseId);
      },

      getLastSession: (exerciseId) => {
        const list = exerciseId
          ? get().sessions.filter((s) => s.exerciseId === exerciseId)
          : get().sessions;
        return list[0] ?? null;
      },

      getTotalSessions: () => get().sessions.length,

      clearHistory: () => set({ sessions: [] }),
    }),
    {
      name: 'ingauge_reset_sessions',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ sessions: s.sessions }),
    }
  )
);
