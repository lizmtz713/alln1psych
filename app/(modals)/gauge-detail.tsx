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
import { GAUGE_CONFIG, getGaugeStatusLabel } from '../../src/utils/gaugeHelpers';
import { useCircleStore } from '../../src/stores/circleStore';
import { getDailyFact } from '../../src/data/psychKnowledge';
import { BodyGauge, StateGauge, EmotionGauge, ConnectionGauge, DirectionGauge, AlignmentGauge } from '../../src/components/gauges';

const GAUGE_COMPONENTS: Record<string, React.FC<{ value: number; size?: number }>> = {
  body: BodyGauge,
  state: StateGauge,
  emotion: EmotionGauge,
  connection: ConnectionGauge,
  direction: DirectionGauge,
  alignment: AlignmentGauge,
};

const COCKPIT_BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const TEXT_MUTED = '#55556A';
const ACCENT = '#7C4DFF';

const GAUGE_SIZE = 140;

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
      { label: 'Talk to Psych', route: '/(tabs)/talk' },
    ],
    funFact:
      'Anger often masks hurt + powerlessness. "Laziness" often masks overwhelm. Naming the real feeling reduces its grip.',
  },
  connection: {
    whatAffects: ['Quality time', 'Feeling heard', 'Conflict', 'Isolation', 'Trust'],
    whatToTry: [
      { label: 'Check on someone', route: '/(tabs)/circle' },
      { label: 'Role play a hard conversation', route: '/(modals)/role-play' },
      { label: 'Help Someone', route: '/(modals)/help-someone' },
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
      { label: 'Talk to Psych', route: '/(tabs)/talk' },
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
        {/* 2. LARGE GAUGE */}
        <View style={styles.gaugeWrap}>
          {(() => {
            const GaugeComponent = GAUGE_COMPONENTS[gaugeId] ?? BodyGauge;
            return <GaugeComponent value={value} size={140} />;
          })()}
          <Text style={styles.gaugeStatusText}>{statusLabel}</Text>
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

        {/* 6. DID YOU KNOW? */}
        <View style={[styles.card, styles.funFactCard]}>
          <Text style={styles.cardTitle}>Did you know?</Text>
          <Text style={styles.cardBody}>{content.funFact}</Text>
        </View>

        {/* 7. CONNECTION: MY CIRCLE */}
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

        {/* 8. CHECK IN BUTTON */}
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
  gaugeWrap: { alignItems: 'center', marginBottom: 24 },
  gaugeStatusText: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 8 },
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
});
