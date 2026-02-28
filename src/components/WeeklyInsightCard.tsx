/**
 * Compact Weekly Insight card for home screen: theme, gauge focus, person focus + "See Full Insight".
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../lib/constants';
import { GAUGE_CONFIG } from '../utils/gaugeHelpers';
import { useWeeklyInsightStore } from '../stores/weeklyInsightStore';
import type { WeeklyInsight } from '../types/weeklyInsight';
import type { GaugeKey } from '../types/relationalMemory';

function GaugeLabel({ gauge }: { gauge: GaugeKey }) {
  const config = GAUGE_CONFIG[gauge];
  return <Text style={styles.gaugeTag}>{config?.label ?? gauge}</Text>;
}

function WeeklyInsightCard() {
  const router = useRouter();
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const { getInsight, isGenerating } = useWeeklyInsightStore();

  useEffect(() => {
    getInsight().then(setInsight);
  }, [getInsight]);

  const onSeeFull = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/weekly-insight');
  };

  if (isGenerating && !insight) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text style={styles.loadingText}>Building your weekly insight…</Text>
      </View>
    );
  }

  if (!insight) return null;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onSeeFull}>
      <View style={styles.header}>
        <Text style={styles.weekOf}>Week of {insight.weekOf}</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </View>
      <Text style={styles.themeTitle} numberOfLines={1}>{insight.theme.title}</Text>
      {insight.personalSummary ? (
        <Text style={styles.personalSummary} numberOfLines={2}>{insight.personalSummary}</Text>
      ) : null}
      <View style={styles.focusRow}>
        <View style={styles.focusChip}>
          <Ionicons name="pulse" size={14} color={COLORS.accent} />
          <GaugeLabel gauge={insight.gaugeFocus.gauge} />
        </View>
        {insight.circleFocus && (
          <View style={styles.focusChip}>
            <Ionicons name="person" size={14} color={COLORS.accent} />
            <Text style={styles.personTag} numberOfLines={1}>{insight.circleFocus.memberName}</Text>
          </View>
        )}
      </View>
      <Pressable style={styles.seeFullBtn} onPress={onSeeFull}>
        <Text style={styles.seeFullText}>See Full Insight</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: { opacity: 0.9 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekOf: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  themeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  personalSummary: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.backgroundElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  gaugeTag: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  personTag: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    maxWidth: 100,
  },
  seeFullBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  seeFullText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

export { WeeklyInsightCard };
export default WeeklyInsightCard;
