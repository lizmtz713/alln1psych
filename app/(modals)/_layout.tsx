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
      <Stack.Screen name="history" options={{ presentation: 'modal' }} />
      <Stack.Screen name="features" options={{ presentation: 'modal' }} />
      <Stack.Screen name="weekly-insight" options={{ presentation: 'modal' }} />
      <Stack.Screen name="resolve" options={{ presentation: 'modal' }} />
      <Stack.Screen name="health-connections" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notification-settings" options={{ presentation: 'modal' }} />
      <Stack.Screen name="heart-inbox" options={{ presentation: 'modal' }} />
      <Stack.Screen name="heart-mail-detail" options={{ presentation: 'modal' }} />
      <Stack.Screen name="heart-mail-compose" options={{ presentation: 'modal' }} />
      {/* NEW - Previously missing */}
      <Stack.Screen name="awards" options={{ presentation: 'modal' }} />
      <Stack.Screen name="awe-activities" options={{ presentation: 'modal' }} />
      <Stack.Screen name="crisis-resources" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cycle" options={{ presentation: 'modal' }} />
      <Stack.Screen name="debrief" options={{ presentation: 'modal' }} />
      <Stack.Screen name="drift-detector" options={{ presentation: 'modal' }} />
      <Stack.Screen name="identity-setup" options={{ presentation: 'modal' }} />
      <Stack.Screen name="learning-style-quiz" options={{ presentation: 'modal' }} />
      <Stack.Screen name="pre-conversation-check" options={{ presentation: 'modal' }} />
      <Stack.Screen name="reach-out-scaffold" options={{ presentation: 'modal' }} />
      <Stack.Screen name="drift-detector" options={{ presentation: 'modal' }} />
      <Stack.Screen name="awe-activities" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cycle" options={{ presentation: 'modal' }} />
      <Stack.Screen name="therapist-share" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
