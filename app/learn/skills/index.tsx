/**
 * 16 Human Skills — List screen. Four domain cards, each with 4 skills.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getDomainsInOrder, getSkillsForDomain } from '../../../src/data/humanSkills';
import { useHumanSkillsStore } from '../../../src/stores/humanSkillsStore';
import type { SkillId } from '../../../src/types/human-skills';

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

export default function HumanSkillsIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const domains = getDomainsInOrder();
  const getPoints = useHumanSkillsStore((s) => s.getPoints);
  const getLevel = useHumanSkillsStore((s) => s.getLevel);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSkillPress = (id: SkillId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/learn/skills/${id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Core Human Skills</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          These are learnable skills, not personality traits. Practice in life; earn points from check-ins, Quick Reset, Post-Flight, and talking with the AI.
        </Text>

        {domains.map((domain) => {
          const skills = getSkillsForDomain(domain.id);
          return (
            <View key={domain.id} style={styles.domainCard}>
              <View style={styles.domainHeader}>
                <Text style={styles.domainEmoji}>{domain.emoji}</Text>
                <View style={styles.domainTitleWrap}>
                  <Text style={styles.domainTitle}>{domain.title}</Text>
                  <Text style={styles.domainDesc}>{domain.description}</Text>
                </View>
              </View>
              <View style={styles.skillList}>
                {skills.map((skill) => {
                  const points = getPoints(skill.id);
                  const level = getLevel(skill.id);
                  const levelLabel = LEVEL_LABELS[level] ?? 'Exploring';
                  return (
                    <Pressable
                      key={skill.id}
                      style={({ pressed }) => [styles.skillRow, pressed && styles.skillRowPressed]}
                      onPress={() => handleSkillPress(skill.id)}
                    >
                      <Text style={styles.skillEmoji}>{skill.emoji}</Text>
                      <View style={styles.skillText}>
                        <Text style={styles.skillTitle}>{skill.shortTitle}</Text>
                        <Text style={styles.skillMeta}>{points} pts · {levelLabel}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
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
  subtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  domainCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  domainEmoji: { fontSize: 32, marginRight: 14 },
  domainTitleWrap: { flex: 1 },
  domainTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 4 },
  domainDesc: { fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
  skillList: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  skillRowPressed: { backgroundColor: COLORS.surfaceElevated },
  skillEmoji: { fontSize: 22, marginRight: 12 },
  skillText: { flex: 1 },
  skillTitle: { fontSize: 16, fontWeight: '600', color: TEXT },
  skillMeta: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
});
