import { Stack } from 'expo-router';

/**
 * Onboarding stack — first-run flow, consent, setup.
 * Not a modal; real stack (Batch 2 modal reduction). Owned by Cockpit.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="old" options={{ animation: 'fade' }} />
    </Stack>
  );
}
