/**
 * Attachment Style Assessment — 12 questions, 4 styles (Secure, Anxious, Avoidant, Fearful).
 * Science: Bowlby/Ainsworth, Bartholomew & Horowitz (1991), ECR-R inspired.
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { ATTACHMENT_QUESTIONS, ATTACHMENT_STYLE_INFO } from '../../src/data/attachmentQuestions';
import { computeAttachmentResult, type QuestionAnswer } from '../../src/services/attachmentService';
import { useAttachmentStore } from '../../src/stores/attachmentStore';
import type { AttachmentResult } from '../../src/types/attachment';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;

const SCALE_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
const SCALE_VALUES = [1, 2, 3, 4, 5];

export default function AttachmentStyleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [step, setStep] = useState(0); // 0 = intro, 1–12 = questions, 13 = result
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AttachmentResult | null>(null);

  const setStoreResult = useAttachmentStore((s) => s.setResult);

  const totalSteps = 1 + ATTACHMENT_QUESTIONS.length; // intro + 12
  const currentQuestion = step >= 1 && step <= 12 ? ATTACHMENT_QUESTIONS[step - 1] : null;
  const progress = step === 0 ? 0 : step > 12 ? 100 : Math.round((step / 12) * 100);

  const setAnswer = (questionId: string, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goNext = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step <= 11) {
      setStep(step + 1);
      return;
    }
    if (step === 12) {
      const answerList: QuestionAnswer[] = ATTACHMENT_QUESTIONS.map((q) => ({
        questionId: q.id,
        value: answers[q.id] ?? 3,
      }));
      const computed = computeAttachmentResult(answerList);
      setResult(computed);
      setStoreResult(computed);
      setStep(13);
    }
  };

  const goBack = () => {
    if (step > 0 && step < 13) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step >= 1 && step <= 12 && currentQuestion) return answers[currentQuestion.id] != null;
    return true;
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const discussWithCoPilot = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
    setTimeout(() => router.push('/(tabs)/talk'), 100);
  };

  // ─── Intro ─────────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Attachment Style</Text>
          <View style={styles.closeBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.introEmoji}>🌳 🌊 🏔️ 🌪️</Text>
          <Text style={styles.introTitle}>How do you connect?</Text>
          <Text style={styles.introBody}>
            This short assessment measures two dimensions: <Text style={styles.bold}>anxiety</Text> (worry about abandonment, need for reassurance) and <Text style={styles.bold}>avoidance</Text> (discomfort with closeness, preference for independence). Your answers place you in one of four styles: Secure, Anxious, Avoidant, or Fearful.
          </Text>
          <Text style={styles.introScience}>Based on attachment theory (Bowlby, Ainsworth) and the Bartholomew & Horowitz four-category model. Questions are inspired by validated instruments like the ECR-R.</Text>
          <Text style={styles.introNote}>12 questions · About 3 minutes · Your results are saved privately.</Text>
          <Pressable style={styles.primaryBtn} onPress={goNext}>
            <Text style={styles.primaryBtnText}>Start</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ─── Result ────────────────────────────────────────────────────────────────
  if (step === 13 && result) {
    const info = ATTACHMENT_STYLE_INFO[result.style];
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <View style={styles.closeBtn} />
          <Text style={styles.headerTitle}>Your result</Text>
          <Pressable onPress={handleDone} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHero}>
            <Text style={styles.resultEmoji}>{info?.emoji ?? '🌳'}</Text>
            <Text style={styles.resultLabel}>{info?.label ?? result.style}</Text>
            <Text style={styles.resultShort}>{info?.shortDescription ?? ''}</Text>
          </View>
          <View style={styles.scoresRow}>
            <View style={styles.scorePill}>
              <Text style={styles.scoreValue}>{result.scores.anxiety.toFixed(1)}</Text>
              <Text style={styles.scoreLabel}>Anxiety</Text>
            </View>
            <View style={styles.scorePill}>
              <Text style={styles.scoreValue}>{result.scores.avoidance.toFixed(1)}</Text>
              <Text style={styles.scoreLabel}>Avoidance</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What this can mean</Text>
            <Text style={styles.cardText}>{info?.insight ?? ''}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your strengths</Text>
            {(info?.strengths ?? []).map((s, i) => (
              <Text key={i} style={styles.bullet}>• {s}</Text>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Growth tips</Text>
            {(info?.growthTips ?? []).map((s, i) => (
              <Text key={i} style={styles.bullet}>• {s}</Text>
            ))}
          </View>
          <Pressable style={styles.primaryBtn} onPress={discussWithCoPilot}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Discuss with CoPilot</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={handleDone}>
            <Text style={styles.secondaryBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ─── Question ───────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>Question {step} of 12</Text>
        <View style={styles.closeBtn} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false}>
        {currentQuestion && (
          <>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
            <View style={styles.scaleRow}>
              {SCALE_VALUES.map((v) => (
                <Pressable
                  key={v}
                  style={[styles.scaleBtn, answers[currentQuestion.id] === v && styles.scaleBtnActive]}
                  onPress={() => setAnswer(currentQuestion.id, v)}
                >
                  <Text style={[styles.scaleNum, answers[currentQuestion.id] === v && styles.scaleNumActive]}>{v}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabelLeft}>Disagree</Text>
              <Text style={styles.scaleLabelRight}>Agree</Text>
            </View>
            <Pressable
              style={[styles.primaryBtn, styles.primaryBtnTop, !canProceed() && styles.primaryBtnDisabled]}
              onPress={goNext}
              disabled={!canProceed()}
            >
              <Text style={styles.primaryBtnText}>{step === 12 ? 'See result' : 'Next'}</Text>
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
    borderBottomColor: CARD_BORDER,
  },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY },
  progressBar: { height: 4, backgroundColor: CARD_BG },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  scroll: { flex: 1 },
  introContent: { padding: 24, paddingBottom: 40 },
  introEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 16 },
  introTitle: { fontSize: 22, fontWeight: '700', color: TEXT_PRIMARY, textAlign: 'center', marginBottom: 16 },
  introBody: { fontSize: 16, color: TEXT_SECONDARY, lineHeight: 24, marginBottom: 16 },
  introScience: { fontSize: 13, color: TEXT_MUTED, fontStyle: 'italic', marginBottom: 12 },
  introNote: { fontSize: 14, color: TEXT_MUTED, marginBottom: 24 },
  bold: { fontWeight: '600', color: TEXT_PRIMARY },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
  },
  primaryBtnTop: { marginTop: 24 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  questionContent: { padding: 24, paddingBottom: 40 },
  questionText: { fontSize: 18, color: TEXT_PRIMARY, lineHeight: 26, marginBottom: 24, fontWeight: '500' },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scaleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleBtnActive: { borderColor: ACCENT, backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.12)' },
  scaleNum: { fontSize: 18, fontWeight: '600', color: TEXT_MUTED },
  scaleNumActive: { color: ACCENT },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 },
  scaleLabelLeft: { fontSize: 12, color: TEXT_MUTED },
  scaleLabelRight: { fontSize: 12, color: TEXT_MUTED },
  resultContent: { padding: 24, paddingBottom: 40 },
  resultHero: { alignItems: 'center', marginBottom: 24 },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultLabel: { fontSize: 24, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 6 },
  resultShort: { fontSize: 16, color: TEXT_SECONDARY, textAlign: 'center', paddingHorizontal: 16 },
  scoresRow: { flexDirection: 'row', gap: 16, marginBottom: 24, justifyContent: 'center' },
  scorePill: {
    backgroundColor: CARD_BG,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    minWidth: 100,
  },
  scoreValue: { fontSize: 22, fontWeight: '700', color: ACCENT, fontVariant: ['tabular-nums'] },
  scoreLabel: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card ?? 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 10 },
  cardText: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22 },
  bullet: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 4 },
  secondaryBtn: { alignItems: 'center', paddingVertical: 16 },
  secondaryBtnText: { fontSize: 16, color: ACCENT, fontWeight: '500' },
});
