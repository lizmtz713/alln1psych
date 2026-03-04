import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function LoveHistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Love History' }} />
      <Stack.Screen name="add" options={{ title: 'Add Entry' }} />
      <Stack.Screen name="[id]" options={{ title: 'Entry' }} />
      <Stack.Screen name="patterns" options={{ title: 'My Patterns' }} />
      <Stack.Screen name="insights" options={{ title: 'Insights' }} />
    </Stack>
  );
}
