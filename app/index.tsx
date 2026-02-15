import { Redirect } from 'expo-router';
import { useUserStore } from '../src/stores/userStore';

export default function IndexScreen() {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(modals)/onboarding" />;
}
