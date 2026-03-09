/**
 * Goals Store — Direction areas, active goals, reflections.
 * Persisted; feeds Direction gauge and Cockpit.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ActiveGoal, GoalReflection, DirectionArea } from '../types/goals';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function weekKey(d: Date = new Date()): string {
  const start = new Date(d);
  start.setDate(start.getDate() - start.getDay());
  const y = start.getFullYear();
  const w = Math.ceil((start.getDate() + 6) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}

interface GoalsState {
  /** 1–3 life focus areas (Direction). */
  directionAreas: DirectionArea[];
  /** Active goals (max e.g. 5 to avoid overload). */
  goals: ActiveGoal[];
  /** Weekly reflections. */
  reflections: GoalReflection[];

  setDirectionAreas: (areas: DirectionArea[]) => void;
  toggleDirectionArea: (area: DirectionArea) => void;
  addGoal: (goal: Omit<ActiveGoal, 'id' | 'createdAt'>) => ActiveGoal;
  updateGoal: (id: string, patch: Partial<Omit<ActiveGoal, 'id' | 'createdAt'>>) => void;
  removeGoal: (id: string) => void;
  setGoalMomentum: (id: string, momentum: ActiveGoal['momentum']) => void;
  addReflection: (r: Omit<GoalReflection, 'reflectedAt'>) => void;
  getReflectionsForGoal: (goalId: string) => GoalReflection[];
  /** For Cockpit: one goal to nudge today (e.g. by rotation or momentum). */
  getGoalForTodayNudge: () => ActiveGoal | null;
}

const MAX_DIRECTION_AREAS = 3;
const MAX_GOALS = 8;

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      directionAreas: [],
      goals: [],
      reflections: [],

      setDirectionAreas: (areas) =>
        set({ directionAreas: areas.slice(0, MAX_DIRECTION_AREAS) }),

      toggleDirectionArea: (area) =>
        set((s) => {
          const next = s.directionAreas.includes(area)
            ? s.directionAreas.filter((a) => a !== area)
            : [...s.directionAreas, area].slice(0, MAX_DIRECTION_AREAS);
          return { directionAreas: next };
        }),

      addGoal: (goal) => {
        const id = genId();
        const created: ActiveGoal = {
          ...goal,
          id,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          goals: [...s.goals, created].slice(-MAX_GOALS),
        }));
        return created;
      },

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      setGoalMomentum: (id, momentum) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, momentum } : g)),
        })),

      addReflection: (r) =>
        set((s) => ({
          reflections: [
            ...s.reflections,
            { ...r, reflectedAt: new Date().toISOString() },
          ],
        })),

      getReflectionsForGoal: (goalId) =>
        get().reflections.filter((r) => r.goalId === goalId),

      getGoalForTodayNudge: () => {
        const { goals } = get();
        if (goals.length === 0) return null;
        const day = new Date().getDate();
        return goals[day % goals.length];
      },
    }),
    {
      name: 'ingauge-goals',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        directionAreas: s.directionAreas,
        goals: s.goals,
        reflections: s.reflections,
      }),
    }
  )
);

export { weekKey };
