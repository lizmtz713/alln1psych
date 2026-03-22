/**
 * Difficult People tool — assessment result, AI context, safety.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DifficultPersonTypeId } from '../types/difficultPeople';
import type { DifficultPersonTypeScore } from '../services/difficultPeopleService';
import { DIFFICULT_PERSON_TYPES } from '../data/difficultPeopleData';

export interface DifficultPeopleStoreState {
  lastScores: DifficultPersonTypeScore[] | null;
  topTypeIds: DifficultPersonTypeId[];
  completedAt: string | null;
  setAssessmentResult: (scores: DifficultPersonTypeScore[], topTypeIds: DifficultPersonTypeId[]) => void;
  clearAssessment: () => void;
  getAIContext: () => string;
}

export const useDifficultPeopleStore = create<DifficultPeopleStoreState>()(
  persist(
    (set, get) => ({
      lastScores: null,
      topTypeIds: [],
      completedAt: null,

      setAssessmentResult: (scores, topTypeIds) =>
        set({
          lastScores: scores,
          topTypeIds,
          completedAt: new Date().toISOString(),
        }),

      clearAssessment: () => set({ lastScores: null, topTypeIds: [], completedAt: null }),

      getAIContext: () => {
        const { topTypeIds } = get();
        if (!topTypeIds.length) return '';
        const types = DIFFICULT_PERSON_TYPES;
        const names = topTypeIds.map((id) => types.find((t) => t.id === id)?.label ?? id).join(', ");
        return `User completed the \"Difficult People\" type identifier. Top types that may fit their situation: ${names}. When giving advice, use strategies like Grey Rock, Don't JADE, Broken Record, and \"when to walk away.\" If they describe danger (abuse, threats, safety), prioritize crisis resources (988, DV hotline) and safety. Science: Dr. Ramani, George Simon, Stern (Gaslight Effect), Cloud & Townsend.`;
      },
    }),
    {
      name: "difficult-people-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
