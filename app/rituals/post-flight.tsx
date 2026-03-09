/**
 * Post-Flight Debrief — Evening ritual. How was your day, highlight, weighing, appreciation, ending, intention honored, tomorrow note.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useRitualsStore } from '../../src/stores/ritualsStore';
import { useCockpitStore, type GaugeKey } from '../../src/stores/cockpitStore';
import { useUserStore } from '../../src/stores/userStore';
import type { DayRating, IntentionHonored, PostFlightEntry } from '../../src/types/rituals';
import { updateWidgetData } from '../../src/services/widgetService';
import { analyzeCheckInVoice } from '../../src/services/checkInVoice';
import { savePostFlightInsightsToJournal } from '../../src/services/insightJournal';
import type { FlightInsightItem } from '../../src/services/insightJournal';
import { VoiceQuestion, type VoiceQuestionAnswer } from '../../src/components/voice';
import { PostFlightComplete } from '../../src/components/rituals/PostFlightComplete';
import { RitualStepChecklist, type RitualStepDef } from '../../src/components/rituals/RitualStepChecklist';
import { trackPostFlight } from '../../src/hooks/useWrappedTracking';
import { format } from 'date-fns';
import { useWinStore } from '../../src/stores/winStore';
import { useHumanSkillsStore, POST_FLIGHT_SKILL_IDS, SKILL_POINTS } from '../../src/stores/humanSkillsStore';
import { useGratitudeStore } from '../../src/stores/gratitudeStore';
import { runAchievementChecks } from '../../src/services/achievementChecker';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const DAY_RATING_OPTIONS: { value: DayRating; emoji: string; label: string }[] = [
  { value: 1, emoji: '😫', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Great' },
];

const INTENTION_OPTIONS: { value: IntentionHonored; label: string }[] = [
  { value: 'yes', label: 'Yes, mostly' },
  { value: 'partial', label: 'Partially' },
  { value: 'no', label: 'Not really' },
  { value: 'forgot', label: "I forgot about it" },
];

/** Evening ritual quick steps — completion loop. */
const EVENING_RITUAL_STEPS: RitualStepDef[] = [
  { id: 'reflect', label: 'Reflection — what mattered today?', deltas: { emotion: 2 } },
  { id: 'journal', label: 'Journal', deltas: { state: 1 } },
  { id: 'reach-out', label: 'Reach out to someone meaningful', deltas: { connection: 3 } },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** State gauge: lower weighing = more stress; higher ending = calmer. 0–100. */
function calculateStateFromPostFlight(entry: Partial<PostFlightEntry>): number {
  const weighing = entry.weighingScore ?? 3;
  const ending = entry.endingScore ?? 3;
  return Math.round((weighing * 0.4 + ending * 0.6) * 20);
}

/** Emotion gauge: highlight and ending quality. 0–100. */
function calculateEmotionFromPostFlight(entry: Partial<PostFlightEntry>): number {
  const highlight = entry.highlightScore ?? 3;
  const ending = entry.endingScore ?? 3;
  return Math.round((highlight * 0.5 + ending * 0.5) * 20);
}

export default function PostFlightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const firstName = name?.trim().split(/\s+/)[0] || 'there';
  const addPostFlight = useRitualsStore((s) => s.addPostFlight);
  const addSkillPoints = useHumanSkillsStore((s) => s.addPoints);
  const addThreeGoodThings = useGratitudeStore((s) => s.addThreeGoodThings);
  const getMorningIntentionForDate = useRitualsStore((s) => s.getMorningIntentionForDate);
  const updateState = useCockpitStore((s) => s.updateState);
  const updateEmotion = useCockpitStore((s) => s.updateEmotion);
  const addGaugeDelta = useCockpitStore((s) => s.addGaugeDelta);

  const [dayRating, setDayRating] = useState<DayRating | null>(null);
  const [goodThing1, setGoodThing1] = useState('');
  const [goodThing2, setGoodThing2] = useState('');
  const [goodThing3, setGoodThing3] = useState('');
  const [wentWell, setWentWell] = useState('');
  const [lettingGo, setLettingGo] = useState('');
  const [intentionHonored, setIntentionHonored] = useState<IntentionHonored | null>(null);
  const [tomorrowNote, setTomorrowNote] = useState('');
  const [highlightAnswer, setHighlightAnswer] = useState<VoiceQuestionAnswer | null>(null);
  const [weighingAnswer, setWeighingAnswer] = useState<VoiceQuestionAnswer | null>(null);
  const [appreciateAnswer, setAppreciateAnswer] = useState<VoiceQuestionAnswer | null>(null);
  const [endingAnswer, setEndingAnswer] = useState<VoiceQuestionAnswer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [completedInsights, setCompletedInsights] = useState<FlightInsightItem[]>([]);
  const [completedGauges, setCompletedGauges] = useState<{ state: number; emotion: number }>({ state: 0, emotion: 0 });
  const [completedRitualStepIds, setCompletedRitualStepIds] = useState<string[]>([]);
  const [ritualGaugeDeltas, setRitualGaugeDeltas] = useState<Partial<Record<GaugeKey, number>>>({});

  const today = todayStr();
  const morningIntention = getMorningIntentionForDate(today);
  const wins = useWinStore((s) => s.wins);
  const winsToday = useMemo(
    () => wins.filter((w) => w.createdAt.slice(0, 10) === today),
    [wins, today]
  );

  const handleComplete = async () => {
    if (dayRating === null || intentionHonored === null) return;
    setSubmitting(true);
    const insights: FlightInsightItem[] = [];
    try {
      const entry: Omit<PostFlightEntry, 'id' | 'completedAt'> = {
        date: today,
        dayRating,
        wentWell: wentWell.trim(),
        lettingGo: lettingGo.trim(),
        intentionHonored,
        tomorrowNote: tomorrowNote.trim() || undefined,
      };

      if (highlightAnswer?.type === 'emoji' && highlightAnswer.value != null) {
        entry.highlightScore = highlightAnswer.value;
      } else if (highlightAnswer?.type === 'voice') {
        const result = await analyzeCheckInVoice(
          'What was the highlight of today?',
          highlightAnswer.transcript ?? '',
          'highlight'
        );
        entry.highlightScore = result.score;
        entry.highlightVoiceUri = highlightAnswer.voiceUri;
        entry.highlightVoiceDurationSec = highlightAnswer.voiceDurationSec;
        entry.highlightTranscript = highlightAnswer.transcript;
        insights.push({ question: 'What was the highlight of today?', score: result.score, insight: result.insight, source: result.source });
      }

      if (weighingAnswer?.type === 'emoji' && weighingAnswer.value != null) {
        entry.weighingScore = weighingAnswer.value;
      } else if (weighingAnswer?.type === 'voice') {
        const result = await analyzeCheckInVoice(
          'Anything weighing on you?',
          weighingAnswer.transcript ?? '',
          'weighing'
        );
        entry.weighingScore = result.score;
        entry.weighingText = weighingAnswer.text;
        entry.weighingVoiceUri = weighingAnswer.voiceUri;
        entry.weighingVoiceDurationSec = weighingAnswer.voiceDurationSec;
        entry.weighingTranscript = weighingAnswer.transcript;
        insights.push({ question: 'Anything weighing on you?', score: result.score, insight: result.insight, source: result.source });
      }

      if (appreciateAnswer?.type === 'voice') {
        entry.appreciateText = appreciateAnswer.transcript;
        entry.appreciateVoiceUri = appreciateAnswer.voiceUri;
        entry.appreciateVoiceDurationSec = appreciateAnswer.voiceDurationSec;
        entry.appreciateTranscript = appreciateAnswer.transcript;
      }

      if (endingAnswer?.type === 'emoji' && endingAnswer.value != null) {
        entry.endingScore = endingAnswer.value;
      } else if (endingAnswer?.type === 'voice') {
        const result = await analyzeCheckInVoice(
          'How are you ending the day?',
          endingAnswer.transcript ?? '',
          'ending'
        );
        entry.endingScore = result.score;
        entry.endingVoiceUri = endingAnswer.voiceUri;
        entry.endingVoiceDurationSec = endingAnswer.voiceDurationSec;
        entry.endingTranscript = endingAnswer.transcript;
        insights.push({ question: 'How are you ending the day?', score: result.score, insight: result.insight, source: result.source });
      }

      const stateValue = calculateStateFromPostFlight(entry);
      const emotionValue = calculateEmotionFromPostFlight(entry);
      updateState(stateValue);
      updateEmotion(emotionValue);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addPostFlight(entry);
      const t1 = goodThing1.trim();
      const t2 = goodThing2.trim();
      const t3 = goodThing3.trim();
      if (t1 || t2 || t3) {
        addThreeGoodThings(today, [t1 || '', t2 || '', t3 || '']);
      }
      updateWidgetData().catch(() => {});
      setCompletedInsights(insights);
      setCompletedGauges({ state: stateValue, emotion: emotionValue });
      trackPostFlight();
      addSkillPoints(POST_FLIGHT_SKILL_IDS, SKILL_POINTS.postFlight, 'post-flight');
      runAchievementChecks();
      setShowCompleteScreen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteRitualStep = (step: RitualStepDef) => {
    if (completedRitualStepIds.includes(step.id)) return;
    setCompletedRitualStepIds((prev) => [...prev, step.id]);
    const nextDeltas = { ...ritualGaugeDeltas };
    for (const [gauge, delta] of Object.entries(step.deltas)) {
      if (typeof delta === 'number' && delta > 0) {
        addGaugeDelta(gauge as GaugeKey, delta);
        nextDeltas[gauge as GaugeKey] = (nextDeltas[gauge as GaugeKey] ?? 0) + delta;
      }
    }
    setRitualGaugeDeltas(nextDeltas);
  };

  const handleRestWell = () => {
    savePostFlightInsightsToJournal(completedInsights);
    updateWidgetData().catch(() => {});
    router.back();
  };

  const dateLabel = format(new Date(), 'EEEE, MMMM d');

  if (showCompleteScreen) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <PostFlightComplete
          insights={completedInsights}
          gaugesUpdated={completedGauges}
          ritualGaugeDeltas={ritualGaugeDeltas}
          onRestWell={handleRestWell}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Evening Ritual</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🌙</Text>
          <Text style={styles.heroTitle}>Evening Ritual</Text>
          <Text style={styles.heroSubtitle}>How was your day?</Text>
          <Text style={styles.heroDate}>{dateLabel}</Text>
        </View>

        <Text style={styles.ritualSectionLabel}>Quick wins — tap to complete</Text>
        <RitualStepChecklist
          steps={EVENING_RITUAL_STEPS}
          completedIds={completedRitualStepIds}
          onCompleteStep={handleCompleteRitualStep}
          showNumbers
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>📊 HOW DID TODAY GO?</Text>
        <View style={styles.ratingRow}>
          {DAY_RATING_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDayRating(opt.value);
              }}
              style={[styles.ratingBtn, dayRating === opt.value && styles.ratingBtnSelected]}
            >
              <Text style={styles.ratingEmoji}>{opt.emoji}</Text>
              <Text style={[styles.ratingLabel, dayRating === opt.value && styles.ratingLabelSelected]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>✨ WHAT WAS THE HIGHLIGHT OF TODAY?</Text>
        <VoiceQuestion
          question=""
          emojiOptions={['😔', '😕', '😐', '🙂', '🤩']}
          onAnswer={setHighlightAnswer}
          allowEmoji={true}
          allowVoice={true}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>💭 ANYTHING WEIGHING ON YOU?</Text>
        <VoiceQuestion
          question=""
          emojiOptions={['😰', '😟', '😐', '😌', '😊']}
          onAnswer={setWeighingAnswer}
          allowEmoji={true}
          allowVoice={true}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>💛 WHO DO YOU APPRECIATE TODAY?</Text>
        <VoiceQuestion
          question=""
          emojiOptions={[]}
          onAnswer={setAppreciateAnswer}
          allowEmoji={false}
          allowVoice={true}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>🌙 HOW ARE YOU ENDING THE DAY?</Text>
        <VoiceQuestion
          question=""
          emojiOptions={['😫', '😔', '😐', '😌', '😴']}
          onAnswer={setEndingAnswer}
          allowEmoji={true}
          allowVoice={true}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>🏆 ANY WINS TODAY?</Text>
        <Pressable
          style={({ pressed }) => [styles.winCaptureBtn, pressed && styles.winCaptureBtnPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tools/win-capture');
          }}
        >
          <Text style={styles.winCaptureBtnText}>
            {winsToday.length > 0 ? `You logged ${winsToday.length} win${winsToday.length !== 1 ? 's' : ''} today — add another` : 'Capture a win'}
          </Text>
          <Ionicons name="add-circle-outline" size={20} color={ACCENT} />
        </Pressable>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>✨ 3 GOOD THINGS</Text>
        <Text style={styles.sectionHint}>What went well today? Even small things count.</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Good thing 1"
          placeholderTextColor={COLORS.textMuted}
          value={goodThing1}
          onChangeText={setGoodThing1}
          multiline
          maxLength={200}
        />
        <TextInput
          style={[styles.textArea, { marginTop: SPACING.sm }]}
          placeholder="Good thing 2"
          placeholderTextColor={COLORS.textMuted}
          value={goodThing2}
          onChangeText={setGoodThing2}
          multiline
          maxLength={200}
        />
        <TextInput
          style={[styles.textArea, { marginTop: SPACING.sm }]}
          placeholder="Good thing 3"
          placeholderTextColor={COLORS.textMuted}
          value={goodThing3}
          onChangeText={setGoodThing3}
          multiline
          maxLength={200}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>✨ ONE THING THAT WENT WELL</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Even something small counts."
          placeholderTextColor={COLORS.textMuted}
          value={wentWell}
          onChangeText={setWentWell}
          multiline
          maxLength={300}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>🍃 ONE THING TO LET GO OF</Text>
        <TextInput
          style={styles.textArea}
          placeholder="What are you leaving in today? (Frustration, worry, regret...)"
          placeholderTextColor={COLORS.textMuted}
          value={lettingGo}
          onChangeText={setLettingGo}
          multiline
          maxLength={300}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>🎯 DID YOU HONOR YOUR INTENTION?</Text>
        {morningIntention ? (
          <>
            <Text style={styles.intentionRecall}>Your morning intention: &ldquo;{morningIntention}&rdquo;</Text>
            <View style={styles.radioGroup}>
              {INTENTION_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIntentionHonored(opt.value);
                  }}
                  style={styles.radioRow}
                >
                  <View style={[styles.radioOuter, intentionHonored === opt.value && styles.radioOuterSelected]}>
                    {intentionHonored === opt.value && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.radioLabel, intentionHonored === opt.value && styles.radioLabelSelected]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.intentionRecall}>You didn&apos;t set a morning intention today.</Text>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>😴 ANYTHING FOR TOMORROW?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Optional: Note for morning-you"
          placeholderTextColor={COLORS.textMuted}
          value={tomorrowNote}
          onChangeText={setTomorrowNote}
          multiline
          maxLength={200}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>📋 HABITS</Text>
        <Pressable
          style={({ pressed }) => [styles.habitCheckBtn, pressed && styles.habitCheckBtnPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/habits');
          }}
        >
          <Text style={styles.habitCheckBtnText}>Check habits</Text>
          <Ionicons name="chevron-forward" size={18} color={ACCENT} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={handleComplete}
          disabled={dayRating === null || intentionHonored === null || submitting}
          style={({ pressed }) => [
            styles.completeBtn,
            (dayRating === null || intentionHonored === null || submitting) && styles.completeBtnDisabled,
            pressed && styles.completeBtnPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.completeBtnText}>🛬 Day Complete</Text>
          )}
        </Pressable>

        <Text style={styles.goodnight}>Sweet dreams, {firstName} 💤</Text>
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
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingTop: SPACING.xl },
  hero: { alignItems: 'center', marginBottom: SPACING.lg },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { ...TYPOGRAPHY.h2, color: TEXT, marginBottom: 4 },
  heroSubtitle: { fontSize: 20, fontWeight: '600', color: TEXT },
  heroDate: { fontSize: 15, color: TEXT_MUTED },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: SPACING.xl,
  },
  ritualSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  sectionHint: { fontSize: 14, color: TEXT_MUTED, marginBottom: SPACING.md },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ratingBtnSelected: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  ratingEmoji: { fontSize: 24, marginBottom: 4 },
  ratingLabel: { fontSize: 10, color: TEXT_MUTED },
  ratingLabelSelected: { color: ACCENT, fontWeight: '600' },
  textArea: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    color: TEXT,
    fontSize: 16,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  intentionRecall: { fontSize: 15, color: TEXT_MUTED, marginBottom: 12 },
  radioGroup: { gap: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: { borderColor: ACCENT },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACCENT,
  },
  radioLabel: { fontSize: 16, color: TEXT },
  radioLabelSelected: { fontWeight: '600', color: TEXT },
  completeBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeBtnDisabled: { opacity: 0.5 },
  completeBtnPressed: { opacity: 0.9 },
  completeBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  winCaptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  winCaptureBtnPressed: { opacity: 0.9 },
  winCaptureBtnText: { fontSize: 15, color: ACCENT, fontWeight: '600' },
  habitCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  habitCheckBtnPressed: { opacity: 0.9 },
  habitCheckBtnText: { fontSize: 15, color: ACCENT, fontWeight: '600' },
  goodnight: { marginTop: 16, fontSize: 15, color: TEXT_MUTED, textAlign: 'center' },
});
