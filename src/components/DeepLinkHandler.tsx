/**
 * Handles ingauge:// deep links (e.g. from widget or external).
 * ingauge://checkin → cockpit check-in
 * ingauge://preflight → pre-flight ritual
 */

import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      try {
        if (url.includes('checkin')) {
          router.push('/(modals)/cockpit-checkin');
        } else if (url.includes('preflight')) {
          router.push('/rituals/pre-flight');
        } else if (url.includes('emergency')) {
          router.push('/emergency');
        }
      } catch (e) {
        if (__DEV__) console.warn('[DeepLink]', e);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [router]);

  return null;
}
