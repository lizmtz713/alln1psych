import { Stack } from 'expo-router';

export default function MindMailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0B0F' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="glimpse-view"
        options={{ presentation: 'fullScreenModal', headerShown: false }}
      />
      <Stack.Screen name="maintenance-ticket" />
    </Stack>
  );
}
