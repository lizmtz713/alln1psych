import { Stack } from 'expo-router';
import { COLORS } from '../../../src/lib/constants';

export default function DatesumeLayout() {
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
      <Stack.Screen name="index" options={{ title: 'My Datésumé' }} />
      <Stack.Screen name="edit-header" options={{ title: 'Header' }} />
      <Stack.Screen name="edit-summary" options={{ title: 'Summary' }} />
      <Stack.Screen name="add-relationship" options={{ title: 'Add experience' }} />
      <Stack.Screen name="[relationshipId]" options={{ title: 'Experience' }} />
      <Stack.Screen name="edit-skills" options={{ title: 'Skills' }} />
      <Stack.Screen name="edit-growth" options={{ title: 'Growth' }} />
      <Stack.Screen name="edit-milestones" options={{ title: 'Milestones' }} />
      <Stack.Screen name="edit-style" options={{ title: 'Style' }} />
      <Stack.Screen name="edit-offerings" options={{ title: 'What I offer' }} />
      <Stack.Screen name="edit-testimonials" options={{ title: 'Testimonials' }} />
      <Stack.Screen name="edit-logistics" options={{ title: 'Logistics' }} />
      <Stack.Screen name="edit" options={{ title: 'Good to Know' }} />
      <Stack.Screen name="preview" options={{ title: 'Preview' }} />
      <Stack.Screen name="share" options={{ title: 'Share' }} />
    </Stack>
  );
}
