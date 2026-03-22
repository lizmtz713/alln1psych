/**
 * Habit Tracker — Habits, completions, and streak tracking.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit, HabitCompletion, HabitStreak, HabitType, HabitId } from '../types/habits';

const STORAGE_KEY = 'ingauge_habits';
const MAX_COMPLETIONS = 2000;

function genId(): string {
  return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(d: string): Date {
  const [y, m, day] = d.split('-").map(Number);
  return new Date(y, m - 1, day);
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Check if completion meets the habit's target for that day */
function meetsTarget(habit: Habit, value: number): boolean {
  if (habit.type === "boolean') return value >= 1;
  const target = habit.target ?? 1;
  return value >= target;
}

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];

  addHabit: (params: { name: string; type: HabitType; target?: number; unit?: string; emoji?: string }) => HabitId;
  updateHabit: (habitId: string, params: Partial<Pick<Habit, 'name' | 'target' | 'unit' | 'emoji'>>) => void;
  archiveHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  getHabit: (habitId: string) => Habit | undefined;
  getActiveHabits: () => Habit[];
  getTodaysHabits: () => Habit[];

  setCompletion: (habitId: string, date: string, value: number, note?: string) => void;
  getCompletion: (habitId: string, date: string) => HabitCompletion | undefined;
  getCompletionsForHabit: (habitId: string, limitDays?: number) => HabitCompletion[];
  getCompletionValue: (habitId: string, date: string) => number;

  getStreak: (habitId: string) => HabitStreak;
  reset: () => void;
}

const now = () => new Date().toISOString();

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],

      addHabit: (params) => {
        const id = genId();
        const habit: Habit = {
          id,
          name: params.name,
          type: params.type,
          target: params.target,
          unit: params.unit,
          emoji: params.emoji,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ habits: [...s.habits, habit] }));
        return id;
      },

      updateHabit: (habitId, params) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId ? { ...h, ...params, updatedAt: now() } : h
          ),
        }));
      },

      archiveHabit: (habitId) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId ? { ...h, archived: true, updatedAt: now() } : h
          ),
        }));
      },

      deleteHabit: (habitId) => {
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== habitId),
          completions: s.completions.filter((c) => c.habitId !== habitId),
        }));
      },

      getHabit: (habitId) => get().habits.find((h) => h.id === habitId),
      getActiveHabits: () => get().habits.filter((h) => !h.archived),
      getTodaysHabits: () => get().habits.filter((h) => !h.archived),

      setCompletion: (habitId, date, value, note) => {
        const habit = get().getHabit(habitId);
        if (!habit) return;
        set((s) => {
          const rest = s.completions.filter((c) => !(c.habitId === habitId && c.date === date));
          const newCompletion: HabitCompletion = {
            habitId,
            date,
            value,
            note,
            recordedAt: now(),
          };
          return {
            completions: [newCompletion, ...rest].slice(0, MAX_COMPLETIONS),
          };
        });
      },

      getCompletion: (habitId, date) =>
        get().completions.find((c) => c.habitId === habitId && c.date === date),

      getCompletionsForHabit: (habitId, limitDays = 365) => {
        const list = get().completions.filter((c) => c.habitId === habitId);
        list.sort((a, b) => b.date.localeCompare(a.date));
        return limitDays ? list.slice(0, limitDays) : list;
      },

      getCompletionValue: (habitId, date) => {
        const c = get().getCompletion(habitId, date);
        return c?.value ?? 0;
      },

      getStreak: (habitId) => {
        const habit = get().getHabit(habitId);
        const completions = get().getCompletionsForHabit(habitId);
        if (!habit) return { habitId, current: 0, longest: 0, lastCompletedDate: null };

        const byDate = new Map<string, number>();
        completions.forEach((c) => byDate.set(c.date, c.value));
        const today = todayStr();
        const sortedDates = [...byDate.keys()].sort();

        let longest = 0;
        let run = 0;
        for (const d of sortedDates) {
          if (meetsTarget(habit, byDate.get(d)!)) {
            run++;
            longest = Math.max(longest, run);
          } else {
            run = 0;
          }
        }

        let current = 0;
        for (let offset = 0; offset < 366; offset++) {
          const d = dateKey(new Date(Date.now() - offset * 86400000));
          if (meetsTarget(habit, byDate.get(d) ?? 0)) current++;
          else break;
        }

        const lastCompletedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
        return { habitId, current, longest, lastCompletedDate };
      },

      reset: () => set({ habits: [], completions: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ habits: s.habits, completions: s.completions }),
    }
  )
);
