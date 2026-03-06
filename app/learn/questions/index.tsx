/**
 * The 12 Life Questions — List screen. Tap a question to explore.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getLifeQuestionsInOrder } from '../../../src/data/lifeQuestions';
import { useLifeQuestionsStore } from '../../../src/stores/lifeQuestionsStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

export default function LifeQuestionsListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const questions = getLifeQuestionsInOrder();
  const isCompleted = useLifeQuestionsStore((s) => s.isCompleted);
  const completedCount = useLifeQuestionsStore((s) => s.completedCount());
  const markStarted = useLifeQuestionsStore((s) => s.markStarted);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleQuestionPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markStarted(id as import('../../../src/types/life-questions').LifeQuestionId);
    router.push(`/learn/questions/${id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>The 12 Life Questions</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Deep inquiry modules. Your answers feed your Identity Snapshot, Purpose Hypothesis, and Life Blueprint.
        </Text>
        {completedCount > 0 && (
          <Text style={styles.progressText}>{completedCount} of 12 completed</Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.mapCard, pressed && styles.cardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/learn/questions/map');
          }}
        >
          <Ionicons name="map" size={24} color={COLORS.accent} />
          <View style={styles.mapCardText}>
            <Text style={styles.mapCardTitle}>Life Journey Map</Text>
            <Text style={styles.mapCardSub}>See your path through all 12 questions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>

        {questions.map((q) => {
          const done = isCompleted(q.id);
          return (
            <Pressable
              key={q.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => handleQuestionPress(q.id)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.emoji}>{q.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{q.title}</Text>
                  <Text style={styles.cardDesc}>{q.description}</Text>
                  {done && (
                    <View style={styles.doneBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.doneText}>Done</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
            </Pressable>
          );
        })}
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
  subtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  progressText: { fontSize: 13, color: COLORS.accent, marginBottom: SPACING.lg },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.accentMuted,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  mapCardText: { flex: 1, marginLeft: 14 },
  mapCardTitle: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 2 },
  mapCardSub: { fontSize: 13, color: TEXT_MUTED },
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
  emoji: { fontSize: 28, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 4 },
  cardDesc: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  doneText: { fontSize: 13, color: COLORS.success, fontWeight: '500' },
});
