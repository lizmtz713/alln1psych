/**
 * How Attraction Works — brain chemistry, stages, factors, types, myths, unhealthy patterns, pattern assessment.
 * Science: Helen Fisher, David Buss, Esther Perel, Attachment Theory.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import {
  ATTRACTION_CHEMICALS,
  ATTRACTION_STAGES,
  ATTRACTION_FACTORS,
  ATTRACTION_TYPES,
  ATTRACTION_MYTHS,
  UNHEALTHY_PATTERNS,
  ATTRACTION_ASSESSMENT_QUESTIONS,
} from '../../src/data/attractionData';
import {
  computePatternScores,
  getInsightSummary,
  type AttractionAnswer,
} from '../../src/services/attractionService';
import { useAttractionStore } from '../../src/stores/attractionStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;
const ATTRACTION_ACCENT = '#A855F7';

type Tab = 'learn' | 'myths' | 'patterns' | 'assessment' | 'coach';

const SCALE_VALUES = [1, 2, 3, 4, 5];

export default function AttractionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('learn');
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);

  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessmentDone, setAssessmentDone] = useState(false);
  const [lastScores, setLastScores] = useState<ReturnType<typeof computePatternScores> | null>(null);

  const { setAssessmentResult, getAIContext } = useAttractionStore();

  const currentQuestion =
    assessmentStep >= 1 && assessmentStep <= ATTRACTION_ASSESSMENT_QUESTIONS.length
      ? ATTRACTION_ASSESSMENT_QUESTIONS[assessmentStep - 1]
      : null;
  const progress =
    assessmentStep === 0
      ? 0
      : assessmentStep > ATTRACTION_ASSESSMENT_QUESTIONS.length
        ? 100
        : Math.round((assessmentStep / ATTRACTION_ASSESSMENT_QUESTIONS.length) * 100);

  const setAnswer = (questionId: string, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAssessmentAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const finishAssessment = () => {
    const answers: AttractionAnswer[] = ATTRACTION_ASSESSMENT_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: assessmentAnswers[q.id] ?? 3,
    }));
    const scores = computePatternScores(answers);
    setAssessmentResult(scores);
    setLastScores(scores);
    setAssessmentDone(true);
    setAssessmentStep(ATTRACTION_ASSESSMENT_QUESTIONS.length + 1);
  };

  const goToTalkWithContext = () => {
    getAIContext();
    router.back();
    setTimeout(() => router.push('/(tabs)/talk'), 100);
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'learn', label: 'Learn', icon: 'sparkles-outline' },
    { key: 'myths', label: 'Myths', icon: 'close-circle-outline' },
    { key: 'patterns', label: 'Patterns', icon: 'warning-outline' },
    { key: 'assessment', label: 'Assessment', icon: 'clipboard-outline' },
    { key: 'coach', label: 'AI Coach', icon: 'chatbubble-ellipses-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>How Attraction Works</Text>
        <View style={styles.closeBtn} />
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab(t.key);
            }}
          >
            <Ionicons
              name={t.icon as any}
              size={18}
              color={tab === t.key ? ATTRACTION_ACCENT : TEXT_MUTED}
            />
            <Text
              style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}
              numberOfLines={1}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Learn ─── */}
        {tab === 'learn' && (
          <>
            <Text style={styles.sectionTitle}>Brain chemistry (6 chemicals)</Text>
            {ATTRACTION_CHEMICALS.map((c) => (
              <View key={c.id} style={styles.chemRow}>
                <Text style={styles.chemEmoji}>{c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chemName}>{c.name}</Text>
                  <Text style={styles.chemRole}>{c.role}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>3 stages of love</Text>
            {ATTRACTION_STAGES.map((s) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.stageHeader}>{s.emoji} {s.label} — {s.timeframe}</Text>
                <Text style={styles.body}>{s.description}</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Key insight</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Your brain on attraction = brain on cocaine + OCD. Literally.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>10 attraction factors</Text>
            {ATTRACTION_FACTORS.map((f) => (
              <View key={f.id} style={styles.factorRow}>
                <Text style={styles.factorEmoji}>{f.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.factorLabel}>{f.label}</Text>
                  <Text style={styles.factorDesc}>{f.description}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>5 types of attraction</Text>
            {ATTRACTION_TYPES.map((t) => (
              <View key={t.id} style={styles.card}>
                <Text style={styles.typeHeader}>{t.emoji} {t.label}</Text>
                <Text style={styles.body}>{t.description}</Text>
              </View>
            ))}
          </>
        )}

        {/* ─── Myths ─── */}
        {tab === 'myths' && (
          <>
            <Text style={styles.sectionTitle}>8 myths busted</Text>
            {ATTRACTION_MYTHS.map((m) => (
              <View key={m.id} style={styles.mythCard}>
                <Text style={styles.mythText}>"{m.myth}"</Text>
                <Text style={styles.truthText}>→ {m.truth}</Text>
              </View>
            ))}
          </>
        )}

        {/* ─── Unhealthy Patterns ─── */}
        {tab === 'patterns' && (
          <>
            <Text style={styles.sectionTitle}>4 unhealthy patterns</Text>
            {UNHEALTHY_PATTERNS.map((p) => {
              const expanded = expandedPatternId === p.id;
              return (
                <Pressable
                  key={p.id}
                  style={styles.card}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedPatternId(expanded ? null : p.id);
                  }}
                >
                  <View style={styles.patternHeader}>
                    <Text style={styles.patternEmoji}>{p.emoji}</Text>
                    <Text style={styles.patternLabel}>{p.label}</Text>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={TEXT_MUTED}
                    />
                  </View>
                  <Text style={styles.body}>{p.description}</Text>
                  {expanded && (
                    <View style={styles.insightBox}>
                      <Text style={styles.insightLabel}>Insight</Text>
                      <Text style={styles.insightText}>{p.insight}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </>
        )}

        {/* ─── Assessment ─── */}
        {tab === 'assessment' && (
          <>
            {assessmentStep === 0 && (
              <>
                <Text style={styles.introText}>
                  12 questions to see your attraction pattern: anxious, avoidant, healthy, or
                  intensity-seeking. Rate 1 (not like me) to 5 (very like me).
                </Text>
                <Pressable style={styles.primaryBtn} onPress={() => setAssessmentStep(1)}>
                  <Text style={styles.primaryBtnText}>Start assessment</Text>
                </Pressable>
              </>
            )}
            {currentQuestion && (
              <>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.questionText}>{currentQuestion.text}</Text>
                <View style={styles.scaleRow}>
                  {SCALE_VALUES.map((v) => (
                    <Pressable
                      key={v}
                      style={[
                        styles.scaleBtn,
                        assessmentAnswers[currentQuestion.id] === v && styles.scaleBtnActive,
                      ]}
                      onPress={() => setAnswer(currentQuestion.id, v)}
                    >
                      <Text
                        style={[
                          styles.scaleNum,
                          assessmentAnswers[currentQuestion.id] === v && styles.scaleNumActive,
                        ]}
                      >
                        {v}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>Not like me</Text>
                  <Text style={styles.scaleLabel}>Very like me</Text>
                </View>
                <Pressable
                  style={[styles.primaryBtn, { marginTop: 24 }]}
                  onPress={() => {
                    if (assessmentStep < ATTRACTION_ASSESSMENT_QUESTIONS.length)
                      setAssessmentStep(assessmentStep + 1);
                    else finishAssessment();
                  }}
                >
                  <Text style={styles.primaryBtnText}>
                    {assessmentStep === ATTRACTION_ASSESSMENT_QUESTIONS.length
                      ? 'See results'
                      : 'Next'}
                  </Text>
                </Pressable>
                {assessmentStep > 1 && (
                  <Pressable
                    style={styles.backBtn}
                    onPress={() => setAssessmentStep(assessmentStep - 1)}
                  >
                    <Text style={styles.backBtnText}>Back</Text>
                  </Pressable>
                )}
              </>
            )}
            {assessmentDone && lastScores && assessmentStep > ATTRACTION_ASSESSMENT_QUESTIONS.length && (
              <>
                <Text style={styles.resultTitle}>Your pattern</Text>
                {(() => {
                  const { dominant, label, tip } = getInsightSummary(lastScores);
                  return (
                    <>
                      <View style={styles.resultCard}>
                        <Text style={styles.resultLabel}>{label}</Text>
                        <Text style={styles.resultTip}>{tip}</Text>
                      </View>
                      <Text style={styles.scoresSub}>Scores (average 1–5)</Text>
                      <View style={styles.scoreRow}>
                        <Text style={styles.scoreText}>Anxious: {lastScores.anxious}</Text>
                        <Text style={styles.scoreText}>Avoidant: {lastScores.avoidant}</Text>
                        <Text style={styles.scoreText}>Healthy: {lastScores.healthy}</Text>
                        <Text style={styles.scoreText}>Intensity: {lastScores.intensity}</Text>
                      </View>
                    </>
                  );
                })()}
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setAssessmentStep(0);
                    setAssessmentAnswers({});
                    setAssessmentDone(false);
                    setLastScores(null);
                  }}
                >
                  <Text style={styles.secondaryBtnText}>Retake</Text>
                </Pressable>
              </>
            )}
          </>
        )}

        {/* ─── AI Coach ─── */}
        {tab === 'coach' && (
          <>
            <Text style={styles.introText}>
              Talk to CoPilot about attraction, chemistry, or your relationship patterns. Your
              assessment results will help tailor the conversation.
            </Text>
            <Pressable style={styles.copilotBtn} onPress={goToTalkWithContext}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
              <Text style={styles.copilotBtnText}>Talk to CoPilot about attraction</Text>
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  tabActive: { backgroundColor: 'rgba(168,85,247,0.12)' },
  tabLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: '500' },
  tabLabelActive: { color: ATTRACTION_ACCENT, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 12 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card ?? 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  chemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chemEmoji: { fontSize: 22, marginRight: 10 },
  chemName: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  chemRole: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 },
  stageHeader: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  body: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20, marginTop: 4 },
  insightBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(168,85,247,0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: ATTRACTION_ACCENT,
  },
  insightLabel: { fontSize: 12, fontWeight: '600', color: ATTRACTION_ACCENT, marginBottom: 4 },
  insightText: { fontSize: 14, color: TEXT_PRIMARY, fontWeight: '500', lineHeight: 20 },
  factorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  factorEmoji: { fontSize: 20, marginRight: 10 },
  factorLabel: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  factorDesc: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 },
  typeHeader: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  mythCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  mythText: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic' },
  truthText: { fontSize: 14, color: TEXT_PRIMARY, marginTop: 6, fontWeight: '500', lineHeight: 20 },
  patternHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  patternEmoji: { fontSize: 20, marginRight: 8 },
  patternLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  introText: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 20 },
  primaryBtn: {
    backgroundColor: ATTRACTION_ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  progressBar: { height: 4, backgroundColor: CARD_BG, marginBottom: 16 },
  progressFill: { height: '100%', backgroundColor: ATTRACTION_ACCENT, borderRadius: 2 },
  questionText: {
    fontSize: 17,
    color: TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scaleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleBtnActive: { borderColor: ATTRACTION_ACCENT, backgroundColor: 'rgba(168,85,247,0.12)' },
  scaleNum: { fontSize: 16, fontWeight: '600', color: TEXT_MUTED },
  scaleNumActive: { color: ATTRACTION_ACCENT },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  scaleLabel: { fontSize: 12, color: TEXT_MUTED },
  backBtn: { alignSelf: 'center', marginTop: 12 },
  backBtnText: { fontSize: 14, color: ATTRACTION_ACCENT },
  resultTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 16 },
  resultCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  resultLabel: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  resultTip: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 8, lineHeight: 20 },
  scoresSub: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  scoreText: { fontSize: 14, color: TEXT_SECONDARY },
  secondaryBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 16 },
  secondaryBtnText: { fontSize: 15, color: ATTRACTION_ACCENT, fontWeight: '500' },
  copilotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ATTRACTION_ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  copilotBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
