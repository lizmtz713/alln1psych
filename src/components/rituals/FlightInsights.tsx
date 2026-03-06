/**
 * FlightInsights — "CoPilot noticed" cards for Pre/Post-Flight AI insights.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

export interface FlightInsightItem {
  question: string;
  score: number;
  insight?: string;
  source: 'ai' | 'heuristic';
}

export interface FlightInsightsProps {
  insights: FlightInsightItem[];
  aiOnly?: boolean;
}

export function FlightInsights(props: FlightInsightsProps) {
  const { insights, aiOnly = true } = props;
  const toShow = aiOnly
    ? insights.filter((i) => i.source === 'ai' && i.insight && i.insight.trim())
    : insights.filter((i) => i.insight && i.insight.trim());

  if (toShow.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>💭 CoPilot noticed</Text>
      {toShow.map((item, idx) => (
        <View key={String(idx)} style={styles.card}>
          <Text style={styles.insightText}>{item.insight ? item.insight.trim() : ''}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: SPACING.xl },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  insightText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
