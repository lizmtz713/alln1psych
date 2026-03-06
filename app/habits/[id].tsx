/**
 * Habit Tracker — Habit detail with calendar heatmap.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useHabitStore } from '../../src/stores/habitStore';
import type { Habit } from '../../src/types/habits';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Last 7 weeks (49 days) for heatmap */
const HEATMAP_DAYS = 49;
const CELL_SIZE = 14;
const CELL_GAP = 4;

export default function HabitDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = id ?? '';
  const habit = useHabitStore((s) => s.getHabit(habitId));
  const getCompletionValue = useHabitStore((s) => s.getCompletionValue);
  const setCompletion = useHabitStore((s) => s.setCompletion);
  const getStreak = useHabitStore((s) => s.getStreak);
  const today = todayStr();
  const value = habit ? getCompletionValue(habit.id, today) : 0;
  const streak = habit ? getStreak(habit.id) : { current: 0, longest: 0, lastCompletedDate: null, habitId: '' };

  const heatmapData = useMemo(() => {
    const out: { date: string; value: number; met: boolean }[] = [];
    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const v = habit ? getCompletionValue(habit.id, key) : 0;
      const target = habit?.type === 'boolean' ? 1 : (habit?.target ?? 1);
      out.push({ date: key, value: v, met: habit?.type === 'boolean' ? v >= 1 : v >= target });
    }
    return out;
  }, [habit, getCompletionValue]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBooleanToggle = () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompletion(habit.id, today, value >= 1 ? 0 : 1);
  };

  const handleCountUp = () => {
    if (!habit || habit.type !== 'count') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompletion(habit.id, today, value + 1);
  };

  const handleCountDown = () => {
    if (!habit || habit.type !== 'count') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompletion(habit.id, today, Math.max(0, value - 1));
  };

  const handleTimerAdd = (mins: number) => {
    if (!habit || habit.type !== 'timer') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompletion(habit.id, today, value + mins);
  };

  if (!habit) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.error}>Habit not found.</Text>
      </View>
    );
  }

  const target = habit.target ?? 1;
  const isDone = habit.type === 'boolean' ? value >= 1 : value >= target;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{habit.emoji ? habit.emoji + ' ' : ''}{habit.name}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>Current streak</Text>
          <Text style={styles.streakValue}>{streak.current} days</Text>
          <Text style={styles.streakLongest}>Best: {streak.longest} days</Text>
        </View>

        <Text style={styles.sectionTitle}>Today</Text>
        {habit.type === 'boolean' && (
          <Pressable style={[styles.todayCard, isDone && styles.todayCardDone]} onPress={handleBooleanToggle}>
            <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
              {isDone && <Ionicons name="checkmark" size={24} color="#fff" />}
            </View>
            <Text style={styles.todayLabel}>{isDone ? 'Done' : 'Mark done'}</Text>
          </Pressable>
        )}
        {habit.type === 'count' && (
          <View style={styles.todayCard}>
            <Pressable style={styles.countControl} onPress={handleCountDown}>
              <Ionicons name="remove" size={24} color={COLORS.accent} />
            </Pressable>
            <Text style={styles.countDisplay}>{value} / {target}{habit.unit ? ' ' + habit.unit : ''}</Text>
            <Pressable style={styles.countControl} onPress={handleCountUp}>
              <Ionicons name="add" size={24} color={COLORS.accent} />
            </Pressable>
          </View>
        )}
        {habit.type === 'timer' && (
          <View style={styles.todayCard}>
            <Text style={styles.timerDisplay}>{value} min</Text>
            <View style={styles.timerButtons}>
              {[5, 10, 15, 20].map((m) => (
                <Pressable key={m} style={styles.timerBtn} onPress={() => handleTimerAdd(m)}>
                  <Text style={styles.timerBtnText}>+{m}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Last {HEATMAP_DAYS} days</Text>
        <View style={styles.heatmapWrap}>
          {heatmapData.map(({ date: d, met }) => (
            <View
              key={d}
              style={[
                styles.heatCell,
                met && styles.heatCellDone,
                d === today && styles.heatCellToday,
              ]}
            />
          ))}
        </View>
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
  backText: { fontSize: 16, color: COLORS.accent },
  streakCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  streakLabel: { fontSize: 13, color: TEXT_MUTED, marginBottom: 4 },
  streakValue: { fontSize: 28, fontWeight: '700', color: COLORS.accent },
  streakLongest: { fontSize: 14, color: TEXT_MUTED, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: TEXT_MUTED, marginBottom: SPACING.sm },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  todayCardDone: { opacity: 0.8 },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.accent },
  todayLabel: { fontSize: 17, fontWeight: '600', color: TEXT },
  countControl: { padding: 8 },
  countDisplay: { flex: 1, fontSize: 20, fontWeight: '700', color: TEXT, textAlign: 'center' },
  timerDisplay: { fontSize: 24, fontWeight: '700', color: COLORS.accent, marginBottom: SPACING.sm },
  timerButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timerBtn: { backgroundColor: COLORS.surfaceElevated, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  timerBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  heatmapWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
  },
  heatCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceElevated,
  },
  heatCellDone: { backgroundColor: COLORS.accent },
  heatCellToday: { borderWidth: 2, borderColor: COLORS.text },
});
