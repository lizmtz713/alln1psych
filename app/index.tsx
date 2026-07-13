import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { useUserStore } from '../src/stores/userStore';
import { SplashScreen } from '../src/components/SplashScreen';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { ensureFirstLaunchDate } from '../src/services/onboardingService';

export default function IndexScreen() {
  const { user, loading, isPasswordRecovery } = useAuth();
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const profileHydrated = useUserStore((s) => s.profileHydrated);
  const hydrate = useOnboardingStore((s) => s.hydrate);

  useEffect(() => {
    if (user && onboardingCompleted && !isPasswordRecovery) {
      ensureFirstLaunchDate();
      hydrate();
    }
  }, [user, onboardingCompleted, hydrate, isPasswordRecovery]);

  if (loading) {
    return <SplashScreen />;
  }

  // Recovery session must never enter Cockpit / onboarding — freeze routing here.
  if (isPasswordRecovery) {
    return <Redirect href="/(auth)/reset-password-confirm" />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Wait for profile load so returning users don't briefly see onboarding (cold start).
  if (!profileHydrated) {
    return <SplashScreen />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
