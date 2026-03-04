/**
 * Post-Flight Debrief — Evening ritual. How was your day, what went well, let go, intention honored, tomorrow note.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useRitualsStore } from '../../src/stores/ritualsStore';
import { useUserStore } from '../../src/stores/userStore';
import type { DayRating, IntentionHonored } from '../../src/types/rituals';
import { updateWidgetData } from '../../src/services/widgetService';
import { format } from 'date-fns';

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

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PostFlightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const firstName = name?.trim().split(/\s+/)[0] || 'there';
  const addPostFlight = useRitualsStore((s) => s.addPostFlight);
  const getMorningIntentionForDate = useRitualsStore((s) => s.getMorningIntentionForDate);

  const [dayRating, setDayRating] = useState<DayRating | null>(null);
  const [wentWell, setWentWell] = useState('');
  const [lettingGo, setLettingGo] = useState('');
  const [intentionHonored, setIntentionHonored] = useState<IntentionHonored | null>(null);
  const [tomorrowNote, setTomorrowNote] = useState('');

  const today = todayStr();
  const morningIntention = getMorningIntentionForDate(today);

  const handleComplete = () => {
    if (dayRating === null || intentionHonored === null) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPostFlight({
      date: today,
      dayRating,
      wentWell: wentWell.trim(),
      lettingGo: lettingGo.trim(),
      intentionHonored,
      tomorrowNote: tomorrowNote.trim() || undefined,
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
        <Text style={styles.headerTitle}>Post-Flight Debrief</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🌙</Text>
          <Text style={styles.heroTitle}>Post-Flight Debrief</Text>
          <Text style={styles.heroSubtitle}>How was your day?</Text>
          <Text style={styles.heroDate}>{dateLabel}</Text>
        </View>

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

        <Pressable
          onPress={handleComplete}
          disabled={dayRating === null || intentionHonored === null}
          style={({ pressed }) => [
            styles.completeBtn,
            (dayRating === null || intentionHonored === null) && styles.completeBtnDisabled,
            pressed && styles.completeBtnPressed,
          ]}
        >
          <Text style={styles.completeBtnText}>🛬 Day Complete</Text>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
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
  goodnight: { marginTop: 16, fontSize: 15, color: TEXT_MUTED, textAlign: 'center' },
});
