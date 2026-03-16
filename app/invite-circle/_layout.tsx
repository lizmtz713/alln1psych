import { Stack } from 'expo-router';

/**
 * Invite Circle stack — invite flow for circle/temperature system.
 * Not a modal; real stack (Batch 4 modal reduction). Owned by People.
 */
export default function InviteCircleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
