import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        gestureEnabled: true,
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="mood-checkin" options={{ presentation: 'modal' }} />
      <Stack.Screen name="invite-circle" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new-journal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="role-play" options={{ presentation: 'modal' }} />
      <Stack.Screen name="activity" options={{ presentation: 'modal' }} />
      <Stack.Screen name="help-someone" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cockpit-checkin" options={{ presentation: 'modal' }} />
      <Stack.Screen name="gauge-detail" options={{ presentation: 'modal' }} />
      <Stack.Screen name="replay" options={{ presentation: 'modal' }} />
      <Stack.Screen name="decode" options={{ presentation: 'modal' }} />
      <Stack.Screen name="relate" options={{ presentation: 'modal' }} />
      <Stack.Screen name="love" options={{ presentation: 'modal' }} />
      <Stack.Screen name="referee" options={{ presentation: 'modal' }} />
      <Stack.Screen name="history" options={{ presentation: 'modal' }} />
      <Stack.Screen name="prompt-generator" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      <Stack.Screen name="patterns" options={{ presentation: 'modal' }} />
      <Stack.Screen name="awards" options={{ presentation: 'modal' }} />
      <Stack.Screen name="identity-setup" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="learning-style-quiz" options={{ presentation: 'modal' }} />
      <Stack.Screen name="pre-conversation-check" options={{ presentation: 'modal' }} />
      <Stack.Screen name="reach-out-scaffold" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
