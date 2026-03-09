/**
 * PreFlightComplete — Completion screen after Morning Ritual: gauge feedback, then transition to Cockpit.
 * Completion loop: ritual steps light up the system gauges; this screen shows the result.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FlightInsights, type FlightInsightItem } from './FlightInsights';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import type { GaugeKey } from '../../stores/cockpitStore';

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

export interface PreFlightCompleteProps {
  /** Single insight from sleep voice (optional). */
  insights: FlightInsightItem[];
  /** Show gauge feedback (Body ↑) — ritual completion loop. */
  bodyUp?: boolean;
  /** System status label after ritual (e.g. "Stable") — optional. */
  systemStatusLabel?: string;
  /** Deltas applied during this ritual (e.g. { body: 4, state: 4, emotion: 1 }) — shown as Body ↑ State ↑ Emotion ↑ */
  ritualGaugeDeltas?: Partial<Record<GaugeKey, number>>;
  onTakeOff: () => void;
}

export function PreFlightComplete({ insights, bodyUp, systemStatusLabel, ritualGaugeDeltas, onTakeOff }: PreFlightCompleteProps) {
  const handleTakeOff = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTakeOff();
  };

  const hasRitualDeltas = ritualGaugeDeltas && Object.keys(ritualGaugeDeltas).length > 0;
  const gaugeEntries = ritualGaugeDeltas
    ? (Object.entries(ritualGaugeDeltas).filter(([, d]) => typeof d === 'number' && d > 0) as [GaugeKey, number][])
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>☀️</Text>
      <Text style={styles.title}>Morning Ritual Complete</Text>
      <Text style={styles.subtitle}>Your morning check-in is saved.</Text>

      {(bodyUp || systemStatusLabel || hasRitualDeltas) && (
        <View style={styles.gaugeFeedback}>
          {hasRitualDeltas && gaugeEntries.map(([gauge, delta]) => (
            <View key={gauge} style={styles.gaugeChip}>
              <Text style={[styles.gaugeChipText, { color: (COLORS as any).gauges?.[gauge] ?? COLORS.accent }]}>
                {GAUGE_LABELS[gauge]} ↑
              </Text>
            </View>
          ))}
          {!hasRitualDeltas && bodyUp && (
            <View style={styles.gaugeChip}>
              <Text style={[styles.gaugeChipText, { color: COLORS.gauges?.body ?? COLORS.accent }]}>Body ↑</Text>
            </View>
          )}
          {systemStatusLabel && (
            <Text style={styles.systemStatus}>System status: {systemStatusLabel}</Text>
          )}
        </View>
      )}

      <FlightInsights insights={insights} aiOnly={true} />

      <Pressable
        onPress={handleTakeOff}
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
    marginBottom: SPACING.lg,
  },
  gaugeFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING.xl,
  },
  gaugeChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gaugeChipText: { fontSize: 15, fontWeight: '700' },
  systemStatus: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
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
