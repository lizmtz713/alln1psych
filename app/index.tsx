import { useRef, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAuth } from '../src/providers/AuthProvider';
import { useUserStore } from '../src/stores/userStore';
import { COLORS } from '../src/lib/constants';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!loading) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <Animated.Text style={[styles.splashTitle, { opacity }]}>
          InGauge
        </Animated.Text>
        <Text style={styles.splashSub}>Your space is loading...</Text>
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
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  splashSub: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 16,
  },
});
