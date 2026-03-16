/**
 * 16 Human Skills — Single skill detail: description, points, level, how to earn.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getSkillById, getDomainById } from '../../../src/data/humanSkills';
import { useHumanSkillsStore, SKILL_POINTS, LEVEL_THRESHOLDS } from '../../../src/stores/humanSkillsStore';
import type { SkillId, SkillLevel } from '../../../src/types/human-skills';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const LEVEL_LABELS: Record<string, string> = {
  exploring: 'Exploring',
  developing: 'Developing',
  practiced: 'Practiced',
  strong: 'Strong',
  integrated: 'Integrated',
};

const LEVEL_ORDER: SkillLevel[] = ['exploring', 'developing', 'practiced', 'strong', 'integrated'];
function getNextLevelThreshold(currentLevel: SkillLevel): number | null {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_THRESHOLDS[LEVEL_ORDER[idx + 1]];
}

type SourceKey = 'checkIn' | 'quickReset' | 'postFlight' | 'aiTalk' | 'lessonComplete' | 'rolePlay' | 'toolUse';
const SOURCES: { key: SourceKey; label: string; route: string }[] = [
  { key: 'checkIn', label: 'Mood check-in', route: '/(modals)/mood-checkin' },
  { key: 'quickReset', label: 'Quick Reset', route: '/tools/quick-reset' },
  { key: 'postFlight', label: 'Post-Flight Debrief', route: '/rituals/post-flight' },
  { key: 'aiTalk', label: 'Talk with AI', route: '/(tabs)/talk' },
  { key: 'lessonComplete', label: 'Complete a lesson', route: '/(tabs)/learn' },
  { key: 'rolePlay', label: 'Conversation practice (Role-play)', route: '/(modals)/role-play' },
  { key: 'toolUse', label: 'Decode or Resolve', route: '/(tabs)/tools' },
];

const POINTS_MAP: Record<SourceKey, number> = {
  checkIn: SKILL_POINTS.checkIn,
  quickReset: SKILL_POINTS.quickReset,
  postFlight: SKILL_POINTS.postFlight,
  aiTalk: SKILL_POINTS.aiTalk,
  lessonComplete: SKILL_POINTS.lessonComplete,
  rolePlay: SKILL_POINTS.conversationSimulation,
  toolUse: SKILL_POINTS.toolUse,
};

/** Which skill IDs get points from each source (for "you earn from" section) */
const SKILL_IDS_BY_SOURCE: Record<SourceKey, SkillId[]> = {
  checkIn: ['self-awareness', 'emotional-awareness', 'body-awareness', 'regulation'],
  quickReset: ['regulation', 'stress-tolerance', 'grounding', 'recovery'],
  postFlight: ['reflection', 'learning', 'intention', 'meaning', 'emotional-awareness'],
  aiTalk: ['communication', 'emotional-awareness', 'self-awareness', 'empathy'],
  lessonComplete: ['emotional-awareness', 'self-awareness', 'regulation', 'communication', 'empathy', 'boundaries', 'repair'],
  rolePlay: ['communication', 'empathy', 'stress-tolerance'],
  toolUse: ['communication', 'empathy', 'self-awareness', 'reflection', 'regulation'],
};

