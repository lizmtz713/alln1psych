/**
 * Creativity Tool — Ideas, prompt responses, daily prompt seed.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CreativeIdea, CreativePromptResponse } from '../types/creativity';

const STORAGE_KEY = 'ingauge_creativity';
const MAX_IDEAS = 500;
const MAX_RESPONSES = 300;

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface CreativityState {
  ideas: CreativeIdea[];
  responses: CreativePromptResponse[];

  addIdea: (body: string, tag?: string) => string;
  getIdeas: () => CreativeIdea[];
  getIdea: (id: string) => CreativeIdea | undefined;
  deleteIdea: (id: string) => void;
  updateIdea: (id: string, body: string, tag?: string) => void;

  addResponse: (promptId: string, body: string) => string;
  getResponses: (promptId?: string) => CreativePromptResponse[];
  getResponse: (id: string) => CreativePromptResponse | undefined;

  reset: () => void;
}

export const useCreativityStore = create<CreativityState>()(
  persist(
    (set, get) => ({
      ideas: [],
      responses: [],

      addIdea: (body, tag) => {
        const id = genId('idea');
        const idea: CreativeIdea = {
          id,
          body: body.trim(),
          tag,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          ideas: [idea, ...s.ideas].slice(0, MAX_IDEAS),
        }));
        return id;
      },

      getIdeas: () => get().ideas,
      getIdea: (id) => get().ideas.find((i) => i.id === id),
      deleteIdea: (id) => set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) })),
      updateIdea: (id, body, tag) =>
        set((s) => ({
          ideas: s.ideas.map((i) => (i.id === id ? { ...i, body: body.trim(), tag } : i)),
        })),

      addResponse: (promptId, body) => {
        const id = genId('resp');
        const response: CreativePromptResponse = {
          id,
          promptId,
          body: body.trim(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          responses: [response, ...s.responses].slice(0, MAX_RESPONSES),
        }));
        return id;
      },

      getResponses: (promptId) => {
        const list = get().responses;
        return promptId ? list.filter((r) => r.promptId === promptId) : list;
      },
      getResponse: (id) => get().responses.find((r) => r.id === id),

      reset: () => set({ ideas: [], responses: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ideas: s.ideas, responses: s.responses }),
    }
  )
);
