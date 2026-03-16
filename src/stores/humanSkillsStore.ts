/**
 * 16 Human Skills — Point tracking and persistence.
 * Passive tracking: check-in, Quick Reset, Post-Flight, AI Talk, lessons, and tools award points.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SkillId, SkillLevel, SkillPointEvent } from '../types/human-skills';
import { getModuleByLessonId } from '../data/educationContent';

const STORAGE_KEY = 'ingauge_human_skills';

export const LEVEL_THRESHOLDS: Record<SkillLevel, number> = {
  exploring: 0,
  developing: 100,
  practiced: 250,
  strong: 500,
  integrated: 1000,
};

export type SkillPointSource = SkillPointEvent['source'];

interface HumanSkillsState {
  /** Total points per skill */
  points: Partial<Record<SkillId, number>>;
  /** Optional event log for debugging/analytics */
  events: SkillPointEvent[];

  getPoints: (skillId: SkillId) => number;
  getLevel: (skillId: SkillId) => SkillLevel;
  /** Add points to one or more skills (e.g. from check-in, quick-reset, post-flight, ai-talk) */
  addPoints: (skillIds: SkillId[], points: number, source: SkillPointSource) => void;
  reset: () => void;
}

const defaultPoints: Partial<Record<SkillId, number>> = {};
const MAX_EVENTS = 500;

function getLevelFromPoints(total: number): SkillLevel {
  if (total >= LEVEL_THRESHOLDS.integrated) return 'integrated';
  if (total >= LEVEL_THRESHOLDS.strong) return 'strong';
  if (total >= LEVEL_THRESHOLDS.practiced) return 'practiced';
  if (total >= LEVEL_THRESHOLDS.developing) return 'developing';
  return 'exploring';
}

export const useHumanSkillsStore = create<HumanSkillsState>()(
  persist(
    (set, get) => ({
      points: {},
      events: [],

      getPoints: (skillId) => get().points[skillId] ?? 0,

      getLevel: (skillId) => {
        const total = get().getPoints(skillId);
        return getLevelFromPoints(total);
      },

      addPoints: (skillIds, points, source) => {
        if (skillIds.length === 0 || points <= 0) return;
        const now = new Date().toISOString();
        set((state) => {
          const nextPoints = { ...state.points };
          for (const id of skillIds) {
            nextPoints[id] = (nextPoints[id] ?? 0) + points;
          }
          const newEvents: SkillPointEvent[] = skillIds.map((skillId) => ({
            skillId,
            points,
            source,
            at: now,
          }));
          const events = [...state.events, ...newEvents].slice(-MAX_EVENTS);
          return { points: nextPoints, events };
        });
      },

      reset: () => set({ points: defaultPoints, events: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ points: s.points, events: s.events }),
    }
  )
);

/** Skill IDs that get points from a mood check-in (self + regulate) */
export const CHECKIN_SKILL_IDS: SkillId[] = [
  'self-awareness',
  'emotional-awareness',
  'body-awareness',
  'regulation',
];

/** Skill IDs that get points from Quick Reset (regulate) */
export const QUICK_RESET_SKILL_IDS: SkillId[] = [
  'regulation',
  'stress-tolerance',
  'grounding',
  'recovery',
];

/** Skill IDs that get points from Post-Flight (reflect + grow) */
export const POST_FLIGHT_SKILL_IDS: SkillId[] = [
  'reflection',
  'learning',
  'intention',
  'meaning',
  'emotional-awareness',
];

/** Skill IDs that get points from AI Talk (connect + self) */
export const AI_TALK_SKILL_IDS: SkillId[] = [
  'communication',
  'emotional-awareness',
  'self-awareness',
  'empathy',
];

/** Skill IDs that get points from completing a role-play conversation simulation */
export const ROLE_PLAY_SKILL_IDS: SkillId[] = [
  'communication',
  'empathy',
  'stress-tolerance',
];

/** Skill IDs that get points from using Decode (message analysis) */
export const DECODE_SKILL_IDS: SkillId[] = [
  'communication',
  'empathy',
];

/** Skill IDs that get points from completing Resolve (internal conflict) */
export const RESOLVE_SKILL_IDS: SkillId[] = [
  'self-awareness',
  'reflection',
  'regulation',
];

/** Points awarded per action (single call) */
export const SKILL_POINTS = {
  checkIn: 10,
  quickReset: 8,
  postFlight: 10,
  aiTalk: 6,
  lessonComplete: 20,
  conversationSimulation: 30,
  toolUse: 15,
} as const;

/** Map education module id → skill IDs that get points when a lesson in that module is completed */
export const LESSON_MODULE_TO_SKILL_IDS: Record<string, SkillId[]> = {
  'feelings-101': ['emotional-awareness', 'self-awareness'],
  triggers: ['emotional-awareness', 'regulation'],
  communication: ['communication', 'empathy'],
  boundaries: ['boundaries', 'communication'],
  'self-compassion': ['self-awareness', 'regulation'],
  relationships: ['empathy', 'repair', 'boundaries'],
};

/** Call after a lesson is completed to award skill points for that lesson's module. */
export function awardSkillPointsForLesson(lessonId: string): void {
  const mod = getModuleByLessonId(lessonId);
  if (!mod) return;
  const skillIds = LESSON_MODULE_TO_SKILL_IDS[mod.id];
  if (!skillIds?.length) return;
  useHumanSkillsStore.getState().addPoints(skillIds, SKILL_POINTS.lessonComplete, 'lesson');
}
