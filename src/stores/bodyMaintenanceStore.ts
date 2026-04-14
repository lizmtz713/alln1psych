/**
 * Body Maintenance Schedule — persist completions and custom frequencies.
 * Everything is editable. Integrates with Body gauge (overdue insight optional).
 * Also holds user-defined routines and service providers (in-memory + persisted).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BODY_MAINTENANCE_CATEGORIES,
  getMaintenanceItemById,
  type MaintenanceInterval,
  type IntervalUnit,
} from '../data/bodyMaintenance';
import type { RoutineItem, ServiceProvider, Frequency } from '../types/bodyMaintenance';

const LOCAL_USER_ID = 'local';

export interface BodyMaintenancePersist {
  /** itemId -> last completed date (ISO string) */
  lastDoneByItemId: Record<string, string>;
  /** itemId -> user-overridden interval */
  customIntervalByItemId: Record<string, MaintenanceInterval>;
}

function addIntervalToDate(date: Date, interval: MaintenanceInterval): Date {
  const next = new Date(date);
  const { value, unit } = interval;
  if (unit === 'days') next.setDate(next.getDate() + value);
  else if (unit === 'weeks') next.setDate(next.getDate() + value * 7);
  else if (unit === 'months') next.setMonth(next.getMonth() + value);
  else if (unit === 'years') next.setFullYear(next.getFullYear() + value);
  return next;
}

function getIntervalForItem(
  itemId: string,
  customByItemId: Record<string, MaintenanceInterval>
): MaintenanceInterval | null {
  const custom = customByItemId[itemId];
  if (custom) return custom;
  const def = getMaintenanceItemById(itemId);
  return def?.defaultInterval ?? null;
}

