import { create } from 'zustand';

export type JournalMood = 'green' | 'yellow' | 'orange' | 'red';

export interface JournalEntry {
  id: string;
  content: string;
  mood?: JournalMood;
  source: 'manual' | 'conversation';
  conversationId?: string;
  createdAt: Date;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface JournalState {
  entries: JournalEntry[];
  addEntry: (
    content: string,
    options?: { mood?: JournalMood; source?: 'manual' | 'conversation'; conversationId?: string }
  ) => void;
  deleteEntry: (id: string) => void;
  getRecentEntries: (count: number) => JournalEntry[];
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],

  addEntry: (content, options = {}) => {
    const { mood, source = 'manual', conversationId } = options;
    set((state) => ({
      entries: [
        {
          id: genId(),
          content: content.trim(),
          mood,
          source,
          conversationId,
          createdAt: new Date(),
        },
        ...state.entries,
      ],
    }));
  },

  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),

  getRecentEntries: (count) => {
    return get().entries.slice(0, count);
  },
}));
