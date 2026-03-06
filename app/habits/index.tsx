/**
 * Habit Tracker — Today's habits with checkboxes and streaks.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useHabitStore } from '../../src/stores/habitStore';
import type { Habit, HabitType } from '../../src/types/habits';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitsIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const habitsState = useHabitStore((s) => s.habits);
  const getCompletionValue = useHabitStore((s) => s.getCompletionValue);
  const setCompletion = useHabitStore((s) => s.setCompletion);
  const getStreak = useHabitStore((s) => s.getStreak);

  const habits = useMemo(
    () => habitsState.filter((h) => !h.archived),
    [habitsState]
  );
  const date = todayStr();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/habits/add');
  };

  const handleHabitPress = (habit: Habit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/habits/' + habit.id);
  };

  const handleBooleanToggle = (habitId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const v = getCompletionValue(habitId, date);
    setCompletion(habitId, date, v >= 1 ? 0 : 1);
  };

  const handleCountIncrement = (habitId: string, target: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const v = getCompletionValue(habitId, date);
    setCompletion(habitId, date, Math.min(target, v + 1));
  };

  const handleTimerSet = (habitId: string, minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = getCompletionValue(habitId, date);
    setCompletion(habitId, date, current + minutes);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Habits</Text>
        <Pressable onPress={handleAdd} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={COLORS.accent} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Today</Text>

        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>Add a habit to start tracking.</Text>
            <Pressable style={styles.emptyBtn} onPress={handleAdd}>
              <Text style={styles.emptyBtnText}>Add habit</Text>
            </Pressable>
          </View>
        ) : (
          habits.map((habit) => {
            const value = getCompletionValue(habit.id, date);
            const streak = getStreak(habit.id);
            const isDone = habit.type === 'boolean' ? value >= 1 : (habit.target ?? 1) <= value;

            return (
              <Pressable
                key={habit.id}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => handleHabitPress(habit)}
              >
                <View style={styles.cardLeft}>
                  {habit.type === 'boolean' && (
                    <Pressable
                      style={[styles.checkbox, isDone && styles.checkboxDone]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleBooleanToggle(habit.id);
                      }}
                    >
                      {isDone && <Ionicons name="checkmark" size={18} color="#fff" />}
                    </Pressable>
                  )}
                  {habit.type === 'count' && (
                    <View style={styles.countWrap}>
                      <Pressable
                        style={styles.countBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCountIncrement(habit.id, habit.target ?? 1);
                        }}
                      >
                        <Text style={styles.countBtnText}>{value}</Text>
                      </Pressable>
                      <Text style={styles.countTarget}>/ {habit.target ?? 1}{habit.unit ? ' ' + habit.unit : ''}</Text>
                    </View>
                  )}
                  {habit.type === 'timer' && (
                    <View style={styles.timerWrap}>
                      <Text style={styles.timerValue}>{value} min</Text>
                      <Pressable
                        style={styles.quickMinBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleTimerSet(habit.id, 5);
                        }}
                      >
                        <Text style={styles.quickMinText}>+5</Text>
                      </Pressable>
                    </View>
                  )}
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, isDone && styles.cardTitleDone]}>
                      {habit.emoji ? habit.emoji + ' ' : ''}{habit.name}
                    </Text>
                    {(streak.current > 0 || streak.longest > 0) && (
                      <Text style={styles.streak}>🔥 {streak.current} day streak · best {streak.longest}</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
              </Pressable>
            );
          })
        )}
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
  addBtn: { width: 40, padding: 8, alignItems: 'flex-end' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 15, color: TEXT_MUTED, marginBottom: SPACING.lg },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 4 },
  emptySub: { fontSize: 14, color: TEXT_MUTED, marginBottom: SPACING.lg },
  emptyBtn: { backgroundColor: COLORS.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  emptyBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardPressed: { opacity: 0.9 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.accent },
  countWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  countBtn: { backgroundColor: COLORS.surfaceElevated, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  countBtnText: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  countTarget: { fontSize: 14, color: TEXT_MUTED, marginLeft: 4 },
  timerWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 14, gap: 6 },
  timerValue: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  quickMinBtn: { backgroundColor: COLORS.surfaceElevated, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  quickMinText: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: TEXT },
  cardTitleDone: { color: TEXT_MUTED, textDecorationLine: 'line-through' },
  streak: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
