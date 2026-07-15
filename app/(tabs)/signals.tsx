/**
 * Signals — Insights & predictions hub (awareness layer).
 * All signals in one place: relationship drift, birthdays, social health, predictions, insights.
 * Easy access, well organized. Links to People and Tools for action.
 */

import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import {
  getDriftWarning,
  getSocialHealthScore,
  getDailyReachOuts,
} from '../../src/services/friendshipMaintenance';
import { getBirthdayReminders, getLastTimeMoments } from '../../src/services/memoryEngine';
import { getMostUrgentWarning } from '../../src/services/predictiveWarnings';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';

export default function SignalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const members = useCircleStore((s) => s.members ?? []);
  const membersSafe = useMemo(() => (Array.isArray(members) ? members : []), [members]);
  const getLights = useLightsStore((s) => s.getLights);
  const lights = useMemo(() => {
    try {
      return getLights(membersSafe);
    } catch {
      return [];
    }
  }, [getLights, membersSafe]);

  const driftWarning = useMemo(() => getDriftWarning(lights), [lights]);
  const socialHealth = useMemo(() => getSocialHealthScore(lights), [lights]);
  const birthdayReminders = useMemo(() => getBirthdayReminders(lights, 14), [lights]);
  const lastTimeMoments = useMemo(() => getLastTimeMoments(lights, 21, 5), [lights]);
  const dailyReachOuts = useMemo(() => getDailyReachOuts(lights, 8), [lights]);
  const [predictiveWarning, setPredictiveWarning] = useState<Awaited<ReturnType<typeof getMostUrgentWarning>>>(null);
  useEffect(() => {
    getMostUrgentWarning().then(setPredictiveWarning).catch(() => setPredictiveWarning(null));
  }, []);

  const needAttentionCount = dailyReachOuts.priority.length + dailyReachOuts.suggested.length;

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const openPeople = (heroId?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(heroId ? `/(tabs)/people?hero=${encodeURIComponent(heroId)}` as any : '/(tabs)/people');
  };

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Signals</Text>
          <Text style={styles.headerSub}>Insights & predictions</Text>
        </View>

        {/* Relationship signals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relationship signals</Text>
          {driftWarning && (
            <Pressable
              style={({ pressed }) => [styles.card, styles.cardDrift, pressed && styles.cardPressed]}
              onPress={() => openPeople(driftWarning.light.id)}
            >
              <Text style={styles.cardEmoji}>📡</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{driftWarning.light.name} is drifting</Text>
                <Text style={styles.cardSub}>
                  You usually talk every {driftWarning.normalRhythmDays} days. It's been {driftWarning.daysSinceContact} days.
                </Text>
                <Text style={styles.cardCta}>See in People →</Text>
              </View>
            </Pressable>
          )}
          {birthdayReminders.slice(0, 3).map((b) => (
            <Pressable
              key={b.light.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => openPeople(b.light.id)}
            >
              <Text style={styles.cardEmoji}>🎂</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{b.light.name}'s birthday {b.daysUntil === 0 ? 'today' : b.label}</Text>
                <Text style={styles.cardCta}>See in People →</Text>
              </View>
            </Pressable>
          ))}
          {lastTimeMoments.slice(0, 2).map((m) => (
            <Pressable
              key={m.light.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => openPeople(m.light.id)}
            >
              <Text style={styles.cardEmoji}>💭</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Haven't seen {m.light.name} in {m.daysAgo} days</Text>
                <Text style={styles.cardSub}>Last time: {m.lastActivities[0] ?? 'Got together'}</Text>
                <Text style={styles.cardCta}>See in People →</Text>
              </View>
            </Pressable>
          ))}
          {needAttentionCount > 0 && !driftWarning && (
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => openPeople()}>
              <Text style={styles.cardEmoji}>💛</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{needAttentionCount} {needAttentionCount === 1 ? 'person' : 'people'} may need attention</Text>
                <Text style={styles.cardCta}>Open People →</Text>
              </View>
            </Pressable>
          )}
          {!driftWarning && birthdayReminders.length === 0 && lastTimeMoments.length === 0 && needAttentionCount === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No relationship signals right now</Text>
              <Text style={styles.emptySub}>Your people are in view</Text>
            </View>
          )}
        </View>

        {/* Social health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social health</Text>
          <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => openPeople()}>
            <View style={styles.healthRow}>
              <Text style={styles.healthScore}>{lights.length === 0 ? '—' : `${socialHealth.score}%`}</Text>
              <View style={styles.healthTiers}>
                {socialHealth.tierSummaries.map((t) => (
                  <Text key={t.tier} style={styles.healthTier}>
                    {t.label}: {t.statusLabel.toLowerCase()}
                  </Text>
                ))}
              </View>
            </View>
            <Text style={styles.cardCta}>See in People →</Text>
          </Pressable>
        </View>

        {/* Predictions */}
        {predictiveWarning && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Predictions</Text>
            <Pressable
              style={({ pressed }) => [styles.card, styles.cardPrediction, pressed && styles.cardPressed]}
              onPress={() => router.push('/(modals)/cockpit-checkin')}
            >
              <Text style={styles.cardEmoji}>📈</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{predictiveWarning.message}</Text>
                <Text style={styles.cardSub}>{predictiveWarning.suggestion}</Text>
                <Text style={styles.cardCta}>Check in →</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Quick link to People */}
        <Pressable style={({ pressed }) => [styles.ctaCard, pressed && styles.cardPressed]} onPress={() => openPeople()}>
          <Ionicons name="people" size={24} color={COLORS.accent} />
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>Open People</Text>
            <Text style={styles.ctaSub}>Relationships, drift, Transmit</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20 },
  header: { marginBottom: SPACING.lg },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 15, color: COLORS.textMuted, marginTop: 4 },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardDrift: { borderLeftWidth: 3, borderLeftColor: COLORS.accent },
  cardPrediction: { borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  cardPressed: { opacity: 0.92 },
  cardEmoji: { fontSize: 24, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  cardCta: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  healthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  healthScore: { fontSize: 32, fontWeight: '800', color: COLORS.accent, marginRight: 16 },
  healthTiers: { flex: 1 },
  healthTier: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  emptySub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  ctaTextWrap: { flex: 1 },
  ctaTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  ctaSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
