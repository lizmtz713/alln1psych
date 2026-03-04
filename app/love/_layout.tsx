import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function LoveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="datesume" />
    </Stack>
  );
}
