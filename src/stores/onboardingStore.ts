/**
 * Adaptive Onboarding - Focus mode state (synced with AsyncStorage).
 * Shared between Settings and Home so toggling updates immediately.
 */

import { create } from 'zustand';
import { getFocusMode, setFocusMode as setFocusModeStorage } from '../services/onboardingService';

interface OnboardingState {
  focusMode: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setFocusMode: (on: boolean) => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  focusMode: false,
  hydrated: false,
  hydrate: async () => {
    const v = await getFocusMode();
    set({ focusMode: v, hydrated: true });
  },
  setFocusMode: async (on: boolean) => {
    await setFocusModeStorage(on);
    set({ focusMode: on });
  },
}));
