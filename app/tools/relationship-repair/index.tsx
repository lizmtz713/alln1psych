/**
 * Relationship Repair — Guided repair attempts after conflict or misunderstanding.
 * Steps: Acknowledge → Take responsibility → Express understanding → Ask what would help.
 * Integrates with Emotion and Connection gauges.
 * Route: /tools/relationship-repair
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Share, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { REPAIR_STEPS, EXAMPLE_REPAIR_PHRASE, buildRepairDraft } from '../../../src/data/relationshipRepair';
import { sendMessageWithSystemPrompt, hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function RelationshipRepairScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(-1); // -1 = intro, 0..3 = steps
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showDraft, setShowDraft] = useState(false);
  const [personalizedDraft, setPersonalizedDraft] = useState<string | null>(null);
  const [personalizeLoading, setPersonalizeLoading] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showDraft) {
      setShowDraft(false);
      setPersonalizedDraft(null);
    } else if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else if (stepIndex === 0) setStepIndex(-1);
    else router.back();
  };

  const currentStep = stepIndex >= 0 ? REPAIR_STEPS[stepIndex] : null;
  const draft = buildRepairDraft(answers);

  const handlePersonalizeWithAI = async () => {
    const baseDraft = draft.trim() || EXAMPLE_REPAIR_PHRASE;
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('AI unavailable', 'Your secure AI session is unavailable. Sign in again or try later.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPersonalizeLoading(true);
    try {
      const systemPrompt = `You help people repair relationships. The user has written a repair message. Make it sound more natural and personal while keeping the same intent and structure. Return ONLY the revised message, no explanation.`;
      const result = await sendMessageWithSystemPrompt([{ role: 'user', content: baseDraft }], systemPrompt);
      const cleaned = (result || '').trim().replace(/^["']|["']$/g, '');
      if (cleaned && !cleaned.startsWith('[AI Error')) setPersonalizedDraft(cleaned);
    } catch {
      Alert.alert('Could not personalize', 'Check your connection and try again.');
    } finally {
      setPersonalizeLoading(false);
    }
  };

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (stepIndex < REPAIR_STEPS.length - 1) setStepIndex(stepIndex + 1);
    else setShowDraft(true);
  };

  const startSteps = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStepIndex(0);
  };

  const shareDraft = async () => {
    try {
      await Share.share({
        message: draft || EXAMPLE_REPAIR_PHRASE,
        title: 'Repair message',
      });
    } catch (_) {}
  };

  // Draft result view
  if (showDraft) {
    const displayText = (personalizedDraft ?? draft).trim() || EXAMPLE_REPAIR_PHRASE;
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Your repair message</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.draftIntro}>
            Use this as a starting point. Say it in your own words when you’re ready.
          </Text>
          <View style={styles.draftCard}>
            <Text style={styles.draftText}>{displayText}</Text>
          </View>
          <Pressable
            style={[styles.secondaryBtn, personalizeLoading && styles.secondaryBtnDisabled]}
            onPress={handlePersonalizeWithAI}
            disabled={personalizeLoading}
          >
            {personalizeLoading ? <ActivityIndicator size="small" color={ACCENT} /> : <Ionicons name="sparkles" size={20} color={ACCENT} />}
            <Text style={styles.secondaryBtnText}>{personalizeLoading ? 'Personalizing…' : 'Personalize with AI'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={async () => { try { await Share.share({ message: displayText, title: 'Repair message' }); } catch (_) {} }}>
            <Ionicons name="share-outline" size={20} color={ACCENT} />
            <Text style={styles.secondaryBtnText}>Share or copy</Text>
          </Pressable>
          <Text style={styles.footerNote}>
            Repair attempts help healthy relationships. This tool supports your Emotion and Connection gauges.
          </Text>
        </ScrollView>
      </View>
    );
  }

  // Intro
  if (stepIndex === -1) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Relationship Repair</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.intro}>
            Research shows that healthy relationships use repair attempts after conflict or misunderstanding. This guide walks you through four steps to shape a repair message.
          </Text>
          <View style={styles.exampleCard}>
            <Text style={styles.exampleLabel}>Example tone</Text>
            <Text style={styles.exampleText}>"{EXAMPLE_REPAIR_PHRASE}"</Text>
          </View>
          <Pressable style={styles.primaryBtn} onPress={startSteps}>
            <Text style={styles.primaryBtnText}>Start</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Step view
  if (!currentStep) return null;
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Step {currentStep.stepNumber} of {REPAIR_STEPS.length}</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepPrompt}>{currentStep.prompt}</Text>
        <TextInput
          style={styles.input}
          placeholder={currentStep.placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={answers[currentStep.id] ?? ''}
          onChangeText={(t) => setAnswers((prev) => ({ ...prev, [currentStep.id]: t }))}
          multiline
        />
        {currentStep.hint && (
          <Text style={styles.hint}>{currentStep.hint}</Text>
        )}
        <Pressable style={styles.primaryBtn} onPress={next}>
          <Text style={styles.primaryBtnText}>
            {stepIndex === REPAIR_STEPS.length - 1 ? 'See my message' : 'Next'}
          </Text>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 20 },
  exampleCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  exampleLabel: { fontSize: 12, fontWeight: '600', color: ACCENT, marginBottom: 6 },
  exampleText: { fontSize: 15, color: TEXT, fontStyle: 'italic', lineHeight: 22 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 8 },
  stepPrompt: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 16 },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 16,
    color: TEXT,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  hint: { fontSize: 13, color: TEXT_MUTED, fontStyle: 'italic', marginBottom: 24 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    gap: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  draftIntro: { fontSize: 15, color: TEXT_MUTED, marginBottom: 16, lineHeight: 22 },
  draftCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: 16,
  },
  draftText: { fontSize: 16, color: TEXT, lineHeight: 24 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  secondaryBtnDisabled: {
    opacity: 0.6,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: ACCENT },
  footerNote: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
