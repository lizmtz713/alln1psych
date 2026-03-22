/**
 * Push and local notifications: daily check-ins, evening reflection, circle nudges.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) console.log('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

/** Daily morning check-in (default 9:00). */
export async function scheduleDailyCheckin(hour: number = 9, minute: number = 0): Promise<void> {
  await cancelDailyCheckin();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'How are you feeling? 💛',
      body: 'Take a moment to check in with yourself.',
      data: { type: 'daily-checkin' },
    },
    trigger: { type: 'daily', hour, minute } as Notifications.NotificationTriggerInput,
  });
}

export async function cancelDailyCheckin(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'daily-checkin') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

/** Evening reflection (default 21:00). */
export async function scheduleEveningReflection(hour: number = 21, minute: number = 0): Promise<void> {
  await cancelEveningReflection();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'How was your day? 🌙',
      body: 'Gauge is here if you want to talk about it.',
      data: { type: 'evening-reflection' },
    },
    trigger: { type: 'daily', hour, minute } as Notifications.NotificationTriggerInput,
  });
}

export async function cancelEveningReflection(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'evening-reflection') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

/** Immediate local notification for circle nudge. */
export async function sendLocalNudge(memberName: string, message: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${memberName} could use you 💛`,
      body: message,
      data: { type: 'circle-nudge', memberName },
    },
    trigger: null,
  });
}

/** One-time reminder to check in with someone (e.g. 1–3 days from now). */
export async function scheduleCheckInReminder(
  personName: string,
  daysFromNow: 1 | 2 | 3
): Promise<string | null> {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(10, 0, 0, 0);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check in with ' + personName + ' 🤝',
      body: 'You set a reminder to follow up. How are they doing?',
      data: { type: 'help-someone-reminder', personName },
    },
    trigger: { date: d, type: 'date' } as Notifications.NotificationTriggerInput,
  });
  return id;
}

// === DRIFT WARNING (relationship radar) ===

const DRIFT_NOTIFICATION_TYPE = 'drift-warning";

/** Schedule a single \"X is drifting\" notification (e.g. tomorrow at 10am). */
export async function scheduleDriftReminder(
  personName: string,
  normalRhythmDays: number,
  daysSinceContact: number,
  triggerDate?: Date
): Promise<string | null> {
  await cancelDriftReminders();
  const d = triggerDate ?? (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(10, 0, 0, 0);
    return t;
  })();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${personName} is drifting`,
      body: `You usually talk every ${normalRhythmDays} days. It's been ${daysSinceContact} days. Want to reconnect?`,
      data: { type: DRIFT_NOTIFICATION_TYPE, personName, normalRhythmDays, daysSinceContact },
    },
    trigger: { date: d, type: "date' } as Notifications.NotificationTriggerInput,
  });
  return id;
}

export async function cancelDriftReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as { type?: string })?.type === DRIFT_NOTIFICATION_TYPE) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}
