/**
 * Body Maintenance store — routines, completions, service providers.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import type {
  RoutineItem,
  ServiceProvider,
  RoutineCompletion,
  Frequency,
  FrequencyType,
} from '../types/bodyMaintenance';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Compute next due date from frequency and last completed (or today if never). */
export function computeNextDue(freq: Frequency, lastCompletedIso?: string): string {
  const from = lastCompletedIso ? new Date(lastCompletedIso) : new Date();
  let next: Date;
  switch (freq.type) {
    case 'daily':
      next = addDays(from, 1);
      break;
    case 'every_x_days':
      next = addDays(from, Math.max(1, freq.value ?? 1));
      break;
    case 'weekly':
      next = addDays(from, 7);
      break;
    case 'biweekly':
      next = addDays(from, 14);
      break;
    case 'monthly':
      next = addMonths(from, 1);
      break;
    case 'every_x_months':
      next = addMonths(from, Math.max(1, freq.value ?? 1));
      break;
    case 'quarterly':
      next = addMonths(from, 3);
      break;
    case 'yearly':
      next = addMonths(from, 12);
      break;
    default:
      next = addDays(from, 7);
  }
  return next.toISOString();
}

interface BodyMaintenanceState {
  routines: RoutineItem[];
  completions: RoutineCompletion[];
  providers: ServiceProvider[];

  addRoutine: (input: Omit<RoutineItem, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'nextDue'>) => RoutineItem;
  updateRoutine: (id: string, updates: Partial<RoutineItem>) => void;
  removeRoutine: (id: string) => void;
  getRoutine: (id: string) => RoutineItem | undefined;
  completeRoutine: (routineId: string, notes?: string) => void;
  snoozeRoutine: (routineId: string, days: number) => void;

