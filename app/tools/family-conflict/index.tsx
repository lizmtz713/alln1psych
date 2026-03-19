/**
 * Family Conflict Navigator — Navigate difficult family relationships.
 * Focus: understanding, boundaries, support. Respects safety and autonomy.
 * Route: /tools/family-conflict
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  FAMILY_CONFLICT_GAUGES,
  FAMILY_CONFLICT_PATTERNS,
  BOUNDARY_EXAMPLES,
  PATHS,
  CONVERSATION_STRUCTURE,
  RESOURCES,
} from '../../../src/data/familyConflictNavigator';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function FamilyConflictNavigatorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const openLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Family conflict support</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          A calm, step-by-step way to reflect on difficult family relationships and choose a path that respects your safety and autonomy.
        </Text>

        {/* Safety first */}
        <View style={styles.safetyNotice}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.warning} />
          <Text style={styles.safetyText}>
            If you are in emotional or physical danger, your safety comes first. You do not have to stay in harmful situations. See Step 6 for support.
          </Text>
        </View>

        {/* Step 1 */}
        <View style={styles.stepBlock}>
          <Text style={styles.stepBadge}>Step 1</Text>
          <Text style={styles.stepTitle}>What’s happening?</Text>
          <Text style={styles.stepDesc}>A quick self-check. No right answers—just notice.</Text>
          <View style={styles.prompts}>
            <Text style={styles.promptLabel}>• What happened recently?</Text>
            <Text style={styles.promptLabel}>• Which emotions are strongest? (anger, hurt, guilt, resentment, sadness)</Text>
            <Text style={styles.promptLabel}>• Which parts of your system are affected?</Text>
          </View>
          <View style={styles.gaugesRow}>
            {FAMILY_CONFLICT_GAUGES.map((g) => (
              <View key={g.id} style={styles.gaugeChip}>
                <Text style={styles.gaugeChipEmoji}>{g.emoji}</Text>
                <Text style={styles.gaugeChipLabel}>{g.label}</Text>
                <Text style={styles.gaugeChipDesc}>{g.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepBlock}>
          <Text style={styles.stepBadge}>Step 2</Text>
          <Text style={styles.stepTitle}>Identify the pattern</Text>
          <Text style={styles.stepDesc}>
            Many family conflicts come from long-standing patterns, not just one event. Which of these feel familiar?
          </Text>
          {FAMILY_CONFLICT_PATTERNS.map((p) => (
            <View key={p.id} style={styles.patternCard}>
              <Text style={styles.patternLabel}>{p.label}</Text>
              <Text style={styles.patternShort}>{p.short}</Text>
            </View>
          ))}
        </View>

        {/* Step 3 */}
        <View style={styles.stepBlock}>
          <Text style={styles.stepBadge}>Step 3</Text>
          <Text style={styles.stepTitle}>Reflect on needs and boundaries</Text>
          <Text style={styles.stepDesc}>You get to decide what you need and what is not acceptable.</Text>
          <View style={styles.prompts}>
            <Text style={styles.promptLabel}>• What do I need from this relationship right now?</Text>
            <Text style={styles.promptLabel}>• What behavior is not acceptable to me?</Text>
            <Text style={styles.promptLabel}>• What would a healthier boundary look like?</Text>
          </View>
          <Text style={styles.examplesTitle}>Examples of healthy boundaries</Text>
          {BOUNDARY_EXAMPLES.map((ex, i) => (
            <Text key={i} style={styles.bullet}>{ex}</Text>
          ))}
        </View>

        {/* Step 4 */}
        <View style={styles.stepBlock}>
          <Text style={styles.stepBadge}>Step 4</Text>
          <Text style={styles.stepTitle}>Choose a path</Text>
          <Text style={styles.stepDesc}>There’s no single “correct” solution. Pick what fits your situation and safety.</Text>
          {PATHS.map((p) => (
            <View key={p.id} style={styles.pathCard}>
              <Text style={styles.pathEmoji}>{p.emoji}</Text>
              <View style={styles.pathBody}>
                <Text style={styles.pathLabel}>{p.label}</Text>
                <Text style={styles.pathDesc}>{p.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Step 5 */}
        <View style={styles.stepBlock}>
          <Text style={styles.stepBadge}>Step 5</Text>
          <Text style={styles.stepTitle}>Prepare for a conversation (if you want one)</Text>
          <Text style={styles.stepDesc}>
            Use this structure to keep the talk productive and less accusatory.
          </Text>
          {CONVERSATION_STRUCTURE.map((c) => (
            <View key={c.step} style={styles.convRow}>
              <Text style={styles.convStepNum}>{c.step}</Text>
              <View style={styles.convBody}>
                <Text style={styles.convLabel}>{c.label}</Text>
                <Text style={styles.convPrompt}>{c.prompt}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Step 6 */}
        <View style={styles.stepBlock}>
          <Text style={styles.stepBadge}>Step 6</Text>
          <Text style={styles.stepTitle}>Resources</Text>
          <Text style={styles.stepDesc}>Support is available. You don’t have to figure this out alone.</Text>
          {RESOURCES.map((r) => (
            <View key={r.id} style={[styles.resourceCard, r.emphasis && styles.resourceCardEmphasis]}>
              <Text style={[styles.resourceLabel, r.emphasis && styles.resourceLabelEmphasis]}>{r.label}</Text>
              <Text style={styles.resourceDesc}>{r.description}</Text>
              {r.links?.map((link, i) => (
                <Pressable
                  key={i}
                  style={styles.resourceLink}
                  onPress={() => openLink(link.url)}
                >
                  <Text style={styles.resourceLinkText}>{link.label}</Text>
                  {link.phone && <Text style={styles.resourcePhone}> {link.phone}</Text>}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This tool is for reflection and support, not a substitute for professional help. If you’re in crisis or danger, use the resources above.
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(224, 122, 95, 0.12)',
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(224, 122, 95, 0.25)',
  },
  safetyText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
    marginLeft: 8,
  },
  stepBlock: { marginBottom: SPACING.xl },
  stepBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, marginBottom: 12 },
  prompts: { marginBottom: 8 },
  promptLabel: { fontSize: 14, color: TEXT, lineHeight: 22, marginBottom: 4 },
  gaugesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gaugeChip: {
    minWidth: '47%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gaugeChipEmoji: { fontSize: 16, marginBottom: 2 },
  gaugeChipLabel: { fontSize: 13, fontWeight: '600', color: TEXT },
  gaugeChipDesc: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  patternCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  patternLabel: { fontSize: 14, fontWeight: '600', color: TEXT },
  patternShort: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  examplesTitle: { fontSize: 13, fontWeight: '600', color: TEXT, marginTop: 8, marginBottom: 6 },
  bullet: { fontSize: 14, color: TEXT_MUTED, lineHeight: 21, marginBottom: 4, paddingLeft: 4 },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pathEmoji: { fontSize: 22, marginRight: 12 },
  pathBody: { flex: 1 },
  pathLabel: { fontSize: 14, fontWeight: '600', color: TEXT },
  pathDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 2, lineHeight: 19 },
  convRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  convStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
  },
  convBody: { flex: 1 },
  convLabel: { fontSize: 14, fontWeight: '600', color: TEXT },
  convPrompt: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  resourceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  resourceCardEmphasis: {
    borderColor: 'rgba(224, 122, 95, 0.4)',
    backgroundColor: 'rgba(224, 122, 95, 0.08)',
  },
  resourceLabel: { fontSize: 14, fontWeight: '600', color: TEXT },
  resourceLabelEmphasis: { color: COLORS.warning },
  resourceDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 4, lineHeight: 19 },
  resourceLink: { marginTop: 6 },
  resourceLinkText: { fontSize: 13, color: ACCENT, fontWeight: '500' },
  resourcePhone: { fontSize: 13, color: TEXT },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
