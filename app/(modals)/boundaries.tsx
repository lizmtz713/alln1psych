/**
 * Boundaries tool — 8 types, scripts, blocks, myths, 17-question assessment, log, affirmations.
 * Science: Tawwab, Cloud & Townsend, Brené Brown.
 */
import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import {
  BOUNDARY_TYPES,
  BOUNDARY_SCRIPTS,
  BOUNDARY_BLOCKS,
  BOUNDARY_MYTHS,
  BOUNDARY_ASSESSMENT_QUESTIONS,
  BOUNDARY_AFFIRMATIONS,
} from '../../src/data/boundariesData';
import { computeCategoryScores, type BoundaryAnswer } from '../../src/services/boundariesService';
import { useBoundariesStore } from '../../src/stores/boundariesStore';
import type { ScriptContext } from '../../src/types/boundaries';
import { ToolIntro } from '../../src/components/tools/ToolIntro';
import { getToolIntroContent } from '../../src/data/toolIntroContent';
import { sendMessageWithSystemPromptOnly, hasOpenAIKey } from '../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;

type Tab = 'learn' | 'scripts' | 'assessment' | 'log' | 'affirmations';

const SCALE_VALUES = [1, 2, 3, 4, 5];

export default function BoundariesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [tab, setTab] = useState<Tab>('learn');
  const [scriptFilter, setScriptFilter] = useState<ScriptContext | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessmentScores, setAssessmentScores] = useState<ReturnType<typeof computeCategoryScores> | null>(null);

  const [logNote, setLogNote] = useState('');
  const [logTypeId, setLogTypeId] = useState<string>('time');
  
  // AI custom script state
  const [customSituation, setCustomSituation] = useState('');
  const [customScriptLoading, setCustomScriptLoading] = useState(false);
  const [customScriptResult, setCustomScriptResult] = useState<{
    soft: string;
    firm: string;
    brokenRecord: string;
    tip: string;
  } | null>(null);

  const { assessmentScores: savedScores, setAssessmentScores: setSavedScores, log, addLogEntry } = useBoundariesStore();

  const filteredScripts = useMemo(() => {
    if (scriptFilter === 'all') return BOUNDARY_SCRIPTS;
    return BOUNDARY_SCRIPTS.filter((s) => s.contexts.includes(scriptFilter));
  }, [scriptFilter]);

  const currentQuestion = assessmentStep >= 1 && assessmentStep <= BOUNDARY_ASSESSMENT_QUESTIONS.length
    ? BOUNDARY_ASSESSMENT_QUESTIONS[assessmentStep - 1]
    : null;
  const progress = assessmentStep === 0 ? 0 : assessmentStep > BOUNDARY_ASSESSMENT_QUESTIONS.length ? 100 : Math.round((assessmentStep / BOUNDARY_ASSESSMENT_QUESTIONS.length) * 100);

  const setAnswer = (questionId: string, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAssessmentAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const finishAssessment = () => {
    const answers: BoundaryAnswer[] = BOUNDARY_ASSESSMENT_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: assessmentAnswers[q.id] ?? 3,
    }));
    const scores = computeCategoryScores(answers);
    setAssessmentScores(scores);
    setSavedScores(scores);
    setAssessmentStep(BOUNDARY_ASSESSMENT_QUESTIONS.length + 1);
  };

  const dailyAffirmation = BOUNDARY_AFFIRMATIONS[new Date().getDate() % BOUNDARY_AFFIRMATIONS.length];

  // AI custom boundary script generator
  const generateCustomScript = useCallback(async () => {
    if (!customSituation.trim()) return;
    
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('API key needed', 'Add your OpenAI API key in Settings for custom scripts.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCustomScriptLoading(true);
    setCustomScriptResult(null);

    try {
      const systemPrompt = `You are a boundary-setting coach based on Nedra Tawwab's work. The user describes a situation where they need to set a boundary.

Generate 3 scripts at different intensities, plus one tactical tip.

Respond in this exact JSON format:
{
  "soft": "Gentle version - validates their perspective while stating your need",
  "firm": "Clear and direct - states the boundary plainly without over-explaining", 
  "brokenRecord": "Repeat version - for when they push back, same boundary different words",
  "tip": "One tactical tip for delivering this specific boundary"
}

Make scripts natural and conversational. Use "I" statements. No clinical language.`;

      const response = await sendMessageWithSystemPromptOnly(
        [{ role: 'user', content: `Situation: ${customSituation.trim()}` }],
        systemPrompt,
        400
      );

      if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setCustomScriptResult(parsed);
        }
      }
    } catch (e) {
      Alert.alert('Generation failed', 'Check your connection and try again.');
    } finally {
      setCustomScriptLoading(false);
    }
  }, [customSituation]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'learn', label: 'Learn', icon: 'book-outline' },
    { key: 'scripts', label: 'Scripts', icon: 'chatbubbles-outline' },
    { key: 'assessment', label: 'Assessment', icon: 'clipboard-outline' },
    { key: 'log', label: 'Log', icon: 'list-outline' },
    { key: 'affirmations', label: 'Affirm', icon: 'heart-outline' },
  ];

  const introContent = getToolIntroContent('boundaries');
  if (showIntro && introContent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ToolIntro
          content={introContent}
          onStart={() => setShowIntro(false)}
          onBack={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>Boundaries</Text>
        <View style={styles.closeBtn} />
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(t.key); }}
          >
            <Ionicons name={t.icon as any} size={18} color={tab === t.key ? ACCENT : TEXT_MUTED} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]} numberOfLines={1}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ─── Learn ─── */}
        {tab === 'learn' && (
          <>
            <Text style={styles.sectionTitle}>8 boundary types</Text>
            {BOUNDARY_TYPES.map((t) => (
              <View key={t.id} style={styles.card}>
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={styles.typeLabel}>{t.label}</Text>
                <Text style={styles.typeDesc}>{t.description}</Text>
              </View>
            ))}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>7 boundary blocks</Text>
            {BOUNDARY_BLOCKS.map((b) => (
              <Pressable key={b.id} style={styles.card} onPress={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                <Text style={styles.blockHeader}>{b.emoji} {b.label}</Text>
                <Text style={styles.blockDesc}>{b.description}</Text>
                {expandedId === b.id && (
                  <>
                    <Text style={styles.blockSub}>How to overcome</Text>
                    {b.howToOvercome.map((h, i) => <Text key={i} style={styles.bullet}>• {h}</Text>)}
                    <Text style={styles.affirmation}>Affirmation: "{b.affirmation}"</Text>
                  </>
                )}
              </Pressable>
            ))}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>10 myths busted</Text>
            {BOUNDARY_MYTHS.map((m) => (
              <View key={m.id} style={styles.mythCard}>
                <Text style={styles.mythText}>"{m.myth}"</Text>
                <Text style={styles.truthText}>→ {m.truth}</Text>
              </View>
            ))}
          </>
        )}

        {/* ─── Scripts ─── */}
        {tab === 'scripts' && (
          <>
            <View style={styles.filterRow}>
              {(['all', 'work', 'family', 'friends'] as const).map((f) => (
                <Pressable key={f} style={[styles.filterChip, scriptFilter === f && styles.filterChipActive]} onPress={() => setScriptFilter(f)}>
                  <Text style={[styles.filterChipText, scriptFilter === f && styles.filterChipTextActive]}>{f === 'all' ? 'All' : f}</Text>
                </Pressable>
              ))}
            </View>
            {filteredScripts.map((s) => (
              <View key={s.id} style={styles.scriptCard}>
                <Text style={styles.scriptTitle}>{s.title}</Text>
                <Text style={styles.scriptLabel}>Soft</Text>
                <Text style={styles.scriptText}>"{s.soft}"</Text>
                <Text style={styles.scriptLabel}>Firm</Text>
                <Text style={styles.scriptText}>"{s.firm}"</Text>
                <Text style={styles.scriptLabel}>Broken record</Text>
                <Text style={styles.scriptText}>"{s.brokenRecord}"</Text>
              </View>
            ))}
            {/* AI Custom Script Generator */}
            <View style={styles.customScriptSection}>
              <Text style={styles.sectionTitle}>✨ Custom script for your situation</Text>
              <Text style={styles.customHint}>Describe what's happening and who you need to set a boundary with.</Text>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. My coworker keeps assigning me extra work without asking"
                placeholderTextColor={TEXT_MUTED}
                value={customSituation}
                onChangeText={(t) => { setCustomSituation(t); setCustomScriptResult(null); }}
                multiline
                textAlignVertical="top"
              />
              <Pressable
                style={[styles.generateBtn, (customScriptLoading || !customSituation.trim()) && styles.generateBtnDisabled]}
                onPress={generateCustomScript}
                disabled={customScriptLoading || !customSituation.trim()}
              >
                {customScriptLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color="#fff" />
                    <Text style={styles.generateBtnText}>Generate my script</Text>
                  </>
                )}
              </Pressable>

              {customScriptResult && (
                <View style={styles.customResultCard}>
                  <Text style={styles.scriptLabel}>Soft</Text>
                  <Text style={styles.scriptText}>"{customScriptResult.soft}"</Text>
                  <Text style={styles.scriptLabel}>Firm</Text>
                  <Text style={styles.scriptText}>"{customScriptResult.firm}"</Text>
                  <Text style={styles.scriptLabel}>Broken record</Text>
                  <Text style={styles.scriptText}>"{customScriptResult.brokenRecord}"</Text>
                  <View style={styles.tipCard}>
                    <Ionicons name="bulb-outline" size={16} color={ACCENT} />
                    <Text style={styles.tipText}>{customScriptResult.tip}</Text>
                  </View>
                </View>
              )}
            </View>

            <Pressable style={styles.practiceBtn} onPress={() => { router.back(); setTimeout(() => router.push('/(modals)/role-play'), 100); }}>
              <Ionicons name="people" size={20} color={ACCENT} />
              <Text style={styles.practiceBtnText}>Practice with Role Play</Text>
            </Pressable>
          </>
        )}

        {/* ─── Assessment ─── */}
        {tab === 'assessment' && (
          <>
            {assessmentStep === 0 && (
              <>
                <Text style={styles.introText}>17 questions across the 8 boundary types. Rate how true each is for you (1 = rarely, 5 = almost always).</Text>
                <Pressable style={styles.primaryBtn} onPress={() => setAssessmentStep(1)}>
                  <Text style={styles.primaryBtnText}>Start assessment</Text>
                </Pressable>
                {savedScores && savedScores.length > 0 && (
                  <Pressable style={styles.secondaryBtn} onPress={() => { setAssessmentScores(savedScores); setAssessmentStep(BOUNDARY_ASSESSMENT_QUESTIONS.length + 1); }}>
                    <Text style={styles.secondaryBtnText}>View last results</Text>
                  </Pressable>
                )}
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
                      style={[styles.scaleBtn, assessmentAnswers[currentQuestion.id] === v && styles.scaleBtnActive]}
                      onPress={() => setAnswer(currentQuestion.id, v)}
                    >
                      <Text style={[styles.scaleNum, assessmentAnswers[currentQuestion.id] === v && styles.scaleNumActive]}>{v}</Text>
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
                    if (assessmentStep < BOUNDARY_ASSESSMENT_QUESTIONS.length) setAssessmentStep(assessmentStep + 1);
                    else finishAssessment();
                  }}
                >
                  <Text style={styles.primaryBtnText}>{assessmentStep === BOUNDARY_ASSESSMENT_QUESTIONS.length ? 'See results' : 'Next'}</Text>
                </Pressable>
                {assessmentStep > 1 && (
                  <Pressable style={styles.backBtn} onPress={() => setAssessmentStep(assessmentStep - 1)}>
                    <Text style={styles.backBtnText}>Back</Text>
                  </Pressable>
                )}
              </>
            )}
            {assessmentStep > BOUNDARY_ASSESSMENT_QUESTIONS.length && (assessmentScores ?? savedScores) && (
              <>
                <Text style={styles.resultTitle}>Your scores by area</Text>
                {(assessmentScores ?? savedScores)!.map((c) => (
                  <View key={c.typeId} style={styles.scoreRow}>
                    <Text style={styles.scoreEmoji}>{c.emoji}</Text>
                    <Text style={styles.scoreLabel}>{c.label}</Text>
                    <Text style={styles.scoreValue}>{c.average.toFixed(1)}</Text>
                  </View>
                ))}
                <Text style={styles.resultHint}>Higher = you feel you hold this boundary well. Lower = growth area.</Text>
                <Pressable style={styles.primaryBtn} onPress={() => { setAssessmentStep(0); setAssessmentAnswers({}); setAssessmentScores(null); }}>
                  <Text style={styles.primaryBtnText}>Retake</Text>
                </Pressable>
              </>
            )}
          </>
        )}

        {/* ─── Log ─── */}
        {tab === 'log' && (
          <>
            <Text style={styles.sectionTitle}>Log a boundary you set</Text>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {BOUNDARY_TYPES.map((t) => (
                <Pressable key={t.id} style={[styles.typeChip, logTypeId === t.id && styles.typeChipActive]} onPress={() => setLogTypeId(t.id)}>
                  <Text style={styles.typeChipEmoji}>{t.emoji}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput style={styles.input} value={logNote} onChangeText={setLogNote} placeholder="e.g. Said no to staying late" placeholderTextColor={TEXT_MUTED} />
            <Pressable style={styles.primaryBtn} onPress={() => { addLogEntry({ typeId: logTypeId as any, note: logNote || undefined }); setLogNote(''); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <Text style={styles.primaryBtnText}>Add to log</Text>
            </Pressable>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent</Text>
            {log.slice(0, 20).map((e) => (
              <View key={e.id} style={styles.logRow}>
                <Text style={styles.logEmoji}>{BOUNDARY_TYPES.find((t) => t.id === e.typeId)?.emoji ?? '🛡️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logType}>{BOUNDARY_TYPES.find((t) => t.id === e.typeId)?.label ?? e.typeId}</Text>
                  {e.note ? <Text style={styles.logNote}>{e.note}</Text> : null}
                </View>
                <Text style={styles.logDate}>{new Date(e.date).toLocaleDateString()}</Text>
              </View>
            ))}
            {log.length === 0 && <Text style={styles.emptyText}>No entries yet. Set a boundary and log it.</Text>}
          </>
        )}

        {/* ─── Affirmations ─── */}
        {tab === 'affirmations' && (
          <>
            <Text style={styles.affirmTitle}>Today's affirmation</Text>
            <View style={styles.affirmCard}>
              <Text style={styles.affirmText}>{dailyAffirmation}</Text>
            </View>
            <Text style={styles.affirmSub}>More affirmations</Text>
            {BOUNDARY_AFFIRMATIONS.filter((a) => a !== dailyAffirmation).slice(0, 5).map((a, i) => (
              <Text key={i} style={styles.affirmBullet}>• {a}</Text>
            ))}
            <Pressable style={styles.copilotBtn} onPress={() => { router.back(); setTimeout(() => router.push('/(tabs)/talk'), 100); }}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              <Text style={styles.copilotBtnText}>Talk to CoPilot about boundaries</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY },
  tabRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8, gap: 4, borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.12)' },
  tabLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: '500' },
  tabLabelActive: { color: ACCENT, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 12 },
  card: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card ?? 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: CARD_BORDER },
  typeEmoji: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  typeDesc: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 4, lineHeight: 20 },
  blockHeader: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  blockDesc: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 4, lineHeight: 20 },
  blockSub: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY, marginTop: 12, marginBottom: 4 },
  bullet: { fontSize: 13, color: TEXT_SECONDARY, marginLeft: 8, marginBottom: 4, lineHeight: 18 },
  affirmation: { fontSize: 13, color: ACCENT, fontStyle: 'italic', marginTop: 10 },
  mythCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: CARD_BORDER },
  mythText: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic' },
  truthText: { fontSize: 14, color: TEXT_PRIMARY, marginTop: 6, fontWeight: '500' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER },
  filterChipActive: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  filterChipText: { fontSize: 14, color: TEXT_MUTED },
  filterChipTextActive: { color: ACCENT, fontWeight: '600' },
  scriptCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: CARD_BORDER },
  scriptTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 10 },
  scriptLabel: { fontSize: 12, color: TEXT_MUTED, marginTop: 8, marginBottom: 2 },
  scriptText: { fontSize: 14, color: TEXT_SECONDARY, fontStyle: 'italic', lineHeight: 20 },
  practiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, marginTop: 8 },
  practiceBtnText: { fontSize: 15, color: ACCENT, fontWeight: '600' },
  introText: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 20 },
  primaryBtn: { backgroundColor: ACCENT, borderRadius: BORDER_RADIUS.button ?? 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  progressBar: { height: 4, backgroundColor: CARD_BG, marginBottom: 16 },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  questionText: { fontSize: 17, color: TEXT_PRIMARY, lineHeight: 24, marginBottom: 20, fontWeight: '500' },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scaleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD_BG, borderWidth: 2, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center' },
  scaleBtnActive: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  scaleNum: { fontSize: 16, fontWeight: '600', color: TEXT_MUTED },
  scaleNumActive: { color: ACCENT },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  scaleLabel: { fontSize: 12, color: TEXT_MUTED },
  backBtn: { alignSelf: 'center', marginTop: 12 },
  backBtnText: { fontSize: 14, color: ACCENT },
  resultTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  scoreEmoji: { fontSize: 20, marginRight: 10 },
  scoreLabel: { flex: 1, fontSize: 15, color: TEXT_PRIMARY },
  scoreValue: { fontSize: 16, fontWeight: '700', color: ACCENT },
  resultHint: { fontSize: 13, color: TEXT_MUTED, marginTop: 12, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center' },
  typeChipActive: { borderColor: ACCENT },
  typeChipEmoji: { fontSize: 22 },
  input: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.input, borderWidth: 1, borderColor: CARD_BORDER, padding: 12, fontSize: 15, color: TEXT_PRIMARY, marginBottom: 16 },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  logEmoji: { fontSize: 20, marginRight: 10 },
  logType: { fontSize: 15, color: TEXT_PRIMARY, fontWeight: '500' },
  logNote: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  logDate: { fontSize: 12, color: TEXT_MUTED },
  emptyText: { fontSize: 14, color: TEXT_MUTED, marginTop: 8 },
  affirmTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 12 },
  affirmCard: { backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.12)', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.accentMuted },
  affirmText: { fontSize: 18, color: TEXT_PRIMARY, fontWeight: '500', lineHeight: 26, fontStyle: 'italic' },
  affirmSub: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  affirmBullet: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 6, lineHeight: 20 },
  copilotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: BORDER_RADIUS.button ?? 12, paddingVertical: 14, marginTop: 24 },
  copilotBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  secondaryBtnText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  // Custom script styles
  customScriptSection: { marginTop: 24, marginBottom: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: CARD_BORDER },
  customHint: { fontSize: 13, color: TEXT_MUTED, marginBottom: 12, lineHeight: 18 },
  customInput: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card ?? 12, borderWidth: 1, borderColor: CARD_BORDER, padding: 14, fontSize: 15, color: TEXT_PRIMARY, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: BORDER_RADIUS.button ?? 12, paddingVertical: 14 },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  customResultCard: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card ?? 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: ACCENT, borderLeftWidth: 4 },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: CARD_BORDER },
  tipText: { flex: 1, fontSize: 14, color: TEXT_PRIMARY, lineHeight: 20 },
});