export default function HumanSkillDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const skillId = (id ?? 'self-awareness') as SkillId;
  const skill = getSkillById(skillId);
  const domain = skill ? getDomainById(skill.domainId) : null;

  const getPoints = useHumanSkillsStore((s) => s.getPoints);
  const getLevel = useHumanSkillsStore((s) => s.getLevel);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const points = skill ? getPoints(skill.id) : 0;
  const level = skill ? getLevel(skill.id) : 'exploring';
  const levelLabel = LEVEL_LABELS[level] ?? 'Exploring';
  const nextThreshold = getNextLevelThreshold(level);
  const showBadge = skill?.badgeName && (level === 'practiced' || level === 'strong' || level === 'integrated');
  const progressPercent = nextThreshold != null && nextThreshold > 0
    ? Math.min(100, (points / nextThreshold) * 100)
    : 100;

  const earnFrom = SOURCES.filter((s) => SKILL_IDS_BY_SOURCE[s.key].includes(skillId));

  if (!skill) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Skill</Text>
        </View>
        <Text style={styles.error}>Skill not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{skill.shortTitle}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.emoji}>{skill.emoji}</Text>
          <Text style={styles.title}>{skill.title}</Text>
          {domain && (
            <View style={styles.domainBadge}>
              <Text style={styles.domainBadgeText}>{domain.emoji} {domain.shortTitle}</Text>
            </View>
          )}
          {showBadge && skill.badgeName ? (
            <View style={styles.badgeChip}>
              <Text style={styles.badgeChipText}>🏅 {skill.badgeName}</Text>
            </View>
          ) : null}
          <Text style={styles.description}>{skill.description}</Text>
        </View>

        {nextThreshold != null ? (
          <View style={[styles.infoCard, styles.progressCard]}>
            <Text style={styles.infoTitle}>Progress to {LEVEL_LABELS[LEVEL_ORDER[LEVEL_ORDER.indexOf(level) + 1] ?? 'developing']}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{points} / {nextThreshold} XP</Text>
          </View>
        ) : (
          <View style={[styles.infoCard, styles.progressCard]}>
            <Text style={styles.infoTitle}>Level complete</Text>
            <Text style={styles.progressLabel}>You’ve reached the top level for this skill. Keep practicing to maintain it.</Text>
          </View>
        )}

        {skill.practiceChallenge ? (
          <View style={[styles.infoCard, styles.challengeCard]}>
            <Text style={styles.infoTitle}>Practice challenge</Text>
            <Text style={styles.infoText}>{skill.practiceChallenge}</Text>
          </View>
        ) : null}

        {skill.whyItMatters ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Why it matters</Text>
            <Text style={styles.infoText}>{skill.whyItMatters}</Text>
          </View>
        ) : null}
        {skill.whatResearchSays ? (
          <View style={[styles.infoCard, styles.infoCardMuted]}>
            <Text style={styles.infoTitle}>What science says</Text>
            <Text style={styles.infoText}>{skill.whatResearchSays}</Text>
          </View>
        ) : null}
        {skill.practiceTips && skill.practiceTips.length > 0 ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Practice at your pace</Text>
            {skill.practiceTips.map((tip, i) => (
              <Text key={i} style={styles.tipBullet}>• {tip}</Text>
            ))}
          </View>
        ) : null}
        {skill.paceNote ? (
          <View style={[styles.infoCard, styles.paceCard]}>
            <Text style={styles.paceText}>{skill.paceNote}</Text>
          </View>
        ) : null}

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{levelLabel}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Earn points by</Text>
        <View style={styles.earnList}>
          {earnFrom.map((s) => (
            <Pressable
              key={s.key}
              style={({ pressed }) => [styles.earnRow, pressed && styles.earnRowPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(s.route as any);
              }}
            >
              <Text style={styles.earnLabel}>{s.label}</Text>
              <Text style={styles.earnPts}>+{POINTS_MAP[s.key]} pts</Text>
              <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.footnote}>
          Points are added automatically when you check in, use Quick Reset or Post-Flight, talk with the AI, complete lessons, or use tools like Role-play, Decode, and Resolve.
        </Text>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  error: { padding: SPACING.lg, color: TEXT_MUTED },
  hero: { marginBottom: SPACING.xl },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  title: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 8 },
  domainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  domainBadgeText: { fontSize: 13, color: TEXT_MUTED },
  description: { fontSize: 16, color: TEXT_MUTED, lineHeight: 24 },
  infoCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoCardMuted: { backgroundColor: COLORS.surfaceElevated ?? CARD_BG },
  infoTitle: { fontSize: 14, fontWeight: '600', color: COLORS.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoText: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  tipBullet: { fontSize: 15, color: TEXT_MUTED, lineHeight: 24, marginBottom: 4 },
  paceCard: { borderColor: COLORS.accent + '40' },
  paceText: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic', lineHeight: 20 },
  badgeChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeChipText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  progressCard: { marginBottom: SPACING.md },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceElevated ?? CARD_BG,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  progressLabel: { fontSize: 13, color: TEXT_MUTED, marginTop: 6 },
  challengeCard: { borderColor: COLORS.accent + '50' },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.accent },
  statLabel: { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: BORDER },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  earnList: { marginBottom: SPACING.lg },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  earnRowPressed: { opacity: 0.9 },
  earnLabel: { flex: 1, fontSize: 15, color: TEXT },
  earnPts: { fontSize: 14, color: COLORS.accent, marginRight: 8 },
  footnote: { fontSize: 12, color: TEXT_MUTED, lineHeight: 18 },
});
