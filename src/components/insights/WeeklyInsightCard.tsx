/**
 * Unified Insight Engine — Home card showing 1–2 (daily) or 3–5 (weekly) generated insights.
 * Uses useGeneratedInsights; context 'home' = 2 max, 'weekly' = 5 max.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGeneratedInsights } from '../../hooks/useGeneratedInsights';
import { GeneratedInsightCard } from './GeneratedInsightCard';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { InsightContext } from '../../types/insights-engine';

export interface WeeklyInsightCardProps {
  /** 'home' = 1–2 daily insights; 'weekly' = 3–5 deeper weekly insights */
  context?: InsightContext;
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  home: { title: \"What we're seeing\", subtitle: "From your gauges & check-ins' },
  weekly: { title: "This week's patterns", subtitle: 'Patterns, causes & growth from your data' },
};

export function WeeklyInsightCard({ context = 'home' }: WeeklyInsightCardProps) {
  const { insights, isLoading, error } = useGeneratedInsights({
    context,
    withHistory: true,
  });

  const { title, subtitle } = TITLES[context] ?? TITLES.home;

  if (isLoading && insights.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <ActivityIndicator size=\"small\" color={COLORS.accent} />
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
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {insights.map((insight) => (
        <GeneratedInsightCard key={insight.id} insight={insight} variant=\"full\" />
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
    flexDirection: "row',
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
