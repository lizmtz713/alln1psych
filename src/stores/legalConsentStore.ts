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
  /** Allow saved context to personalize AI (privacy-safe default: false) */
  allowAiLearning: boolean;
  /** Reserved for a future explicit transcript-storage opt-in; currently false */
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
      allowAiLearning: false,
      voiceStorageEnabled: false,

      setAiDisclaimerAccepted: () => set({ aiDisclaimerAcceptedAt: new Date().toISOString() }),
      setVoiceDisclosureAccepted: () => set({ voiceDisclosureAcceptedAt: new Date().toISOString() }),
      setAllowAiLearning: (value) => set({ allowAiLearning: value }),
      setVoiceStorageEnabled: (value) => set({ voiceStorageEnabled: value }),

      hasAcceptedAiDisclaimer: () => Boolean(get().aiDisclaimerAcceptedAt),
      hasAcceptedVoiceDisclosure: () => Boolean(get().voiceDisclosureAcceptedAt),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<LegalConsentState>;
        if (version < 2) {
          return {
            ...state,
            allowAiLearning: false,
            voiceStorageEnabled: false,
          } as LegalConsentState;
        }
        return state as LegalConsentState;
      },
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
