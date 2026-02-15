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
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
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
    trigger: {
      type: 'daily' as const,
      hour,
      minute,
    },
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
      body: 'Psych is here if you want to talk about it.',
      data: { type: 'evening-reflection' },
    },
    trigger: {
      type: 'daily' as const,
      hour,
      minute,
    },
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
