import { create } from 'zustand';

interface SettingsState {
  apiKeySavedAt: number;
  notificationsCheckIn: boolean;
  notificationsCircleNudges: boolean;
  voicePreference: 'voice' | 'text';
  circleSharingPaused: boolean;
  setApiKeySavedAt: (at: number) => void;
  setNotificationsCheckIn: (v: boolean) => void;
  setNotificationsCircleNudges: (v: boolean) => void;
  setVoicePreference: (v: 'voice' | 'text') => void;
  setCircleSharingPaused: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKeySavedAt: 0,
  notificationsCheckIn: true,
  notificationsCircleNudges: true,
  voicePreference: 'voice',
  circleSharingPaused: false,

  setApiKeySavedAt: (apiKeySavedAt) => set({ apiKeySavedAt }),
  setNotificationsCheckIn: (notificationsCheckIn) => set({ notificationsCheckIn }),
  setNotificationsCircleNudges: (notificationsCircleNudges) => set({ notificationsCircleNudges }),
  setVoicePreference: (voicePreference) => set({ voicePreference }),
  setCircleSharingPaused: (circleSharingPaused) => set({ circleSharingPaused }),
}));