/** Compute next due date string from a Frequency and a base date. Used by routine/provider scheduling. */
export function computeNextDue(frequency: Frequency, fromDate: Date | string): string {
  const d = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
  const t = frequency.type;
  const v = frequency.value ?? 1;
  if (t === 'daily') d.setDate(d.getDate() + 1);
  else if (t === 'every_x_days') d.setDate(d.getDate() + v);
  else if (t === 'weekly') d.setDate(d.getDate() + 7);
  else if (t === 'biweekly') d.setDate(d.getDate() + 14);
  else if (t === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (t === 'every_x_months') d.setMonth(d.getMonth() + v);
  else if (t === 'quarterly') d.setMonth(d.getMonth() + 3);
  else if (t === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function computeNextDueFromFrequency(frequency: Frequency, fromDateStr: string): string {
  return computeNextDue(frequency, new Date(fromDateStr));
}

export const useBodyMaintenanceStore = create<BodyMaintenancePersist & {
  markDone: (itemId: string) => void;
  setCustomInterval: (itemId: string, interval: MaintenanceInterval | null) => void;
  getLastDone: (itemId: string) => string | undefined;
  getNextDue: (itemId: string) => Date | null;
  isOverdue: (itemId: string) => boolean;
  getInterval: (itemId: string) => MaintenanceInterval | null;
  getOverdueItems: () => { itemId: string; label: string }[];
  getTimelineEntries: () => { monthKey: string; monthLabel: string; isOverdue: boolean; items: { itemId: string; label: string }[] }[];
  routines: RoutineItem[];
  providers: ServiceProvider[];
  getRoutinesByFrequency: (freq: string) => RoutineItem[];
  getComingUp: (limit: number) => Array<{ item?: RoutineItem; provider?: ServiceProvider; dueLabel: string; overdueDays?: number }>;
  completeRoutine: (id: string) => void;
  getRoutine: (id: string) => RoutineItem | undefined;
  snoozeRoutine: (id: string, days?: number) => void;
  removeRoutine: (id: string) => void;
  addRoutine: (input: Omit<RoutineItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & Partial<Pick<RoutineItem, 'id' | 'lastCompleted' | 'nextDue' | 'notes'>>) => void;
  addProvider: (input: Omit<ServiceProvider, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & Partial<Pick<ServiceProvider, 'id'>>) => void;
  getProvider: (id: string) => ServiceProvider | undefined;
  updateProvider: (id: string, patch: Partial<ServiceProvider>) => void;
  removeProvider: (id: string) => void;
}>()(
  persist(
    (set, get) => ({
      lastDoneByItemId: {},
      customIntervalByItemId: {},
      routines: [],
      providers: [],

      markDone(itemId: string) {
        const iso = new Date().toISOString().slice(0, 10);
        set((s) => ({
          lastDoneByItemId: { ...s.lastDoneByItemId, [itemId]: iso },
        }));
      },

      setCustomInterval(itemId: string, interval: MaintenanceInterval | null) {
        set((s) => {
          const next = { ...s.customIntervalByItemId };
          if (interval) next[itemId] = interval;
          else delete next[itemId];
          return { customIntervalByItemId: next };
        });
      },

      getLastDone(itemId: string) {
        return get().lastDoneByItemId[itemId];
      },

      getInterval(itemId: string) {
        return getIntervalForItem(itemId, get().customIntervalByItemId);
      },

      getNextDue(itemId: string): Date | null {
        const last = get().lastDoneByItemId[itemId];
        const interval = getIntervalForItem(itemId, get().customIntervalByItemId);
        if (!interval || !last) return null;
        const from = new Date(last);
        return addIntervalToDate(from, interval);
      },

      isOverdue(itemId: string): boolean {
        const next = get().getNextDue(itemId);
        if (!next) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);
        return next < today;
      },

      /** Overdue items for gauge insight (e.g. \"You're overdue for a dental cleaning\") */
      getOverdueItems(): { itemId: string; label: string }[] {
        const out: { itemId: string; label: string }[] = [];
        for (const cat of BODY_MAINTENANCE_CATEGORIES) {
          for (const item of cat.items) {
            if (get().isOverdue(item.id)) out.push({ itemId: item.id, label: item.label });
          }
        }
        return out;
      },

      /** Timeline: next 6 months + overdue, grouped by month for \"Jan: Doctor, Feb: Haircut\" */
      getTimelineEntries(): { monthKey: string; monthLabel: string; isOverdue: boolean; items: { itemId: string; label: string }[] }[] {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const byMonth = new Map<string, { itemId: string; label: string }[]>();
        const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
        for (const cat of BODY_MAINTENANCE_CATEGORIES) {
          for (const item of cat.items) {
            const next = get().getNextDue(item.id);
            if (!next) continue;
            const nextNorm = new Date(next);
            nextNorm.setHours(0, 0, 0, 0);
            const key = nextNorm.getFullYear() + '-' + String(nextNorm.getMonth()).padStart(2, '0');
            const monthLabel = months[nextNorm.getMonth()] + ' ' + nextNorm.getFullYear();
            if (nextNorm < today) {
              const k = '_overdue';
              if (!byMonth.has(k)) byMonth.set(k, []);
              byMonth.get(k)!.push({ itemId: item.id, label: item.label });
            } else {
              const end = new Date(today);
              end.setMonth(end.getMonth() + 6);
              if (nextNorm <= end) {
                if (!byMonth.has(key)) byMonth.set(key, []);
                byMonth.get(key)!.push({ itemId: item.id, label: item.label });
              }
            }
          }
        }
        const entries: { monthKey: string; monthLabel: string; isOverdue: boolean; items: { itemId: string; label: string }[] }[] = [];
        if (byMonth.has('_overdue')) {
          entries.push({ monthKey: '_overdue', monthLabel: 'Overdue', isOverdue: true, items: byMonth.get('_overdue')! });
        }
        const keys = Array.from(byMonth.keys()).filter((k) => k !== '_overdue').sort();
        for (const key of keys) {
          const [y, m] = key.split('-').map(Number);
          entries.push({
            monthKey: key,
            monthLabel: months[m] + ' ' + y,
            isOverdue: false,
            items: byMonth.get(key)!,
          });
        }
        return entries;
      },

      getRoutinesByFrequency(freq: string): RoutineItem[] {
        return get().routines.filter((r) => r.frequency.type === freq);
      },

      getComingUp(limit: number): Array<{ item?: RoutineItem; provider?: ServiceProvider; dueLabel: string; overdueDays?: number }> {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const entries: Array<{ item?: RoutineItem; provider?: ServiceProvider; dueLabel: string; overdueDays?: number }> = [];
        for (const r of get().routines) {
          if (!r.nextDue) continue;
          const due = new Date(r.nextDue);
          due.setHours(0, 0, 0, 0);
          const overdueDays = Math.floor((now.getTime() - due.getTime()) / 86400000);
          entries.push({
            item: r,
            dueLabel: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            overdueDays: overdueDays > 0 ? overdueDays : undefined,
          });
        }
        for (const p of get().providers) {
          if (!p.nextDue) continue;
          const due = new Date(p.nextDue);
          due.setHours(0, 0, 0, 0);
          const overdueDays = Math.floor((now.getTime() - due.getTime()) / 86400000);
          entries.push({
            provider: p,
            dueLabel: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            overdueDays: overdueDays > 0 ? overdueDays : undefined,
          });
        }
        entries.sort((a, b) => {
          const aDue = (a.item?.nextDue ?? a.provider?.nextDue) ?? '';
          const bDue = (b.item?.nextDue ?? b.provider?.nextDue) ?? '';
          return aDue.localeCompare(bDue);
        });
        return entries.slice(0, limit);
      },

      getRoutine(id: string): RoutineItem | undefined {
        return get().routines.find((r) => r.id === id);
      },

      completeRoutine(id: string): void {
        const r = get().routines.find((x) => x.id === id);
        if (!r) return;
        const now = new Date().toISOString().slice(0, 10);
        const next = computeNextDueFromFrequency(r.frequency, now);
        set((s) => ({
          routines: s.routines.map((x) =>
            x.id === id ? { ...x, lastCompleted: now, nextDue: next, updatedAt: new Date().toISOString() } : x
          ),
        }));
      },

      snoozeRoutine(id: string, days: number = 1): void {
        const r = get().routines.find((x) => x.id === id);
        if (!r) return;
        const d = new Date();
        d.setDate(d.getDate() + (days ?? 1));
        const next = d.toISOString().slice(0, 10);
        set((s) => ({
          routines: s.routines.map((x) => (x.id === id ? { ...x, nextDue: next, updatedAt: new Date().toISOString() } : x)),
        }));
      },

      removeRoutine(id: string): void {
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
      },

      addRoutine(input: Omit<RoutineItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & Partial<Pick<RoutineItem, 'id' | 'lastCompleted' | 'nextDue' | 'notes'>>): void {
        const now = new Date().toISOString();
        const id = input.id ?? 'r-' + Date.now();
        const nextDue = input.nextDue ?? computeNextDueFromFrequency(input.frequency, new Date().toISOString().slice(0, 10));
        const item: RoutineItem = {
          ...input,
          id,
          userId: LOCAL_USER_ID,
          createdAt: now,
          updatedAt: now,
          lastCompleted: input.lastCompleted,
          nextDue,
          notes: input.notes,
        };
        set((s) => ({ routines: [...s.routines, item] }));
      },

      addProvider(input: Omit<ServiceProvider, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & Partial<Pick<ServiceProvider, 'id'>>): void {
        const now = new Date().toISOString();
        const id = input.id ?? 'p-' + Date.now();
        const provider: ServiceProvider = {
          ...input,
          id,
          userId: LOCAL_USER_ID,
          paymentMethods: input.paymentMethods ?? [],
          reminderEnabled: input.reminderEnabled ?? false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ providers: [...s.providers, provider] }));
      },

      getProvider(id: string): ServiceProvider | undefined {
        return get().providers.find((p) => p.id === id);
      },

      updateProvider(id: string, patch: Partial<ServiceProvider>): void {
        const now = new Date().toISOString();
        set((s) => ({
          providers: s.providers.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p)),
        }));
      },

      removeProvider(id: string): void {
        set((s) => ({ providers: s.providers.filter((p) => p.id !== id) }));
      },
    }),
    {
      name: 'body-maintenance',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        lastDoneByItemId: s.lastDoneByItemId,
        customIntervalByItemId: s.customIntervalByItemId,
        routines: s.routines,
        providers: s.providers,
      }),
    }
  )
);

/** Format interval for display, e.g. "every 6 months" */
export function formatInterval(interval: MaintenanceInterval): string {
  const { value, unit } = interval;
  if (value === 1 && unit === 'years') return 'yearly';
  if (value === 1 && unit === 'months') return 'monthly';
  if (value === 1 && unit === 'weeks') return 'weekly';
  if (value === 1 && unit === 'days') return 'daily';
  if (unit === 'years') return `every ${value} years`;
  if (unit === 'months') return `every ${value} months`;
  if (unit === 'weeks') return `every ${value} weeks`;
  if (unit === 'days') return `every ${value} days`;
  return `${value} ${unit}`;
}

/** Format next due for display, e.g. "Jan 15" or "Overdue" */
export function formatNextDue(nextDue: Date | null, isOverdue: boolean): string {
  if (!nextDue) return 'Not scheduled';
  if (isOverdue) return 'Overdue';
  const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec';
  const m = nextDue.getMonth();
  const d = nextDue.getDate();
  return `${months.split(' ')[m]} ${d}`;
}
