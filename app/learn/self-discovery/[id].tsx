/**
 * Self-Discovery quiz runner — intro, questions (scale or multiple choice), result.
 * Big Five shows top 2 traits; others show single result. External quizzes redirect.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  getSelfDiscoveryQuizById,
  scoreBigFive,
  scoreDimensionQuiz,
  isInlineQuiz,
} from '../../../src/data/selfDiscoveryQuizzes';
import type { SelfDiscoveryQuizInline, SelfDiscoveryQuestion, SelfDiscoveryResult } from '../../../src/types/selfDiscovery';
import { GAUGES } from '../../../src/data/gaugeSystem';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

function isScaleQuestion(q: SelfDiscoveryQuestion): boolean {
  return (q.scaleLabels != null && q.scaleLabels.length >= 2) && (!q.options || q.options.length === 0);
}

export default function SelfDiscoveryQuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const quiz = id ? getSelfDiscoveryQuizById(id) : undefined;

  const [step, setStep] = useState(0); // 0 = intro, 1..N = questions, N+1 = result
  const [scaleAnswers, setScaleAnswers] = useState<Record<string, number>>({});
  const [optionAnswers, setOptionAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<SelfDiscoveryResult[]>([]);

  // Redirect external quizzes (e.g. attachment)
  useEffect(() => {
    if (quiz && quiz.type === 'external') {
      router.replace(quiz.route as any);
    }
  }, [quiz, router]);

  if (!quiz || !isInlineQuiz(quiz)) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.error}>Quiz not found.</Text>
      </View>
    );
  }

  const inlineQuiz = quiz as SelfDiscoveryQuizInline;
  const { questions, results: resultsMap } = inlineQuiz;
  const totalSteps = 1 + questions.length;
  const isIntro = step === 0;
  const isResult = step > questions.length;
  const questionIndex = step >= 1 && step <= questions.length ? step - 1 : 0;
  const currentQuestion = questions[questionIndex];
  const progress = step === 0 ? 0 : isResult ? 100 : Math.round((step / questions.length) * 100);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0 && !isResult) setStep(step - 1);
    else router.back();
  };

  const setScaleAnswer = (questionId: string, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScaleAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const setOptionAnswer = (questionId: string, value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOptionAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    if (isScaleQuestion(currentQuestion)) return scaleAnswers[currentQuestion.id] != null;
    return optionAnswers[currentQuestion.id] != null;
  };

  const goNext = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step < questions.length) {
      setStep(step + 1);
      return;
    }
    if (step === questions.length) {
      // Compute result
      if (inlineQuiz.id === 'big-five') {
        const allNums: Record<string, number> = {};
        questions.forEach((q) => {
          const v = scaleAnswers[q.id];
          if (v != null) allNums[q.id] = v;
        });
        const topTwo = scoreBigFive(allNums);
        setResults(topTwo.map((k) => resultsMap[k]).filter(Boolean));
      } else {
        const ans: Record<string, string> = {};
        questions.forEach((q) => {
          const v = optionAnswers[q.id];
          if (v) ans[q.id] = v;
        });
        const key = scoreDimensionQuiz(questions, ans);
        const r = resultsMap[key];
        if (r) setResults([r]);
      }
      setStep(questions.length + 1);
    }
  };

  const gaugeName = (key: string) => GAUGES.find((g) => g.id === key)?.name ?? key;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isResult ? 'Your result' : inlineQuiz.shortTitle}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {!isResult && step > 0 && (
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isIntro && (
          <>
            <View style={styles.hero}>
              <Text style={styles.emoji}>{inlineQuiz.emoji}</Text>
              <Text style={styles.title}>{inlineQuiz.title}</Text>
              <Text style={styles.description}>{inlineQuiz.description}</Text>
              <Text style={styles.timeEstimate}>{inlineQuiz.timeEstimate}</Text>
            </View>
            <Pressable style={styles.primaryBtn} onPress={goNext}>
              <Text style={styles.primaryBtnText}>Start</Text>
            </Pressable>
          </>
        )}

        {!isIntro && !isResult && currentQuestion && (
          <>
            <Text style={styles.stepLabel}>Question {step} of {questions.length}</Text>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
            {isScaleQuestion(currentQuestion) ? (
              <View style={styles.scaleWrap}>
                <View style={styles.scaleRow}>
                  {[1, 2, 3, 4, 5].map((value) => {
                    const selected = scaleAnswers[currentQuestion.id] === value;
                    return (
                      <Pressable
                        key={value}
                        style={[styles.scaleBtn, selected && styles.scaleBtnSelected]}
                        onPress={() => setScaleAnswer(currentQuestion.id, value)}
                      >
                        <Text style={[styles.scaleBtnText, selected && styles.scaleBtnTextSelected]}>{value}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabelText}>{currentQuestion.scaleLabels?.[0] ?? 'Not like me'}</Text>
                  <Text style={styles.scaleLabelText}>{currentQuestion.scaleLabels?.[1] ?? 'Very much like me'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.optionsWrap}>
                {currentQuestion.options.map((opt) => {
                  const selected = optionAnswers[currentQuestion.id] === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      style={[styles.optionBtn, selected && styles.optionBtnSelected]}
                      onPress={() => setOptionAnswer(currentQuestion.id, opt.value)}
                    >
                      <Text style={[styles.optionBtnText, selected && styles.optionBtnTextSelected]}>{opt.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <Pressable
              style={[styles.primaryBtn, !canProceed() && styles.primaryBtnDisabled]}
              onPress={goNext}
              disabled={!canProceed()}
            >
              <Text style={styles.primaryBtnText}>{step === questions.length ? 'See result' : 'Next'}</Text>
            </Pressable>
          </>
        )}

        {isResult && results.length > 0 && (
          <>
            {results.map((r) => (
              <View key={r.key} style={styles.resultCard}>
                <Text style={styles.resultEmoji}>{r.emoji}</Text>
                <Text style={styles.resultTitle}>Your result: {r.title}</Text>
                <Text style={styles.resultInsight}>{r.insight}</Text>
                {r.gauges.length > 0 && (
                  <Text style={styles.resultGauges}>
                    This can affect: {r.gauges.map(gaugeName).join(', ')}
                  </Text>
                )}
                <Text style={styles.whatHelpsLabel}>What helps</Text>
                {r.whatHelps.map((h, i) => (
                  <Text key={i} style={styles.whatHelpsItem}>• {h}</Text>
                ))}
              </View>
            ))}
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </Pressable>
          </>
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
  backText: { fontSize: 16, color: ACCENT },
  error: { padding: 20, color: TEXT_MUTED },
  progressWrap: { height: 4, backgroundColor: BORDER, width: '100%' },
  progressBar: { height: 4, backgroundColor: ACCENT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: TEXT, textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 16, color: TEXT_MUTED, textAlign: 'center', lineHeight: 24, marginBottom: 8 },
  timeEstimate: { fontSize: 14, color: TEXT_MUTED },
  stepLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 8 },
  questionText: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 24 },
  scaleWrap: { marginBottom: 24 },
  scaleRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 },
  scaleBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  scaleBtnSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  scaleBtnText: { fontSize: 16, fontWeight: '600', color: TEXT },
  scaleBtnTextSelected: { color: '#fff' },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8, marginBottom: 24 },
  scaleLabelText: { fontSize: 12, color: TEXT_MUTED },
  optionsWrap: { marginBottom: 24 },
  optionBtn: {
    backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: BORDER,
    padding: SPACING.md, marginBottom: 10,
  },
  optionBtnSelected: { borderColor: ACCENT, backgroundColor: ACCENT + '20' },
  optionBtnText: { fontSize: 15, color: TEXT },
  optionBtnTextSelected: { fontWeight: '600' },
  primaryBtn: {
    backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  resultCard: {
    backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: BORDER,
    padding: SPACING.lg, marginBottom: 24,
  },
  resultEmoji: { fontSize: 40, marginBottom: 12 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 12 },
  resultInsight: { fontSize: 16, color: TEXT_MUTED, lineHeight: 24, marginBottom: 12 },
  resultGauges: { fontSize: 14, color: ACCENT, marginBottom: 12 },
  whatHelpsLabel: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 6 },
  whatHelpsItem: { fontSize: 14, color: TEXT_MUTED, lineHeight: 22, marginBottom: 4 },
});
