import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { VoiceRecorder } from '../voice';
import { analyzeDailyDebrief, type DailyDebriefResult } from '../../services/dailyDebrief';
import { promptForGauge, type AdaptiveCheckInPlan } from '../../services/adaptiveCheckIn';
import { speakWithOpenAI } from '../../services/voice';
import type { GaugeKey } from '../../stores/cockpitStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { GAUGE_CONFIG } from '../../utils/gaugeHelpers';
import { BORDER_RADIUS, COLORS, SPACING } from '../../lib/constants';

const GAUGES: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

export type AdaptiveSavePayload = {
  gauges: Partial<Record<GaugeKey, number>>;
  note: string | null;
  mode: 'quick_pulse' | 'voice_debrief';
  source: 'explicit' | 'confirmed_unchanged' | 'voice_inferred' | 'wearable_prompted';
  confidence: 'low' | 'medium' | 'high' | 'mixed';
};

type Props = {
  plan: AdaptiveCheckInPlan;
  currentGauges: Partial<Record<GaugeKey, number>>;
  pending: boolean;
  onSave: (payload: AdaptiveSavePayload) => Promise<void>;
  onWeeklyCalibration: () => void;
  onClose: () => void;
};

type Screen = 'home' | 'change' | 'talk' | 'review';

function activeSnapshot(current: Partial<Record<GaugeKey, number>>): Partial<Record<GaugeKey, number>> {
  return Object.fromEntries(
    Object.entries(current).filter(([, value]) => typeof value === 'number' && value >= 0)
  ) as Partial<Record<GaugeKey, number>>;
}

