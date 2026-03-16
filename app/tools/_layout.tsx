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
      <Stack.Screen name="help-someone" />
      <Stack.Screen name="reach-out" />
      <Stack.Screen name="relational-bridge" />
      <Stack.Screen name="focus" />
      <Stack.Screen name="human-roles" />
      <Stack.Screen name="family-conflict" />
      <Stack.Screen name="role-play" />
      <Stack.Screen name="behavior-translator" />
      <Stack.Screen name="post-flight-logger" />
      <Stack.Screen name="collision-report" />
      <Stack.Screen name="flight-plan" />
      <Stack.Screen name="parent-compass" />
      <Stack.Screen name="memory-builder" />
      <Stack.Screen name="relationship-repair" />
      <Stack.Screen name="perspective-translator" />
      <Stack.Screen name="life-direction-finder" />
      <Stack.Screen name="creativity" />
      <Stack.Screen name="decision" />
      <Stack.Screen name="bias-check" />
      <Stack.Screen name="win-capture" />
      <Stack.Screen name="tone-check" />
      <Stack.Screen name="repair" />
      <Stack.Screen name="after-fight" />
      <Stack.Screen name="conversation-builder" />
    </Stack>
  );
}
