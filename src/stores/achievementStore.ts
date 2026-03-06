/**
 * Achievements — Unlock tracking and pending modal queue.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserAchievements } from '../types/achievements';

const STORAGE_KEY = 'ingauge_achievements';

interface AchievementState extends UserAchievements {
  /** IDs of achievements that just unlocked and haven't been shown in modal yet */
  pendingUnlocked: string[];

  unlock: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  getUnlockedAt: (id: string) => string | undefined;
  clearPending: () => void;
  shiftPending: () => string | undefined;
  addPending: (id: string) => void;
  reset: () => void;
}

const defaultState = {
  unlockedAt: {} as Record<string, string>,
  pendingUnlocked: [] as string[],
};

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      unlock: (id) => {
        if (get().unlockedAt[id]) return false;
        const now = new Date().toISOString();
        set((s) => ({
          unlockedAt: { ...s.unlockedAt, [id]: now },
          pendingUnlocked: [...s.pendingUnlocked, id],
        }));
        return true;
      },

      isUnlocked: (id) => !!get().unlockedAt[id],
      getUnlockedAt: (id) => get().unlockedAt[id],

      clearPending: () => set((s) => ({ ...s, pendingUnlocked: [] })),
      shiftPending: () => {
        const current = get().pendingUnlocked;
        if (current.length === 0) return undefined;
        const [first, ...rest] = current;
        set((s) => ({ ...s, pendingUnlocked: rest }));
        return first;
      },
      addPending: (id) =>
        set((s) =>
          s.pendingUnlocked.includes(id) ? s : { ...s, pendingUnlocked: [...s.pendingUnlocked, id] }
        ),

      reset: () => set(defaultState),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ unlockedAt: s.unlockedAt }),
    }
  )
);
