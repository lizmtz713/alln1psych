/**
 * Achievements — Unlocked and progress by category.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useAchievementStore } from '../../src/stores/achievementStore';
import { getAchievementsByCategory } from '../../src/data/achievements';
import { getAchievementProgress } from '../../src/services/achievementChecker';

const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const unlockedAt = useAchievementStore((s) => s.unlockedAt);
  const isUnlocked = useAchievementStore((s) => s.isUnlocked);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const categories = getAchievementsByCategory();
  const totalUnlocked = Object.keys(unlockedAt).length;
  const total = categories.reduce((a, c) => a + c.achievements.length, 0);
  const pct = total > 0 ? Math.round((totalUnlocked / total) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressCard}>
          <Text style={styles.progressEmoji}>🏆</Text>
          <Text style={styles.progressCount}>{totalUnlocked} / {total}</Text>
          <Text style={styles.progressLabel}>{pct}% earned</Text>
        </View>

        {categories.map(({ category, label, achievements }) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            {achievements.map((a) => {
              const unlocked = isUnlocked(a.id);
              const { current, target } = getAchievementProgress(a.id);
              const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              return (
                <View
                  key={a.id}
                  style={[styles.card, unlocked && styles.cardUnlocked]}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardEmoji}>{a.emoji}</Text>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]}>
                        {a.title}
                      </Text>
                      <Text style={styles.cardDesc} numberOfLines={2}>{a.description}</Text>
                      {!unlocked && target > 0 && (
                        <Text style={styles.cardProgress}>
                          {current} / {target}
                        </Text>
                      )}
                    </View>
                  </View>
                  {unlocked ? (
                    <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                  ) : (
                    <Ionicons name="lock-closed" size={22} color={TEXT_MUTED} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  progressCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.accentMuted,
  },
  progressEmoji: { fontSize: 40, marginBottom: 8 },
  progressCount: { fontSize: 28, fontWeight: '700', color: TEXT },
  progressLabel: { fontSize: 14, color: TEXT_MUTED },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: BORDER,
    opacity: 0.85,
  },
  cardUnlocked: { opacity: 1, borderColor: COLORS.accentMuted },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: TEXT },
  cardTitleLocked: { color: TEXT_MUTED },
  cardDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  cardProgress: { fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
});
