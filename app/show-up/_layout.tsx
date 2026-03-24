import { Stack } from 'expo-router';
import { COLORS } from '../../src/lib/constants';

export default function ShowUpGuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