export function AdaptiveCheckInEntry({ plan, currentGauges, pending, onSave, onWeeklyCalibration, onClose }: Props) {
  const [screen, setScreen] = useState<Screen>('home');
  const [changeDirection, setChangeDirection] = useState<'better' | 'harder'>('harder');
  const [selectedGauge, setSelectedGauge] = useState<GaugeKey | null>(plan.suggestedGauge);
  const [changeAmount, setChangeAmount] = useState<10 | 20>(10);
  const [typedDebrief, setTypedDebrief] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DailyDebriefResult | null>(null);
  const [reviewScores, setReviewScores] = useState<Partial<Record<GaugeKey, number>>>({});
  const aiVoiceEnabled = useSettingsStore((state) => state.aiVoiceEnabled);

  const hasPrevious = useMemo(() => Object.keys(activeSnapshot(currentGauges)).length >= 4, [currentGauges]);

  const submitUnchanged = async () => {
    if (!hasPrevious) {
      Alert.alert('One calibration first', 'Complete the weekly calibration once so Gauge has a baseline to confirm.');
      return;
    }
    await onSave({
      gauges: activeSnapshot(currentGauges),
      note: 'No meaningful change reported.',
      mode: 'quick_pulse',
      source: 'confirmed_unchanged',
      confidence: 'high',
    });
  };

  const submitChange = async () => {
    if (!selectedGauge) return;
    const snapshot = activeSnapshot(currentGauges);
    const current = snapshot[selectedGauge] ?? 50;
    snapshot[selectedGauge] = Math.max(0, Math.min(100, current + (changeDirection === 'better' ? changeAmount : -changeAmount)));
    await onSave({
      gauges: snapshot,
      note: `${GAUGE_CONFIG[selectedGauge]?.label ?? selectedGauge} feels ${changeDirection}.`,
      mode: 'quick_pulse',
      source: plan.signals.length ? 'wearable_prompted' : 'explicit',
      confidence: 'high',
    });
  };

  const analyzeTranscript = async (transcript: string, audioUri?: string) => {
    if (!transcript.trim()) {
      if (audioUri) void FileSystem.deleteAsync(audioUri, { idempotent: true }).catch(() => {});
      Alert.alert('Tell me a little more', 'Record or type what today has actually been like.');
      return;
    }
    setAnalyzing(true);
    try {
      const next = await analyzeDailyDebrief(transcript, currentGauges, plan);
      const scores = activeSnapshot(currentGauges);
      for (const gauge of GAUGES) {
        const inferred = next.gauges[gauge]?.score;
        if (typeof inferred === 'number') scores[gauge] = inferred;
      }
      setResult(next);
      setReviewScores(scores);
      setScreen('review');
      if (aiVoiceEnabled) void speakWithOpenAI(`${next.summary} ${next.reflection}`);
    } finally {
      setAnalyzing(false);
      if (audioUri) void FileSystem.deleteAsync(audioUri, { idempotent: true }).catch(() => {});
    }
  };

  const adjustScore = (gauge: GaugeKey, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReviewScores((scores) => ({
      ...scores,
      [gauge]: Math.max(0, Math.min(100, (scores[gauge] ?? 50) + delta)),
    }));
  };

  const submitReview = async () => {
    if (!result) return;
    const confidences = Object.values(result.gauges).map((reading) => reading?.confidence).filter(Boolean);
    const confidence = confidences.length === 0 || new Set(confidences).size > 1
      ? 'mixed'
      : confidences[0] as 'low' | 'medium' | 'high';
    await onSave({
      gauges: reviewScores,
      note: result.summary,
      mode: 'voice_debrief',
      source: 'voice_inferred',
      confidence,
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={screen === 'home' ? onClose : () => setScreen('home')} style={styles.iconButton}>
          <Ionicons name={screen === 'home' ? 'close' : 'arrow-back'} size={25} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Daily check-in</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {screen === 'home' && (
          <>
            {plan.intensity === 'recovery' && (
              <View style={styles.recoveryBadge}>
                <Ionicons name="leaf-outline" size={18} color={COLORS.success} />
                <Text style={styles.recoveryBadgeText}>Low-friction mode</Text>
              </View>
            )}
            <Text style={styles.eyebrow}>{plan.signals.length ? 'YOUR BODY NOTICED A CHANGE' : 'TODAY’S PULSE'}</Text>
            <Text style={styles.title}>{plan.opening}</Text>
            <Pressable style={styles.listenButton} onPress={() => void speakWithOpenAI(plan.opening)}>
              <Ionicons name="volume-medium-outline" size={19} color={COLORS.accent} />
              <Text style={styles.listenButtonText}>Hear Gauge ask</Text>
            </Pressable>
            {plan.signals.map((signal) => (
              <View key={signal.kind} style={styles.signalCard}>
                <Ionicons name="pulse" size={20} color={COLORS.accent} />
                <View style={styles.signalCopy}>
                  <Text style={styles.signalLabel}>{signal.label}</Text>
                  <Text style={styles.signalDetail}>{signal.detail}</Text>
                </View>
              </View>
            ))}
            {plan.signals.length > 0 && (
              <Text style={styles.disclaimer}>A body signal is a clue, not a diagnosis. You decide what it means.</Text>
            )}

            <Pressable style={styles.primaryChoice} onPress={hasPrevious ? submitUnchanged : onWeeklyCalibration} disabled={pending}>
              <Text style={styles.primaryChoiceText}>{hasPrevious ? 'Nothing meaningful changed' : 'Start my first calibration'}</Text>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            </Pressable>
            <View style={styles.twoColumn}>
              <Pressable style={styles.choice} onPress={() => { setChangeDirection('better'); setScreen('change'); }}>
                <Ionicons name="trending-up" size={21} color={COLORS.success} />
                <Text style={styles.choiceText}>I feel better</Text>
              </Pressable>
              <Pressable style={styles.choice} onPress={() => { setChangeDirection('harder'); setScreen('change'); }}>
                <Ionicons name="trending-down" size={21} color={COLORS.amber} />
                <Text style={styles.choiceText}>Something’s harder</Text>
              </Pressable>
            </View>
            <Pressable style={styles.talkChoice} onPress={() => setScreen('talk')}>
              <View style={styles.talkIcon}><Ionicons name="mic" size={26} color="#fff" /></View>
              <View style={styles.talkCopy}>
                <Text style={styles.talkTitle}>Talk it through</Text>
                <Text style={styles.talkSub}>Say more. Gauge will listen and confirm what it heard.</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={COLORS.textMuted} />
            </Pressable>
            <Pressable style={styles.weeklyLink} onPress={onWeeklyCalibration}>
              <Text style={styles.weeklyLinkText}>Do the full weekly calibration</Text>
            </Pressable>
          </>
        )}

        {screen === 'change' && (
          <>
            <Text style={styles.eyebrow}>ONE THING AT A TIME</Text>
            <Text style={styles.title}>Which part feels {changeDirection}?</Text>
            <View style={styles.gaugeGrid}>
              {GAUGES.map((gauge) => {
                const selected = selectedGauge === gauge;
                return (
                  <Pressable
                    key={gauge}
                    style={[styles.gaugeChoice, selected && { borderColor: GAUGE_CONFIG[gauge]?.color ?? COLORS.accent }]}
                    onPress={() => setSelectedGauge(gauge)}
                  >
                    <Text style={styles.gaugeChoiceTitle}>{GAUGE_CONFIG[gauge]?.label ?? gauge}</Text>
                    <Text style={styles.gaugeChoicePrompt}>{promptForGauge(gauge)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.amountLabel}>How noticeable is the change?</Text>
            <View style={styles.twoColumn}>
              {[10, 20].map((amount) => (
                <Pressable
                  key={amount}
                  style={[styles.choice, changeAmount === amount && styles.choiceSelected]}
                  onPress={() => setChangeAmount(amount as 10 | 20)}
                >
                  <Text style={styles.choiceText}>{amount === 10 ? 'A little' : 'A lot'}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={[styles.saveButton, !selectedGauge && styles.disabled]} onPress={submitChange} disabled={!selectedGauge || pending}>
              {pending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save today’s pulse</Text>}
            </Pressable>
          </>
        )}

        {screen === 'talk' && (
          <>
            <Text style={styles.eyebrow}>PRIVATE DAILY DEBRIEF</Text>
            <Text style={styles.title}>Tell me how today has actually been.</Text>
            <Text style={styles.bodyCopy}>Talk naturally. You don’t need to cover all six gauges. Your recording is deleted after transcription unless you explicitly save it elsewhere.</Text>
            {analyzing ? (
              <View style={styles.processing}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.processingText}>Listening for the parts that matter…</Text>
              </View>
            ) : (
              <VoiceRecorder
                requestTranscribe
                maxDurationSec={300}
                onDone={({ uri, transcript }) => void analyzeTranscript(transcript ?? '', uri)}
              />
            )}
            <Text style={styles.or}>or type instead</Text>
            <TextInput
              style={styles.input}
              value={typedDebrief}
              onChangeText={setTypedDebrief}
              placeholder="Today was…"
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={12_000}
            />
            <Pressable style={[styles.secondaryButton, !typedDebrief.trim() && styles.disabled]} onPress={() => void analyzeTranscript(typedDebrief)} disabled={!typedDebrief.trim() || analyzing}>
              <Text style={styles.secondaryButtonText}>Reflect this back to me</Text>
            </Pressable>
          </>
        )}

        {screen === 'review' && result && (
          <>
            <Text style={styles.eyebrow}>HERE’S WHAT I HEARD</Text>
            <Text style={styles.title}>{result.summary}</Text>
            <Text style={styles.bodyCopy}>{result.reflection}</Text>
            {GAUGES.map((gauge) => {
              const inferred = result.gauges[gauge];
              const score = reviewScores[gauge];
              if (typeof score !== 'number') return null;
              return (
                <View key={gauge} style={styles.reviewRow}>
                  <View style={styles.reviewCopy}>
                    <Text style={styles.reviewTitle}>{GAUGE_CONFIG[gauge]?.label ?? gauge}</Text>
                    <Text style={styles.reviewEvidence}>{inferred?.evidence ?? 'Unchanged from your previous check-in.'}</Text>
                  </View>
                  <View style={styles.scoreControl}>
                    <Pressable onPress={() => adjustScore(gauge, -10)} style={styles.scoreButton}><Text style={styles.scoreButtonText}>−</Text></Pressable>
                    <Text style={styles.score}>{score}</Text>
                    <Pressable onPress={() => adjustScore(gauge, 10)} style={styles.scoreButton}><Text style={styles.scoreButtonText}>+</Text></Pressable>
                  </View>
                </View>
              );
            })}
            {result.followUpQuestion && <Text style={styles.followUp}>Still worth considering: {result.followUpQuestion}</Text>}
            <Pressable style={styles.saveButton} onPress={submitReview} disabled={pending}>
              {pending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Yes, save this check-in</Text>}
            </Pressable>
            <Pressable style={styles.weeklyLink} onPress={() => setScreen('talk')}><Text style={styles.weeklyLinkText}>No, let me explain again</Text></Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING.lg, paddingBottom: 64 },
  recoveryBadge: { alignSelf: 'flex-start', flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: COLORS.success + '18', marginBottom: 18 },
  recoveryBadgeText: { color: COLORS.success, fontSize: 13, fontWeight: '700' },
  eyebrow: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10 },
  title: { color: COLORS.text, fontSize: 27, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5, marginBottom: 14 },
  bodyCopy: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: 20 },
  signalCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.card, padding: 14, marginBottom: 10 },
  signalCopy: { flex: 1 },
  signalLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  signalDetail: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  disclaimer: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginVertical: 8 },
  listenButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, marginTop: -6, marginBottom: 12 },
  listenButtonText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  primaryChoice: { marginTop: 14, minHeight: 58, backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.card, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryChoiceText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  twoColumn: { flexDirection: 'row', gap: 10, marginTop: 10 },
  choice: { flex: 1, minHeight: 58, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.card, padding: 13, alignItems: 'center', justifyContent: 'center', gap: 5 },
  choiceSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  choiceText: { color: COLORS.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  talkChoice: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 14, borderRadius: BORDER_RADIUS.card, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  talkIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  talkCopy: { flex: 1, marginHorizontal: 12 },
  talkTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  talkSub: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 3 },
  weeklyLink: { alignItems: 'center', padding: 18 },
  weeklyLinkText: { color: COLORS.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
  gaugeGrid: { gap: 9 },
  gaugeChoice: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 14 },
  gaugeChoiceTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 3 },
  gaugeChoicePrompt: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  amountLabel: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginTop: 20 },
  saveButton: { minHeight: 58, backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.card, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryButton: { minHeight: 52, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  secondaryButtonText: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  processing: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 14 },
  processingText: { color: COLORS.textSecondary, fontSize: 14 },
  or: { color: COLORS.textMuted, textAlign: 'center', fontSize: 13, marginVertical: 10 },
  input: { minHeight: 120, color: COLORS.text, fontSize: 16, lineHeight: 23, textAlignVertical: 'top', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.card, padding: 14 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.card, padding: 13, marginBottom: 9 },
  reviewCopy: { flex: 1 },
  reviewTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  reviewEvidence: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  scoreControl: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  scoreButton: { width: 31, height: 31, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  scoreButtonText: { color: COLORS.text, fontSize: 19 },
  score: { color: COLORS.text, width: 32, fontSize: 17, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  followUp: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, padding: 14, borderLeftWidth: 2, borderLeftColor: COLORS.accent, marginTop: 8 },
});
