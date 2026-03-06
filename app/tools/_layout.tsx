import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="quick-reset" />
      <Stack.Screen name="focus" />
      <Stack.Screen name="creativity" />
      <Stack.Screen name="decision" />
      <Stack.Screen name="bias-check" />
      <Stack.Screen name="win-capture" />
    </Stack>
  );
}
