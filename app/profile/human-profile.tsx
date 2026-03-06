/**
 * Human Profile — Combined view of the 12 Life Questions outputs.
 * Identity Snapshot, Purpose Hypothesis, Life Blueprint derived from stored responses.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/lib/constants';
import { useLifeQuestionsStore } from '../../src/stores/lifeQuestionsStore';
import { getLifeQuestionsInOrder } from '../../src/data/lifeQuestions';
import type { LifeQuestionId, LifeQuestionResponse, LifeQuestionExerciseResponse } from '../../src/types/life-questions';

function exerciseDisplayValue(ex: LifeQuestionExerciseResponse): string {
  if (typeof ex.value === 'string') return ex.value.trim();
  if (typeof ex.value === 'number') return String(ex.value);
  if (Array.isArray(ex.value)) return (ex.value as string[]).filter(Boolean).join(' · ');
  return '';
}

function getTextFromResponse(r: LifeQuestionResponse | undefined): string[] {
  if (!r) return [];
  const out: string[] = [];
  if (r.reflection?.trim()) out.push(r.reflection.trim());
  for (const ex of r.exercises) {
    const v = exerciseDisplayValue(ex);
    if (v) out.push(v);
  }
  return out;
}

function getExerciseValue(r: LifeQuestionResponse | undefined, exerciseId: string): string | undefined {
  if (!r) return undefined;
  const ex = r.exercises.find((e) => e.exerciseId === exerciseId);
  if (!ex) return undefined;
  const v = exerciseDisplayValue(ex);
  return v || undefined;
}

const IDENTITY_IDS: LifeQuestionId[] = ['identity', 'fears', 'belonging', 'story'];
const PURPOSE_IDS: LifeQuestionId[] = ['purpose', 'meaning', 'legacy'];
const BLUEPRINT_IDS: LifeQuestionId[] = ['values', 'strengths', 'relationships', 'growth', 'choice'];

export default function HumanProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const getAllResponses = useLifeQuestionsStore((s) => s.getAllResponses);
  const responses = getAllResponses();
  const byId = React.useMemo(() => {
    const map: Partial<Record<LifeQuestionId, LifeQuestionResponse>> = {};
    for (const r of responses) map[r.questionId] = r;
    return map;
  }, [responses]);

  const identityLines = React.useMemo(() => {
    const lines: string[] = [];
    for (const id of IDENTITY_IDS) {
      lines.push(...getTextFromResponse(byId[id]));
    }
    return lines.filter(Boolean);
  }, [byId]);

  const purposeLines = React.useMemo(() => {
    const lines: string[] = [];
    for (const id of PURPOSE_IDS) {
      lines.push(...getTextFromResponse(byId[id]));
    }
    return lines.filter(Boolean);
  }, [byId]);

  const blueprintLines = React.useMemo(() => {
    const lines: string[] = [];
    for (const id of BLUEPRINT_IDS) {
      lines.push(...getTextFromResponse(byId[id]));
    }
    return lines.filter(Boolean);
  }, [byId]);

  const legacyStatement = React.useMemo(() => {
    const legacyRes = byId['legacy'];
    const oneLine = getExerciseValue(legacyRes, 'e1');
    const tombstone = getExerciseValue(legacyRes, 'e3');
    if (!oneLine && !tombstone) return null;
    return { oneLine, tombstone, updatedAt: legacyRes?.updatedAt ?? new Date().toISOString() };
  }, [byId]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleJourneyMap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/learn/questions/map');
  };

  const isEmpty = identityLines.length === 0 && purposeLines.length === 0 && blueprintLines.length === 0 && !legacyStatement;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Human Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🪞</Text>
            <Text style={styles.emptyTitle}>Your profile is taking shape</Text>
            <Text style={styles.emptySub}>
              Answer the 12 Life Questions to build your Identity Snapshot, Purpose Hypothesis, and Life Blueprint here.
            </Text>
            <Pressable style={styles.ctaBtn} onPress={() => router.push('/learn/questions')}>
              <Text style={styles.ctaBtnText}>Explore the 12 Questions</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.accent} />
            </Pressable>
          </View>
        ) : (
          <>
            {identityLines.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Identity Snapshot</Text>
                <Text style={styles.sectionHint}>Who you are, what you fear, where you belong, your story.</Text>
                <View style={styles.card}>
                  {identityLines.map((line, i) => (
                    <Text key={i} style={styles.cardLine}>{line}</Text>
                  ))}
                </View>
              </View>
            )}

            {purposeLines.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Purpose Hypothesis</Text>
                <Text style={styles.sectionHint}>What you're for, what gives meaning, what you want to leave behind.</Text>
                <View style={styles.card}>
                  {purposeLines.map((line, i) => (
                    <Text key={i} style={styles.cardLine}>{line}</Text>
                  ))}
                </View>
              </View>
            )}

            {blueprintLines.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Life Blueprint</Text>
                <Text style={styles.sectionHint}>Values, strengths, relationships, growth, choices.</Text>
                <View style={styles.card}>
                  {blueprintLines.map((line, i) => (
                    <Text key={i} style={styles.cardLine}>{line}</Text>
                  ))}
                </View>
              </View>
            )}

            {legacyStatement && (legacyStatement.oneLine || legacyStatement.tombstone) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Legacy statement</Text>
                <Text style={styles.sectionHint}>What you want to leave behind (from the Legacy question).</Text>
                <View style={styles.card}>
                  {legacyStatement.oneLine ? (
                    <Text style={styles.cardLine}>{legacyStatement.oneLine}</Text>
                  ) : null}
                  {legacyStatement.tombstone ? (
                    <Text style={[styles.cardLine, styles.legacyTombstone]}>Tombstone: {legacyStatement.tombstone}</Text>
                  ) : null}
                </View>
              </View>
            )}

            <Pressable style={styles.mapLink} onPress={handleJourneyMap}>
              <Ionicons name="map" size={20} color={COLORS.accent} />
              <Text style={styles.mapLinkText}>View Life Journey Map</Text>
            </Pressable>
          </>
        )}
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 44, padding: 8, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 48 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl * 2 },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  emptySub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 320, marginBottom: SPACING.xl },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  section: { marginBottom: SPACING.xl },
  sectionLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sectionHint: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.sm },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  cardLine: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 },
  legacyTombstone: { fontStyle: 'italic' },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.lg,
    paddingVertical: 14,
  },
  mapLinkText: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
});
