/**
 * Gauge detail — opens when user taps a gauge tile on Home.
 * Route: /(modals)/gauge-detail?gauge=body|state|emotion|connection|direction|alignment
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCockpitStore, type GaugeKey } from '../../src/stores/cockpitStore';
import { useCycleStore, useCycleData, PHASE_INFO } from '../../src/stores/cycleStore';
import { GAUGE_CONFIG, getGaugeStatusLabel } from '../../src/utils/gaugeHelpers';
import { useCircleStore } from '../../src/stores/circleStore';
import { getDailyFact } from '../../src/data/psychKnowledge';
import { GaugeArc } from '../../src/components/gauges/GaugeArc';
import { ACADEMIC_SOURCES, getInsightsForGauge, type GaugeType } from '../../src/data/academicSources';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/lib/constants';

// Using design system colors (v2.0 - Oura-inspired)
const COCKPIT_BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;

const GAUGE_SIZE = 200;

const GAUGE_DETAIL_CONTENT: Record<
  string,
  { whatAffects: string[]; whatToTry: { label: string; route: string }[]; funFact: string }
> = {
  body: {
    whatAffects: ['Sleep', 'Nutrition', 'Hydration', 'Movement', 'Hormonal cycles'],
    whatToTry: [
      { label: 'Body Scan', route: '/(modals)/activity?id=body-scan' },
      { label: 'Breathing', route: '/(modals)/activity?id=breathing' },
      { label: 'Go for a 10-minute walk', route: '/(modals)/activity?id=body-scan' },
    ],
    funFact:
      "You cannot think clearly if your body is dysregulated. This isn't weakness. This is physics.",
  },
  state: {
    whatAffects: ['Stress', 'Sleep', 'Caffeine', 'Conflict', 'Overwhelm'],
    whatToTry: [
      { label: 'Breathing', route: '/(modals)/activity?id=breathing' },
      { label: '5-4-3-2-1 grounding', route: '/(modals)/activity?id=breathing' },
      { label: 'Movement', route: '/(modals)/activity?id=body-scan' },
    ],
    funFact:
      "Your nervous system state determines your emotional intensity. You're not choosing to overreact. Your system is in threat mode.",
  },
  emotion: {
    whatAffects: ['Body state', 'Past experiences', 'Sleep', 'Relationships', 'Unmet needs'],
    whatToTry: [
      { label: 'Emotion Wheel', route: '/(modals)/activity?id=emotion-wheel' },
      { label: 'Thought Challenger', route: '/(modals)/activity?id=thought-challenger' },
      { label: 'Talk to Gauge', route: '/(tabs)/talk' },
    ],
    funFact:
      'Anger often masks hurt + powerlessness. "Laziness" often masks overwhelm. Naming the real feeling reduces its grip.',
  },
  connection: {
    whatAffects: ['Quality time', 'Feeling heard', 'Conflict', 'Isolation', 'Trust'],
    whatToTry: [
      { label: 'Check on someone', route: '/(tabs)/circle' },
      { label: 'Role play a hard conversation', route: '/(modals)/role-play' },
      { label: 'Help', route: '/(modals)/help-someone' },
    ],
    funFact:
      "Social isolation affects the brain like physical pain. Connection isn't a luxury. It's a biological requirement.",
  },
  direction: {
    whatAffects: ['Values clarity', 'Small wins', 'Purpose', 'Routine', 'Meaning'],
    whatToTry: [
      { label: 'Values check-in', route: '/(tabs)/learn' },
      { label: 'Talk about purpose', route: '/(tabs)/talk' },
    ],
    funFact:
      "When meaning collapses, depression rises. You're not broken. You might just be lost.",
  },
  alignment: {
    whatAffects: ['Values', 'Recent choices', 'Integrity', 'Boundaries'],
    whatToTry: [
      { label: 'Trigger Map', route: '/(modals)/activity?id=trigger-map' },
      { label: 'Journal reflection', route: '/(modals)/new-journal' },
      { label: 'Talk to Gauge', route: '/(tabs)/talk' },
    ],
    funFact:
      "When actions don't match values, stress increases. That stress isn't punishment. It's your alignment system working correctly.",
  },
};

function getStatusLabel(value: number): string {
  if (value < 0) return 'Not checked';
  return getGaugeStatusLabel(value);
}

function TrendIndicator({ trend }: { trend: 'improving' | 'stable' | 'declining' | null }) {
  if (!trend) return null;
  const icon = trend === 'improving' ? 'trending-up' : trend === 'declining' ? 'trending-down' : 'remove';
  const label = trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Declining' : 'Stable';
  return (
    <View style={styles.trendRow}>
      <Ionicons name={icon} size={18} color={TEXT_SECONDARY} />
      <Text style={styles.trendText}>{label}</Text>
    </View>
  );
}

export default function GaugeDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { gauge: gaugeParam } = useLocalSearchParams<{ gauge: string }>();
  const gaugeId = (gaugeParam ?? 'body') as GaugeKey;
  const config = GAUGE_CONFIG[gaugeId];
  const gaugeState = useCockpitStore((s) => s[gaugeId]);
  const members = useCircleStore((s) => s.members) ?? [];

  const value = gaugeState?.value ?? -1;
  const trend = gaugeState?.trend ?? null;
  const statusLabel = getStatusLabel(value);
  const content = GAUGE_DETAIL_CONTENT[gaugeId] ?? GAUGE_DETAIL_CONTENT.body;

  if (!config) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.error}>Unknown gauge.</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.title} numberOfLines={1}>
            {config.label}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {config.subtitle}
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. LARGE GAUGE — Oura-inspired arc visualization */}
        <View style={styles.gaugeWrap}>
          <GaugeArc
            value={value}
            gauge={gaugeId as any}
            size={GAUGE_SIZE}
            strokeWidth={12}
            label={config.label}
            alertText={value >= 0 && value < 30 ? 'PAY ATTENTION' : value >= 0 && value < 50 ? 'NEEDS CARE' : undefined}
          />
          <TrendIndicator trend={trend} />
        </View>

        {/* 2b. Knowledge base — Did you know? */}
        {(() => {
          const dailyFact = getDailyFact(gaugeId);
          return dailyFact ? (
            <View style={{ backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: CARD_BORDER }}>
              <Text style={{ color: ACCENT, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Did you know?</Text>
              <Text style={{ color: TEXT_PRIMARY, fontSize: 15, fontWeight: '600', marginBottom: 8 }}>{dailyFact.principle}</Text>
              <Text style={{ color: '#B0B0C0', fontSize: 14, lineHeight: 20 }}>{dailyFact.userFriendly}</Text>
              <Text style={{ color: '#55556A', fontSize: 11, marginTop: 8 }}>Source: {dailyFact.source}</Text>
            </View>
          ) : null;
        })()}

        {/* 3. WHY THIS MATTERS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why this matters</Text>
          <Text style={styles.cardBody}>{config.description}</Text>
        </View>

        {/* 4. WHAT AFFECTS THIS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What affects this</Text>
          <Text style={styles.cardBody}>{content.whatAffects.join(' · ')}</Text>
        </View>

        {/* 4b. CYCLE CONTEXT — if cycle tracking enabled */}
        {(() => {
          const { trackingEnabled, currentPhase, dayOfCycle, phaseInfo } = useCycleData();
          const getInsightsForGauge = useCycleStore((s) => s.getInsightsForGauge);
          
          if (!trackingEnabled || !currentPhase || !phaseInfo) return null;
          
          const cycleInsights = getInsightsForGauge(gaugeId);
          const contextInsight = cycleInsights.find((i) => i.type === 'context');
          const patternInsight = cycleInsights.find((i) => i.type === 'pattern');
          
          if (!contextInsight) return null;
          
          return (
            <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: phaseInfo.color }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Text style={{ fontSize: 20 }}>{phaseInfo.emoji}</Text>
                <View>
                  <Text style={styles.cardTitle}>Cycle Context</Text>
                  <Text style={{ color: TEXT_MUTED, fontSize: 12 }}>
                    Day {dayOfCycle} · {phaseInfo.name} Phase
                  </Text>
                </View>
              </View>
              <Text style={styles.cardBody}>{contextInsight.message}</Text>
              {patternInsight && (
                <Text style={[styles.cardBody, { marginTop: 8, fontStyle: 'italic', color: TEXT_SECONDARY }]}>
                  📊 {patternInsight.message}
                </Text>
              )}
            </View>
          );
        })()}

        {/* 5. WHAT TO TRY */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What to try</Text>
          {content.whatToTry.map((item, i) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.linkRow,
                i === content.whatToTry.length - 1 && styles.linkRowLast,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
            >
              <Text style={styles.linkText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={ACCENT} />
            </Pressable>
          ))}
        </View>

        {/* 6. THE SCIENCE (Academic Sources) */}
        {(() => {
          const sources = ACADEMIC_SOURCES.filter(s => s.primaryGauge === gaugeId);
          const insights = getInsightsForGauge(gaugeId as GaugeType);
          if (sources.length === 0) return null;
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📚 The Science Behind This</Text>
              <Text style={[styles.cardBody, { marginBottom: 16 }]}>
                This gauge is informed by real research. Tap to explore the depth.
              </Text>
              {sources.map((source) => (
                <View key={source.id} style={styles.sourceItem}>
                  <Text style={styles.sourceAuthor}>{source.author}</Text>
                  <Text style={styles.sourceTitle}>{source.title}</Text>
                  <Text style={styles.sourceInsight}>"{source.keyInsight}"</Text>
                </View>
              ))}
              {insights.length > 0 && (
                <View style={styles.insightsSection}>
                  <Text style={styles.insightsSectionTitle}>💡 Synthesized Insights</Text>
                  {insights.slice(0, 3).map((insight) => (
                    <View key={insight.id} style={styles.insightItem}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <Text style={styles.insightTruth}>{insight.coreTruth}</Text>
                      <Text style={styles.insightAction}>→ {insight.whatYouCanDo}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })()}

        {/* 8. CONNECTION: MY CIRCLE */}
        {gaugeId === 'connection' && members.length > 0 && (
          <Pressable
            style={styles.card}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/circle');
            }}
          >
            <Text style={styles.cardTitle}>My Circle</Text>
            <Text style={styles.cardBody}>
              {members.length} {members.length === 1 ? 'person' : 'people'} in your circle. Tap to check in.
            </Text>
          </Pressable>
        )}

        {/* 9. CHECK IN BUTTON */}
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(modals)/cockpit-checkin');
          }}
        >
          <Text style={styles.primaryBtnText}>Check in</Text>
        </Pressable>
      </ScrollView>
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COCKPIT_BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitles: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 },
  error: { fontSize: 16, color: TEXT_SECONDARY, padding: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  gaugeWrap: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.lg },
  gaugeStatusText: { fontSize: 14, color: TEXT_SECONDARY, marginTop: SPACING.sm },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  trendText: { fontSize: 14, color: TEXT_SECONDARY },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  funFactCard: { borderLeftWidth: 4, borderLeftColor: ACCENT },
  cardTitle: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8, letterSpacing: -0.2 },
  cardBody: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  linkRowLast: { borderBottomWidth: 0 },
  linkText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  primaryBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  
  // Academic Sources
  sourceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  sourceAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
    marginBottom: 2,
  },
  sourceTitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  sourceInsight: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  
  // Synthesized Insights
  insightsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
  },
  insightsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  insightItem: {
    marginBottom: 16,
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  insightTruth: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 8,
  },
  insightAction: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: '500',
  },
});
