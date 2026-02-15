import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { useCircleStore } from '../../src/stores/circleStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { myTemperature, myTemperatureLabel, members } = useCircleStore();

  const needsCheckIn = members.filter(
    (m) => m.temperature === 'orange' || m.temperature === 'red'
  );
  const firstAlert = needsCheckIn[0];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.welcome}>Welcome to your space.</Text>
      <Text style={styles.sub}>Everything here is just for you.</Text>

      {/* Temperature summary card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <TemperatureGauge temperature={myTemperature} size="md" />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>You're feeling</Text>
            <Text style={styles.cardLabel}>{myTemperatureLabel}</Text>
          </View>
        </View>
        <Pressable
          style={styles.checkInButton}
          onPress={() => router.push('/(modals)/mood-checkin')}
        >
          <Text style={styles.checkInButtonText}>Check in</Text>
        </Pressable>
      </View>

      {/* Circle preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your circle</Text>
        {members.length === 0 ? (
          <Text style={styles.muted}>No one in your circle yet.</Text>
        ) : (
          <>
            <Text style={styles.muted}>
              {members.length} {members.length === 1 ? 'person' : 'people'} in your circle
            </Text>
            {firstAlert && (
              <View style={styles.alert}>
                <Text style={styles.alertText}>
                  {firstAlert.name} could use a check-in
                </Text>
                <Pressable
                  style={styles.alertButton}
                  onPress={() => router.push('/(tabs)/circle')}
                >
                  <Text style={styles.alertButtonText}>See Circle</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>

      {/* Practice a conversation */}
      <Pressable
        style={styles.practiceCard}
        onPress={() => router.push('/(modals)/role-play')}
      >
        <Text style={styles.practiceEmoji}>🎭</Text>
        <Text style={styles.practiceTitle}>Practice a conversation</Text>
        <Text style={styles.practiceSub}>Rehearse tough talks with AI before the real thing.</Text>
      </Pressable>

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
