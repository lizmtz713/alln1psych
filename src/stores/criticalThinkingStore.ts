/**
 * Critical Thinking Tool — Practice progress and badges.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CriticalThinkingState {
  totalCorrect: number;
  streak: number;
  bestStreak: number;
  badges: string[];
  lastPracticeDate: string | null; // YYYY-MM-DD for daily reset
  recordCorrect: () => void;
  recordWrong: () => void;
  addBadge: (id: string) => void;
  hasBadge: (id: string) => boolean;
  resetStreak: () => void;
}

const BADGE_IDS = {
  FIRST_CORRECT: 'first-correct',
  STREAK_5: 'streak-5',
  STREAK_10: 'streak-10',
  TOTAL_10: 'total-10',
  TOTAL_25: 'total-25',
} as const;

export const CRITICAL_THINKING_BADGES = BADGE_IDS;

export const useCriticalThinkingStore = create<CriticalThinkingState>()(
  persist(
    (set, get) => ({
      totalCorrect: 0,
      streak: 0,
      bestStreak: 0,
      badges: [],
      lastPracticeDate: null,

      recordCorrect: () => {
        set((state) => {
          const newStreak = state.streak + 1;
          const newBest = Math.max(state.bestStreak, newStreak);
          const newTotal = state.totalCorrect + 1;
          const newBadges = [...state.badges];
          if (!newBadges.includes(BADGE_IDS.FIRST_CORRECT)) newBadges.push(BADGE_IDS.FIRST_CORRECT);
          if (newStreak >= 5 && !newBadges.includes(BADGE_IDS.STREAK_5)) newBadges.push(BADGE_IDS.STREAK_5);
          if (newStreak >= 10 && !newBadges.includes(BADGE_IDS.STREAK_10)) newBadges.push(BADGE_IDS.STREAK_10);
          if (newTotal >= 10 && !newBadges.includes(BADGE_IDS.TOTAL_10)) newBadges.push(BADGE_IDS.TOTAL_10);
          if (newTotal >= 25 && !newBadges.includes(BADGE_IDS.TOTAL_25)) newBadges.push(BADGE_IDS.TOTAL_25);
          return {
            totalCorrect: newTotal,
            streak: newStreak,
            bestStreak: newBest,
            badges: newBadges,
            lastPracticeDate: new Date().toISOString().slice(0, 10),
          };
        });
      },

      recordWrong: () => set((s) => ({ streak: 0 })),

      addBadge: (id) =>
        set((s) => (s.badges.includes(id) ? s : { badges: [...s.badges, id] })),

      hasBadge: (id) => get().badges.includes(id),

      resetStreak: () => set({ streak: 0 }),
    }),
    {
      name: 'critical-thinking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
