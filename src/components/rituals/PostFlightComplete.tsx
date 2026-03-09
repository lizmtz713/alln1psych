/**
 * PostFlightComplete — Full completion screen after Post-Flight: insights, gauge summary, gratitude streak, journal save.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlightInsights, type FlightInsightItem } from './FlightInsights';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { useGratitudeStore } from '../../stores/gratitudeStore';
import type { GaugeKey } from '../../stores/cockpitStore';

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

export interface PostFlightCompleteProps {
  insights: FlightInsightItem[];
  gaugesUpdated: { state?: number; emotion?: number };
  /** Deltas from evening ritual checklist (Reflection ✔ Emotion +2, etc.) */
  ritualGaugeDeltas?: Partial<Record<GaugeKey, number>>;
  onRestWell: () => void;
}

export function PostFlightComplete({
  insights,
  gaugesUpdated,
  ritualGaugeDeltas,
  onRestWell,
}: PostFlightCompleteProps) {
  const router = useRouter();
  const streak = useGratitudeStore((s) => s.getStreak());

  const handleRestWell = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestWell();
  };

  const handleGratitudeReview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/rituals/gratitude-review');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌙</Text>
      <Text style={styles.title}>Day Closed</Text>
      <Text style={styles.subtitle}>System stabilized.{'\n'}Rest well.</Text>

      {streak > 0 && (
        <View style={styles.streakBlock}>
          <Text style={styles.streakEmoji}>🙏</Text>
          <Text style={styles.streakText}>{streak} day{streak === 1 ? '' : 's'} gratitude streak</Text>
          <Pressable onPress={handleGratitudeReview} style={styles.streakLink}>
            <Text style={styles.streakLinkText}>See review</Text>
          </Pressable>
        </View>
      )}

      {ritualGaugeDeltas && Object.keys(ritualGaugeDeltas).length > 0 && (
        <View style={styles.ritualDeltasRow}>
          {(Object.entries(ritualGaugeDeltas).filter(([, d]) => typeof d === 'number' && d > 0) as [GaugeKey, number][]).map(([gauge]) => (
            <View key={gauge} style={styles.ritualDeltaChip}>
              <Text style={[styles.ritualDeltaText, { color: (COLORS as any).gauges?.[gauge] ?? COLORS.accent }]}>
                {GAUGE_LABELS[gauge]} ↑
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.gaugeRow}>
        {gaugesUpdated.state != null && (
          <View style={styles.gaugeBlock}>
            <Text style={styles.gaugeLabel}>State</Text>
            <Text style={[styles.gaugeValue, { color: COLORS.gauges.state }]}>
              {gaugesUpdated.state}
            </Text>
          </View>
        )}
        {gaugesUpdated.emotion != null && (
          <View style={styles.gaugeBlock}>
            <Text style={styles.gaugeLabel}>Emotion</Text>
            <Text style={[styles.gaugeValue, { color: COLORS.gauges.emotion }]}>
              {gaugesUpdated.emotion}
            </Text>
          </View>
        )}
      </View>

      <FlightInsights insights={insights} aiOnly={true} />

      <Pressable
        onPress={handleRestWell}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Back to Cockpit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  streakBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.gaugeBg.alignment,
    borderRadius: BORDER_RADIUS.card,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  streakEmoji: { fontSize: 18 },
  streakText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  streakLink: { paddingVertical: 4, paddingHorizontal: 4 },
  streakLinkText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  ritualDeltasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  ritualDeltaChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ritualDeltaText: { fontSize: 15, fontWeight: '700' },
  gaugeRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  gaugeBlock: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minWidth: 100,
  },
  gaugeLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  gaugeValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  button: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
