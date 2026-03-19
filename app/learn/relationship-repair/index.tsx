/**
 * Relationship Repair — Micro-lessons (MVP).
 * Route: /learn/relationship-repair
 * Short lessons: 3–5 cards, 1 example, 1 action, Try this tool CTA.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { RELATIONSHIP_REPAIR_LESSONS } from '../../../src/data/relationshipRepairLessons';

const BG = COLORS.background;
const CARD = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function RelationshipRepairLearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Relationship repair</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Short, science-backed lessons. Each ends with a tool you can use right away.</Text>
        {RELATIONSHIP_REPAIR_LESSONS.map((lesson) => (
          <Pressable
            key={lesson.id}
            style={({ pressed }) => [styles.lessonCard, pressed && styles.lessonCardPressed]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/learn/relationship-repair/${lesson.id}`); }}
          >
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonMeta}>{lesson.cards.length} cards · Try {lesson.toolCta.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={MUTED} />
          </Pressable>
        ))}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: MUTED, marginBottom: SPACING.xl, lineHeight: 22 },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  lessonCardPressed: { opacity: 0.9 },
  lessonTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: TEXT },
  lessonMeta: { fontSize: 12, color: MUTED, marginRight: 8 },
});
