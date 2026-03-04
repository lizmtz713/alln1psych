import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0B0F' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="identity" />
      <Stack.Screen name="how-you-connect" />
      <Stack.Screen name="what-gives-life" />
      <Stack.Screen name="sensitive" />
      <Stack.Screen name="in-your-own-words" />
      <Stack.Screen name="gauges/body" />
      <Stack.Screen name="gauges/state" />
      <Stack.Screen name="gauges/emotion" />
      <Stack.Screen name="gauges/connection" />
      <Stack.Screen name="gauges/direction" />
      <Stack.Screen name="gauges/direction-discovery" />
      <Stack.Screen name="gauges/alignment" />
      <Stack.Screen name="gauges/alignment-discovery" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
