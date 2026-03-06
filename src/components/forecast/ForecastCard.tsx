/**
 * Life Forecast — Home widget: tomorrow's forecast (full or compact).
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { getTomorrowForecast } from '../../services/forecastService';
import { COLORS, SPACING } from '../../lib/constants';

export interface ForecastCardProps {
  compact?: boolean;
}

export function ForecastCard({ compact = false }: ForecastCardProps) {
  const router = useRouter();
  const forecast = useMemo(() => getTomorrowForecast(), []);

  const riskLine = forecast.riskFactors.length > 0
    ? forecast.riskFactors.map((f) => f.reason).join('; ').slice(0, 80)
    : 'Looking stable';
  const suggestion = forecast.suggestions[0]?.text ?? 'Take it one step at a time';

  if (compact) {
    return (
      <Pressable style={styles.compactCard} onPress={() => router.push('/forecast')}>
        <Text style={styles.compactEmoji}>🔮</Text>
        <Text style={styles.compactTitle}>Tomorrow</Text>
        <Text style={styles.compactSub} numberOfLines={1}>{forecast.dayName} · {riskLine}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={() => router.push('/forecast')}>
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
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  emoji: { fontSize: 22 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  dayName: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 8 },
  riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8 },
  riskIcon: { fontSize: 14 },
  riskText: { flex: 1, fontSize: 13, color: COLORS.warning },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
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
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: 8,
  },
  compactEmoji: { fontSize: 18 },
  compactTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  compactSub: { flex: 1, fontSize: 13, color: COLORS.textMuted },
});
