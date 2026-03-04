/**
 * Attraction tool — pattern assessment result and AI context.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AttractionPatternScores } from '../types/attraction';
import { getInsightSummary } from '../services/attractionService';

export interface AttractionStoreState {
  lastScores: AttractionPatternScores | null;
  completedAt: string | null;
  setAssessmentResult: (scores: AttractionPatternScores) => void;
  clearAssessment: () => void;
  getAIContext: () => string;
}

export const useAttractionStore = create<AttractionStoreState>()(
  persist(
    (set, get) => ({
      lastScores: null,
      completedAt: null,

      setAssessmentResult: (scores) =>
        set({
          lastScores: scores,
          completedAt: new Date().toISOString(),
        }),

      clearAssessment: () => set({ lastScores: null, completedAt: null }),

      getAIContext: () => {
        const { lastScores } = get();
        if (!lastScores) return '';
        const { dominant, label, tip } = getInsightSummary(lastScores);
        return `User completed the "How Attraction Works" pattern assessment. Dominant pattern: ${label}. Scores — anxious: ${lastScores.anxious}, avoidant: ${lastScores.avoidant}, healthy: ${lastScores.healthy}, intensity: ${lastScores.intensity}. Insight: ${tip} When discussing attraction, relationships, or "spark," reference Helen Fisher (brain chemistry), attachment theory, and the difference between anxiety-driven "chemistry" and secure attachment.`;
      },
    }),
    {
      name: 'attraction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
