/**
 * Life Forecast — Pre-Flight integration: today's forecast with factors and suggestion.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTodayForecast } from '../../services/forecastService';
import { COLORS } from '../../lib/constants';

export interface PreFlightForecastProps {
  onAck?: () => void;
}

export function PreFlightForecast({ onAck }: PreFlightForecastProps) {
  const forecast = useMemo(() => getTodayForecast(), []);

  const hasRisks = forecast.riskFactors.length > 0;
  const suggestion = forecast.suggestions[0]?.text;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🔮</Text>
        <Text style={styles.title}>Today's Forecast</Text>
      </View>
      {hasRisks ? (
        <>
          <Text style={styles.subtitle}>
            {forecast.riskLevel === 'high' ? 'State may be challenging' : 'A few things to watch'}
          </Text>
          {forecast.riskFactors.slice(0, 3).map((f, i) => (
            <View key={i} style={styles.factorRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.factorText}>{f.reason}</Text>
            </View>
          ))}
          {suggestion && (
            <View style={styles.suggestionRow}>
              <Text style={styles.suggestionIcon}>💡</Text>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.stable}>No major risk factors today. You're good to go.</Text>
      )}
      {onAck && (
        <Text style={styles.ack} onPress={onAck}>Got it</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  emoji: { fontSize: 20 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  factorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  bullet: { fontSize: 14, color: COLORS.textMuted },
  factorText: { flex: 1, fontSize: 13, color: COLORS.text },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 8 },
  suggestionIcon: { fontSize: 14 },
  suggestionText: { fontSize: 14, color: COLORS.text },
  stable: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  ack: { fontSize: 14, color: COLORS.accent, fontWeight: '600', marginTop: 4 },
});
