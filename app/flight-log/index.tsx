/**
 * Flight Log — Your journey over time. Big picture, gauge journeys, timeline.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import {
  getFlightLogData,
  type FlightLogData,
  type FlightLogTimelineItem,
  type GaugeJourney,
} from '../../src/services/flightLogService';
import { format } from 'date-fns';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function FlightLogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState<FlightLogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const result = await getFlightLogData();
      setData(result);
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    load();
  };

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Loading your journey…</Text>
      </View>
    );
  }

  const startedLabel = data?.startedDate
    ? `Started: ${format(new Date(data.startedDate), 'MMMM d, yyyy')} (${data.daysSinceStart} days ago)`
    : 'Start your first check-in to see your journey';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Flight Log</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>📜</Text>
          <Text style={styles.heroTitle}>Flight Log</Text>
          <Text style={styles.heroSubtitle}>Your journey so far</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>📊 THE BIG PICTURE</Text>
        <View style={styles.card}>
          <Text style={styles.bigPictureLine}>{startedLabel}</Text>
          <Text style={styles.bigPictureLine}>Check-ins: {data?.checkInCount ?? 0} total</Text>
          <Text style={styles.bigPictureLine}>Current streak: {data?.currentStreak ?? 0} days {data?.currentStreak && data.currentStreak >= 7 ? '🔥' : ''}</Text>
        </View>

        {data?.systemScoreTrend != null && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>📈 YOUR PROGRESS</Text>
            <View style={styles.card}>
              <Text style={styles.progressLine}>
                You're {data.systemScoreTrend >= 0 ? 'up' : 'down'} {Math.abs(data.systemScoreTrend)} points from when you started. 📈
              </Text>
            </View>
          </>
        )}

        {data?.gaugeJourneys && data.gaugeJourneys.some((g) => g.startAvg > 0 || g.currentAvg > 0) && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>🎯 GAUGE JOURNEYS</Text>
            <View style={styles.card}>
              {data.gaugeJourneys.map((g) => (
                <GaugeJourneyRow key={g.key} journey={g} />
              ))}
            </View>
          </>
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>📅 TIMELINE</Text>
        {data?.timeline && data.timeline.length > 0 ? (
          data.timeline.map((item) => (
            <TimelineCard key={`${item.date}-${item.title}`} item={item} />
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyTimeline}>Complete Pre-Flight or Post-Flight to build your timeline.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function GaugeJourneyRow({ journey }: { journey: GaugeJourney }) {
  const arrow = journey.delta > 0 ? '↗️' : journey.delta < 0 ? '↘️' : '→';
  const deltaStr = journey.delta > 0 ? `+${journey.delta}` : String(journey.delta);
  return (
    <View style={styles.gaugeJourneyRow}>
      <Text style={styles.gaugeJourneyEmoji}>{journey.emoji}</Text>
      <Text style={styles.gaugeJourneyName}>{journey.name}</Text>
      <Text style={styles.gaugeJourneyNums}>
        {journey.startAvg} → {journey.currentAvg} {arrow} {deltaStr}
        {journey.isHighlight ? ' 🌟' : ''}
      </Text>
    </View>
  );
}

function TimelineCard({ item }: { item: FlightLogTimelineItem }) {
  return (
    <View style={styles.timelineCard}>
      <Text style={styles.timelineDate}>{format(new Date(item.date), 'MMM d, yyyy')}</Text>
      <Text style={styles.timelineTitle}>{item.title}</Text>
      {item.subtitle ? (
        <Text style={styles.timelineSubtitle} numberOfLines={3}>{item.subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: TEXT_MUTED },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  hero: { alignItems: 'center', marginBottom: SPACING.lg },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: TEXT },
  heroSubtitle: { fontSize: 16, color: TEXT_MUTED },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: SPACING.xl },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
  },
  bigPictureLine: { fontSize: 15, color: TEXT, marginBottom: 4 },
  progressLine: { fontSize: 15, color: TEXT },
  gaugeJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  gaugeJourneyEmoji: { fontSize: 18, marginRight: 10 },
  gaugeJourneyName: { flex: 1, fontSize: 15, fontWeight: '600', color: TEXT },
  gaugeJourneyNums: { fontSize: 14, color: TEXT_MUTED },
  timelineCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  timelineDate: { fontSize: 13, color: TEXT_MUTED, marginBottom: 6 },
  timelineTitle: { fontSize: 15, fontWeight: '500', color: TEXT },
  timelineSubtitle: { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },
  emptyTimeline: { fontSize: 15, color: TEXT_MUTED, textAlign: 'center' },
});
