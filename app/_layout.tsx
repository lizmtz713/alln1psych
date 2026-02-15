import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/lib/constants';
import { AuthProvider } from '../src/providers/AuthProvider';
import { AuthSync } from '../src/providers/AuthSync';
import { NotificationsSetup } from '../src/providers/NotificationsSetup';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthSync>
          <NotificationsSetup>
          <StatusBar style="light" />
          <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modals)" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="lesson" />
          </Stack>
          </NotificationsSetup>
        </AuthSync>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
