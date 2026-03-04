import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function BodyMaintenanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Body Maintenance' }} />
      <Stack.Screen name="add-routine" options={{ title: 'Add Routine' }} />
      <Stack.Screen name="add-provider" options={{ title: 'Add Provider' }} />
      <Stack.Screen name="[routineId]" options={{ title: 'Routine' }} />
      <Stack.Screen name="providers/[id]" options={{ title: 'Provider' }} />
    </Stack>
  );
}
