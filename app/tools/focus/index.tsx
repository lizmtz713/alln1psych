/**
 * Focus Tool — Timer presets and attention training. Route: /tools/focus
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useFocusStore } from '../../../src/stores/focusStore';
import type { FocusPresetMinutes, FocusExerciseId } from '../../../src/types/focus';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const TIMER_PRESETS = [
  { minutes: 5 as FocusPresetMinutes, label: '5 min', subtitle: 'Quick focus' },
  { minutes: 15 as FocusPresetMinutes, label: '15 min', subtitle: 'Short block' },
  { minutes: 25 as FocusPresetMinutes, label: '25 min', subtitle: 'Pomodoro' },
  { minutes: 45 as FocusPresetMinutes, label: '45 min', subtitle: 'Deep work' },
];

const EXERCISES: { id: FocusExerciseId; emoji: string; title: string; subtitle: string }[] = [
  { id: 'breath', emoji: '🌬️', title: 'Breath focus', subtitle: 'Attention on the breath' },
  { id: 'point', emoji: '👁️', title: 'Single-point gaze', subtitle: 'Steady gaze on one spot' },
  { id: 'body-scan', emoji: '🧘', title: 'Body scan', subtitle: 'Notice sensations head to toe' },
  { id: 'listening', emoji: '👂', title: 'Listening', subtitle: 'Focus on sounds' },
  { id: 'thought-noting', emoji: '💭', title: 'Thought noting', subtitle: 'Notice thoughts, return to breath' },
];

export default function FocusIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const getLastSession = useFocusStore((s) => s.getLastSession);
  const getTotalFocusMinutes = useFocusStore((s) => s.getTotalFocusMinutes);
  const totalMins = Math.floor(getTotalFocusMinutes());
  const lastSession = getLastSession();

  const handleTimerPreset = (minutes: FocusPresetMinutes) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/focus/session?duration=' + String(minutes));
  };

  const handleExercise = (id: FocusExerciseId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/focus/exercise/' + id);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Focus</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Set a timer for focused work, or train your attention with a short exercise.</Text>
        {totalMins > 0 && (
          <Text style={styles.stats}>{totalMins} min total focus{lastSession ? ' · Last: ' + lastSession.durationMinutes + ' min' : ''}</Text>
        )}
        <Text style={styles.sectionLabel}>Focus timer</Text>
        <View style={styles.presetRow}>
          {TIMER_PRESETS.map((p) => (
            <Pressable key={p.minutes} style={({ pressed }) => [styles.presetCard, pressed && styles.cardPressed]} onPress={() => handleTimerPreset(p.minutes)}>
              <Text style={styles.presetLabel}>{p.label}</Text>
              <Text style={styles.presetSub}>{p.subtitle}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sectionLabel}>Attention training</Text>
        {EXERCISES.map((ex) => (
          <Pressable key={ex.id} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => handleExercise(ex.id)}>
            <Text style={styles.cardEmoji}>{ex.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{ex.title}</Text>
              <Text style={styles.cardSub}>{ex.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 16, color: TEXT_MUTED, lineHeight: 24, marginBottom: SPACING.md },
  stats: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.lg },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED, marginBottom: SPACING.sm, marginTop: SPACING.md },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  presetCard: { width: '48%', backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: BORDER, padding: SPACING.lg },
  cardPressed: { opacity: 0.9 },
  presetLabel: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  presetSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: BORDER, padding: SPACING.lg, marginBottom: SPACING.md },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: TEXT },
  cardSub: { fontSize: 14, color: TEXT_MUTED, marginTop: 2 },
});
