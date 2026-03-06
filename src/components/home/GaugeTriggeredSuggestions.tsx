/**
 * Gauge-Triggered Tools — Home "Suggested for you" section.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useToolSuggestions } from '../../hooks/useToolSuggestions';
import { COLORS, SPACING } from '../../lib/constants';

export interface GaugeTriggeredSuggestionsProps {
  limit?: number;
}

export function GaugeTriggeredSuggestions({ limit = 3 }: GaugeTriggeredSuggestionsProps) {
  const router = useRouter();
  const { suggestions, shouldShow } = useToolSuggestions({ limit, requireGaugeData: true });

  if (!shouldShow || suggestions.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Suggested for you</Text>
      <View style={styles.chipRow}>
        {suggestions.map((s) => (
          <Pressable
            key={s.toolKey}
            style={styles.chip}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(s.route as any);
            }}
          >
            <Text style={styles.chipIcon}>{s.icon}</Text>
            <Text style={styles.chipLabel} numberOfLines={1}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      {suggestions[0]?.reason ? (
        <Text style={styles.reason} numberOfLines={2}>{suggestions[0].reason}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    maxWidth: '48%',
  },
  chipIcon: { fontSize: 18 },
  chipLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  reason: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
});
