/**
 * Difficult People tool — Type Identifier, Type Browser, Strategy Cards, Scripts Library, AI Coach.
 * Safety: crisis resources at top; when to walk away per type.
 */
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import {
  DIFFICULT_PERSON_TYPES,
  DIFFICULT_PERSON_STRATEGIES,
  DIFFICULT_PERSON_SCRIPTS,
  DIFFICULT_PERSON_ASSESSMENT_QUESTIONS,
  CRISIS_RESOURCES_TEXT,
} from '../../src/data/difficultPeopleData';
import {
  computeTypeScores,
  getTopTypes,
  isAssessmentComplete,
  type DifficultPersonAnswer,
} from '../../src/services/difficultPeopleService';
import { useDifficultPeopleStore } from '../../src/stores/difficultPeopleStore';
import type { DifficultPersonTypeId } from '../../src/types/difficultPeople';
import type { ContextTag } from '../../src/types/difficultPeople';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;

type Tab = 'identifier' | 'browser' | 'strategies' | 'scripts' | 'coach';

const SCALE_VALUES = [1, 2, 3, 4, 5];
const CONTEXT_LABELS: Record<ContextTag, string> = {
  family: 'Family',
  romantic: 'Romantic',
  work: 'Work',
  friend: 'Friend',
};

export default function DifficultPeopleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('identifier');
  const [expandedTypeId, setExpandedTypeId] = useState<DifficultPersonTypeId | null>(null);

  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessmentDone, setAssessmentDone] = useState(false);
  const [lastTopTypes, setLastTopTypes] = useState<DifficultPersonTypeId[]>([]);

  const { setAssessmentResult, getAIContext } = useDifficultPeopleStore();

  const currentQuestion =
    assessmentStep >= 1 && assessmentStep <= DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length
      ? DIFFICULT_PERSON_ASSESSMENT_QUESTIONS[assessmentStep - 1]
      : null;
  const progress =
    assessmentStep === 0
      ? 0
      : assessmentStep > DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length
        ? 100
        : Math.round((assessmentStep / DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length) * 100);

  const setAnswer = (questionId: string, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAssessmentAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const finishAssessment = () => {
    const answers: DifficultPersonAnswer[] = DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: assessmentAnswers[q.id] ?? 3,
    }));
    const scores = computeTypeScores(answers);
    const top = getTopTypes(scores, 3);
    setAssessmentResult(scores, top);
    setLastTopTypes(top);
    setAssessmentDone(true);
    setAssessmentStep(DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length + 1);
  };

  const goToTalkWithContext = () => {
    getAIContext(); // ensure context is available for conversation
    router.back();
    setTimeout(() => router.push('/(tabs)/talk'), 100);
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'identifier', label: 'Identify', icon: 'search-outline' },
    { key: 'browser', label: 'Types', icon: 'people-outline' },
    { key: 'strategies', label: 'Strategies', icon: 'bulb-outline' },
    { key: 'scripts', label: 'Scripts', icon: 'chatbubbles-outline' },
    { key: 'coach', label: 'AI Coach', icon: 'chatbubble-ellipses-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>Difficult People</Text>
        <View style={styles.closeBtn} />
      </View>

      {/* Crisis resources — always visible */}
      <Pressable
        style={styles.crisisBanner}
        onPress={() => router.push('/(modals)/crisis-resources')}
      >
        <Ionicons name="shield-checkmark" size={20} color={COLORS.red} />
        <Text style={styles.crisisBannerText}>Crisis & safety resources</Text>
        <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
      </Pressable>

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
            <Ionicons name={t.icon as any} size={18} color={tab === t.key ? ACCENT : TEXT_MUTED} />
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
        {/* ─── Type Identifier ─── */}
        {tab === 'identifier' && (
          <>
            {assessmentStep === 0 && (
              <>
                <Text style={styles.introText}>
                  15 questions to see which difficult-person patterns fit your situation. Rate 1
                  (rarely) to 5 (almost always).
                </Text>
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => setAssessmentStep(1)}
                >
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
                  <Text style={styles.scaleLabel}>Rarely</Text>
                  <Text style={styles.scaleLabel}>Always</Text>
                </View>
                <Pressable
                  style={[styles.primaryBtn, { marginTop: 24 }]}
                  onPress={() => {
                    if (assessmentStep < DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length)
                      setAssessmentStep(assessmentStep + 1);
                    else finishAssessment();
                  }}
                >
                  <Text style={styles.primaryBtnText}>
                    {assessmentStep === DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length
                      ? 'See results'
                      : 'Next'}
                  </Text>
                </Pressable>
                {assessmentStep > 1 && (
                  <Pressable style={styles.backBtn} onPress={() => setAssessmentStep(assessmentStep - 1)}>
                    <Text style={styles.backBtnText}>Back</Text>
                  </Pressable>
                )}
              </>
            )}
            {assessmentDone && assessmentStep > DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length && (
              <>
                <Text style={styles.resultTitle}>Your top patterns</Text>
                <Text style={styles.resultSub}>
                  These types may fit the person or situation you're dealing with.
                </Text>
                {lastTopTypes.map((typeId) => {
                  const t = DIFFICULT_PERSON_TYPES.find((x) => x.id === typeId);
                  if (!t) return null;
                  return (
                    <Pressable
                      key={t.id}
                      style={styles.typeCard}
                      onPress={() => {
                        setExpandedTypeId(expandedTypeId === t.id ? null : t.id);
                        setTab('browser');
                      }}
                    >
                      <Text style={styles.typeEmoji}>{t.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.typeLabel}>{t.label}</Text>
                        <Text style={styles.typeTagline}>{t.tagline}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
                    </Pressable>
                  );
                })}
                <Text style={styles.resultHint}>
                  Tap a type to open the Type Browser for red flags, scripts, and when to walk away.
                </Text>
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setAssessmentStep(0);
                    setAssessmentAnswers({});
                    setAssessmentDone(false);
                    setLastTopTypes([]);
                  }}
                >
                  <Text style={styles.secondaryBtnText}>Retake</Text>
                </Pressable>
              </>
            )}
          </>
        )}

        {/* ─── Type Browser ─── */}
        {tab === 'browser' && (
          <>
            <Text style={styles.sectionTitle}>8 difficult person types</Text>
            {DIFFICULT_PERSON_TYPES.map((t) => {
              const expanded = expandedTypeId === t.id;
              return (
                <Pressable
                  key={t.id}
                  style={styles.card}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedTypeId(expanded ? null : t.id);
                  }}
                >
                  <View style={styles.typeCardHeader}>
                    <Text style={styles.typeEmoji}>{t.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeLabel}>{t.label}</Text>
                      <Text style={styles.typeTagline}>{t.tagline}</Text>
                    </View>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={TEXT_MUTED}
                    />
                  </View>
                  {expanded && (
                    <>
                      <Text style={styles.cardSub}>Red flags</Text>
                      {t.redFlags.map((f, i) => (
                        <Text key={i} style={styles.bullet}>
                          • {f}
                        </Text>
                      ))}
                      <Text style={styles.cardSub}>Common phrases</Text>
                      {t.commonPhrases.map((p, i) => (
                        <Text key={i} style={styles.phrase}>
                          "{p}"
                        </Text>
                      ))}
                      <Text style={styles.cardSub}>How they make you feel</Text>
                      <Text style={styles.body}>{t.howTheyMakeYouFeel.join(', ')}</Text>
                      <Text style={styles.cardSub}>Psychology</Text>
                      <Text style={styles.body}>{t.psychology}</Text>
                      {(Object.keys(t.tipsByContext) as ContextTag[]).map((ctx) => (
                        <View key={ctx}>
                          <Text style={styles.cardSub}>{CONTEXT_LABELS[ctx]}</Text>
                          {(t.tipsByContext[ctx] ?? []).map((tip, i) => (
                            <Text key={i} style={styles.bullet}>
                              • {tip}
                            </Text>
                          ))}
                        </View>
                      ))}
                      <View style={styles.walkAwayBox}>
                        <Text style={styles.walkAwayLabel}>When to walk away</Text>
                        <Text style={styles.walkAwayText}>{t.whenToWalkAway}</Text>
                      </View>
                      <Text style={styles.cardSub}>Resources</Text>
                      {t.resources.map((r, i) => (
                        <Text key={i} style={styles.bullet}>
                          • {r}
                        </Text>
                      ))}
                    </>
                  )}
                </Pressable>
              );
            })}
          </>
        )}

        {/* ─── Strategy Cards ─── */}
        {tab === 'strategies' && (
          <>
            <Text style={styles.sectionTitle}>7 core strategies</Text>
            {DIFFICULT_PERSON_STRATEGIES.map((s) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.strategyHeader}>
                  {s.emoji} {s.label}
                </Text>
                <Text style={styles.body}>{s.description}</Text>
                <Text style={styles.cardSub}>Steps</Text>
                {s.steps.map((step, i) => (
                  <Text key={i} style={styles.bullet}>
                    {i + 1}. {step}
                  </Text>
                ))}
                <Text style={styles.whenToUse}>When to use: {s.whenToUse}</Text>
              </View>
            ))}
          </>
        )}

        {/* ─── Scripts Library ─── */}
        {tab === 'scripts' && (
          <>
            <Text style={styles.sectionTitle}>Scripts — what to say</Text>
            {DIFFICULT_PERSON_SCRIPTS.map((s) => (
              <View key={s.id} style={styles.scriptCard}>
                <Text style={styles.scriptTheySay}>They say: "{s.theySay}"</Text>
                <Text style={styles.scriptYouSay}>You say: "{s.youSay}"</Text>
                <Text style={styles.scriptWhy}>Why it works: {s.whyItWorks}</Text>
              </View>
            ))}
            <Pressable
              style={styles.practiceBtn}
              onPress={() => {
                router.back();
                setTimeout(() => router.push('/(modals)/role-play'), 100);
              }}
            >
              <Ionicons name="people" size={20} color={ACCENT} />
              <Text style={styles.practiceBtnText}>Practice with Role Play</Text>
            </Pressable>
          </>
        )}

        {/* ─── AI Coach ─── */}
        {tab === 'coach' && (
          <>
            <Text style={styles.introText}>
              Get personalized advice for your situation. CoPilot will use your assessment results
              and the difficult-people strategies. If you mention danger or abuse, crisis resources
              will be prioritized.
            </Text>
            <Pressable style={styles.copilotBtn} onPress={goToTalkWithContext}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
              <Text style={styles.copilotBtnText}>Talk to CoPilot about difficult people</Text>
            </Pressable>
            <Text style={styles.crisisInline}>{CRISIS_RESOURCES_TEXT}</Text>
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
  crisisBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  crisisBannerText: { fontSize: 14, color: TEXT_SECONDARY, flex: 1 },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.accentBg ?? 'rgba(124,77,255,0.12)' },
  tabLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: '500' },
  tabLabelActive: { color: ACCENT, fontWeight: '600' },
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
  typeCardHeader: { flexDirection: 'row', alignItems: 'center' },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card ?? 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  typeEmoji: { fontSize: 24, marginRight: 10 },
  typeLabel: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  typeTagline: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  cardSub: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY, marginTop: 12, marginBottom: 4 },
  bullet: { fontSize: 13, color: TEXT_SECONDARY, marginLeft: 8, marginBottom: 4, lineHeight: 18 },
  phrase: { fontSize: 13, color: TEXT_SECONDARY, fontStyle: 'italic', marginBottom: 4 },
  body: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
  walkAwayBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: COLORS.accentBg ?? 'rgba(124,77,255,0.08)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  walkAwayLabel: { fontSize: 12, fontWeight: '600', color: ACCENT, marginBottom: 4 },
  walkAwayText: { fontSize: 13, color: TEXT_PRIMARY, lineHeight: 18 },
  strategyHeader: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  whenToUse: { fontSize: 13, color: TEXT_MUTED, fontStyle: 'italic', marginTop: 10 },
  scriptCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  scriptTheySay: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic' },
  scriptYouSay: { fontSize: 15, color: TEXT_PRIMARY, fontWeight: '600', marginTop: 8 },
  scriptWhy: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 6, lineHeight: 18 },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    marginTop: 8,
  },
  practiceBtnText: { fontSize: 15, color: ACCENT, fontWeight: '600' },
  introText: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 20 },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  progressBar: { height: 4, backgroundColor: CARD_BG, marginBottom: 16 },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  questionText: { fontSize: 17, color: TEXT_PRIMARY, lineHeight: 24, marginBottom: 20, fontWeight: '500' },
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
  scaleBtnActive: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  scaleNum: { fontSize: 16, fontWeight: '600', color: TEXT_MUTED },
  scaleNumActive: { color: ACCENT },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  scaleLabel: { fontSize: 12, color: TEXT_MUTED },
  backBtn: { alignSelf: 'center', marginTop: 12 },
  backBtnText: { fontSize: 14, color: ACCENT },
  resultTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  resultSub: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 16 },
  resultHint: { fontSize: 13, color: TEXT_MUTED, marginTop: 12, marginBottom: 20 },
  secondaryBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  secondaryBtnText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  copilotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  copilotBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  crisisInline: { fontSize: 13, color: TEXT_MUTED, marginTop: 20, lineHeight: 20 },
});
