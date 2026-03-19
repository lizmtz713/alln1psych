import { Stack } from 'expo-router';
import { COLORS } from '../../../src/lib/constants';

export default function MemoryBuilderLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="person/[id]" />
      <Stack.Screen name="practice" />
      <Stack.Screen name="practice/[exercise]" />
      <Stack.Screen name="tips" />
    </Stack>
  );
}
