/**
 * Human Development Map — Life Stages.
 * Timeline of human development. Orientation, not grading. Research-based, calm, reflective.
 * Route: /learn/life-stages
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getLifeStagesOrdered, type LifeStage, type GaugeId } from '../../../src/data/lifeStages';
import { useLifeStagesStore, type StageMarker } from '../../../src/stores/lifeStagesStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const GAUGE_LABELS: Record<GaugeId, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

function StageCard({
  stage,
  isExpanded,
  onToggle,
  marker,
  onSetMarker,
}: {
  stage: LifeStage;
  isExpanded: boolean;
  onToggle: () => void;
  marker: StageMarker | null;
  onSetMarker: (m: StageMarker | null) => void;
}) {
  const handleMarker = (m: StageMarker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSetMarker(marker === m ? null : m);
  };

  return (
    <View style={[styles.stageCard, { borderLeftColor: stage.color, borderLeftWidth: 4 }]}>
      <Pressable style={styles.stageCardHeader} onPress={onToggle}>
        <View style={styles.stageCardTitleRow}>
          <Text style={styles.stageCardTitle}>{stage.title}</Text>
          <Text style={[styles.stageCardAge, { color: stage.color }]}>{stage.ageRange}</Text>
        </View>
        <View style={styles.markerRow}>
          {marker === 'passed' && <Text style={styles.markerLabel}>✓ Passed</Text>}
          {marker === 'here' && <Text style={[styles.markerLabel, styles.markerHere]}>● I'm here</Text>}
          {marker === 'preparing' && <Text style={styles.markerLabel}>→ Preparing</Text>}
        </View>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
      </Pressable>

      {isExpanded && (
        <View style={styles.stageCardBody}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What humans develop</Text>
            {stage.whatDevelops.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item}</Text>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What's normal</Text>
            <Text style={styles.reassurance}>Many people in this stage experience:</Text>
            {stage.whatsNormal.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item}</Text>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Common challenges</Text>
            {stage.commonChallenges.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item}</Text>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What helps</Text>
            {stage.whatHelps.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item}</Text>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Gauges that matter most</Text>
            <View style={styles.gaugesRow}>
              {stage.gaugesEmphasized.map((gid) => (
                <View key={gid} style={[styles.gaugePill, { backgroundColor: stage.colorBg }]}>
                  <Text style={[styles.gaugePillText, { color: stage.color }]}>{GAUGE_LABELS[gid]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.orientationRow}>
            <Text style={styles.orientationHint}>Optional: mark your place (not graded)</Text>
            <View style={styles.orientationBtns}>
              <Pressable
                style={[styles.orientationBtn, marker === 'passed' && styles.orientationBtnActive]}
                onPress={() => handleMarker('passed')}
              >
                <Text style={styles.orientationBtnText}>I've been here</Text>
              </Pressable>
              <Pressable
                style={[styles.orientationBtn, marker === 'here' && styles.orientationBtnActive]}
                onPress={() => handleMarker('here')}
              >
                <Text style={styles.orientationBtnText}>I'm here</Text>
              </Pressable>
              <Pressable
                style={[styles.orientationBtn, marker === 'preparing' && styles.orientationBtnActive]}
                onPress={() => handleMarker('preparing')}
              >
                <Text style={styles.orientationBtnText}>Preparing</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default function LifeStagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const stages = getLifeStagesOrdered();
  const [expandedId, setExpandedId] = useState<string | null>(stages[0]?.id ?? null);
  const scrollRef = useRef<ScrollView>(null);

  const markers = useLifeStagesStore((s) => s.markers);
  const setMarker = useLifeStagesStore((s) => s.setMarker);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleStagePill = (stage: LifeStage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(stage.id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const toggleExpanded = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Life Stages</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Understanding where you are in the human journey</Text>
        <Text style={styles.introLine}>Every stage of life brings challenges and growth. Understanding them helps you navigate with more clarity.</Text>

        {/* Timeline pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineScroll}
        >
          {stages.map((stage) => (
            <Pressable
              key={stage.id}
              style={[
                styles.pill,
                { backgroundColor: expandedId === stage.id ? stage.colorBg : CARD_BG, borderColor: stage.color },
                expandedId === stage.id && styles.pillActive,
              ]}
              onPress={() => handleStagePill(stage)}
            >
              <Text style={[styles.pillText, expandedId === stage.id && { color: stage.color, fontWeight: '600' }]} numberOfLines={1}>
                {stage.title}
              </Text>
              {markers[stage.id] === 'here' && <View style={[styles.pillDot, { backgroundColor: stage.color }]} />}
            </Pressable>
          ))}
        </ScrollView>

        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isExpanded={expandedId === stage.id}
            onToggle={() => toggleExpanded(stage.id)}
            marker={markers[stage.id] ?? null}
            onSetMarker={(m) => setMarker(stage.id, m)}
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This map is based on developmental psychology and life-span research. It's for orientation and reassurance—not a score or prescription.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 15, fontWeight: '600', color: TEXT, marginBottom: 4 },
  introLine: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, marginBottom: SPACING.lg },
  timelineScroll: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg, paddingVertical: 4 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  pillActive: { borderWidth: 2 },
  pillText: { fontSize: 13, color: TEXT_MUTED },
  pillDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  stageCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: BORDER,
  },
  stageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  stageCardTitleRow: { flex: 1 },
  stageCardTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  stageCardAge: { fontSize: 13, marginTop: 2 },
  markerRow: { marginRight: 8 },
  markerLabel: { fontSize: 12, color: TEXT_MUTED },
  markerHere: { color: COLORS.accent, fontWeight: '600' },
  stageCardBody: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  section: { marginTop: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  reassurance: { fontSize: 13, color: TEXT_MUTED, marginBottom: 4 },
  bullet: { fontSize: 14, color: TEXT, lineHeight: 21, marginBottom: 2 },
  gaugesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  gaugePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  gaugePillText: { fontSize: 12, fontWeight: '600' },
  orientationRow: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  orientationHint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  orientationBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  orientationBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: BORDER,
  },
  orientationBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  orientationBtnText: { fontSize: 12, color: TEXT },
  footer: { marginTop: 8 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
