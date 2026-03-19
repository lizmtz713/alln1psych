/**
 * Life Direction Finder — Reflective assessment (write or speak).
 * One deeper prompt + 12 reflective questions. AI/keywords extract themes. Not a single job title.
 * Route: /tools/life-direction-finder
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Audio from 'expo-av';
import { requestPermissionsAsync as requestAudioPermissions } from 'expo-av/build/Audio/Recording';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  MEANINGFUL_WORK_PROMPT,
  REFLECTIVE_DIRECTION_QUESTIONS,
  DIRECTION_THEMES,
  DIRECTION_EXPERIMENTS,
  DIRECTION_GAUGES,
  computeDirectionResultsFromReflection,
  directionInterpretationToResults,
  type DirectionResults,
} from '../../../src/data/lifeDirectionFinder';
import { getSkillThemesForDirectionTheme } from '../../../src/data/skillThemes';
import { useCockpitStore } from '../../../src/stores/cockpitStore';
import * as Voice from '../../../src/services/voice';
import { interpretDirectionReflection } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function LifeDirectionFinderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [meaningfulWork, setMeaningfulWork] = useState('');
  const [reflectiveAnswers, setReflectiveAnswers] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [results, setResults] = useState<DirectionResults | null>(null);
  const [resultsRefining, setResultsRefining] = useState(false);

  const direction = useCockpitStore((s) => s.direction.value);
  const connection = useCockpitStore((s) => s.connection.value);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0 && step <= 12) {
      setStep(step - 1);
    } else if (step === 0) {
      setStarted(false);
    } else {
      router.back();
    }
  };

  const currentReflectivePrompt = step === 0 ? null : REFLECTIVE_DIRECTION_QUESTIONS[step - 1];

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 12) {
      setStep(step + 1);
    } else {
      setStep(13);
      const keywordResults = computeDirectionResultsFromReflection(meaningfulWork, reflectiveAnswers);
      setResults(keywordResults);
      setResultsRefining(true);
    }
  };

  useEffect(() => {
    if (step !== 13 || !resultsRefining) return;
    const combined = [meaningfulWork, ...Object.values(reflectiveAnswers)].filter(Boolean).join('\n');
    if (!combined.trim()) {
      setResultsRefining(false);
      return;
    }
    let cancelled = false;
    interpretDirectionReflection(combined)
      .then((interp) => {
        if (cancelled || !interp) return;
        setResults(directionInterpretationToResults(interp));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setResultsRefining(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, resultsRefining, meaningfulWork, reflectiveAnswers]);

  const skillThemesFromResults = results ? results.topThemes.flatMap((t) => getSkillThemesForDirectionTheme(t.id)).slice(0, 6) : [];
  const uniqueSkillThemes = Array.from(new Map(skillThemesFromResults.map((s) => [s.id, s])).values());
  const gaugeTip = direction >= 0 && direction < 50 && connection >= 0 && connection >= 50;

  const handleMicPress = async () => {
    if (isRecording) {
      try {
        const uri = await Voice.stopRecording();
        setIsRecording(false);
        setIsTranscribing(true);
        const text = await Voice.transcribeWithWhisper(uri);
        setIsTranscribing(false);
        if (step === 0) {
          setMeaningfulWork((prev) => (prev ? prev + ' ' + text : text));
        } else if (currentReflectivePrompt) {
          setReflectiveAnswers((prev) => ({
            ...prev,
            [currentReflectivePrompt.id]: (prev[currentReflectivePrompt.id] || '') + (prev[currentReflectivePrompt.id] ? ' ' : '') + text,
          }));
        }
      } catch (e) {
        setIsRecording(false);
        setIsTranscribing(false);
        Alert.alert('Transcription failed', 'Check your internet and OpenAI key in Settings.');
      }
      return;
    }
    const { status } = await requestAudioPermissions();
    if (status !== 'granted') {
      Alert.alert('Microphone needed', 'Enable mic in Settings to use voice.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    try {
      await Voice.startRecording();
    } catch (e) {
      setIsRecording(false);
      Alert.alert('Recording failed', 'Could not start recording.');
    }
  };

  // Intro
  if (!started) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Life Direction Finder</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.introTitle}>Find your direction themes</Text>
          <Text style={styles.introBody}>
            Careers are not fixed choices. They are evolving directions. You'll answer one deep prompt and 12 short reflections—by writing (or speaking when available). Your answers are interpreted into themes and possible fields, not a single job title.
          </Text>
          <Text style={styles.introMeta}>1 prompt + 12 questions · Write or speak · Connects to your gauges</Text>
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStarted(true);
              setStep(0);
            }}
          >
            <Text style={styles.startBtnText}>Start</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Results
  if (step === 13 && results) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => setStep(12)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Your direction</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {resultsRefining && (
            <View style={styles.refiningRow}>
              <ActivityIndicator size="small" color={ACCENT} />
              <Text style={styles.refiningText}>Refining with AI…</Text>
            </View>
          )}
          <Text style={styles.resultsHeadline}>Your direction signals</Text>
          {gaugeTip && (
            <View style={styles.gaugeTip}>
              <Ionicons name="bulb-outline" size={18} color={ACCENT} />
              <Text style={styles.gaugeTipText}>
                Work involving people may energize you more than solitary tasks. Consider roles that use your Connection strength.
              </Text>
            </View>
          )}
          {results.thriveWhen.length > 0 && (
            <View style={styles.resultsBlock}>
              <Text style={styles.resultsLabel}>You thrive when</Text>
              {results.thriveWhen.map((item, i) => (
                <Text key={i} style={styles.bullet}>• {item}</Text>
              ))}
            </View>
          )}
          <View style={styles.resultsBlock}>
            <Text style={styles.resultsLabel}>Your strongest themes</Text>
            <View style={styles.themePills}>
              {results.topThemes.map((t) => (
                <View key={t.id} style={styles.themePill}>
                  <Text style={styles.themePillText}>{t.label}</Text>
                </View>
              ))}
            </View>
          </View>
          {uniqueSkillThemes.length > 0 && (
            <View style={styles.resultsBlock}>
              <Text style={styles.resultsLabel}>Skill themes that may fit</Text>
              <View style={styles.themePills}>
                {uniqueSkillThemes.slice(0, 6).map((t) => (
                  <View key={t.id} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={styles.resultsBlock}>
            <Text style={styles.resultsLabel}>Possible fields</Text>
            <Text style={styles.resultsSub}>Not prescriptions—starting points to explore.</Text>
            <View style={styles.fieldPills}>
              {results.possibleFields.map((f) => (
                <View key={f} style={styles.fieldPill}>
                  <Text style={styles.fieldPillText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.resultsBlock}>
            <Text style={styles.resultsLabel}>Connected to your gauges</Text>
            <View style={styles.gaugesRow}>
              {DIRECTION_GAUGES.map((g) => (
                <View key={g.id} style={styles.gaugeChip}>
                  <Text style={styles.gaugeChipEmoji}>{g.emoji}</Text>
                  <Text style={styles.gaugeChipLabel}>{g.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.resultsBlock}>
            <Text style={styles.resultsLabel}>Try an experiment</Text>
            <Text style={styles.resultsSub}>Small steps to test your direction.</Text>
            {DIRECTION_EXPERIMENTS.map((ex, i) => (
              <Text key={i} style={styles.experimentItem}>• {ex}</Text>
            ))}
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your direction can evolve. Revisit this tool as you learn more about what energizes you.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Step 0 (meaningful work) or 1–12 (reflective)
  const isMeaningfulStep = step === 0;
  const promptText = isMeaningfulStep ? MEANINGFUL_WORK_PROMPT : (currentReflectivePrompt?.text ?? '');
  const examples = currentReflectivePrompt?.examples ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isMeaningfulStep ? 'Meaningful work' : `Reflection ${step} of 12`}
        </Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.promptText}>{promptText}</Text>
        {examples.length > 0 && (
          <Text style={styles.examplesHint}>Examples (optional): {examples.join(' · ')}</Text>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder={isMeaningfulStep ? 'Write or speak your answer...' : 'A few words or sentences...'}
            placeholderTextColor={COLORS.textMuted}
            value={step === 0 ? meaningfulWork : (currentReflectivePrompt && reflectiveAnswers[currentReflectivePrompt.id]) || ''}
            onChangeText={(t) => {
              if (step === 0) setMeaningfulWork(t);
              else if (currentReflectivePrompt) setReflectiveAnswers((prev) => ({ ...prev, [currentReflectivePrompt.id]: t }));
            }}
            multiline
            numberOfLines={4}
          />
          <Pressable
            style={[styles.micBtn, isRecording && styles.micBtnRecording, (isRecording || isTranscribing) && styles.micBtnDisabled]}
            onPress={handleMicPress}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color="#fff" />
            )}
          </Pressable>
        </View>
        {(isRecording || isTranscribing) && (
          <Text style={styles.recordingHint}>
            {isRecording ? 'Recording… Tap mic to stop.' : 'Transcribing…'}
          </Text>
        )}
        <Pressable style={styles.nextBtn} onPress={goNext}>
          <Text style={styles.nextBtnText}>{step === 12 ? 'See my results' : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  introTitle: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 12 },
  introBody: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 12 },
  introMeta: { fontSize: 13, color: COLORS.textMuted, marginBottom: 24 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  startBtnPressed: { opacity: 0.9 },
  startBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  promptText: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 12, lineHeight: 26 },
  examplesHint: { fontSize: 13, color: TEXT_MUTED, marginBottom: 12, lineHeight: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  textInput: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 15,
    color: TEXT,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnRecording: { backgroundColor: COLORS.error },
  micBtnDisabled: { opacity: 0.8 },
  recordingHint: { fontSize: 13, color: TEXT_MUTED, marginTop: 8 },
  refiningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  refiningText: { fontSize: 14, color: TEXT_MUTED },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 14,
    marginTop: 24,
    gap: 8,
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultsHeadline: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 16 },
  gaugeTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  gaugeTipText: { flex: 1, fontSize: 13, color: TEXT, lineHeight: 19, marginLeft: 8 },
  resultsBlock: { marginBottom: 24 },
  resultsLabel: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 8 },
  resultsSub: { fontSize: 13, color: TEXT_MUTED, marginBottom: 8 },
  bullet: { fontSize: 15, color: TEXT, lineHeight: 22, marginBottom: 4 },
  themePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themePill: { backgroundColor: COLORS.accentBg, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: COLORS.borderAccent },
  themePillText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  skillPill: { backgroundColor: CARD_BG, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  skillPillText: { fontSize: 13, color: TEXT },
  fieldPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fieldPill: { backgroundColor: CARD_BG, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  fieldPillText: { fontSize: 13, color: TEXT },
  gaugesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gaugeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  gaugeChipEmoji: { fontSize: 14, marginRight: 4 },
  gaugeChipLabel: { fontSize: 13, color: TEXT },
  experimentItem: { fontSize: 14, color: TEXT, lineHeight: 22, marginBottom: 4 },
  footer: { marginTop: 8 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
