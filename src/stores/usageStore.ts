import { create } from 'zustand';

const STORAGE_KEY_DAY = 'usage_store_day';
const getToday = () => new Date().toDateString();

interface UsageState {
  ttsCallsToday: number;
  whisperFallbacksToday: number;
  gptCallsToday: number;
  _lastResetDay: string;
  incrementTTS: () => void;
  incrementWhisperFallback: () => void;
  incrementGPT: () => void;
  resetDaily: () => void;
  _ensureDay: () => void;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  ttsCallsToday: 0,
  whisperFallbacksToday: 0,
  gptCallsToday: 0,
  _lastResetDay: '',

  _ensureDay: () => {
    const today = getToday();
    if (get()._lastResetDay !== today) {
      set({
        ttsCallsToday: 0,
        whisperFallbacksToday: 0,
        gptCallsToday: 0,
        _lastResetDay: today,
      });
    }
  },

  incrementTTS: () => {
    get()._ensureDay();
    set((s) => ({ ttsCallsToday: s.ttsCallsToday + 1 }));
  },
  incrementWhisperFallback: () => {
    get()._ensureDay();
    set((s) => ({ whisperFallbacksToday: s.whisperFallbacksToday + 1 }));
  },
  incrementGPT: () => {
    get()._ensureDay();
    set((s) => ({ gptCallsToday: s.gptCallsToday + 1 }));
  },
  resetDaily: () => {
    set({
      ttsCallsToday: 0,
      whisperFallbacksToday: 0,
      gptCallsToday: 0,
      _lastResetDay: getToday(),
    });
  },
}));
