/**
 * Gratitude Review — Weekly summary and patterns from 3 Good Things + morning gratitude.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useGratitudeStore } from '../../src/stores/gratitudeStore';
import { format, parseISO } from 'date-fns';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

export default function GratitudeReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const getStreak = useGratitudeStore((s) => s.getStreak);
  const getWeekSummary = useGratitudeStore((s) => s.getWeekSummary);
  const getPatterns = useGratitudeStore((s) => s.getPatterns);
  const days = useGratitudeStore((s) => s.days);

  const streak = getStreak();
  const weekSummary = getWeekSummary();
  const patterns = getPatterns();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const sortedDates = Object.keys(days)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 14);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Gratitude Review</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Your 3 Good Things and morning gratitude at a glance.</Text>

        {streak > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🙏</Text>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>day gratitude streak</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Evening (3 Good Things)</Text>
            <Text style={styles.summaryValue}>{weekSummary.daysWithEvening} days</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Morning gratitude</Text>
            <Text style={styles.summaryValue}>{weekSummary.daysWithMorning} days</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total good things logged</Text>
            <Text style={styles.summaryValue}>{weekSummary.totalGoodThings}</Text>
          </View>
          {weekSummary.streakAtEnd > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Streak this week</Text>
              <Text style={styles.summaryValue}>{weekSummary.streakAtEnd} days</Text>
            </View>
          )}
        </View>

        {patterns.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>PATTERNS</Text>
            {patterns.map((p, i) => (
              <View key={i} style={styles.patternCard}>
                <Text style={styles.patternLabel}>{p.label}</Text>
                <Text style={styles.patternDesc}>{p.description}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionLabel}>RECENT DAYS</Text>
        {sortedDates.length === 0 ? (
          <Text style={styles.empty}>Complete Post-Flight with 3 Good Things or Pre-Flight with morning gratitude to see entries here.</Text>
        ) : (
          sortedDates.map((dateStr) => {
            const day = days[dateStr];
            if (!day) return null;
            const hasEvening = day.threeGoodThings.some((t) => t.length > 0);
            const hasMorning = !!day.morningGratitude?.trim();
            if (!hasEvening && !hasMorning) return null;
            const dateLabel = format(parseISO(dateStr), 'EEE, MMM d');
            return (
              <View key={dateStr} style={styles.dayCard}>
                <Text style={styles.dayDate}>{dateLabel}</Text>
                {hasEvening && (
                  <>
                    <Text style={styles.daySectionLabel}>3 Good Things</Text>
                    {day.threeGoodThings.filter(Boolean).map((t, j) => (
                      <Text key={j} style={styles.dayItem}>• {t}</Text>
                    ))}
                  </>
                )}
                {hasMorning && (
                  <>
                    <Text style={styles.daySectionLabel}>Morning</Text>
                    <Text style={styles.dayItem}>• {day.morningGratitude}</Text>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 15, color: TEXT_MUTED, marginBottom: SPACING.xl },
  streakCard: {
    backgroundColor: COLORS.gaugeBg.alignment,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gauges.alignment,
  },
  streakEmoji: { fontSize: 32, marginBottom: 4 },
  streakNumber: { fontSize: 36, fontWeight: '700', color: TEXT },
  streakLabel: { fontSize: 14, color: TEXT_MUTED },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 15, color: TEXT },
  summaryValue: { fontSize: 15, fontWeight: '600', color: TEXT },
  patternCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  patternLabel: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 4 },
  patternDesc: { fontSize: 14, color: TEXT_MUTED },
  empty: { fontSize: 14, color: TEXT_MUTED },
  dayCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  dayDate: { fontSize: 15, fontWeight: '600', color: TEXT, marginBottom: 8 },
  daySectionLabel: { fontSize: 12, color: TEXT_MUTED, marginTop: 6, marginBottom: 2 },
  dayItem: { fontSize: 14, color: TEXT, marginLeft: 8, marginBottom: 2 },
});
