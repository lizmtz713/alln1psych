/**
 * Single Relationship Repair lesson — cards + example + action + Try this tool.
 * Route: /learn/relationship-repair/[id]
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function RelationshipRepairLessonScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = RELATIONSHIP_REPAIR_LESSONS.find((l) => l.id === id);

  if (!lesson) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.error}>Lesson not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {lesson.cards.map((card, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardText}>{card.text}</Text>
          </View>
        ))}
        <Text style={styles.sectionLabel}>Example</Text>
        <View style={[styles.card, styles.exampleCard]}>
          <Text style={styles.exampleText}>{lesson.example}</Text>
        </View>
        <Text style={styles.sectionLabel}>Try this</Text>
        <Text style={styles.actionText}>{lesson.action}</Text>
        <Text style={styles.ctaLabel}>Try this tool</Text>
        <Pressable
          style={styles.ctaBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(lesson.toolCta.route as any); }}
        >
          <Ionicons name="construct-outline" size={20} color={ACCENT} />
          <Text style={styles.ctaBtnText}>{lesson.toolCta.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </Pressable>
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
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: TEXT, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  card: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardText: { fontSize: 15, color: TEXT, lineHeight: 22 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: MUTED, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  exampleCard: { borderColor: COLORS.accentMuted || ACCENT + '40' },
  exampleText: { fontSize: 15, color: TEXT, lineHeight: 22, fontStyle: 'italic' },
  actionText: { fontSize: 15, color: TEXT, lineHeight: 22, marginBottom: SPACING.sm },
  ctaLabel: { fontSize: 13, fontWeight: '600', color: MUTED, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
  },
  ctaBtnText: { flex: 1, fontSize: 16, fontWeight: '600', color: TEXT },
  error: { padding: SPACING.lg, color: MUTED },
  backText: { fontSize: 16, color: ACCENT },
});
