/**
 * The 12 Life Questions — Single question exploration: prompts + exercises, save responses.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../src/lib/constants';
import { getLifeQuestionById } from '../../../src/data/lifeQuestions';
import { useLifeQuestionsStore } from '../../../src/stores/lifeQuestionsStore';
import type { LifeQuestionId } from '../../../src/types/life-questions';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

export default function LifeQuestionDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const questionId = (id ?? 'identity') as LifeQuestionId;
  const module = getLifeQuestionById(questionId);

  const getResponse = useLifeQuestionsStore((s) => s.getResponse);
  const setExerciseResponse = useLifeQuestionsStore((s) => s.setExerciseResponse);
  const setReflection = useLifeQuestionsStore((s) => s.setReflection);
  const markCompleted = useLifeQuestionsStore((s) => s.markCompleted);

  const [reflection, setReflectionLocal] = useState('');
  const response = getResponse(questionId);

  useEffect(() => {
    if (response?.reflection) setReflectionLocal(response.reflection);
  }, [response?.reflection]);

  const handleSaveReflection = () => {
    setReflection(questionId, reflection.trim());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMarkComplete = () => {
    markCompleted(questionId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!module) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.error}>Question not found.</Text>
      </View>
    );
  }

  const getExerciseValue = (exerciseId: string): string | string[] | number | undefined => {
    const ex = response?.exercises.find((e) => e.exerciseId === exerciseId);
    return ex?.value;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{module.shortTitle}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.emoji}>{module.emoji}</Text>
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.description}>{module.description}</Text>
        </View>

        <Text style={styles.sectionLabel}>PROMPTS</Text>
        {module.prompts.map((p) => (
          <View key={p.id} style={styles.promptCard}>
            <Text style={styles.promptText}>{p.text}</Text>
            {p.hint && <Text style={styles.promptHint}>{p.hint}</Text>}
          </View>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>EXERCISES</Text>
        {module.exercises.map((ex) => {
          const value = getExerciseValue(ex.id);
          if (ex.type === 'freeform' || ex.type === 'reflection') {
            const text = typeof value === 'string' ? value : '';
            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseTitle}>{ex.title}</Text>
                <Text style={styles.exerciseInstruction}>{ex.instruction}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={ex.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  value={text}
                  onChangeText={(t) => setExerciseResponse(questionId, ex.id, t)}
                  multiline
                  maxLength={2000}
                />
              </View>
            );
          }
          if (ex.type === 'list') {
            const list = Array.isArray(value) ? value : value ? [String(value)] : [];
            const str = list.join(', ');
            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseTitle}>{ex.title}</Text>
                <Text style={styles.exerciseInstruction}>{ex.instruction}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={ex.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  value={str}
                  onChangeText={(t) => setExerciseResponse(questionId, ex.id, t.split(',').map((s) => s.trim()).filter(Boolean))}
                />
              </View>
            );
          }
          if (ex.type === 'scale') {
            const num = typeof value === 'number' ? value : 5;
            const [low, high] = ex.scaleLabels ?? ['1', '10'];
            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseTitle}>{ex.title}</Text>
                <Text style={styles.exerciseInstruction}>{ex.instruction}</Text>
                <View style={styles.scaleRow}>
                  <Text style={styles.scaleLabel}>{low}</Text>
                  <View style={styles.scaleDots}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <Pressable
                        key={n}
                        style={[styles.scaleDot, n <= num && styles.scaleDotActive]}
                        onPress={() => setExerciseResponse(questionId, ex.id, n)}
                      />
                    ))}
                  </View>
                  <Text style={styles.scaleLabel}>{high}</Text>
                </View>
              </View>
            );
          }
          return null;
        })}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>REFLECTION (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, styles.reflectionInput]}
          placeholder="Any overall reflection on this question?"
          placeholderTextColor={COLORS.textMuted}
          value={reflection}
          onChangeText={setReflectionLocal}
          onBlur={handleSaveReflection}
          multiline
          maxLength={500}
        />

        <Pressable style={styles.doneBtn} onPress={handleMarkComplete}>
          <Text style={styles.doneBtnText}>Mark complete</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  backText: { fontSize: 16, color: COLORS.accent },
  error: { fontSize: 16, color: TEXT_MUTED, padding: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: SPACING.xl },
  emoji: { fontSize: 48, marginBottom: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: TEXT, textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 16, color: TEXT_MUTED, textAlign: 'center', lineHeight: 24 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  promptCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  promptText: { fontSize: 16, color: TEXT, lineHeight: 24 },
  promptHint: { fontSize: 14, color: TEXT_MUTED, marginTop: 8, fontStyle: 'italic' },
  exerciseCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  exerciseTitle: { fontSize: 16, fontWeight: '600', color: TEXT, marginBottom: 4 },
  exerciseInstruction: { fontSize: 14, color: TEXT_MUTED, marginBottom: 12 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    color: TEXT,
    fontSize: 15,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  reflectionInput: { minHeight: 80 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scaleLabel: { fontSize: 12, color: TEXT_MUTED, width: 40 },
  scaleDots: { flexDirection: 'row', gap: 6, flex: 1 },
  scaleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
  },
  scaleDotActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  doneBtn: {
    marginTop: 24,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
