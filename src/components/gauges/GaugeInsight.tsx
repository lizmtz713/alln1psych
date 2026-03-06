/**
 * Contextual Insights — Gauge detail page: 2–3 compact insight cards for this gauge.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { GaugeKey } from '../../stores/cockpitStore';
import { useGaugeInsight } from '../../hooks/useContextualInsight';
import { InsightCard } from '../insights/InsightCard';
import { COLORS, SPACING } from '../../lib/constants';

export interface GaugeInsightProps {
  gauge: GaugeKey;
  limit?: number;
}

export function GaugeInsight({ gauge, limit = 3 }: GaugeInsightProps) {
  const { selections, loading } = useGaugeInsight(gauge, limit);

  if (loading || !selections.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>💡 Insights for this gauge</Text>
      {selections.map(({ card }) => (
        <View key={card.id} style={styles.cardWrap}>
          <InsightCard card={card} compact />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardWrap: {
    marginBottom: SPACING.sm,
  },
});
