import { create } from 'zustand';

export interface GratitudeEntry {
  id: string;
  text: string;
  why?: string;
  createdAt: string;
}

interface GratitudeState {
  entries: GratitudeEntry[];
  addEntry: (text: string, why?: string) => void;
  removeEntry: (id: string) => void;
  getEntries: () => GratitudeEntry[];
  clearAll: () => void;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useGratitudeStore = create<GratitudeState>((set, get) => ({
  entries: [],

  addEntry: (text, why) => {
    const entry: GratitudeEntry = {
      id: genId(),
      text: text.trim(),
      why: why?.trim(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ entries: [entry, ...state.entries] }));
  },

  removeEntry: (id) => {
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  getEntries: () => get().entries,

  clearAll: () => set({ entries: [] }),
}));
