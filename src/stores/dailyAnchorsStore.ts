/**
 * Daily Anchors — Per-day state for "Your Life Today".
 * Resets when date changes (midnight rollover checked on read).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DailyAnchorsState {
  /** Date this state is for (YYYY-MM-DD) */
  date: string;
  /** User completed connection prompt (reached out / logged contact) */
  connectionPromptActedOn: boolean;
  /** User saw the daily insight card today */
  dailyInsightSeen: boolean;
  setConnectionPromptActedOn: (done: boolean) => void;
  setDailyInsightSeen: (seen: boolean) => void;
  /** Mark daily connection prompt done (e.g. after sending Mind Mail). Calls ensureDate then sets acted on. */
  completeConnectionPrompt: () => void;
  /** True if state is for today */
  isToday: () => boolean;
  /** Clear or re-key state when date changes */
  ensureDate: () => void;
}

const STORAGE_KEY = 'alln1_daily_anchors';

export const useDailyAnchorsStore = create<DailyAnchorsState>()(
  persist(
    (set, get) => ({
      date: todayKey(),
      connectionPromptActedOn: false,
      dailyInsightSeen: false,

      setConnectionPromptActedOn: (done) => set({ connectionPromptActedOn: done }),
      setDailyInsightSeen: (seen) => set({ dailyInsightSeen: seen }),

      completeConnectionPrompt: () => {
        get().ensureDate();
        set({ connectionPromptActedOn: true });
      },

      isToday: () => get().date === todayKey(),

      ensureDate: () => {
        const today = todayKey();
        const current = get().date;
        if (current !== today) {
          set({
            date: today,
            connectionPromptActedOn: false,
            dailyInsightSeen: false,
          });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        date: s.date,
        connectionPromptActedOn: s.connectionPromptActedOn,
        dailyInsightSeen: s.dailyInsightSeen,
      }),
    }
  )
);
