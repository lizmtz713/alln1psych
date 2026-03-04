/**
 * Attachment style assessment — persistence and AI context helper.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AttachmentResult } from '../types/attachment';
import { ATTACHMENT_STYLE_INFO } from '../data/attachmentQuestions';

export interface AttachmentStoreState {
  result: AttachmentResult | null;
  lastCompletedAt: string | null;
  setResult: (result: AttachmentResult) => void;
  clearResult: () => void;
  /** For AI/CoPilot: short context string to include in system or user prompt */
  getAIContext: () => string;
}

export const useAttachmentStore = create<AttachmentStoreState>()(
  persist(
    (set, get) => ({
      result: null,
      lastCompletedAt: null,

      setResult: (result) =>
        set({
          result,
          lastCompletedAt: result.completedAt,
        }),

      clearResult: () => set({ result: null, lastCompletedAt: null }),

      getAIContext: () => {
        const { result } = get();
        if (!result) return '';
        const info = ATTACHMENT_STYLE_INFO[result.style];
        const label = info?.label ?? result.style;
        const emoji = info?.emoji ?? '';
        return `User's attachment style (self-reported): ${label} ${emoji}. Anxiety dimension: ${result.scores.anxiety.toFixed(1)}/5, Avoidance: ${result.scores.avoidance.toFixed(1)}/5. Use this to tailor how you talk about relationships, closeness, and support — e.g. if anxious, validate need for reassurance; if avoidant, respect need for space; if fearful, go slow and name safety.`;
      },
    }),
    {
      name: 'attachment-style-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
