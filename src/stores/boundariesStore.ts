/**
 * Boundaries tool — assessment results, boundary log, AI context.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BoundaryCategoryScore } from '../services/boundariesService';
import type { BoundaryLogEntry } from '../types/boundaries';
import { BOUNDARY_TYPES } from '../data/boundariesData';

export interface BoundariesStoreState {
  assessmentScores: BoundaryCategoryScore[] | null;
  assessmentCompletedAt: string | null;
  log: BoundaryLogEntry[];
  setAssessmentScores: (scores: BoundaryCategoryScore[]) => void;
  addLogEntry: (entry: Omit<BoundaryLogEntry, 'id' | 'date'>) => void;
  clearAssessment: () => void;
  getAIContext: () => string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useBoundariesStore = create<BoundariesStoreState>()(
  persist(
    (set, get) => ({
      assessmentScores: null,
      assessmentCompletedAt: null,
      log: [],

      setAssessmentScores: (scores) =>
        set({
          assessmentScores: scores,
          assessmentCompletedAt: new Date().toISOString(),
        }),

      addLogEntry: (entry) =>
        set((s) => ({
          log: [
            {
              ...entry,
              id: generateId(),
              date: new Date().toISOString(),
            },
            ...s.log,
          ].slice(0, 100), // keep last 100
        })),

      clearAssessment: () => set({ assessmentScores: null, assessmentCompletedAt: null }),

      getAIContext: () => {
        const { assessmentScores, log } = get();
        if (!assessmentScores?.length) return '';
        const types = BOUNDARY_TYPES;
        const weak = assessmentScores.filter((c) => c.average > 0 && c.average < 3).map((c) => c.label);
        const strong = assessmentScores.filter((c) => c.average >= 4).map((c) => c.label);
        let ctx = `User did a boundaries self-assessment. `;
        if (strong.length) ctx += `They feel stronger in: ${strong.join(', ')}. `;
        if (weak.length) ctx += `They want to grow in: ${weak.join(', ')}. `;
        if (log.length > 0) ctx += `They've been practicing boundary-setting (${log.length} log entries). `;
        ctx += `When discussing limits, guilt, or people-pleasing, tailor support to boundaries (Tawwab, Cloud & Townsend).`;
        return ctx;
      },
    }),
    {
      name: 'boundaries-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
