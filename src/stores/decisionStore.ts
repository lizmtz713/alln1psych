/**
 * Decision Tool — Save and track decisions and follow-up reflections.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Decision, DecisionReflection } from '../types/decision';

const STORAGE_KEY = 'ingauge_decision';
const MAX_DECISIONS = 100;
const MAX_REFLECTIONS_PER_DECISION = 50;

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const now = () => new Date().toISOString();

interface DecisionState {
  decisions: Decision[];
  reflections: DecisionReflection[];

  addDecision: (decision: Omit<Decision, 'id' | 'createdAt'>) => string;
  updateDecision: (id: string, patch: Partial<Decision>) => void;
  getDecision: (id: string) => Decision | undefined;
  getDecisions: () => Decision[];
  deleteDecision: (id: string) => void;

  addReflection: (decisionId: string, body: string) => string;
  getReflections: (decisionId: string) => DecisionReflection[];
  reset: () => void;
}

export const useDecisionStore = create<DecisionState>()(
  persist(
    (set, get) => ({
      decisions: [],
      reflections: [],

      addDecision: (decision) => {
        const id = genId('dec');
        const full: Decision = {
          ...decision,
          id,
          createdAt: now(),
        };
        set((s) => ({
          decisions: [full, ...s.decisions].slice(0, MAX_DECISIONS),
        }));
        return id;
      },

      updateDecision: (id, patch) => {
        set((s) => ({
          decisions: s.decisions.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
      },

      getDecision: (id) => get().decisions.find((d) => d.id === id),
      getDecisions: () => get().decisions,
      deleteDecision: (id) =>
        set((s) => ({
          decisions: s.decisions.filter((d) => d.id !== id),
          reflections: s.reflections.filter((r) => r.decisionId !== id),
        })),

      addReflection: (decisionId, body) => {
        const id = genId('refl');
        const reflection: DecisionReflection = {
          id,
          decisionId,
          body: body.trim(),
          createdAt: now(),
        };
        set((s) => {
          const refs = [reflection, ...s.reflections.filter((r) => r.decisionId === decisionId)].slice(0, MAX_REFLECTIONS_PER_DECISION);
          const other = s.reflections.filter((r) => r.decisionId !== decisionId);
          return { reflections: [...refs, ...other] };
        });
        return id;
      },

      getReflections: (decisionId) =>
        get().reflections.filter((r) => r.decisionId === decisionId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      reset: () => set({ decisions: [], reflections: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ decisions: s.decisions, reflections: s.reflections }),
    }
  )
);
