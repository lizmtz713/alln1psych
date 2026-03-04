import { Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/lib/constants';

export default function NewsLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ padding: 8 }} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'News My Way' }} />
      <Stack.Screen name="settings" options={{ title: 'News Settings' }} />
    </Stack>
  );
}
