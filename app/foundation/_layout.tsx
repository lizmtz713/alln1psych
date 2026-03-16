import { Stack } from 'expo-router';

export default function FoundationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="values" />
      <Stack.Screen name="directions" />
      <Stack.Screen name="people" />
      <Stack.Screen name="body" />
      <Stack.Screen name="state" />
      <Stack.Screen name="emotion" />
    </Stack>
  );
}
