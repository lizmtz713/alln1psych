/**
 * Pre-Flight Check — Morning ritual. 60-second check-in: sleep, feeling, intention, heads up.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useRitualsStore } from '../../src/stores/ritualsStore';
import { useUserStore } from '../../src/stores/userStore';
import type { SleepQuality } from '../../src/types/rituals';
import { useCycleStore } from '../../src/stores/cycleStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import { updateWidgetData } from '../../src/services/widgetService';
import { format } from 'date-fns';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const SLEEP_OPTIONS: { value: SleepQuality; emoji: string; label: string }[] = [
  { value: 1, emoji: '😫', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😴', label: 'Great' },
];

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
  const members = useCircleStore((s) => s.members) ?? [];
  const getLights = useLightsStore((s) => s.getLights);
  const lights = getLights(members);

  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [morningFeeling, setMorningFeeling] = useState(50);
  const [intention, setIntention] = useState('');

  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const phase = useCycleStore((s) => s.currentPhase);
  const upcomingBirthdays = settings.showBirthdays
    ? lights.filter((l) => l.birthday).slice(0, 2)
    : [];

  const handleComplete = () => {
    if (sleepQuality === null) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPreFlight({
      date: todayStr(),
      sleepQuality,
      morningFeeling,
      intention: intention.trim() || '',
    });
    updateWidgetData().catch(() => {});
    router.back();
  };

  const dateLabel = format(new Date(), 'EEEE, MMMM d');

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

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>💤 HOW DID YOU SLEEP?</Text>
        <View style={styles.sleepRow}>
          {SLEEP_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSleepQuality(opt.value);
              }}
              style={[styles.sleepBtn, sleepQuality === opt.value && styles.sleepBtnSelected]}
            >
              <Text style={styles.sleepEmoji}>{opt.emoji}</Text>
              <Text style={[styles.sleepLabel, sleepQuality === opt.value && styles.sleepLabelSelected]}>{opt.label}</Text>
            </Pressable>
          ))}
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
          disabled={sleepQuality === null}
          style={({ pressed }) => [
            styles.readyBtn,
            sleepQuality === null && styles.readyBtnDisabled,
            pressed && styles.readyBtnPressed,
          ]}
        >
          <Text style={styles.readyBtnText}>✈️ Ready for Takeoff</Text>
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
  sleepRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  sleepBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sleepBtnSelected: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  sleepEmoji: { fontSize: 28, marginBottom: 4 },
  sleepLabel: { fontSize: 11, color: TEXT_MUTED },
  sleepLabelSelected: { color: ACCENT, fontWeight: '600' },
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
