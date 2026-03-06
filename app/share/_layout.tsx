import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function ShareLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="cockpit" options={{ title: 'Share Cockpit' }} />
    </Stack>
  );
}
