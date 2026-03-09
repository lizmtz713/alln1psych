import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function LightsLayout() {
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
      <Stack.Screen name="[id]" options={{ title: 'Person' }} />
      <Stack.Screen name="log-entry" options={{ title: 'Log connection' }} />
      <Stack.Screen name="add" options={{ title: 'Add someone' }} />
      <Stack.Screen name="world" options={{ title: 'World Temperature' }} />
      <Stack.Screen name="map" options={{ title: 'Relationship Universe' }} />
      <Stack.Screen name="radar" options={{ title: 'Relationship Universe' }} />
      <Stack.Screen name="insights" options={{ title: 'People Insights' }} />
      <Stack.Screen name="learn" options={{ title: 'The Art of Friendship' }} />
      <Stack.Screen name="lessons" options={{ headerShown: false }} />
      <Stack.Screen name="tiers/five" options={{ title: 'Your 5' }} />
      <Stack.Screen name="tiers/fifteen" options={{ title: 'Your 15' }} />
      <Stack.Screen name="tiers/fifty" options={{ title: 'Your 50' }} />
      <Stack.Screen name="tiers/network" options={{ title: 'Your 150' }} />
      <Stack.Screen name="family/index" options={{ title: 'Family Dashboard' }} />
      <Stack.Screen name="family/create" options={{ title: 'Create Family' }} />
      <Stack.Screen name="family/[familyId]/index" options={{ title: 'Family' }} />
      <Stack.Screen name="family/[familyId]/coordinate" options={{ title: 'Coordinate Care' }} />
      <Stack.Screen name="family/[familyId]/patterns" options={{ title: 'Family Patterns' }} />
      <Stack.Screen name="family/[familyId]/settings" options={{ title: 'Family Settings' }} />
    </Stack>
  );
}
