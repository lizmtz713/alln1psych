/**
 * Achievements — View all achievements and progress
 */
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const getAchievements = useInsightsStore((s) => s.getAchievements);
  const achievements = getAchievements();
  
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Achievements</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{unlocked.length}</Text>
            <Text style={styles.summaryLabel}>of {achievements.length} unlocked</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(unlocked.length / achievements.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Unlocked */}
          {unlocked.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Unlocked</Text>
              <View style={styles.grid}>
                {unlocked.map((achievement) => (
                  <View key={achievement.id} style={styles.achievementCard}>
                    <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                    <View style={styles.unlockedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Keep Going</Text>
              <View style={styles.grid}>
                {locked.map((achievement) => (
                  <View key={achievement.id} style={[styles.achievementCard, styles.lockedCard]}>
                    <Text style={[styles.achievementEmoji, styles.lockedEmoji]}>🔒</Text>
                    <Text style={[styles.achievementTitle, styles.lockedText]}>{achievement.title}</Text>
                    <Text style={[styles.achievementDesc, styles.lockedText]}>{achievement.description}</Text>
                  </View>
                ))}
              </View>
            </>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
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
  
  // Summary
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  summaryNumber: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.accent,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  
  // Section
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    position: 'relative',
  },
  lockedCard: {
    opacity: 0.6,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  achievementTitle: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  achievementDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  lockedText: {
    color: COLORS.textMuted,
  },
  unlockedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
});
