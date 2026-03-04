/**
 * News My Way store — digest, capacity, doomscroll check-in, impact, settings.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NewsStory,
  NewsDigest,
  NewsMyWaySettings,
  StoryImpact,
  DoomscrollCheckIn,
  CapacityMode,
  StoryReaction,
} from '../types/newsMyWay';

const DEFAULT_SETTINGS: NewsMyWaySettings = {
  newsFreeWhenStateBelow: 20,
  interestTopics: [],
  preFlightIntegration: false,
  doomscrollCheckInMinutes: 15,
};

interface NewsMyWayState {
  digest: NewsDigest | null;
  settings: NewsMyWaySettings;
  impacts: StoryImpact[];
  doomscrollCheckIns: DoomscrollCheckIn[];
  /** Session start for doomscroll timer (ISO string). */
  sessionStartedAt: string | null;
  /** User chose "news-free today" for this date (YYYY-MM-DD). */
  newsFreeDates: string[];

  setDigest: (digest: NewsDigest | null) => void;
  setSettings: (s: Partial<NewsMyWaySettings>) => void;
  recordImpact: (storyId: string, reaction: StoryReaction) => void;
  recordDoomscrollCheckIn: (feeling: 'better' | 'same' | 'worse', sessionDurationMinutes: number) => void;
  startSession: () => void;
  clearSession: () => void;
  setNewsFreeToday: (date: string) => void;
  removeNewsFreeDate: (date: string) => void;
  isNewsFreeToday: (date: string) => boolean;

  getCapacityMode: (stateGaugeValue: number) => CapacityMode;
  getStoriesForCapacity: (stories: NewsStory[], mode: CapacityMode) => NewsStory[];
}

function getCapacityModeFromState(value: number): CapacityMode {
  if (value < 0) return 'balanced';
  if (value <= 25) return 'minimal';
  if (value <= 50) return 'light';
  if (value <= 75) return 'balanced';
  return 'full';
}

function limitByCapacity(stories: NewsStory[], mode: CapacityMode): NewsStory[] {
  const limits = { minimal: 5, light: 8, balanced: 15, full: 20 };
  return stories.slice(0, limits[mode]);
}

export const useNewsMyWayStore = create<NewsMyWayState>()(
  persist(
    (set, get) => ({
      digest: null,
      settings: DEFAULT_SETTINGS,
      impacts: [],
      doomscrollCheckIns: [],
      sessionStartedAt: null,
      newsFreeDates: [],

      setDigest: (digest) => set({ digest }),

      setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      recordImpact: (storyId, reaction) => {
        const impact: StoryImpact = { storyId, reaction, at: new Date().toISOString() };
        set((s) => ({ impacts: [impact, ...s.impacts].slice(0, 500) }));
      },

      recordDoomscrollCheckIn: (feeling, sessionDurationMinutes) => {
        const checkIn: DoomscrollCheckIn = {
          at: new Date().toISOString(),
          feeling,
          sessionDurationMinutes,
        };
        set((s) => ({ doomscrollCheckIns: [checkIn, ...s.doomscrollCheckIns].slice(0, 100) }));
      },

      startSession: () => set({ sessionStartedAt: new Date().toISOString() }),

      clearSession: () => set({ sessionStartedAt: null }),

      setNewsFreeToday: (date) =>
        set((s) => ({
          newsFreeDates: s.newsFreeDates.includes(date) ? s.newsFreeDates : [...s.newsFreeDates, date],
        })),

      removeNewsFreeDate: (date) =>
        set((s) => ({ newsFreeDates: s.newsFreeDates.filter((d) => d !== date) })),

      isNewsFreeToday: (date) => get().newsFreeDates.includes(date),

      getCapacityMode: (stateGaugeValue) => getCapacityModeFromState(stateGaugeValue),

      getStoriesForCapacity: (stories, mode) => limitByCapacity(stories, mode),
    }),
    {
      name: 'alln1-news-my-way',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        settings: s.settings,
        impacts: s.impacts,
        doomscrollCheckIns: s.doomscrollCheckIns,
        newsFreeDates: s.newsFreeDates,
      }),
    }
  )
);
