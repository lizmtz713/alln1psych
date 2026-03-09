/**
 * LightsMapSnapshot — Shareable card for Lights Map (square or story format).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MapFormat, TierBreakdown, TemperatureSummary } from '../../types/lightsMap';
import { COLORS, SPACING } from '../../lib/constants';
import { LIGHT_TEMPERATURE_SCALE } from '../../types/lights';

export interface LightsMapSnapshotProps {
  format: MapFormat;
  tierBreakdown: TierBreakdown[];
  temperatureSummary: TemperatureSummary;
  nodeCount: number;
}

const CARD_PADDING = SPACING.lg;
const SQUARE_SIZE = 340;
const STORY_WIDTH = 280;
const STORY_HEIGHT = 497;

export function LightsMapSnapshot({
  format,
  tierBreakdown,
  temperatureSummary,
  nodeCount,
}: LightsMapSnapshotProps) {
  const isStory = format === 'story';
  const width = isStory ? STORY_WIDTH : SQUARE_SIZE;
  const height = isStory ? STORY_HEIGHT : SQUARE_SIZE;

  return (
    <View style={[styles.card, { width, height, padding: CARD_PADDING }]}>
      <Text style={styles.title}>My People</Text>
      <Text style={styles.subtitle}>{nodeCount} connection{nodeCount !== 1 ? 's' : ''}</Text>

      {/* Tier breakdown */}
      <View style={styles.tierRow}>
        {tierBreakdown.map((t) => (
          <View key={t.tier} style={styles.tierPill}>
            <Text style={styles.tierLabel}>{t.label}</Text>
            <Text style={styles.tierCount}>{t.count}</Text>
          </View>
        ))}
      </View>

      {/* Temperature summary */}
      <View style={styles.tempRow}>
        <View style={[styles.tempDot, { backgroundColor: LIGHT_TEMPERATURE_SCALE.warm.color }]} />
        <Text style={styles.tempText}>{temperatureSummary.warm} warm</Text>
        <View style={[styles.tempDot, { backgroundColor: LIGHT_TEMPERATURE_SCALE.neutral.color }]} />
        <Text style={styles.tempText}>{temperatureSummary.neutral} neutral</Text>
        <View style={[styles.tempDot, { backgroundColor: LIGHT_TEMPERATURE_SCALE.cool.color }]} />
        <Text style={styles.tempText}>{temperatureSummary.cool} cool</Text>
      </View>

      <Text style={styles.footer}>AllN1 Psych · You Are Not Alone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.md },
  tierRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  tierLabel: { fontSize: 12, color: COLORS.textSecondary },
  tierCount: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  tempRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  tempDot: { width: 8, height: 8, borderRadius: 4 },
  tempText: { fontSize: 12, color: COLORS.textSecondary },
  footer: { marginTop: 'auto', fontSize: 11, color: COLORS.textDim },
});
