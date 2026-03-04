/**
 * Datésumé store — single dating resume, persisted locally.
 * 18+ feature; age gate in UI.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Datesume,
  DatesumeRelationship,
  GrowthEntry,
  Milestone,
  Testimonial,
  RelationshipStatus,
  GoodToKnow,
} from '../types/datesume';

const STORAGE_KEY = 'ingauge_datesume';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

const defaultSkills = {
  expert: [] as string[],
  proficient: [] as string[],
  developing: [] as string[],
};

const defaultOfferings = {
  dailyLife: [] as string[],
  adventures: [] as string[],
  toughTimes: [] as string[],
  fun: [] as string[],
};

const defaultLogistics = {
  openToLDR: undefined as boolean | undefined,
  willingToTravel: undefined as boolean | undefined,
  communicationPref: undefined as string | undefined,
  livingSituation: undefined as string | undefined,
  pets: undefined as string | undefined,
  wantsKids: undefined as 'yes' | 'no' | 'maybe' | 'have_them' | undefined,
  openToMarriage: undefined as boolean | undefined,
};

const defaultGoodToKnow: GoodToKnow = {
  coreValues: [],
  redFlagsIWatchFor: [],
  loveLanguages: [],
  howIShowLove: [],
  howINeedLove: [],
  threeThingsToKnow: [],
};

function createEmptyDatesume(): Datesume {
  const t = now();
  return {
    id: genId(),
    displayName: '',
    relationshipStatus: 'single',
    relationships: [],
    growthJourney: [],
    milestones: [],
    skills: { ...defaultSkills },
    offerings: { ...defaultOfferings },
    testimonials: [],
    logistics: { ...defaultLogistics },
    goodToKnow: { ...defaultGoodToKnow },
    isPublic: false,
    showRealNames: false,
    createdAt: t,
    updatedAt: t,
  };
}

interface DatesumeState {
  datesume: Datesume | null;
  init: () => void;
  update: (patch: Partial<Datesume>) => void;
  updateGoodToKnow: (patch: Partial<GoodToKnow>) => void;
  updateRelationship: (id: string, patch: Partial<DatesumeRelationship>) => void;
  addRelationship: (r: Omit<DatesumeRelationship, 'id'>) => void;
  removeRelationship: (id: string) => void;
  updateGrowth: (id: string, patch: Partial<GrowthEntry>) => void;
  addGrowth: (g: Omit<GrowthEntry, 'id'>) => void;
  removeGrowth: (id: string) => void;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  addMilestone: (m: Omit<Milestone, 'id'>) => void;
  removeMilestone: (id: string) => void;
  updateTestimonial: (id: string, patch: Partial<Testimonial>) => void;
  addTestimonial: (t: Omit<Testimonial, 'id'>) => void;
  removeTestimonial: (id: string) => void;
  reset: () => void;
}

export const useDatesumeStore = create<DatesumeState>()(
  persist(
    (set, get) => ({
      datesume: null,

      init: () => {
        const current = get().datesume;
        if (current === null) {
          set({ datesume: createEmptyDatesume() });
        } else if (current && !current.goodToKnow) {
          set({ datesume: { ...current, goodToKnow: { ...defaultGoodToKnow }, updatedAt: now() } });
        }
      },

      update: (patch) => {
        const d = get().datesume ?? createEmptyDatesume();
        set({
          datesume: {
            ...d,
            ...patch,
            updatedAt: now(),
          },
        });
      },

      updateGoodToKnow: (patch) => {
        const d = get().datesume ?? createEmptyDatesume();
        set({
          datesume: {
            ...d,
            goodToKnow: { ...d.goodToKnow, ...patch },
            updatedAt: now(),
          },
        });
      },

      updateRelationship: (id, patch) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            relationships: d.relationships.map((r) =>
              r.id === id ? { ...r, ...patch } : r
            ),
            updatedAt: now(),
          },
        });
      },

      addRelationship: (r) => {
        const d = get().datesume ?? createEmptyDatesume();
        const full: DatesumeRelationship = { ...r, id: genId() };
        set({
          datesume: {
            ...d,
            relationships: [full, ...d.relationships],
            updatedAt: now(),
          },
        });
      },

      removeRelationship: (id) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            relationships: d.relationships.filter((r) => r.id !== id),
            updatedAt: now(),
          },
        });
      },

      updateGrowth: (id, patch) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            growthJourney: d.growthJourney.map((g) =>
              g.id === id ? { ...g, ...patch } : g
            ),
            updatedAt: now(),
          },
        });
      },

      addGrowth: (g) => {
        const d = get().datesume ?? createEmptyDatesume();
        const full: GrowthEntry = { ...g, id: genId() };
        set({
          datesume: {
            ...d,
            growthJourney: [full, ...d.growthJourney],
            updatedAt: now(),
          },
        });
      },

      removeGrowth: (id) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            growthJourney: d.growthJourney.filter((g) => g.id !== id),
            updatedAt: now(),
          },
        });
      },

      updateMilestone: (id, patch) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            milestones: d.milestones.map((m) =>
              m.id === id ? { ...m, ...patch } : m
            ),
            updatedAt: now(),
          },
        });
      },

      addMilestone: (m) => {
        const d = get().datesume ?? createEmptyDatesume();
        const full: Milestone = { ...m, id: genId() };
        set({
          datesume: {
            ...d,
            milestones: [...d.milestones, full],
            updatedAt: now(),
          },
        });
      },

      removeMilestone: (id) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            milestones: d.milestones.filter((m) => m.id !== id),
            updatedAt: now(),
          },
        });
      },

      updateTestimonial: (id, patch) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            testimonials: d.testimonials.map((t) =>
              t.id === id ? { ...t, ...patch } : t
            ),
            updatedAt: now(),
          },
        });
      },

      addTestimonial: (t) => {
        const d = get().datesume ?? createEmptyDatesume();
        const full: Testimonial = { ...t, id: genId() };
        set({
          datesume: {
            ...d,
            testimonials: [...d.testimonials, full],
            updatedAt: now(),
          },
        });
      },

      removeTestimonial: (id) => {
        const d = get().datesume;
        if (!d) return;
        set({
          datesume: {
            ...d,
            testimonials: d.testimonials.filter((t) => t.id !== id),
            updatedAt: now(),
          },
        });
      },

      reset: () => set({ datesume: createEmptyDatesume() }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ datesume: s.datesume }),
    }
  )
);
