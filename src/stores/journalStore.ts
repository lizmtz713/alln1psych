import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as database from '../services/database';
import { trackJournalEntry } from '../hooks/useWrappedTracking';

export type JournalMood = 'green' | 'yellow' | 'orange' | 'red';

export type JournalEntryType = 'text' | 'voice' | 'mixed';

export interface JournalEntry {
  id: string;
  content: string;
  mood?: JournalMood;
  source: 'manual' | 'conversation';
  conversationId?: string;
  createdAt: Date;
  /** Entry type: text-only, voice-only, or both */
  type?: JournalEntryType;
  /** Voice note local URI (or remote URL when persisted to Storage) */
  voiceUri?: string;
  voiceDurationSec?: number;
  transcript?: string;
  transcribedAt?: Date;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type AddEntryOptions = {
  mood?: JournalMood;
  source?: 'manual' | 'conversation';
  conversationId?: string;
  type?: JournalEntryType;
  voiceUri?: string;
  voiceDurationSec?: number;
  transcript?: string;
};

interface JournalState {
  entries: JournalEntry[];
  addEntry: (contentOrOptions: string | AddEntryOptions, options?: AddEntryOptions) => void;
  deleteEntry: (id: string) => void;
  getRecentEntries: (count: number) => JournalEntry[];
  reset: () => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],

  addEntry: (contentOrOptions, options = {}) => {
    const userId = useAuthStore.getState().userId;
    const createdAt = new Date();

    let content: string;
    let opts: AddEntryOptions;

    if (typeof contentOrOptions === 'string') {
      content = contentOrOptions.trim();
      opts = options;
    } else {
      opts = contentOrOptions as AddEntryOptions;
      content = (opts.transcript ?? '').trim();
    }

    const {
      mood,
      source = 'manual',
      conversationId,
      type = content ? 'text' : 'voice',
      voiceUri,
      voiceDurationSec,
      transcript,
    } = opts;

    const entryForApi = typeof contentOrOptions === 'string' ? content : (content || 'Voice note');

    const addLocal = (id: string) =>
      set((state) => ({
        entries: [
          {
            id,
            content: content || (transcript ?? ''),
            mood,
            source,
            conversationId,
            createdAt,
            type: voiceUri ? 'voice' : (content && transcript ? 'mixed' : content ? 'text' : 'voice'),
            voiceUri,
            voiceDurationSec,
            transcript,
            transcribedAt: transcript ? createdAt : undefined,
          },
          ...state.entries,
        ],
      }));

    if (userId) {
      database
        .addJournalEntry(userId, entryForApi, {
          mood,
          source,
          conversation_id: conversationId,
        })
        .then((res) => {
          if ('id' in res) addLocal(res.id);
          else addLocal(genId());
          trackJournalEntry();
        })
        .catch(() => addLocal(genId()));
    } else {
      addLocal(genId());
      trackJournalEntry();
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

  reset: () => set({ entries: [] }),
}));
