/**
 * Contextual Insights — Home "💡 Insight" section.
 * Shows 1–2 insight cards based on current gauges, 7-day no-repeat.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDailyInsight } from '../../hooks/useContextualInsight';
import { InsightCard } from '../insights/InsightCard';
import { COLORS, SPACING } from '../../lib/constants';

export function DailyInsight() {
  const { selections, loading } = useDailyInsight(2);

  if (loading) return null;
  if (!selections.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>💡 Insight</Text>
      {selections.map(({ card }) => (
        <View key={card.id} style={styles.cardWrap}>
          <InsightCard card={card} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardWrap: {
    marginBottom: SPACING.sm,
  },
});
