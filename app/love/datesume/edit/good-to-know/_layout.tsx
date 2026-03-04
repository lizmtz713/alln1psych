import { Stack } from 'expo-router';
import { COLORS } from '../../../../../src/lib/constants';

export default function GoodToKnowLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Good to Know' }} />
      <Stack.Screen name="attachment" options={{ title: 'Attachment & Emotional' }} />
      <Stack.Screen name="values" options={{ title: 'Core Values' }} />
      <Stack.Screen name="life-goals" options={{ title: 'Life Goals' }} />
      <Stack.Screen name="conflict" options={{ title: 'Conflict & Communication' }} />
      <Stack.Screen name="love-style" options={{ title: 'Love Style' }} />
      <Stack.Screen name="relationships" options={{ title: 'How I Relate' }} />
      <Stack.Screen name="lifestyle" options={{ title: 'Lifestyle Basics' }} />
    </Stack>
  );
}
