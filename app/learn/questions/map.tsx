/**
 * Life Journey Map — Full screen map of the 12 questions + link to Human Profile.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../src/lib/constants';
import { JourneyMap } from '../../../src/components/questions/JourneyMap';
import { useLifeQuestionsStore } from '../../../src/stores/lifeQuestionsStore';

export default function LifeQuestionsMapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const completedCount = useLifeQuestionsStore((s) => s.completedCount());

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleHumanProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile/human-profile');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Life Journey Map</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {completedCount > 0 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>{completedCount} of 12 questions completed</Text>
          </View>
        )}
        <JourneyMap embedded />
        <Pressable style={styles.profileBtn} onPress={handleHumanProfile}>
          <Ionicons name="person" size={22} color={COLORS.accent} />
          <Text style={styles.profileBtnText}>View Human Profile</Text>
        </Pressable>
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
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  progressCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.accentBg,
    borderRadius: 12,
  },
  progressText: { fontSize: 14, color: COLORS.accent, fontWeight: '600', textAlign: 'center' },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  profileBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
});
