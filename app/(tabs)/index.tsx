import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { useCircleStore } from '../../src/stores/circleStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { myTemperature, myTemperatureLabel, members } = useCircleStore();
  const card0 = useRef(new Animated.Value(0)).current;
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const card3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (v: Animated.Value, delay: number) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      });
    Animated.parallel([
      anim(card0, 0),
      anim(card1, 100),
      anim(card2, 200),
      anim(card3, 300),
    ]).start();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const needsCheckIn = members.filter(
    (m) => m.temperature === 'orange' || m.temperature === 'red'
  );
  const firstAlert = needsCheckIn[0];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      <Text style={styles.welcome}>Welcome to your space.</Text>
      <Text style={styles.sub}>Everything here is just for you.</Text>

      {/* Temperature summary card */}
      <Animated.View
        style={[
          styles.card,
          styles.tempCard,
          {
            opacity: card0,
            transform: [{ translateY: card0.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          },
        ]}
      >
        <View style={[styles.cardRow]}>
          <TemperatureGauge temperature={myTemperature} size="md" />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>You're feeling</Text>
            <Text style={styles.cardLabel}>{myTemperatureLabel}</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.checkInButton, pressed && { transform: [{ scale: 0.96 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/mood-checkin');
          }}
        >
          <Text style={styles.checkInButtonText}>Check in</Text>
        </Pressable>
      </Animated.View>

      {/* Circle preview */}
      <Animated.View style={[styles.section, { opacity: card1, transform: [{ translateY: card1.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
        <Text style={styles.sectionTitle}>Your circle</Text>
        {members.length === 0 ? (
          <Text style={styles.muted}>No one in your circle yet.</Text>
        ) : (
          <>
            <Text style={styles.muted}>
              {members.length} {members.length === 1 ? 'person' : 'people'} in your circle
            </Text>
            {firstAlert && (
              <Animated.View style={[styles.alert, styles.alertGlow]}>
                <Text style={styles.alertText}>
                  {firstAlert.name} could use a check-in
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.alertButton, pressed && { opacity: 0.9 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(tabs)/circle');
                  }}
                >
                  <Text style={styles.alertButtonText}>See Circle</Text>
                </Pressable>
              </Animated.View>
            )}
          </>
        )}
      </Animated.View>

      {/* Practice a conversation */}
      <Animated.View style={{ opacity: card2, transform: [{ translateY: card2.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
      <Pressable
        style={({ pressed }) => [styles.practiceCard, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(modals)/role-play');
        }}
      >
        <Text style={styles.practiceEmoji}>🎭</Text>
        <Text style={styles.practiceTitle}>Practice a conversation</Text>
        <Text style={styles.practiceSub}>Rehearse tough talks with AI before the real thing.</Text>
      </Pressable>
      </Animated.View>

      <Text style={styles.prompt}>How are you feeling today?</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: 17,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 24,
  },
  tempCard: {
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTextWrap: { marginLeft: 16 },
  cardTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  checkInButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  muted: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  alert: {
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertGlow: {
    shadowColor: COLORS.temperature.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  alertText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  alertButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  alertButtonText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '500',
  },
  practiceCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 24,
  },
  practiceEmoji: { fontSize: 28, marginBottom: 8 },
  practiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  practiceSub: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  prompt: {
    fontSize: 17,
    color: COLORS.accent,
  },
});
