/**
 * Memory Builder — persist people met and recall schedule.
 * Spaced recall: 1h → 1d → 3d → 1w (optional 2w).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MemoryPerson } from '../types/memoryBuilder';

const RECALL_DELAYS_MS = [
  60 * 60 * 1000,       // 1 hour
  24 * 60 * 60 * 1000,  // 1 day
  3 * 24 * 60 * 60 * 1000, // 3 days
  7 * 24 * 60 * 60 * 1000, // 1 week
  14 * 24 * 60 * 60 * 1000, // 2 weeks
];

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface MemoryBuilderPersist {
  people: MemoryPerson[];
}

export const useMemoryBuilderStore = create<MemoryBuilderPersist & {
  addPerson: (p: Omit<MemoryPerson, 'id' | 'createdAt' | 'nextRecallAt' | 'recallLevel'>) => MemoryPerson;
  updatePerson: (id: string, updates: Partial<Omit<MemoryPerson, 'id' | 'createdAt'>>) => void;
  deletePerson: (id: string) => void;
  getPersonById: (id: string) => MemoryPerson | undefined;
  getPeople: () => MemoryPerson[];
  getPeopleDueForRecall: () => MemoryPerson[];
  recordRecall: (id: string) => void;
  getPeopleMetThisWeek: () => number;
}>()(
  persist(
    (set, get) => ({
      people: [],

      addPerson(p) {
        const now = new Date().toISOString();
        const next = new Date(Date.now() + RECALL_DELAYS_MS[0]).toISOString();
        const person: MemoryPerson = {
          id: genId(),
          name: p.name.trim(),
          photoUri: p.photoUri,
          whereMet: p.whereMet?.trim(),
          detail: p.detail?.trim(),
          association: p.association?.trim(),
          distinctiveFeature: p.distinctiveFeature,
          createdAt: now,
          nextRecallAt: next,
          recallLevel: 0,
        };
        set((s) => ({ people: [person, ...s.people] }));
        return person;
      },

      updatePerson(id, updates) {
        set((s) => ({
          people: s.people.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        }));
      },

      deletePerson(id) {
        set((s) => ({ people: s.people.filter((q) => q.id !== id) }));
      },

      getPersonById(id) {
        return get().people.find((q) => q.id === id);
      },

      getPeople() {
        return get().people;
      },

      getPeopleDueForRecall() {
        const now = new Date().toISOString();
        return get().people.filter((p) => p.nextRecallAt <= now && p.recallLevel < RECALL_DELAYS_MS.length);
      },

      recordRecall(id) {
        const person = get().people.find((p) => p.id === id);
        if (!person) return;
        const nextLevel = Math.min(person.recallLevel + 1, RECALL_DELAYS_MS.length - 1);
        const nextAt = new Date(Date.now() + RECALL_DELAYS_MS[nextLevel]).toISOString();
        set((s) => ({
          people: s.people.map((q) =>
            q.id === id ? { ...q, recallLevel: nextLevel, nextRecallAt: nextAt } : q
          ),
        }));
      },

      getPeopleMetThisWeek() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const cutoff = oneWeekAgo.toISOString();
        return get().people.filter((p) => p.createdAt >= cutoff).length;
      },
    }),
    {
      name: 'memory-builder',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ people: s.people }),
    }
  )
);