  addProvider: (input: Omit<ServiceProvider, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => ServiceProvider;
  updateProvider: (id: string, updates: Partial<ServiceProvider>) => void;
  removeProvider: (id: string) => void;
  getProvider: (id: string) => ServiceProvider | undefined;

  getRoutinesByFrequency: (band: 'daily' | 'weekly' | 'monthly' | 'quarterly') => RoutineItem[];
  getComingUp: (limit: number) => Array<{ item: RoutineItem; dueLabel: string; overdueDays?: number } | { provider: ServiceProvider; dueLabel: string; overdueDays?: number }>;
  getItemsDueThisWeek: () => RoutineItem[];
}

const defaultFrequency: Frequency = { type: 'weekly' };

export const useBodyMaintenanceStore = create<BodyMaintenanceState>()(
  persist(
    (set, get) => ({
      routines: [],
      completions: [],
      providers: [],

      addRoutine: (input) => {
        const userId = useAuthStore.getState().userId ?? 'local';
        const now = nowIso();
        const nextDue = computeNextDue(input.frequency, input.lastCompleted);
        const routine: RoutineItem = {
          ...input,
          id: genId(),
          userId,
          nextDue,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        return routine;
      },

      updateRoutine: (id, updates) => {
        const routine = get().routines.find((r) => r.id === id);
        if (!routine) return;
        const nextDue = updates.lastCompleted != null || updates.frequency != null
          ? computeNextDue(updates.frequency ?? routine.frequency, updates.lastCompleted ?? routine.lastCompleted)
          : updates.nextDue ?? routine.nextDue;
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id
              ? { ...r, ...updates, nextDue, updatedAt: nowIso() }
              : r
          ),
        }));
      },

      removeRoutine: (id) => {
        set((s) => ({
          routines: s.routines.filter((r) => r.id !== id),
          completions: s.completions.filter((c) => c.routineId !== id),
        }));
      },

      getRoutine: (id) => get().routines.find((r) => r.id === id),

      completeRoutine: (routineId, notes) => {
        const routine = get().getRoutine(routineId);
        if (!routine) return;
        const completedAt = nowIso();
        const completion: RoutineCompletion = {
          id: genId(),
          routineId,
          completedAt,
          notes,
        };
        const nextDue = computeNextDue(routine.frequency, completedAt);
        const streak = (routine.streak ?? 0) + 1;
        set((s) => ({
          completions: [completion, ...s.completions],
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  lastCompleted: completedAt,
                  nextDue,
                  streak,
                  updatedAt: nowIso(),
                }
              : r
          ),
        }));
      },

      snoozeRoutine: (routineId, days) => {
        const routine = get().getRoutine(routineId);
        if (!routine) return;
        const currentDue = routine.nextDue ? new Date(routine.nextDue) : new Date();
        const nextDue = addDays(currentDue, days).toISOString();
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId ? { ...r, nextDue, updatedAt: nowIso() } : r
          ),
        }));
      },

      addProvider: (input) => {
        const userId = useAuthStore.getState().userId ?? 'local';
        const now = nowIso();
        const provider: ServiceProvider = {
          ...input,
          id: genId(),
          userId,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ providers: [...s.providers, provider] }));
        return provider;
      },

      updateProvider: (id, updates) => {
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: nowIso() } : p
          ),
        }));
      },

      removeProvider: (id) => {
        set((s) => ({ providers: s.providers.filter((p) => p.id !== id) }));
      },

      getProvider: (id) => get().providers.find((p) => p.id === id),

      getRoutinesByFrequency: (band) => {
        const all = get().routines;
        const map = {
          daily: ['daily'] as FrequencyType[],
          weekly: ['weekly', 'biweekly', 'every_x_days'] as FrequencyType[],
          monthly: ['monthly', 'every_x_months'] as FrequencyType[],
          quarterly: ['quarterly', 'yearly'] as FrequencyType[],
        };
        const types = map[band];
        return all.filter((r) => types.includes(r.frequency.type));
      },

      getComingUp: (limit) => {
        const now = new Date();
        const items: Array<{ item: RoutineItem; dueLabel: string; overdueDays?: number } | { provider: ServiceProvider; dueLabel: string; overdueDays?: number }> = [];

        get().routines.forEach((r) => {
          if (!r.nextDue) return;
          const due = new Date(r.nextDue);
          const overdueDays = due < now ? Math.ceil((now.getTime() - due.getTime()) / 86400000) : 0;
          const dueLabel = overdueDays > 0 ? `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue` : due.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
          items.push({ item: r, dueLabel, overdueDays: overdueDays > 0 ? overdueDays : undefined });
        });
        get().providers.forEach((p) => {
          if (!p.nextDue) return;
          const due = new Date(p.nextDue);
          const overdueDays = due < now ? Math.ceil((now.getTime() - due.getTime()) / 86400000) : 0;
          const dueLabel = overdueDays > 0 ? `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue` : due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          items.push({ provider: p, dueLabel, overdueDays: overdueDays > 0 ? overdueDays : undefined });
        });

        items.sort((a, b) => {
          const dateA = 'item' in a ? (a.item.nextDue ? new Date(a.item.nextDue).getTime() : 0) : (a.provider.nextDue ? new Date(a.provider.nextDue).getTime() : 0);
          const dateB = 'item' in b ? (b.item.nextDue ? new Date(b.item.nextDue).getTime() : 0) : (b.provider.nextDue ? new Date(b.provider.nextDue).getTime() : 0);
          return dateA - dateB;
        });
        return items.slice(0, limit);
      },

      getItemsDueThisWeek: () => {
        const now = new Date();
        const weekEnd = addDays(now, 7);
        return get().routines.filter((r) => {
          if (!r.nextDue) return false;
          const d = new Date(r.nextDue);
          return d >= now && d <= weekEnd;
        });
      },
    }),
    {
      name: 'alln1-body-maintenance',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ routines: s.routines, completions: s.completions, providers: s.providers }),
    }
  )
);
