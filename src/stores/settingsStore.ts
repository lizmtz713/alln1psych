import { create } from 'zustand';

interface SettingsState {
  apiKeySavedAt: number;
  notificationsCheckIn: boolean;
  notificationsCircleNudges: boolean;
  voicePreference: 'voice' | 'text';
  /** When true, AI responds with voice (OpenAI TTS). When false, text only. */
  aiVoiceEnabled: boolean;
  circleSharingPaused: boolean;
  setApiKeySavedAt: (at: number) => void;
  setNotificationsCheckIn: (v: boolean) => void;
  setNotificationsCircleNudges: (v: boolean) => void;
  setVoicePreference: (v: 'voice' | 'text') => void;
  setAiVoiceEnabled: (v: boolean) => void;
  setCircleSharingPaused: (v: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKeySavedAt: 0,
  notificationsCheckIn: true,
  notificationsCircleNudges: true,
  voicePreference: 'voice',
  aiVoiceEnabled: true,
  circleSharingPaused: false,

  setApiKeySavedAt: (apiKeySavedAt) => set({ apiKeySavedAt }),
  setNotificationsCheckIn: (notificationsCheckIn) => set({ notificationsCheckIn }),
  setNotificationsCircleNudges: (notificationsCircleNudges) => set({ notificationsCircleNudges }),
  setVoicePreference: (voicePreference) => set({ voicePreference }),
  setAiVoiceEnabled: (aiVoiceEnabled) => set({ aiVoiceEnabled }),
  setCircleSharingPaused: (circleSharingPaused) => set({ circleSharingPaused }),
  reset: () =>
    set({
      apiKeySavedAt: 0,
      notificationsCheckIn: true,
      notificationsCircleNudges: true,
      voicePreference: 'voice',
      aiVoiceEnabled: true,
      circleSharingPaused: false,
    }),
}));
