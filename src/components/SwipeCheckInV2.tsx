/**
 * SwipeCheckInV2 — Question-based check-in with swipe navigation
 * 
 * FIXED: Users answer QUESTIONS, not numbers.
 * The score is calculated from their answers.
 * 
 * - Swipe between gauges (navigation)
 * - Tap to answer questions
 * - Questions rotate to stay fresh
 * - Scores calculated behind the scenes
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../lib/constants';

type GaugeName = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

interface SwipeCheckInV2Props {
  onComplete: (values: Record<GaugeName, number>) => void;
  onCancel?: () => void;
  variant?: number; // Which question variant to use (rotates daily)
}

// ═══════════════════════════════════════════════════════════════
// BODY: Checklist style (did you do these things?)
// ═══════════════════════════════════════════════════════════════

const BODY_QUESTIONS = [
  // Variant 0: Basic needs
  {
    prompt: "Let's check in on your body",
    items: [
      { id: 'sleep', label: 'Slept okay?', emoji: '😴' },
      { id: 'food', label: 'Eaten today?', emoji: '🍽️' },
      { id: 'water', label: 'Had water?', emoji: '💧' },
      { id: 'move', label: 'Moved your body?', emoji: '🚶' },
    ],
  },
  // Variant 1: How does it feel
  {
    prompt: "How's your body right now?",
    items: [
      { id: 'energy', label: 'Have energy?', emoji: '⚡' },
      { id: 'pain', label: 'Pain-free?', emoji: '💪' },
      { id: 'rested', label: 'Feel rested?', emoji: '🛏️' },
      { id: 'fueled', label: 'Feel fueled?', emoji: '🔋' },
    ],
  },
  // Variant 2: Quick physical check
  {
    prompt: "Quick body scan",
    items: [
      { id: 'tension', label: 'Relaxed (not tense)?', emoji: '😌' },
      { id: 'breath', label: 'Breathing easy?', emoji: '🌬️' },
      { id: 'stomach', label: 'Stomach okay?', emoji: '🫃' },
      { id: 'head', label: 'Head clear?', emoji: '🧠' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// STATE: Single choice (nervous system regulation)
// ═══════════════════════════════════════════════════════════════

const STATE_OPTIONS = [
  { label: 'Calm', value: 100, emoji: '😌', desc: 'Regulated. Clear thinking.' },
  { label: 'Alert', value: 75, emoji: '👀', desc: 'Focused. Ready for action.' },
  { label: 'Activated', value: 50, emoji: '😤', desc: 'Fight-or-flight starting.' },
  { label: 'Threatened', value: 25, emoji: '😰', desc: 'Reactions amplified.' },
  { label: 'Shutdown', value: 10, emoji: '😶', desc: 'Frozen or numb.' },
];

const STATE_QUESTIONS = [
  "How regulated do you feel?",
  "Where's your nervous system?",
  "What state are you in right now?",
];

// ═══════════════════════════════════════════════════════════════
// EMOTION: Multi-select (what are you feeling?)
// ═══════════════════════════════════════════════════════════════

const EMOTION_OPTIONS = [
  { label: 'Calm', emoji: '😌', valence: 'positive' },
  { label: 'Happy', emoji: '😊', valence: 'positive' },
  { label: 'Grateful', emoji: '🙏', valence: 'positive' },
  { label: 'Excited', emoji: '🤩', valence: 'positive' },
  { label: 'Sad', emoji: '😢', valence: 'negative' },
  { label: 'Anxious', emoji: '😰', valence: 'negative' },
  { label: 'Angry', emoji: '😠', valence: 'negative' },
  { label: 'Overwhelmed', emoji: '🤯', valence: 'negative' },
  { label: 'Numb', emoji: '😶', valence: 'neutral' },
  { label: 'Confused', emoji: '😕', valence: 'neutral' },
];

const EMOTION_QUESTIONS = [
  "What are you feeling? (pick all that apply)",
  "Select the emotions present right now",
  "What's showing up emotionally?",
];

// ═══════════════════════════════════════════════════════════════
// CONNECTION: Scale with descriptors
// ═══════════════════════════════════════════════════════════════

const CONNECTION_OPTIONS = [
  { label: 'Very connected', value: 100, emoji: '🤗', desc: 'Feel close to people who matter' },
  { label: 'Somewhat connected', value: 75, emoji: '🙂', desc: 'Decent relationships, could be closer' },
  { label: 'A bit isolated', value: 50, emoji: '😐', desc: 'Missing connection' },
  { label: 'Lonely', value: 25, emoji: '😔', desc: 'Feeling alone' },
  { label: 'Completely isolated', value: 10, emoji: '🏝️', desc: 'No one to turn to' },
];

const CONNECTION_QUESTIONS = [
  "How connected do you feel to others?",
  "Rate your sense of connection",
  "How's your relationship energy?",
];

// ═══════════════════════════════════════════════════════════════
// DIRECTION: Scale with descriptors
// ═══════════════════════════════════════════════════════════════

const DIRECTION_OPTIONS = [
  { label: 'Clear purpose', value: 100, emoji: '🎯', desc: 'Know where I\'m going' },
  { label: 'Mostly clear', value: 75, emoji: '🧭', desc: 'General direction, some fog' },
  { label: 'Uncertain', value: 50, emoji: '🤔', desc: 'Not sure what I\'m doing' },
  { label: 'Lost', value: 25, emoji: '😵‍💫', desc: 'No sense of direction' },
  { label: 'Completely stuck', value: 10, emoji: '🛑', desc: 'Can\'t see a path forward' },
];

const DIRECTION_QUESTIONS = [
  "Do you have a sense of direction?",
  "How clear is your purpose right now?",
  "Where are you headed?",
];

// ═══════════════════════════════════════════════════════════════
// ALIGNMENT: Scale with descriptors
// ═══════════════════════════════════════════════════════════════

const ALIGNMENT_OPTIONS = [
  { label: 'Fully aligned', value: 100, emoji: '⭐', desc: 'Living my values' },
  { label: 'Mostly aligned', value: 75, emoji: '✨', desc: 'Some compromises but okay' },
  { label: 'Drifting', value: 50, emoji: '🌊', desc: 'Not quite myself lately' },
  { label: 'Off track', value: 25, emoji: '😣', desc: 'Choices don\'t match values' },
  { label: 'Betraying myself', value: 10, emoji: '💔', desc: 'Acting against who I am' },
];

const ALIGNMENT_QUESTIONS = [
  "Are you living in alignment with your values?",
  "How aligned do your choices feel?",
  "Are you being true to yourself?",
];

// ═══════════════════════════════════════════════════════════════
// SCORE CALCULATORS
// ═══════════════════════════════════════════════════════════════

function calculateBodyScore(checked: string[]): number {
  // Each checked item = 25 points (4 items = 100)
  return checked.length * 25;
}

function calculateEmotionScore(selected: string[]): number {
  if (selected.length === 0) return 50;
  
  const options = EMOTION_OPTIONS.filter(o => selected.includes(o.label));
  const positive = options.filter(o => o.valence === 'positive').length;
  const negative = options.filter(o => o.valence === 'negative').length;
  const neutral = options.filter(o => o.valence === 'neutral').length;
  
  // More positive = higher score
  // More negative = lower score
  // Numb/Confused = mid-low
  if (selected.includes('Numb')) return 30;
  if (negative > positive) return Math.max(20, 50 - (negative * 15));
  if (positive > negative) return Math.min(100, 50 + (positive * 15));
  return 50;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function SwipeCheckInV2({ onComplete, onCancel, variant = 0 }: SwipeCheckInV2Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{
    body: string[];
    state: number;
    emotion: string[];
    connection: number;
    direction: number;
    alignment: number;
  }>({
    body: [],
    state: -1,
    emotion: [],
    connection: -1,
    direction: -1,
    alignment: -1,
  });
  
  const steps: GaugeName[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  const currentStep = steps[step];
  
  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
    } else {
      // Calculate final scores and complete
      const finalValues: Record<GaugeName, number> = {
        body: calculateBodyScore(answers.body),
        state: answers.state,
        emotion: calculateEmotionScore(answers.emotion),
        connection: answers.connection,
        direction: answers.direction,
        alignment: answers.alignment,
      };
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(finalValues);
    }
  }, [step, answers, onComplete]);
  
  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Complete with what we have
      const finalValues: Record<GaugeName, number> = {
        body: answers.body.length > 0 ? calculateBodyScore(answers.body) : -1,
        state: answers.state,
        emotion: answers.emotion.length > 0 ? calculateEmotionScore(answers.emotion) : -1,
        connection: answers.connection,
        direction: answers.direction,
        alignment: answers.alignment,
      };
      onComplete(finalValues);
    }
  }, [step, answers, onComplete]);
  
  // Get question variant (rotates)
  const v = variant % 3;
  
  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {steps.map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              i === step && styles.progressDotActive,
              i < step && styles.progressDotDone,
            ]}
          />
        ))}
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* BODY */}
        {currentStep === 'body' && (
          <BodyCheckIn
            variant={v}
            checked={answers.body}
            onChange={(items) => setAnswers({ ...answers, body: items })}
          />
        )}
        
        {/* STATE */}
        {currentStep === 'state' && (
          <SingleSelectCheckIn
            question={STATE_QUESTIONS[v]}
            options={STATE_OPTIONS}
            value={answers.state}
            onChange={(val) => setAnswers({ ...answers, state: val })}
            color={COLORS.gauges.state}
          />
        )}
        
        {/* EMOTION */}
        {currentStep === 'emotion' && (
          <MultiSelectCheckIn
            question={EMOTION_QUESTIONS[v]}
            options={EMOTION_OPTIONS}
            selected={answers.emotion}
            onChange={(items) => setAnswers({ ...answers, emotion: items })}
            color={COLORS.gauges.emotion}
          />
        )}
        
        {/* CONNECTION */}
        {currentStep === 'connection' && (
          <SingleSelectCheckIn
            question={CONNECTION_QUESTIONS[v]}
            options={CONNECTION_OPTIONS}
            value={answers.connection}
            onChange={(val) => setAnswers({ ...answers, connection: val })}
            color={COLORS.gauges.connection}
          />
        )}
        
        {/* DIRECTION */}
        {currentStep === 'direction' && (
          <SingleSelectCheckIn
            question={DIRECTION_QUESTIONS[v]}
            options={DIRECTION_OPTIONS}
            value={answers.direction}
            onChange={(val) => setAnswers({ ...answers, direction: val })}
            color={COLORS.gauges.direction}
          />
        )}
        
        {/* ALIGNMENT */}
        {currentStep === 'alignment' && (
          <SingleSelectCheckIn
            question={ALIGNMENT_QUESTIONS[v]}
            options={ALIGNMENT_OPTIONS}
            value={answers.alignment}
            onChange={(val) => setAnswers({ ...answers, alignment: val })}
            color={COLORS.gauges.alignment}
          />
        )}
      </ScrollView>
      
      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentLight]}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {step === steps.length - 1 ? 'Done' : 'Next'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function BodyCheckIn({
  variant,
  checked,
  onChange,
}: {
  variant: number;
  checked: string[];
  onChange: (items: string[]) => void;
}) {
  const config = BODY_QUESTIONS[variant] || BODY_QUESTIONS[0];
  
  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (checked.includes(id)) {
      onChange(checked.filter(i => i !== id));
    } else {
      onChange([...checked, id]);
    }
  };
  
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.emoji}>🫀</Text>
      <Text style={styles.question}>{config.prompt}</Text>
      
      <View style={styles.checklistGrid}>
        {config.items.map((item) => {
          const isChecked = checked.includes(item.id);
          return (
            <Pressable
              key={item.id}
              style={[styles.checklistItem, isChecked && styles.checklistItemActive]}
              onPress={() => toggle(item.id)}
            >
              <Text style={styles.checklistEmoji}>{item.emoji}</Text>
              <Text style={[styles.checklistLabel, isChecked && styles.checklistLabelActive]}>
                {item.label}
              </Text>
              <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      
      <Text style={styles.hint}>
        {checked.length}/4 — {checked.length === 4 ? 'All systems go!' : 'Tap all that apply'}
      </Text>
    </View>
  );
}

function SingleSelectCheckIn({
  question,
  options,
  value,
  onChange,
  color,
}: {
  question: string;
  options: { label: string; value: number; emoji: string; desc: string }[];
  value: number;
  onChange: (value: number) => void;
  color: string;
}) {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.question}>{question}</Text>
      
      <View style={styles.optionsColumn}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <Pressable
              key={opt.label}
              style={[
                styles.optionRow,
                isSelected && { backgroundColor: `${color}20`, borderColor: color },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(opt.value);
              }}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, isSelected && { color }]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MultiSelectCheckIn({
  question,
  options,
  selected,
  onChange,
  color,
}: {
  question: string;
  options: { label: string; emoji: string; valence: string }[];
  selected: string[];
  onChange: (items: string[]) => void;
  color: string;
}) {
  const toggle = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(label)) {
      onChange(selected.filter(l => l !== label));
    } else {
      onChange([...selected, label]);
    }
  };
  
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.question}>{question}</Text>
      
      <View style={styles.emotionGrid}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.label);
          return (
            <Pressable
              key={opt.label}
              style={[
                styles.emotionChip,
                isSelected && { backgroundColor: `${color}30`, borderColor: color },
              ]}
              onPress={() => toggle(opt.label)}
            >
              <Text style={styles.emotionChipEmoji}>{opt.emoji}</Text>
              <Text style={[styles.emotionChipLabel, isSelected && { color }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      
      <Text style={styles.hint}>
        {selected.length === 0 ? 'Tap all that apply' : `${selected.length} selected`}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: COLORS.accent,
  },
  progressDotDone: {
    backgroundColor: COLORS.success,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },
  
  // Question container
  questionContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  question: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  hint: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
  
  // Checklist (Body)
  checklistGrid: {
    width: '100%',
    gap: SPACING.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checklistItemActive: {
    backgroundColor: `${COLORS.gauges.body}15`,
    borderColor: COLORS.gauges.body,
  },
  checklistEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  checklistLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    flex: 1,
  },
  checklistLabelActive: {
    color: COLORS.gauges.body,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.gauges.body,
    borderColor: COLORS.gauges.body,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Single select options
  optionsColumn: {
    width: '100%',
    gap: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
  },
  optionDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  
  // Emotion grid (multi-select)
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emotionChipEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  emotionChipLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
  
  // Actions
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  skipButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  skipText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.textSecondary,
  },
  nextButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  nextGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  nextText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default SwipeCheckInV2;
