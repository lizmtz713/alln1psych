import { create } from 'zustand';
import type { Lesson } from '../data/educationContent';
import { MODULES } from '../data/educationContent';
import { useAuthStore } from './authStore';
import * as database from '../services/database';

export type ContentAgeGroup =
  | 'under13'
  | 'teen'
  | 'youngAdult'
  | 'adult'
  | 'midlife'
  | 'senior';

/** Map userStore ageGroup to content age group for lesson content */
export function userAgeToContentAge(
  ageGroup: string | null
): ContentAgeGroup {
  switch (ageGroup) {
    case 'under13':
      return 'under13';
    case '13-17':
      return 'teen';
    case '18-25':
      return 'youngAdult';
    case '26-40':
      return 'adult';
    case '41-60':
      return 'midlife';
    case '60+':
      return 'senior';
    default:
      return 'adult';
  }
}

interface EducationState {
  completedLessons: string[];
  lessonProgress: Record<string, number>;
  reflections: Record<string, string>;
  streakDays: number;
  lastLessonDate: Date | null;
  completeLesson: (lessonId: string, reflection?: string) => void;
  saveReflection: (lessonId: string, text: string) => void;
  setLessonProgress: (lessonId: string, percent: number) => void;
  getModuleProgress: (moduleId: string) => number;
  isLessonCompleted: (lessonId: string) => boolean;
  getNextLesson: (contentAgeGroup: ContentAgeGroup) => Lesson | null;
  reset: () => void;
}

export const useEducationStore = create<EducationState>((set, get) => ({
  completedLessons: [],
  lessonProgress: {},
  reflections: {},
  streakDays: 0,
  lastLessonDate: null,

  completeLesson: (lessonId, reflection) => {
    const now = new Date();
    const userId = useAuthStore.getState().userId;
    if (userId) database.completeLesson(userId, lessonId, reflection).catch(() => {});
    set((state) => {
      const already = state.completedLessons.includes(lessonId);
      if (already) return state;
      const last = state.lastLessonDate;
      const lastDay = last ? new Date(last).toDateString() : null;
      const today = now.toDateString();
      const streak =
        lastDay === today
          ? state.streakDays
          : lastDay && last && new Date(last).getTime() === new Date(today).getTime() - 86400000
            ? state.streakDays + 1
            : 1;
      return {
        completedLessons: [...state.completedLessons, lessonId],
        lastLessonDate: now,
        streakDays: streak,
      };
    });
  },

  saveReflection: (lessonId, text) =>
    set((state) => ({
      reflections: { ...state.reflections, [lessonId]: text },
    })),

  setLessonProgress: (lessonId, percent) =>
    set((state) => ({
      lessonProgress: { ...state.lessonProgress, [lessonId]: percent },
    })),

  getModuleProgress: (moduleId) => {
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod) return 0;
    const completed = get().completedLessons;
    const count = mod.lessons.filter((l) => completed.includes(l.id)).length;
    return count;
  },

  isLessonCompleted: (lessonId) => get().completedLessons.includes(lessonId),

  getNextLesson: (contentAgeGroup) => {
    const { completedLessons } = get();
    for (const mod of MODULES) {
      if (!mod.recommendedFor.includes(contentAgeGroup)) continue;
      for (const lesson of mod.lessons) {
        if (!completedLessons.includes(lesson.id)) return lesson;
      }
    }
    return null;
  },
  reset: () =>
    set({
      completedLessons: [],
      lessonProgress: {},
      reflections: {},
      streakDays: 0,
      lastLessonDate: null,
    }),
}));
