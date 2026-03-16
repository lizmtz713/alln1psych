/**
 * Quick Reset — Single exercise screen. Route: /tools/quick-reset/[id]
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useResetStore, type QuickResetExerciseId } from '../../../src/stores/resetStore';
import { useHumanSkillsStore, QUICK_RESET_SKILL_IDS, SKILL_POINTS } from '../../../src/stores/humanSkillsStore';
import { BoxBreathing } from '../../../src/components/quickReset/BoxBreathing';
import { PhysiologicalSigh } from '../../../src/components/quickReset/PhysiologicalSigh';
import { FiveFourGrounding } from '../../../src/components/quickReset/FiveFourGrounding';
import { ColdReset } from '../../../src/components/quickReset/ColdReset';
import { ShakeItOut } from '../../../src/components/quickReset/ShakeItOut';
import { ShortWalk } from '../../../src/components/quickReset/ShortWalk';

const VALID_IDS: QuickResetExerciseId[] = [
  'box-breathing',
  'physiological-sigh',
  '5-4-3-2-1-grounding',
  'cold-reset',
  'shake-it-out',
  'short-walk',
];

const TITLES: Record<QuickResetExerciseId, string> = {
  'box-breathing': 'Box Breathing',
  'physiological-sigh': 'Physiological Sigh',
  '5-4-3-2-1-grounding': '5-4-3-2-1 Grounding',
  'cold-reset': 'Cold Reset',
  'shake-it-out': 'Shake It Out',
  'short-walk': 'Short Walk',
};

export default function QuickResetExerciseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addSession = useResetStore((s) => s.addSession);
  const addSkillPoints = useHumanSkillsStore((s) => s.addPoints);

  const exerciseId = (VALID_IDS.includes(id as QuickResetExerciseId) ? id : 'box-breathing') as QuickResetExerciseId;

  const handleComplete = useCallback(
    (durationSeconds: number) => {
      addSession(exerciseId, durationSeconds);
      addSkillPoints(QUICK_RESET_SKILL_IDS, SKILL_POINTS.quickReset, 'quick-reset');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
    [exerciseId, addSession, addSkillPoints, router]
  );

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderExercise = () => {
    switch (exerciseId) {
      case 'box-breathing':
        return <BoxBreathing onComplete={handleComplete} />;
      case 'physiological-sigh':
        return <PhysiologicalSigh onComplete={handleComplete} />;
      case '5-4-3-2-1-grounding':
        return <FiveFourGrounding onComplete={handleComplete} />;
      case 'cold-reset':
        return <ColdReset onComplete={handleComplete} />;
      case 'shake-it-out':
        return <ShakeItOut onComplete={handleComplete} />;
      case 'short-walk':
        return <ShortWalk onComplete={handleComplete} />;
      default:
        return <BoxBreathing onComplete={handleComplete} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.textMuted} />
        </Pressable>
        <Text style={styles.headerTitle}>{TITLES[exerciseId]}</Text>
        <View style={styles.closeBtn} />
      </View>
      <View style={styles.content}>{renderExercise()}</View>
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
  closeBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  content: { flex: 1 },
});
