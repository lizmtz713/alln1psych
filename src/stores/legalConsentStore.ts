/**
 * Legal consent & privacy preferences.
 * Persisted for AI disclaimer, voice disclosure, AI learning, voice storage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ingauge_legal_consent';

export interface LegalConsentState {
  /** When user accepted the AI guidance notice (ISO string or null) */
  aiDisclaimerAcceptedAt: string | null;
  /** When user accepted the voice interaction notice */
  voiceDisclosureAcceptedAt: string | null;
  /** Allow conversations to be used to improve AI (default true; user can disable) */
  allowAiLearning: boolean;
  /** Store voice transcripts (default true; user can disable) */
  voiceStorageEnabled: boolean;

  setAiDisclaimerAccepted: () => void;
  setVoiceDisclosureAccepted: () => void;
  setAllowAiLearning: (value: boolean) => void;
  setVoiceStorageEnabled: (value: boolean) => void;
  hasAcceptedAiDisclaimer: () => boolean;
  hasAcceptedVoiceDisclosure: () => boolean;
}

export const useLegalConsentStore = create<LegalConsentState>()(
  persist(
    (set, get) => ({
      aiDisclaimerAcceptedAt: null,
      voiceDisclosureAcceptedAt: null,
      allowAiLearning: true,
      voiceStorageEnabled: true,

      setAiDisclaimerAccepted: () => set({ aiDisclaimerAcceptedAt: new Date().toISOString() }),
      setVoiceDisclosureAccepted: () => set({ voiceDisclosureAcceptedAt: new Date().toISOString() }),
      setAllowAiLearning: (value) => set({ allowAiLearning: value }),
      setVoiceStorageEnabled: (value) => set({ voiceStorageEnabled: value }),

      hasAcceptedAiDisclaimer: () => Boolean(get().aiDisclaimerAcceptedAt),
      hasAcceptedVoiceDisclosure: () => Boolean(get().voiceDisclosureAcceptedAt),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        aiDisclaimerAcceptedAt: s.aiDisclaimerAcceptedAt,
        voiceDisclosureAcceptedAt: s.voiceDisclosureAcceptedAt,
        allowAiLearning: s.allowAiLearning,
        voiceStorageEnabled: s.voiceStorageEnabled,
      }),
    }
  )
);
