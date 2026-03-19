/**
 * Memory Builder — Practice: pick an exercise (Name Lock, Face Anchor, etc.).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useMemoryBuilderStore } from '../../../src/stores/memoryBuilderStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const EXERCISES = [
  { id: 'name-lock', title: 'Name Lock', sub: '30–45 sec · Strengthen name encoding', emoji: '🔒' },
  { id: 'face-anchor', title: 'Face Anchor', sub: '45 sec · Notice one unique feature', emoji: '👁️' },
  { id: 'association-builder', title: 'Association Builder', sub: '30 sec · Connect name to an image', emoji: '🔗' },
  { id: 'quick-recall', title: 'Quick Recall', sub: '30 sec · Who did you meet? Pick the name', emoji: '⚡' },
  { id: 'spaced-reminder', title: 'Spaced Reminder', sub: '10 sec · Recall someone due now', emoji: '🕐' },
  { id: 'real-life', title: 'Real-Life Practice', sub: 'Tip: Repeat their name in conversation', emoji: '💬' },
];

export default function MemoryBuilderPracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dueCount = useMemoryBuilderStore((s) => s.getPeopleDueForRecall()).length;
  const peopleCount = useMemoryBuilderStore((s) => s.getPeople()).length;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const open = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tools/memory-builder/practice/${exerciseId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Practice</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          Quick exercises based on attention → association → recall → spacing. Each under 60 seconds.
        </Text>

        {EXERCISES.map((ex) => {
          const isSpaced = ex.id === 'spaced-reminder';
          const disabled = isSpaced && dueCount === 0;
          return (
            <Pressable
              key={ex.id}
              style={({ pressed }) => [
                styles.card,
                pressed && !disabled && styles.cardPressed,
                disabled && styles.cardDisabled,
              ]}
              onPress={() => !disabled && open(ex.id)}
              disabled={disabled}
            >
              <Text style={styles.cardEmoji}>{ex.emoji}</Text>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, disabled && styles.cardTitleMuted]}>{ex.title}</Text>
                <Text style={styles.cardSub}>
                  {isSpaced && dueCount > 0 ? `${dueCount} due now` : ex.sub}
                </Text>
              </View>
              {!disabled && <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />}
            </Pressable>
          );
        })}

        {peopleCount === 0 && (
          <Text style={styles.hint}>Add people you've met first, then come back to practice.</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: TEXT_MUTED, marginBottom: 20, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 10,
  },
  cardPressed: { opacity: 0.9 },
  cardDisabled: { opacity: 0.6 },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  cardTitleMuted: { color: TEXT_MUTED },
  cardSub: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  hint: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic', marginTop: 12 },
});
