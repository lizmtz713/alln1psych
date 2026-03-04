import { Stack } from 'expo-router';

export default function YourStoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0B0F' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit/[field]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
