import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/providers/AuthProvider';
import { useUserStore } from '../src/stores/userStore';
import { COLORS } from '../src/lib/constants';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>AllN1 Psych</Text>
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.spinner} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(modals)/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  spinner: {
    marginTop: 24,
  },
});
