/**
 * Pre-Flight Check — Morning ritual. 60-second check-in: sleep (emoji or voice), feeling, intention, heads up.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useRitualsStore } from '../../src/stores/ritualsStore';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { useUserStore } from '../../src/stores/userStore';
import { useCycleStore } from '../../src/stores/cycleStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import { updateWidgetData } from '../../src/services/widgetService';
import { analyzeCheckInVoice } from '../../src/services/checkInVoice';
import { savePreFlightInsightToJournal } from '../../src/services/insightJournal';
import type { FlightInsightItem } from '../../src/services/insightJournal';
import { VoiceQuestion, type VoiceQuestionAnswer } from '../../src/components/voice';
import { PreFlightComplete } from '../../src/components/rituals/PreFlightComplete';
import { PreFlightForecast } from '../../src/components/forecast/PreFlightForecast';
import { trackPreFlight } from '../../src/hooks/useWrappedTracking';
import { format } from 'date-fns';
import { useGratitudeStore } from '../../src/stores/gratitudeStore';
import { useSleepStore, sleepQualityLabel } from '../../src/stores/sleepStore';
import type { SleepQuality } from '../../src/types/sleep';
import { fetchSleepFromHealthKit } from '../../src/services/healthKitSleep';
import { runAchievementChecks } from '../../src/services/achievementChecker';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const SLEEP_EMOJIS = ['😫', '😕', '😐', '🙂', '😴'];

/** Map sleep 1–5 to Body gauge 0–100 */
function bodyFromSleep(score: number): number {
  const map: Record<number, number> = { 1: 20, 2: 35, 3: 50, 4: 70, 5: 85 };
  return map[score] ?? 50;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PreFlightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const trackWidth = width - SPACING.lg * 4;

  const name = useUserStore((s) => s.name);
  const firstName = name?.trim().split(/\s+/)[0] || 'there';
  const addPreFlight = useRitualsStore((s) => s.addPreFlight);
  const settings = useRitualsStore((s) => s.settings);
  const addMorningGratitude = useGratitudeStore((s) => s.addMorningGratitude);
  const updateBody = useCockpitStore((s) => s.updateBody);
  const getLastNight = useSleepStore((s) => s.getLastNight);
  const addFromPreFlight = useSleepStore((s) => s.addFromPreFlight);
  const setHealthKitCache = useSleepStore((s) => s.setHealthKitCache);
  const members = useCircleStore((s) => s.members) ?? [];
  const getLights = useLightsStore((s) => s.getLights);
  const lights = getLights(members);

  const [sleepAnswer, setSleepAnswer] = useState<VoiceQuestionAnswer | null>(null);
  const [manualSleepHours, setManualSleepHours] = useState('');
  const [manualSleepQuality, setManualSleepQuality] = useState<SleepQuality | null>(null);
  const [morningFeeling, setMorningFeeling] = useState(50);
  const [morningGratitude, setMorningGratitude] = useState('');
  const [intention, setIntention] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [completedInsights, setCompletedInsights] = useState<FlightInsightItem[]>([]);

  const lastNight = getLastNight();
  const hasSleepAnswer = sleepAnswer !== null || (manualSleepHours.trim() !== '' && manualSleepQuality !== null);

  useEffect(() => {
    fetchSleepFromHealthKit().then((res) => {
      if (res.available && res.data) {
        setHealthKitCache(res.data.date, res.data);
      }
    });
  }, [setHealthKitCache]);

  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const phase = useCycleStore((s) => s.currentPhase);
  const upcomingBirthdays = settings.showBirthdays
    ? lights.filter((l) => l.birthday).slice(0, 2)
    : [];

  const handleComplete = async () => {
    if (!hasSleepAnswer) return;
    setSubmitting(true);
    try {
      let sleepQuality: SleepQuality;
      let sleepVoiceUri: string | undefined;
      let sleepVoiceDurationSec: number | undefined;
      let sleepTranscript: string | undefined;
      let manualHours: number | undefined;

      if (sleepAnswer?.type === 'emoji' && sleepAnswer.value != null) {
        sleepQuality = sleepAnswer.value as SleepQuality;
      } else if (sleepAnswer?.type === 'voice') {
        const transcript = sleepAnswer.transcript ?? '';
        const result = await analyzeCheckInVoice('How did you sleep?', transcript, 'sleep');
        sleepQuality = result.score as SleepQuality;
        sleepVoiceUri = sleepAnswer.voiceUri;
        sleepVoiceDurationSec = sleepAnswer.voiceDurationSec;
        sleepTranscript = sleepAnswer.transcript;
        if (result.insight || result.source === 'ai') {
          setCompletedInsights([{ question: 'How did you sleep?', score: result.score, insight: result.insight, source: result.source }]);
        }
      } else if (manualSleepQuality !== null && manualSleepHours.trim() !== '') {
        sleepQuality = manualSleepQuality;
        const hrs = parseFloat(manualSleepHours.replace(',', '.'));
        manualHours = Number.isFinite(hrs) && hrs >= 0 && hrs <= 24 ? hrs : undefined;
      } else {
        setSubmitting(false);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (manualSleepQuality !== null && manualSleepHours.trim() !== '' && !sleepAnswer) {
        addFromPreFlight(todayStr(), manualSleepQuality, manualHours);
      } else {
        addFromPreFlight(todayStr(), sleepQuality);
      }
      addPreFlight({
        date: todayStr(),
        sleepQuality,
        morningFeeling,
        intention: intention.trim() || '',
        ...(sleepVoiceUri && { sleepVoiceUri }),
        ...(sleepVoiceDurationSec != null && { sleepVoiceDurationSec }),
        ...(sleepTranscript && { sleepTranscript }),
      });
      if (morningGratitude.trim()) {
        addMorningGratitude(todayStr(), morningGratitude.trim());
      }
      updateBody(bodyFromSleep(sleepQuality));
      updateWidgetData().catch(() => {});
      trackPreFlight();
      runAchievementChecks();
      setShowCompleteScreen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakeOff = () => {
    if (completedInsights.length > 0) {
      const item = completedInsights[0];
      savePreFlightInsightToJournal(item.insight, item.score);
    }
    updateWidgetData().catch(() => {});
    router.back();
  };

  const dateLabel = format(new Date(), 'EEEE, MMMM d');

  if (showCompleteScreen) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <PreFlightComplete insights={completedInsights} onTakeOff={handleTakeOff} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Pre-Flight Check</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>☀️</Text>
          <Text style={styles.heroTitle}>Pre-Flight Check</Text>
          <Text style={styles.heroGreeting}>Good morning, {firstName}</Text>
          <Text style={styles.heroDate}>{dateLabel}</Text>
        </View>

        <PreFlightForecast />

        {lastNight && (
          <>
            <View style={styles.divider} />
            <View style={styles.sleepContextCard}>
              <Text style={styles.sleepContextTitle}>😴 Last night&apos;s sleep</Text>
              <Text style={styles.sleepContextText}>
                {lastNight.hours > 0 ? `${lastNight.hours} hours` : '—'} · {sleepQualityLabel(lastNight.quality)}
              </Text>
            </View>
          </>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>💤 HOW DID YOU SLEEP?</Text>
        <VoiceQuestion
          question=""
          emojiOptions={SLEEP_EMOJIS}
          allowEmoji={true}
          allowVoice={true}
          onAnswer={setSleepAnswer}
        />
        <Text style={styles.manualSleepLabel}>Or enter manually</Text>
        <View style={styles.manualSleepRow}>
          <TextInput
            style={styles.manualHoursInput}
            placeholder="Hours"
            placeholderTextColor={COLORS.textMuted}
            value={manualSleepHours}
            onChangeText={setManualSleepHours}
            keyboardType="decimal-pad"
          />
          <View style={styles.qualityRow}>
            {([1, 2, 3, 4, 5] as SleepQuality[]).map((q) => (
              <Pressable
                key={q}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setManualSleepQuality(q);
                }}
                style={[styles.qualityBtn, manualSleepQuality === q && styles.qualityBtnSelected]}
              >
                <Text style={styles.qualityBtnEmoji}>{SLEEP_EMOJIS[q - 1]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>🌡️ HOW DO YOU FEEL RIGHT NOW?</Text>
        <View style={styles.sliderWrap}>
          <View
            style={[styles.track, { width: trackWidth }]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              const loc = e.nativeEvent.locationX;
              const pct = Math.max(0, Math.min(1, loc / trackWidth));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMorningFeeling(Math.round(pct * 100));
            }}
          >
            <View style={[styles.trackFill, { width: `${morningFeeling}%` }]} />
            <View style={[styles.thumb, { left: `${morningFeeling}%`, marginLeft: -8 }]} />
          </View>
          <Text style={styles.currentLabel}>Currently: {morningFeeling}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>🙏 ONE THING YOU'RE GRATEFUL FOR</Text>
        <TextInput
          style={styles.intentionInput}
          placeholder="Optional: Start the day with one gratitude."
          placeholderTextColor={COLORS.textMuted}
          value={morningGratitude}
          onChangeText={setMorningGratitude}
          multiline
          maxLength={200}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>🎯 ONE INTENTION FOR TODAY</Text>
        <TextInput
          style={styles.intentionInput}
          placeholder="What's one thing you want to focus on or bring to today?"
          placeholderTextColor={COLORS.textMuted}
          value={intention}
          onChangeText={setIntention}
          multiline
          maxLength={200}
        />
        <Text style={styles.intentionHint}>e.g., "Be patient" "Rest when I need to" "Finish the report"</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>📅 HEADS UP — YOUR DAY</Text>
        <View style={styles.headsUpCard}>
          {settings.showCalendarEvents && (
            <Text style={styles.headsUpRow}>📅 3 meetings today</Text>
          )}
          {upcomingBirthdays.length > 0 && (
            <Text style={styles.headsUpRow}>🎂 {upcomingBirthdays[0] ? `${upcomingBirthdays[0].name}'s birthday!` : "A Light's birthday!"}</Text>
          )}
          {settings.showCycleInfo && dayOfCycle != null && (
            <Text style={styles.headsUpRow}>🌙 Day {dayOfCycle} of cycle{phase ? ` (${phase})` : ''}</Text>
          )}
          {!settings.showCalendarEvents && upcomingBirthdays.length === 0 && (!settings.showCycleInfo || dayOfCycle == null) && (
            <Text style={styles.headsUpEmpty}>Nothing on the radar. You're clear for takeoff.</Text>
          )}
        </View>

        <View style={styles.divider} />

        <Pressable
          onPress={handleComplete}
          disabled={!hasSleepAnswer || submitting}
          style={({ pressed }) => [
            styles.readyBtn,
            (!hasSleepAnswer || submitting) && styles.readyBtnDisabled,
            pressed && styles.readyBtnPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.readyBtnText}>✈️ Ready for Takeoff</Text>
          )}
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
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingTop: SPACING.xl },
  hero: { alignItems: 'center', marginBottom: SPACING.lg },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { ...TYPOGRAPHY.h2, color: TEXT, marginBottom: 4 },
  heroGreeting: { fontSize: 20, fontWeight: '600', color: TEXT },
  heroDate: { fontSize: 15, color: TEXT_MUTED },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: SPACING.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  sliderWrap: { marginTop: 8 },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.inputSurface,
    overflow: 'visible',
    position: 'relative',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  thumb: {
    position: 'absolute',
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: TEXT,
  },
  currentLabel: { marginTop: 12, fontSize: 15, color: TEXT_MUTED, textAlign: 'center' },
  intentionInput: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    color: TEXT,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  intentionHint: { marginTop: 8, fontSize: 13, color: TEXT_MUTED },
  sleepContextCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
  },
  sleepContextTitle: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED, marginBottom: 4 },
  sleepContextText: { fontSize: 16, color: TEXT },
  manualSleepLabel: { fontSize: 13, color: TEXT_MUTED, marginTop: 12, marginBottom: 8 },
  manualSleepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  manualHoursInput: {
    width: 72,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    fontSize: 16,
    color: TEXT,
  },
  qualityRow: { flexDirection: 'row', gap: 6 },
  qualityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityBtnSelected: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  qualityBtnEmoji: { fontSize: 20 },
  headsUpCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
  },
  headsUpRow: { fontSize: 15, color: TEXT, marginBottom: 8 },
  headsUpEmpty: { fontSize: 15, color: TEXT_MUTED },
  readyBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  readyBtnDisabled: { opacity: 0.5 },
  readyBtnPressed: { opacity: 0.9 },
  readyBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
