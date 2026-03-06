/**
 * Renders a single generated insight (Pattern, Cause, Timing, Growth, Meaning).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { GeneratedInsight, InsightKind } from '../../types/insights-engine';

const KIND_CONFIG: Record<
  InsightKind,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  pattern: { label: 'Pattern', icon: 'pulse', color: COLORS.gauges.state },
  cause: { label: 'Cause', icon: 'help-buoy', color: COLORS.gauges.emotion },
  timing: { label: 'Timing', icon: 'time', color: COLORS.gauges.direction },
  growth: { label: 'Growth', icon: 'trending-up', color: COLORS.temperature.green },
  meaning: { label: 'Meaning', icon: 'bulb', color: COLORS.gauges.alignment },
};

export interface GeneratedInsightCardProps {
  insight: GeneratedInsight;
  variant?: 'compact' | 'full';
}

export function GeneratedInsightCard({ insight, variant = 'full' }: GeneratedInsightCardProps) {
  const config = KIND_CONFIG[insight.kind];

  if (variant === 'compact') {
    return (
      <View style={styles.compactCard}>
        <Text style={styles.compactTitle} numberOfLines={1}>{insight.title}</Text>
        <Text style={styles.compactBody} numberOfLines={2}>{insight.body}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
          <Ionicons name={config.icon} size={14} color={config.color} />
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={styles.title}>{insight.title}</Text>
      <Text style={styles.body}>{insight.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  compactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  compactBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
