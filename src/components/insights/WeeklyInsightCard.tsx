/**
 * Unified Insight Engine — Home card showing 1–3 generated insights
 * (Pattern, Cause, Timing, Growth, Meaning). Uses useGeneratedInsights for home context.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGeneratedInsights } from '../../hooks/useGeneratedInsights';
import { GeneratedInsightCard } from './GeneratedInsightCard';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { InsightContext } from '../../types/insights-engine';

export function WeeklyInsightCard({
  context = 'home',
}: {
  context?: InsightContext;
}) {
  const { insights, isLoading, error } = useGeneratedInsights({
    context,
    withHistory: true,
  });

  if (isLoading && insights.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.loadingText}>Building your insights…</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return null; // Fail quietly; don't block home
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>What we're seeing</Text>
        <Text style={styles.sectionSubtitle}>From your gauges & check-ins</Text>
      </View>
      {insights.map((insight) => (
        <GeneratedInsightCard key={insight.id} insight={insight} variant="full" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
