/**
 * Full Weekly Insight modal — opened from "See Full Insight" on the home card.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';
import { GAUGE_CONFIG } from '../../src/utils/gaugeHelpers';
import { useWeeklyInsightStore } from '../../src/stores/weeklyInsightStore';
import type { WeeklyInsight } from '../../src/types/weeklyInsight';
import type { GaugeKey } from '../../src/types/relationalMemory';

export default function WeeklyInsightScreen() {
  const router = useRouter();
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const { getInsight, isGenerating } = useWeeklyInsightStore();

  useEffect(() => {
    getInsight().then(setInsight);
  }, [getInsight]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isGenerating && !insight) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={26} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Weekly Insight</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Building your weekly insight…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!insight) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={26} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Weekly Insight</Text>
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>No insight available yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gaugeConfig = GAUGE_CONFIG[insight.gaugeFocus.gauge as string];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={26} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Weekly Insight</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.weekOf}>Week of {insight.weekOf}</Text>
        <Text style={styles.themeTitle}>{insight.theme.title}</Text>
        <Text style={styles.themeDesc}>{insight.theme.description}</Text>

        {insight.personalSummary ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your summary</Text>
            <Text style={styles.cardBody}>{insight.personalSummary}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gauge focus</Text>
          <View style={[styles.gaugeChip, { borderColor: gaugeConfig?.color ?? COLORS.accent }]}>
            <Text style={styles.gaugeChipText}>{gaugeConfig?.label ?? insight.gaugeFocus.gauge}</Text>
          </View>
          <Text style={styles.cardBody}>{insight.gaugeFocus.reason}</Text>
          <Text style={styles.practicesLabel}>Try this week:</Text>
          {insight.gaugeFocus.practices.map((p, i) => (
            <Text key={i} style={styles.practiceItem}>• {p}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Archetype: {insight.archetypeGuidance.archetype}</Text>
          <Text style={styles.cardBody}><Text style={styles.bold}>Strength:</Text> {insight.archetypeGuidance.strength}</Text>
          <Text style={styles.cardBody}><Text style={styles.bold}>Watch out:</Text> {insight.archetypeGuidance.watchOut}</Text>
          <Text style={styles.cardBody}><Text style={styles.bold}>Practice:</Text> {insight.archetypeGuidance.practice}</Text>
        </View>

        {insight.circleFocus ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Circle focus</Text>
            <Text style={styles.cardBody}>{insight.circleFocus.insight}</Text>
            <Text style={styles.practicesLabel}>Suggested action:</Text>
            <Text style={styles.cardBody}>{insight.circleFocus.suggestedAction}</Text>
          </View>
        ) : null}

        {insight.provenStrategy ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Proven strategy</Text>
            <Text style={styles.cardBody}>{insight.provenStrategy.description}</Text>
            <Text style={styles.cardBody}>Effectiveness: {insight.provenStrategy.effectiveness}%</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginRight: 34 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  weekOf: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  themeTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  themeDesc: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.accent, marginBottom: 8 },
  cardBody: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 8 },
  bold: { fontWeight: '600' },
  gaugeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  gaugeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  practicesLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginTop: 8, marginBottom: 4 },
  practiceItem: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 2 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12 },
});
