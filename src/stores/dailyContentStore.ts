import { create } from 'zustand';
import type { DailyContent } from '../services/personalization';

interface DailyContentState {
  content: DailyContent | null;
  date: string; // YYYY-MM-DD
  isLoading: boolean;
  setContent: (content: DailyContent) => void;
  setLoading: (loading: boolean) => void;
  isStale: () => boolean;
  reset: () => void;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useDailyContentStore = create<DailyContentState>((set, get) => ({
  content: null,
  date: '',
  isLoading: false,
  setContent: (content) => set({ content, date: todayKey() }),
  setLoading: (isLoading) => set({ isLoading }),
  isStale: () => get().date !== todayKey(),
  reset: () => set({ content: null, date: '' }),
}));
