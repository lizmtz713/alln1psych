/**
 * Small habits widget for home — today's progress and link to /habits.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { useHabitStore } from '../../stores/habitStore';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function HabitsWidget() {
  const router = useRouter();
  const habitsState = useHabitStore((s) => s.habits);
  const getCompletionValue = useHabitStore((s) => s.getCompletionValue);
  const habits = useMemo(
    () => habitsState.filter((h) => !h.archived),
    [habitsState]
  );

  const date = todayStr();
  let done = 0;
  habits.forEach((h) => {
    const v = getCompletionValue(h.id, date);
    if (h.type === 'boolean') {
      if (v >= 1) done++;
    } else {
      const target = h.target ?? 1;
      if (v >= target) done++;
    }
  });

  if (habits.length === 0) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed && styles.wrapPressed]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/habits');
      }}
    >
      <Text style={styles.emoji}>📋</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Today's habits</Text>
        <Text style={styles.sub}>{done} of {habits.length} done</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  wrapPressed: { opacity: 0.9 },
  emoji: { fontSize: 24, marginRight: 12 },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
