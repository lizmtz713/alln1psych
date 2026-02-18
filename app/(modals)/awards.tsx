/**
 * Awards — Your milestones and progress
 * Premium, Apple-style design
 */
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// Better award names and descriptions
const AWARD_DISPLAY: Record<string, { name: string; desc: string; icon: string }> = {
  'first-checkin': { name: 'First Step', desc: 'Completed your first check-in', icon: '🌱' },
  'week-streak': { name: 'Week Strong', desc: '7 consecutive days', icon: '🔥' },
  'first-lesson': { name: 'Learner', desc: 'Completed your first lesson', icon: '📖' },
  'circle-builder': { name: 'Connected', desc: 'Added someone to your circle', icon: '💜' },
  'brave-voice': { name: 'Voice', desc: 'Used voice for the first time', icon: '🎙️' },
  'self-aware': { name: 'Self-Aware', desc: 'Mastered the basics', icon: '🧠' },
  'month-streak': { name: 'Committed', desc: '30 days strong', icon: '⭐' },
  'all-modules': { name: 'Scholar', desc: 'Completed all lessons', icon: '🎓' },
};

export default function AwardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const getAchievements = useInsightsStore((s) => s.getAchievements);
  const achievements = getAchievements();
  
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const progress = Math.round((unlocked.length / achievements.length) * 100);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Awards</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Ring */}
          <View style={styles.progressSection}>
            <View style={styles.progressRing}>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
            <Text style={styles.progressLabel}>{unlocked.length} of {achievements.length} earned</Text>
          </View>

          {/* Unlocked */}
          {unlocked.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earned</Text>
              {unlocked.map((achievement) => {
                const display = AWARD_DISPLAY[achievement.id] || { name: achievement.title, desc: achievement.description, icon: achievement.emoji };
                return (
                  <View key={achievement.id} style={styles.awardCard}>
                    <View style={styles.awardIcon}>
                      <Text style={styles.awardEmoji}>{display.icon}</Text>
                    </View>
                    <View style={styles.awardInfo}>
                      <Text style={styles.awardName}>{display.name}</Text>
                      <Text style={styles.awardDesc}>{display.desc}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  </View>
                );
              })}
            </View>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>In Progress</Text>
              {locked.map((achievement) => {
                const display = AWARD_DISPLAY[achievement.id] || { name: achievement.title, desc: achievement.description, icon: achievement.emoji };
                return (
                  <View key={achievement.id} style={[styles.awardCard, styles.awardCardLocked]}>
                    <View style={[styles.awardIcon, styles.awardIconLocked]}>
                      <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
                    </View>
                    <View style={styles.awardInfo}>
                      <Text style={[styles.awardName, styles.awardNameLocked]}>{display.name}</Text>
                      <Text style={[styles.awardDesc, styles.awardDescLocked]}>{display.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  content: {
    padding: SPACING.lg,
  },
  
  // Progress
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  progressPercent: {
    ...TYPOGRAPHY.displayMd,
    color: COLORS.accent,
  },
  progressLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
  },
  
  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  
  // Award Card
  awardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  awardCardLocked: {
    opacity: 0.6,
  },
  awardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  awardIconLocked: {
    backgroundColor: COLORS.border,
  },
  awardEmoji: {
    fontSize: 24,
  },
  awardInfo: {
    flex: 1,
  },
  awardName: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
    marginBottom: 2,
  },
  awardNameLocked: {
    color: COLORS.textMuted,
  },
  awardDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
  },
  awardDescLocked: {
    color: COLORS.textMuted,
  },
});
