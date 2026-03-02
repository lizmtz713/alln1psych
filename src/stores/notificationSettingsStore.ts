/**
 * Smart notification preferences — toggles per type, quiet hours, frequency, smart timing.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SmartNotificationSettings,
  SmartNotificationType,
  QuietHours,
  NotificationFrequency,
} from '../services/smartNotifications';
import {
  DEFAULT_SMART_SETTINGS,
  type NotificationTypeConfig,
} from '../services/smartNotifications';

interface NotificationSettingsState extends SmartNotificationSettings {
  setQuietHours: (q: Partial<QuietHours>) => void;
  setFrequency: (f: NotificationFrequency) => void;
  setSmartTiming: (v: boolean) => void;
  setMaxPerDay: (n: number) => void;
  setMinHoursBetween: (n: number) => void;
  setTypeEnabled: (type: SmartNotificationType, enabled: boolean) => void;
  setTypePriority: (type: SmartNotificationType, priority: NotificationTypeConfig['priority']) => void;
  reset: () => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SMART_SETTINGS,

      setQuietHours: (q) =>
        set((s) => ({
          quietHours: { ...s.quietHours, ...q },
        })),

      setFrequency: (frequency) => set({ frequency }),

      setSmartTiming: (smartTiming) => set({ smartTiming }),

      setMaxPerDay: (maxPerDay) => set({ maxPerDay }),

      setMinHoursBetween: (minHoursBetween) => set({ minHoursBetween }),

      setTypeEnabled: (type, enabled) =>
        set((s) => ({
          types: {
            ...s.types,
            [type]: { ...s.types[type], enabled },
          },
        })),

      setTypePriority: (type, priority) =>
        set((s) => ({
          types: {
            ...s.types,
            [type]: { ...s.types[type], priority },
          },
        })),

      reset: () => set(DEFAULT_SMART_SETTINGS),
    }),
    {
      name: '@ingauge/notification_settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
