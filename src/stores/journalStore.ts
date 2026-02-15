import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as database from '../services/database';

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
    const userId = useAuthStore.getState().userId;
    const trimmed = content.trim();
    const createdAt = new Date();

    const addLocal = (id: string) =>
      set((state) => ({
        entries: [
          { id, content: trimmed, mood, source, conversationId, createdAt },
          ...state.entries,
        ],
      }));

    if (userId) {
      database
        .addJournalEntry(userId, trimmed, { mood, source, conversation_id: conversationId })
        .then((res) => {
          if ('id' in res) addLocal(res.id);
          else addLocal(genId());
        })
        .catch(() => addLocal(genId()));
    } else {
      addLocal(genId());
    }
  },

  deleteEntry: (id) => {
    const userId = useAuthStore.getState().userId;
    if (userId) database.deleteJournalEntry(id).catch(() => {});
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },

  getRecentEntries: (count) => {
    return get().entries.slice(0, count);
  },
}));
