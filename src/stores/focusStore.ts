/**
 * Focus Tool — Stores focus timer sessions and attention exercise completions.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FocusSession, FocusExerciseSession, FocusExerciseId } from '../types/focus';

const STORAGE_KEY = 'ingauge_focus';
const MAX_SESSIONS = 100;
const MAX_EXERCISE_SESSIONS = 200;

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface FocusState {
  sessions: FocusSession[];
  exerciseSessions: FocusExerciseSession[];

  addSession: (durationMinutes: number, completedSeconds?: number) => void;
  addExerciseSession: (exerciseId: FocusExerciseId, durationSeconds: number) => void;
  getSessions: () => FocusSession[];
  getExerciseSessions: (exerciseId?: FocusExerciseId) => FocusExerciseSession[];
  getLastSession: () => FocusSession | null;
  getLastExerciseSession: (exerciseId?: FocusExerciseId) => FocusExerciseSession | null;
  getTotalFocusMinutes: () => number;
  clearHistory: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      sessions: [],
      exerciseSessions: [],

      addSession: (durationMinutes, completedSeconds) => {
        const session: FocusSession = {
          id: genId('focus'),
          durationMinutes,
          completedAt: new Date().toISOString(),
          completedSeconds,
        };
        set((s) => ({
          sessions: [session, ...s.sessions].slice(0, MAX_SESSIONS),
        }));
      },

      addExerciseSession: (exerciseId, durationSeconds) => {
        const session: FocusExerciseSession = {
          id: genId('focus-ex'),
          exerciseId,
          completedAt: new Date().toISOString(),
          durationSeconds,
        };
        set((s) => ({
          exerciseSessions: [session, ...s.exerciseSessions].slice(0, MAX_EXERCISE_SESSIONS),
        }));
      },

      getSessions: () => get().sessions,
      getExerciseSessions: (exerciseId) => {
        const list = get().exerciseSessions;
        return exerciseId ? list.filter((s) => s.exerciseId === exerciseId) : list;
      },
      getLastSession: () => get().sessions[0] ?? null,
      getLastExerciseSession: (exerciseId) => {
        const list = get().exerciseSessions;
        const filtered = exerciseId ? list.filter((s) => s.exerciseId === exerciseId) : list;
        return filtered[0] ?? null;
      },
      getTotalFocusMinutes: () => {
        return get().sessions.reduce((sum, s) => sum + (s.completedSeconds ?? s.durationMinutes * 60) / 60, 0);
      },
      clearHistory: () => set({ sessions: [], exerciseSessions: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ sessions: s.sessions, exerciseSessions: s.exerciseSessions }),
    }
  )
);
