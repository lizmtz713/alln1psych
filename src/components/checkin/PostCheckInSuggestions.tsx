/**
 * Post check-in reward screen: one small insight (reinforces usage), optional streak, then tool suggestions.
 * Streaks reward consistency; we never punish missed days.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getToolSuggestions, type ToolSuggestion } from '../../services/toolSuggestionService';
import { useCockpitStore, type GaugeKey } from '../../stores/cockpitStore';
import type { GeneratedInsight } from '../../types/insights-engine';
import { GeneratedInsightCard } from '../insights/GeneratedInsightCard';
import { COLORS, SPACING } from '../../lib/constants';

export interface PostCheckInSuggestionsProps {
  /** Gauge values (and optionally trends) after check-in */
  gauges: Partial<Record<GaugeKey, { value: number; trend?: 'improving' | 'stable' | 'declining' | null }>>;
  visible: boolean;
  onDismiss: () => void;
  limit?: number;
  /** Optional: 1–2 generated insights (Unified Insight Engine, context postCheckIn) */
  generatedInsights?: GeneratedInsight[];
}

export function PostCheckInSuggestions({
  gauges,
  visible,
  onDismiss,
  limit = 3,
  generatedInsights = [],
}: PostCheckInSuggestionsProps) {
  const router = useRouter();
  const getCheckInStreak = useCockpitStore((s) => s.getCheckInStreak);
  const streak = getCheckInStreak();

  const suggestions = useMemo(() => {
    const snap = Object.fromEntries(
      Object.entries(gauges).filter(([, v]) => v != null && v.value >= 0)
    ) as Partial<Record<GaugeKey, { value: number; trend: 'improving' | 'stable' | 'declining' | null }>>;
    const normalized = Object.fromEntries(
      Object.entries(snap).map(([k, v]) => [
        k,
        { value: v.value, trend: v.trend ?? null },
      ])
    ) as Partial<Record<GaugeKey, { value: number; trend: 'improving' | 'stable' | 'declining' | null }>>;
    return getToolSuggestions(normalized, { limit });
  }, [gauges, limit]);

  const handlePress = (s: ToolSuggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
    setTimeout(() => router.push(s.route as any), 300);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          {/* Reward: one small insight */}
          {generatedInsights.length > 0 && (
            <>
              <Text style={styles.title}>Insight</Text>
              <GeneratedInsightCard key={generatedInsights[0].id} insight={generatedInsights[0]} variant="compact" />
            </>
          )}
          {/* Streak: reward consistency, never punish */}
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>
                {streak} day streak
              </Text>
            </View>
          )}
          {suggestions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Try this next</Text>
              <Text style={styles.subtitle}>Based on your check-in</Text>
            </>
          )}
          {suggestions.map((s) => (
            <Pressable
              key={s.toolKey}
              style={styles.card}
              onPress={() => handlePress(s)}
            >
              <Text style={styles.cardIcon}>{s.icon}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{s.label}</Text>
                <Text style={styles.cardReason} numberOfLines={2}>{s.reason}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissBtnText}>Done</Text>
          </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetScroll: {
    maxHeight: '85%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: SPACING.lg, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.lg },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentBg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  streakText: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  cardIcon: { fontSize: 28 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardReason: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  dismissBtn: { marginTop: SPACING.md, paddingVertical: 12, alignItems: 'center' },
  dismissBtnText: { fontSize: 15, color: COLORS.textMuted },
});
