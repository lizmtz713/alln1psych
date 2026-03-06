/**
 * Focus Tool — Single attention exercise. Route: /tools/focus/exercise/[id]
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { COLORS } from '../../../../src/lib/constants';
import { useFocusStore } from '../../../../src/stores/focusStore';
import type { FocusExerciseId } from '../../../../src/types/focus';
import { FocusBreath } from '../../../../src/components/focus/FocusBreath';
import { FocusPoint } from '../../../../src/components/focus/FocusPoint';
import { FocusBodyScan } from '../../../../src/components/focus/FocusBodyScan';
import { FocusListening } from '../../../../src/components/focus/FocusListening';
import { FocusThoughtNoting } from '../../../../src/components/focus/FocusThoughtNoting';

const VALID_IDS: FocusExerciseId[] = ['breath', 'point', 'body-scan', 'listening', 'thought-noting'];

const TITLES: Record<FocusExerciseId, string> = {
  'breath': 'Breath focus',
  'point': 'Single-point gaze',
  'body-scan': 'Body scan',
  'listening': 'Listening',
  'thought-noting': 'Thought noting',
};

export default function FocusExerciseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = (VALID_IDS.includes(id as FocusExerciseId) ? id : 'breath') as FocusExerciseId;
  const addExerciseSession = useFocusStore((s) => s.addExerciseSession);

  const handleComplete = useCallback(
    (durationSeconds: number) => {
      addExerciseSession(exerciseId, durationSeconds);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
    [exerciseId, addExerciseSession, router]
  );

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderExercise = () => {
    switch (exerciseId) {
      case 'breath':
        return <FocusBreath onComplete={handleComplete} />;
      case 'point':
        return <FocusPoint onComplete={handleComplete} />;
      case 'body-scan':
        return <FocusBodyScan onComplete={handleComplete} />;
      case 'listening':
        return <FocusListening onComplete={handleComplete} />;
      case 'thought-noting':
        return <FocusThoughtNoting onComplete={handleComplete} />;
      default:
        return <FocusBreath onComplete={handleComplete} />;
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
