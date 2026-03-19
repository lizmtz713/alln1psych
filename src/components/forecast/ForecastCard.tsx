/**
 * Human Weather Forecast — Home widget: how you'll likely feel tomorrow.
 * Pure presentational component: no Zustand, no store subscriptions. All data via props.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { getTomorrowForecast } from '../../services/forecastService';
import { COLORS, SPACING } from '../../lib/constants';

export interface ForecastCardProps {
  compact?: boolean;
  /** Gauge values 0–100, or -1 if unset */
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
  /** Last check-in context (sleep, social, stress) */
  checkInContext: { sleep?: string; social?: string; stressSource?: string } | null;
  /** Optional health context (sleep hours, readiness) for richer forecast */
  healthContext?: { lastNightSleepHours?: number; readinessScore?: number };
  /** Optional: days since last connection-focused check-in */
  daysSinceConnection?: number;
}

export function ForecastCard({
  compact = false,
  body,
  state,
  emotion,
  connection,
  direction,
  alignment,
  checkInContext,
  healthContext,
  daysSinceConnection,
}: ForecastCardProps) {
  const router = useRouter();

  const gaugeValues = useMemo(
    () => ({
      ...(body >= 0 && { body }),
      ...(state >= 0 && { state }),
      ...(emotion >= 0 && { emotion }),
      ...(connection >= 0 && { connection }),
      ...(direction >= 0 && { direction }),
      ...(alignment >= 0 && { alignment }),
    }),
    [body, state, emotion, connection, direction, alignment]
  );

  const forecastInput = useMemo(
    () => ({
      gauges: gaugeValues,
      checkInContext,
      healthContext,
      ...(daysSinceConnection != null && { daysSinceConnection }),
    }),
    [gaugeValues, checkInContext, healthContext, daysSinceConnection]
  );

  const forecast = useMemo(
    () => getTomorrowForecast(forecastInput),
    [forecastInput]
  );

  const riskLine =
    forecast.riskFactors.length > 0
      ? forecast.riskFactors.map((f) => f.reason).join('; ').slice(0, 80)
      : 'Looking stable';
  const suggestion = forecast.suggestions[0]?.text ?? 'Take it one step at a time';

  const hasAnyInput =
    body >= 0 ||
    state >= 0 ||
    emotion >= 0 ||
    connection >= 0 ||
    direction >= 0 ||
    alignment >= 0 ||
    checkInContext != null;
  if (!hasAnyInput) {
    return null;
  }

  const onPress = () => router.push('/forecast');

  if (compact) {
    return (
      <Pressable style={styles.compactCard} onPress={onPress}>
        <Text style={styles.compactEmoji}>🔮</Text>
        <Text style={styles.compactTitle}>Tomorrow</Text>
        <Text style={styles.compactSub} numberOfLines={1}>
          {forecast.dayName} · {riskLine}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🔮</Text>
        <Text style={styles.title}>Tomorrow's Forecast</Text>
      </View>
      <Text style={styles.dayName}>{forecast.dayName}</Text>
      {forecast.riskLevel !== 'low' && forecast.riskFactors.length > 0 && (
        <View style={styles.riskRow}>
          <Text style={styles.riskIcon}>⚠️</Text>
          <Text style={styles.riskText} numberOfLines={2}>
            {forecast.riskFactors[0]?.reason ?? riskLine}
          </Text>
        </View>
      )}
      <View style={styles.suggestionRow}>
        <Text style={styles.suggestionIcon}>💡</Text>
        <Text style={styles.suggestionText}>{suggestion}</Text>
      </View>
      <Text style={styles.cta}>See full forecast →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  emoji: { fontSize: 20 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  dayName: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  riskIcon: { fontSize: 14 },
  riskText: { flex: 1, fontSize: 13, color: COLORS.warning },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  suggestionIcon: { fontSize: 14 },
  suggestionText: { fontSize: 14, color: COLORS.text },
  cta: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginHorizontal: SPACING.lg,
    marginBottom: 8,
    gap: 8,
  },
  compactEmoji: { fontSize: 18 },
  compactTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  compactSub: { flex: 1, fontSize: 13, color: COLORS.textMuted },
});
