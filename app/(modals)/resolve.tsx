/**
 * Resolve — 7-phase internal conflict resolution tool (IFS-inspired).
 * Route: /(modals)/resolve
 *
 * Phase 1: Intro
 * Phase 2: User describes the conflict
 * Phase 3: Voice Part A
 * Phase 4: Voice Part B
 * Phase 5: AI analyzes what each part is protecting (IFS-based)
 * Phase 6: User selects which gauges relate
 * Phase 7: AI generates integration path
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { ToolIntro } from '../../src/components/tools/ToolIntro';
import { getToolIntroContent } from '../../src/data/toolIntroContent';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import type { GaugeKey } from '../../src/stores/cockpitStore';
import { useHumanSkillsStore, RESOLVE_SKILL_IDS, SKILL_POINTS } from '../../src/stores/humanSkillsStore';

const BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const ACCENT = '#7C4DFF';
const AI_BODY = '#E0E0E0';
const LOADING_TEXT = '#8888A0';

const PHASES = [
  'intro',
  'describe',
  'voiceA',
  'voiceB',
  'analysis',
  'gauges',
  'integration',
] as const;
type Phase = (typeof PHASES)[number];

const GAUGE_KEYS: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

const IFS_ANALYSIS_SYSTEM = `You are Psych, an AI coach trained in Internal Family Systems (IFS) ideas. The user is doing internal conflict resolution. They described a conflict ("Part of me wants X, but part of me wants Y"), then let Part A and Part B speak in their own words.

Your job: analyze what each part is PROTECTING — the underlying need, fear, or positive intent. Use IFS language: parts often protect us from pain, shame, or overwhelm. Name the likely need/intent of each part in 2–4 sentences total. Be warm and non-pathologizing. Use these section headers (ALL CAPS):

PART A IS LIKELY PROTECTING — What need or fear might Part A be guarding?
PART B IS LIKELY PROTECTING — Same for Part B.
BOTH PARTS WANT — One sentence on what they have in common (safety, belonging, agency, etc.).`;

const INTEGRATION_SYSTEM = `You are Psych. The user did internal conflict resolution: they named a conflict, let both parts speak, saw an IFS-style analysis of what each part protects, and selected which life gauges (body, state, emotion, connection, direction, alignment) this conflict touches.

Your job: give them a short INTEGRATION PATH — 3–5 concrete steps that honor BOTH parts. No forcing one part to "win." Examples: "Set a boundary that Part A needs, then schedule a small action Part B wants," or "Name the fear Part A carries before making the decision Part B is pushing for." Be specific to what they shared. Use a clear numbered list. Keep tone warm and practical.`;

export default function ResolveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('intro');
  const [conflictDescription, setConflictDescription] = useState('');
  const [voiceA, setVoiceA] = useState('');
  const [voiceB, setVoiceB] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [selectedGauges, setSelectedGauges] = useState<GaugeKey[]>([]);
  const [integrationText, setIntegrationText] = useState('');
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const idx = PHASES.indexOf(phase);
    if (idx < PHASES.length - 1) setPhase(PHASES[idx + 1]);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === 'intro') {
      router.back();
      return;
    }
    const idx = PHASES.indexOf(phase);
    if (idx > 0) setPhase(PHASES[idx - 1]);
    else router.back();
  };

  const toggleGauge = (g: GaugeKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGauges((prev) =>
      prev.includes(g) ? prev.filter((k) => k !== g) : [...prev, g]
    );
  };

  const runAnalysis = async () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const userContent = `Conflict: ${conflictDescription}\n\nPart A said: ${voiceA}\n\nPart B said: ${voiceB}`;
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: userContent }],
        IFS_ANALYSIS_SYSTEM
      );
      setAnalysisText(response?.trim() ?? '');
      setPhase('analysis');
    } catch (e) {
      if (__DEV__) console.warn('Resolve analysis error:', e);
      setAnalysisText("I couldn't analyze that right now. Try again in a moment.");
      setPhase('analysis');
    } finally {
      setLoading(false);
    }
  };

  const runIntegration = async () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const gaugeList = selectedGauges.length ? selectedGauges.join(', ') : 'none selected';
      const userContent = `Conflict: ${conflictDescription}\n\nPart A: ${voiceA}\n\nPart B: ${voiceB}\n\nAnalysis:\n${analysisText}\n\nGauges this touches: ${gaugeList}`;
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: userContent }],
        INTEGRATION_SYSTEM
      );
      setIntegrationText(response?.trim() ?? '');
      setPhase('integration');
      useHumanSkillsStore.getState().addPoints(RESOLVE_SKILL_IDS, SKILL_POINTS.toolUse, 'tool');
    } catch (e) {
      if (__DEV__) console.warn('Resolve integration error:', e);
      setIntegrationText("I couldn't generate an integration path right now. Try again in a moment.");
      setPhase('integration');
      useHumanSkillsStore.getState().addPoints(RESOLVE_SKILL_IDS, SKILL_POINTS.toolUse, 'tool');
    } finally {
      setLoading(false);
    }
  };

  const canProceedDescribe = conflictDescription.trim().length >= 10;
  const canProceedVoiceA = voiceA.trim().length >= 5;
  const canProceedVoiceB = voiceB.trim().length >= 5;

  const resolveIntroContent = getToolIntroContent('resolve');
  if (phase === 'intro' && resolveIntroContent) {
    return (
      <ErrorBoundary>
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <ToolIntro
            content={resolveIntroContent}
            onStart={() => setPhase('describe')}
            onBack={() => router.back()}
          />
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            onPress={goBack}
          >
            <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Ionicons name="git-merge" size={20} color={ACCENT} />
            <Text style={styles.headerTitle}>Resolve</Text>
          </View>
          <View style={styles.closeBtn} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Phase 1: Intro */}
            {phase === 'intro' && (
              <>
                <View style={styles.card}>
                  <Text style={styles.lead}>
                    When your system is at war with itself
                  </Text>
                  <Text style={styles.sub}>
                    Sometimes one part of you wants something and another part wants the opposite. That’s not a flaw — it’s your inner system trying to protect different needs. This tool helps you hear both parts, name what they’re protecting, and find a path that honors both.
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                  onPress={goNext}
                >
                  <Text style={styles.primaryBtnText}>Start</Text>
                </Pressable>
              </>
            )}

            {/* Phase 2: Describe conflict */}
            {phase === 'describe' && (
              <>
                <Text style={styles.prompt}>Describe the conflict in your own words.</Text>
                <Text style={styles.hint}>e.g. "Part of me wants to say yes, but part of me wants to say no."</Text>
                <TextInput
                  style={styles.largeInput}
                  placeholder="Part of me wants… but part of me wants…"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={conflictDescription}
                  onChangeText={setConflictDescription}
                  multiline
                  numberOfLines={4}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (!canProceedDescribe || pressed) && (pressed ? styles.pressed : styles.primaryBtnDisabled),
                  ]}
                  onPress={goNext}
                  disabled={!canProceedDescribe}
                >
                  <Text style={styles.primaryBtnText}>Next</Text>
                </Pressable>
              </>
            )}

            {/* Phase 3: Voice Part A */}
            {phase === 'voiceA' && (
              <>
                <Text style={styles.prompt}>Let Part A speak.</Text>
                <Text style={styles.hint}>Give this part a voice. What does it want? What is it afraid of?</Text>
                <TextInput
                  style={styles.largeInput}
                  placeholder="I want… I'm afraid that…"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={voiceA}
                  onChangeText={setVoiceA}
                  multiline
                  numberOfLines={4}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (!canProceedVoiceA || pressed) && (pressed ? styles.pressed : styles.primaryBtnDisabled),
                  ]}
                  onPress={goNext}
                  disabled={!canProceedVoiceA}
                >
                  <Text style={styles.primaryBtnText}>Next</Text>
                </Pressable>
              </>
            )}

            {/* Phase 4: Voice Part B */}
            {phase === 'voiceB' && (
              <>
                <Text style={styles.prompt}>Let Part B speak.</Text>
                <Text style={styles.hint}>Same for the other part. What does it want? What is it protecting?</Text>
                <TextInput
                  style={styles.largeInput}
                  placeholder="I want… I need…"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={voiceB}
                  onChangeText={setVoiceB}
                  multiline
                  numberOfLines={4}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (!canProceedVoiceB || pressed) && (pressed ? styles.pressed : styles.primaryBtnDisabled),
                  ]}
                  onPress={runAnalysis}
                  disabled={!canProceedVoiceB || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Analyze both parts</Text>
                  )}
                </Pressable>
              </>
            )}

            {/* Phase 5: AI analysis */}
            {phase === 'analysis' && (
              <>
                <Text style={styles.prompt}>What each part might be protecting</Text>
                <View style={styles.card}>
                  <Text style={styles.aiBody}>{analysisText}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                  onPress={goNext}
                >
                  <Text style={styles.primaryBtnText}>Next: choose gauges</Text>
                </Pressable>
              </>
            )}

            {/* Phase 6: Select gauges */}
            {phase === 'gauges' && (
              <>
                <Text style={styles.prompt}>Which areas of life does this conflict touch?</Text>
                <Text style={styles.hint}>Select any that feel relevant (optional).</Text>
                <View style={styles.chipRow}>
                  {GAUGE_KEYS.map((g) => {
                    const selected = selectedGauges.includes(g);
                    return (
                      <Pressable
                        key={g}
                        style={[
                          styles.chip,
                          selected && styles.chipSelected,
                        ]}
                        onPress={() => toggleGauge(g)}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {GAUGE_LABELS[g]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (pressed || loading) && (pressed ? styles.pressed : styles.primaryBtnDisabled),
                  ]}
                  onPress={runIntegration}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Get integration path</Text>
                  )}
                </Pressable>
              </>
            )}

            {/* Phase 7: Integration path */}
            {phase === 'integration' && (
              <>
                <Text style={styles.prompt}>Integration path</Text>
                <View style={styles.card}>
                  <Text style={styles.aiBody}>{integrationText}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                  }}
                >
                  <Text style={styles.primaryBtnText}>Done</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 16,
  },
  lead: { fontSize: 17, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8, lineHeight: 24 },
  sub: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22 },
  prompt: { fontSize: 17, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  hint: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 12 },
  largeInput: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input ?? 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    color: TEXT_PRIMARY,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  aiBody: { fontSize: 15, color: AI_BODY, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(124, 77, 255, 0.15)' },
  chipText: { fontSize: 14, color: TEXT_SECONDARY },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
});
