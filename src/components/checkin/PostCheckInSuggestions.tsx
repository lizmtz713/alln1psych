/**
 * Gauge-Triggered Tools — Post check-in modal: suggest 1–3 tools based on gauges.
 * Optionally shows 1–2 Unified Insight Engine insights (pattern, cause, meaning).
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getToolSuggestions, type ToolSuggestion } from '../../services/toolSuggestionService';
import type { GaugeKey } from '../../stores/cockpitStore';
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
          <Text style={styles.title}>Try this next</Text>
          <Text style={styles.subtitle}>Based on your check-in</Text>
          {generatedInsights.slice(0, 2).map((insight) => (
            <GeneratedInsightCard key={insight.id} insight={insight} variant="compact" />
          ))}
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
            <Text style={styles.dismissBtnText}>Maybe later</Text>
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
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.lg },
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
