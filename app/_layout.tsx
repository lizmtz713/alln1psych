import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/lib/constants';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/providers/AuthProvider';
import { AuthSync } from '../src/providers/AuthSync';
import { NotificationsSetup } from '../src/providers/NotificationsSetup';
import { AchievementModalHolder } from '../src/components/achievements/AchievementModalHolder';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AuthSync>
            <NotificationsSetup>
            <AchievementModalHolder />
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
          <Stack.Screen name="share" />
          <Stack.Screen name="forecast" />
          <Stack.Screen name="tools" />
          <Stack.Screen name="learn" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="habits" />
          <Stack.Screen name="love" />
          <Stack.Screen name="love-history" />
          <Stack.Screen name="body-maintenance" />
          <Stack.Screen name="news-my-way" />
          <Stack.Screen name="emergency" />
          <Stack.Screen name="rituals" />
          <Stack.Screen name="mind-mail" />
          <Stack.Screen name="lights" />
          <Stack.Screen name="flight-log" />
          <Stack.Screen name="timeline" />
          <Stack.Screen name="wrapped" />
          </Stack>
            </NotificationsSetup>
          </AuthSync>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
