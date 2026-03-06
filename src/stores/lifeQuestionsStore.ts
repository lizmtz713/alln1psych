/**
 * The 12 Life Questions — Progress and responses.
 * Persisted for Identity Snapshot, Purpose Hypothesis, Life Blueprint, and Human Profile.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LifeQuestionId,
  LifeQuestionResponse,
  LifeQuestionExerciseResponse,
  LifeQuestionsProgress,
} from '../types/life-questions';

const STORAGE_KEY = 'ingauge_life_questions';

interface LifeQuestionsState {
  /** All responses by question id */
  responses: Partial<Record<LifeQuestionId, LifeQuestionResponse>>;
  progress: LifeQuestionsProgress;

  getResponse: (questionId: LifeQuestionId) => LifeQuestionResponse | undefined;
  setExerciseResponse: (
    questionId: LifeQuestionId,
    exerciseId: string,
    value: string | string[] | number
  ) => void;
  setReflection: (questionId: LifeQuestionId, reflection: string) => void;
  markStarted: (questionId: LifeQuestionId) => void;
  markCompleted: (questionId: LifeQuestionId) => void;
  isCompleted: (questionId: LifeQuestionId) => boolean;
  completedCount: () => number;
  getAllResponses: () => LifeQuestionResponse[];
  reset: () => void;
}

const defaultProgress: LifeQuestionsProgress = {
  completed: {},
  started: {},
};

function now(): string {
  return new Date().toISOString();
}

export const useLifeQuestionsStore = create<LifeQuestionsState>()(
  persist(
    (set, get) => ({
      responses: {},
      progress: defaultProgress,

      getResponse: (questionId) => get().responses[questionId],

      setExerciseResponse: (questionId, exerciseId, value) => {
        set((state) => {
          const existing = state.responses[questionId] ?? {
            questionId,
            exercises: [],
            updatedAt: now(),
          };
          const exercises = existing.exercises.filter((e) => e.exerciseId !== exerciseId);
          exercises.push({ exerciseId, value, updatedAt: now() });
          return {
            responses: {
              ...state.responses,
              [questionId]: { ...existing, exercises, updatedAt: now() },
            },
          };
        });
      },

      setReflection: (questionId, reflection) => {
        set((state) => {
          const existing = state.responses[questionId] ?? {
            questionId,
            exercises: [],
            updatedAt: now(),
          };
          return {
            responses: {
              ...state.responses,
              [questionId]: { ...existing, reflection, updatedAt: now() },
            },
          };
        });
      },

      markStarted: (questionId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            started: { ...state.progress.started, [questionId]: now() },
          },
        }));
      },

      markCompleted: (questionId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            completed: { ...state.progress.completed, [questionId]: now() },
          },
        }));
      },

      isCompleted: (questionId) => Boolean(get().progress.completed[questionId]),

      completedCount: () => Object.keys(get().progress.completed).length,

      getAllResponses: () => {
        const res = get().responses;
        return Object.values(res).filter(Boolean) as LifeQuestionResponse[];
      },

      reset: () => set({ responses: {}, progress: defaultProgress }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ responses: s.responses, progress: s.progress }),
    }
  )
);
