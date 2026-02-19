import { Redirect } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { useUserStore } from '../src/stores/userStore';
import { SplashScreen } from '../src/components/SplashScreen';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);

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
