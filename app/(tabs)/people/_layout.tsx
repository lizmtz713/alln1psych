import { Stack } from 'expo-router';
import { COLORS } from '../../../src/lib/constants';

export default function PeopleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="family-fleet" />
      <Stack.Screen name="fleet-management" />
      <Stack.Screen name="copilot-radar" />
      <Stack.Screen name="fleet-synergy" />
      <Stack.Screen name="black-box" />
    </Stack>
  );
}
