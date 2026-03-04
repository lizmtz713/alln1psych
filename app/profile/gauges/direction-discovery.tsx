/**
 * Direction Discovery — AI-guided flow to find your Direction (purpose) through reflective questions.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { DIRECTION_QUESTIONS } from '../../../src/data/discoveryQuestions';
import { synthesizeDirection, type DirectionSynthesis } from '../../../src/services/discoveryAI';

type Step = 'intro' | 'questions' | 'synthesizing' | 'result' | 'refine';

export default function DirectionDiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { direction: def, setDirection: setDef } = useGaugeDefinitionsStore();

  const [step, setStep] = useState<Step>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [synthesis, setSynthesis] = useState<DirectionSynthesis | null>(null);
  const [editableStatement, setEditableStatement] = useState('');
  const [error, setError] = useState<string | null>(null);

  const q = DIRECTION_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === DIRECTION_QUESTIONS.length - 1;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('questions');
    setCurrentIndex(0);
    setAnswers({});
  };

  const handleNext = () => {
    if (!q) return;
    const value = (answers[q.id] ?? '').trim();
    if (!value) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLastQuestion) {
      setStep('synthesizing');
      setError(null);
      synthesizeDirection(answers)
        .then((res) => {
          setSynthesis(res);
          setEditableStatement(res.directionStatement);
          setStep('result');
        })
        .catch((e) => {
          setError(e?.message ?? 'Something went wrong');
          setStep('result');
          setSynthesis({
            themes: [],
            coreDesire: '',
            directionStatement: 'We couldn\'t generate a summary right now. Try again or write your direction below.',
          });
          setEditableStatement('');
        });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    else setStep('intro');
  };

  const handleYesSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const statement = (editableStatement || synthesis?.directionStatement || '').trim();
    setDef({ bigPicture: statement });
    router.back();
  };

  const handleRefine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('refine');
    if (!editableStatement && synthesis?.directionStatement) setEditableStatement(synthesis.directionStatement);
  };

  const handleSaveRefine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const statement = editableStatement.trim();
    if (statement) setDef({ bigPicture: statement });
    router.back();
  };

  const handleStartOver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('intro');
    setSynthesis(null);
    setAnswers({});
    setCurrentIndex(0);
    setEditableStatement('');
    setError(null);
  };

  if (step === 'intro') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.heroEmoji}>🧭</Text>
          <Text style={styles.heroTitle}>Find Your Direction</Text>
          <Text style={styles.heroSub}>
            Let's figure out where you're going. I'll ask a few questions. There are no wrong answers—just be honest.
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Let's Start</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === 'questions' && q) {
    const value = answers[q.id] ?? '';
    const canNext = value.trim().length > 0;
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.progress}>Question {currentIndex + 1} of {DIRECTION_QUESTIONS.length}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionText}>{q.question}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={q.placeholder}
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={(t) => setAnswers((prev) => ({ ...prev, [q.id]: t }))}
            multiline
            numberOfLines={4}
          />
          <Pressable
            style={[styles.primaryButton, !canNext && styles.primaryButtonDisabled]}
            onPress={handleNext}
            disabled={!canNext}
          >
            <Text style={styles.primaryButtonText}>{isLastQuestion ? 'See my direction' : 'Continue'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === 'synthesizing') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.synthesizingWrap}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.synthesizingText}>Finding your direction...</Text>
        </View>
      </View>
    );
  }

  if (step === 'refine') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => setStep('result')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Refine your direction</Text>
        </View>
        <ScrollView contentContainerStyle={styles.refineContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.refineHint}>Edit until it feels right.</Text>
          <TextInput
            style={styles.textAreaLarge}
            placeholder="Your direction statement..."
            placeholderTextColor={COLORS.textMuted}
            value={editableStatement}
            onChangeText={setEditableStatement}
            multiline
          />
          <Pressable style={styles.primaryButton} onPress={handleSaveRefine}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === 'result' && synthesis) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>✨</Text>
          <Text style={styles.resultTitle}>Here's What I See</Text>
          <Text style={styles.resultSub}>Based on what you shared, a theme emerges:</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.card}>
            {synthesis.themes.length > 0 && (
              <Text style={styles.themesText}>You care deeply about {synthesis.themes.join(', ').toUpperCase()}.</Text>
            )}
            {synthesis.coreDesire ? (
              <Text style={styles.bodyText}>You want: {synthesis.coreDesire}</Text>
            ) : null}
            <Text style={styles.bodyLabel}>Your Direction might be:</Text>
            <Text style={styles.statementText}>"{synthesis.directionStatement}"</Text>
          </View>
          <Text style={styles.resultCta}>Does this feel right?</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={handleRefine}>
              <Text style={styles.secondaryButtonText}>Let's refine</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleYesSave}>
              <Text style={styles.primaryButtonText}>Yes, save it</Text>
            </Pressable>
          </View>
          <Pressable style={styles.linkButton} onPress={handleStartOver}>
            <Text style={styles.linkButtonText}>Start over</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  introContent: { padding: 24, paddingTop: 48 },
  heroEmoji: { fontSize: 48, marginBottom: 16 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  heroSub: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 32 },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, color: COLORS.accent },
  progress: { flex: 1, textAlign: 'center', fontSize: 14, color: COLORS.textMuted },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  questionContent: { padding: 24, paddingBottom: 48 },
  questionText: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 20, lineHeight: 28 },
  textArea: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 16, fontSize: 16, color: COLORS.text, minHeight: 120, textAlignVertical: 'top', marginBottom: 24 },
  textAreaLarge: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 16, fontSize: 16, color: COLORS.text, minHeight: 180, textAlignVertical: 'top', marginBottom: 24 },
  synthesizingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  synthesizingText: { fontSize: 16, color: COLORS.textMuted },
  resultContent: { padding: 24, paddingBottom: 48 },
  resultEmoji: { fontSize: 40, marginBottom: 12 },
  resultTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  resultSub: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 20 },
  errorText: { fontSize: 14, color: COLORS.error, marginBottom: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  themesText: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
  bodyText: { fontSize: 15, color: COLORS.text, marginBottom: 12 },
  bodyLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
  statementText: { fontSize: 16, color: COLORS.text, fontStyle: 'italic', lineHeight: 24 },
  resultCta: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  secondaryButton: { flex: 1, paddingVertical: 14, borderRadius: BORDER_RADIUS.button, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  refineContent: { padding: 24 },
  refineHint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 12 },
  linkButton: { alignItems: 'center', paddingVertical: 12 },
  linkButtonText: { fontSize: 15, color: COLORS.textMuted },
});
