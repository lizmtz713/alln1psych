import { Stack } from 'expo-router';

/**
 * Identity setup stack — configuration/profile flow (name, age, pronouns, etc.).
 * Not a modal; real stack (Batch 3 modal reduction). Owned by Me. May move under /profile later.
 */
export default function IdentitySetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
