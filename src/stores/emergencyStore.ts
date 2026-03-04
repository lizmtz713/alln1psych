/**
 * Emergency Mode store — active session, settings, minimal session tracking.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  EmergencySession,
  EmergencySettings,
  EmergencyTrigger,
  EmergencyAction,
} from '../types/emergency';
import { DEFAULT_EMERGENCY_SETTINGS } from '../types/emergency';

const STORAGE_KEY = 'ingauge_emergency';

function genId(): string {
  return `em-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface EmergencyState {
  isActive: boolean;
  currentSession: EmergencySession | null;
  recentSessions: EmergencySession[];
  settings: EmergencySettings;
  activate: (trigger: EmergencyTrigger) => void;
  deactivate: () => void;
  recordAction: (action: EmergencyAction, meta?: { contactedLightId?: string }) => void;
  recordTrustedContactNotified: () => void;
  setSettings: (s: Partial<EmergencySettings>) => void;
}

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentSession: null,
      recentSessions: [],
      settings: DEFAULT_EMERGENCY_SETTINGS,

      activate: (trigger) => {
        const session: EmergencySession = {
          id: genId(),
          startedAt: new Date().toISOString(),
          trigger,
          actionsUsed: [],
          trustedContactNotified: false,
        };
        set({ isActive: true, currentSession: session });
      },

      deactivate: () => {
        const { currentSession, recentSessions } = get();
        if (currentSession) {
          const ended = { ...currentSession, endedAt: new Date().toISOString() };
          set({ recentSessions: [ended, ...recentSessions].slice(0, 30) });
        }
        set({ isActive: false, currentSession: null });
      },

      recordAction: (action, meta) => {
        const { currentSession } = get();
        if (!currentSession) return;
        const actionsUsed = currentSession.actionsUsed.includes(action)
          ? currentSession.actionsUsed
          : [...currentSession.actionsUsed, action];
        set({
          currentSession: {
            ...currentSession,
            actionsUsed,
            ...(meta?.contactedLightId && { contactedLightId: meta.contactedLightId }),
          },
        });
      },

      recordTrustedContactNotified: () => {
        const { currentSession } = get();
        if (!currentSession) return;
        set({ currentSession: { ...currentSession, trustedContactNotified: true } });
      },

      setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings, recentSessions: state.recentSessions }),
    }
  )
);
