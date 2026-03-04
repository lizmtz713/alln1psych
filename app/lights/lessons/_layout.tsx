import { Stack } from 'expo-router';
import { COLORS } from '../../../src/lib/constants';

export default function LessonsLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Friendship Lessons' }} />
      <Stack.Screen name="[lessonId]" options={{ title: 'Lesson' }} />
    </Stack>
  );
}
