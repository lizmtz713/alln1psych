import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthProvider';
import { useSettingsStore } from '../stores/settingsStore';
import { registerForPushNotifications } from '../services/notifications';
import {
  scheduleDailyCheckin,
  scheduleEveningReflection,
  cancelDailyCheckin,
  cancelEveningReflection,
} from '../services/notifications';
import * as database from '../services/database';

/**
 * When user is authenticated: register for push, save token to profile,
 * sync scheduled notifications with settings, and handle notification taps.
 */
export function NotificationsSetup({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const settings = useSettingsStore();
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    (async () => {
      const token = await registerForPushNotifications();
      if (cancelled || !token) return;
      await database.updateProfile(user.id, { push_token: token });
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    if (settings.notificationsCheckIn) {
      scheduleDailyCheckin(9, 0).catch(() => {});
      scheduleEveningReflection(21, 0).catch(() => {});
    } else {
      cancelDailyCheckin().catch(() => {});
      cancelEveningReflection().catch(() => {});
    }
  }, [user?.id, settings.notificationsCheckIn]);

  useEffect(() => {
    listenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string };
      const type = data?.type;
      if (type === 'daily-checkin') {
        router.push('/(modals)/mood-checkin');
      } else if (type === 'evening-reflection') {
        router.push('/(tabs)/talk');
      } else if (type === 'circle-nudge') {
        router.push('/(tabs)/circle');
      }
    });

    return () => {
      if (listenerRef.current) {
        (listenerRef.current as { remove?: () => void }).remove?.();
        listenerRef.current = null;
      }
    };
  }, [router]);

  return <>{children}</>;
}
