/**
 * Gauge-Triggered Tools — Suggestions on gauge detail page.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useToolSuggestionsForGauge } from '../../hooks/useToolSuggestions';
import type { GaugeKey } from '../../stores/cockpitStore';
import { COLORS, SPACING } from '../../lib/constants';

export interface GaugeToolSuggestionsProps {
  gauge: GaugeKey;
  value: number;
  trend?: 'improving' | 'stable' | 'declining' | null;
  limit?: number;
}

export function GaugeToolSuggestions({ gauge, value, trend = null, limit = 3 }: GaugeToolSuggestionsProps) {
  const router = useRouter();
  const suggestions = useToolSuggestionsForGauge(gauge, value, trend, limit);

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Tools that can help</Text>
      {suggestions.map((s) => (
        <Pressable
          key={s.toolKey}
          style={styles.row}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(s.route as any);
          }}
        >
          <Text style={styles.icon}>{s.icon}</Text>
          <View style={styles.textWrap}>
            <Text style={styles.label}>{s.label}</Text>
            <Text style={styles.reason} numberOfLines={2}>{s.reason}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: SPACING.lg },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    gap: 12,
  },
  icon: { fontSize: 24 },
  textWrap: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  reason: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
