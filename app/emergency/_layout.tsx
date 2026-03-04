import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function EmergencyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="crisis" />
      <Stack.Screen name="breathe" />
      <Stack.Screen name="reach-out" />
    </Stack>
  );
}
