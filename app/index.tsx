import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { useUserStore } from '../src/stores/userStore';
import { SplashScreen } from '../src/components/SplashScreen';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { ensureFirstLaunchDate } from '../src/services/onboardingService';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const hydrate = useOnboardingStore((s) => s.hydrate);

  useEffect(() => {
    if (user && onboardingCompleted) {
      ensureFirstLaunchDate();
      hydrate();
    }
  }, [user, onboardingCompleted, hydrate]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(modals)/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
