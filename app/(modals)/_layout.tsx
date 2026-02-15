import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="mood-checkin" options={{ presentation: 'modal' }} />
      <Stack.Screen name="invite-circle" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new-journal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
