import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function RitualsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="pre-flight" />
      <Stack.Screen name="post-flight" />
      <Stack.Screen name="gratitude-review" />
    </Stack>
  );
}
