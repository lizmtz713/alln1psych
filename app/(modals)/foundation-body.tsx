/**
 * PHOSM: Body Baseline Setup
 * 
 * Personalization layer for the Body gauge.
 * User defines THEIR baselines (sleep, nutrition, movement, health context).
 * AI assists throughout — suggests based on check-in history.
 * 
 * The science (biological psychology) is already defined.
 * This captures what those needs look like FOR THIS USER.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useFoundationStore } from '../../src/stores/foundationStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';

type Step = 'intro' | 'sleep' | 'fuel' | 'movement' | 'health' | 'done';

// Body gauge color
const BODY_AMBER = '#C9956B';

interface BodyBaseline {
  // Sleep
  idealSleepHours: number;
  preferredBedtime: string;
  preferredWakeTime: string;
  sleepChallenges: string[];
  // Nutrition
  mealsPerDay: number;
  hydrationGoal: number;
  dietaryNotes: string;
  // Movement
  exerciseTypes: string[];
  exerciseDaysPerWeek: number;
  movementBarriers: string[];
  // Health context (optional)
  healthNotes: string;
}

const defaultBaseline: BodyBaseline = {
  idealSleepHours: 7,
  preferredBedtime: '10:00 PM',
  preferredWakeTime: '6:00 AM',
  sleepChallenges: [],
  mealsPerDay: 3,
  hydrationGoal: 8,
  dietaryNotes: '',
  exerciseTypes: [],
  exerciseDaysPerWeek: 3,
  movementBarriers: [],
  healthNotes: '',
};

const SLEEP_HOURS = [5, 6, 7, 8, 9, 10];
const BEDTIMES = ['9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '1:00 AM', 'Varies'];
const WAKE_TIMES = ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', 'Varies'];

const SLEEP_CHALLENGES = [
  { id: 'falling', label: 'Trouble falling asleep' },
  { id: 'staying', label: 'Wake up during night' },
  { id: 'waking', label: 'Hard to wake up' },
  { id: 'irregular', label: 'Irregular schedule' },
  { id: 'quality', label: 'Sleep but still tired' },
];

const MEALS_OPTIONS = [
  { value: 1, label: '1 meal', desc: 'Intermittent fasting / OMAD' },
  { value: 2, label: '2 meals', desc: 'Breakfast skipper or light eater' },
  { value: 3, label: '3 meals', desc: 'Traditional schedule' },
  { value: 4, label: 'Grazing', desc: 'Small meals throughout' },
];

const HYDRATION_OPTIONS = [4, 6, 8, 10, 12];

const EXERCISE_TYPES = [
  { id: 'walking', label: 'Walking', emoji: '🚶' },
  { id: 'running', label: 'Running', emoji: '🏃' },
  { id: 'gym', label: 'Gym / Weights', emoji: '🏋️' },
  { id: 'yoga', label: 'Yoga / Stretching', emoji: '🧘' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'dance', label: 'Dancing', emoji: '💃' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
  { id: 'hiit', label: 'HIIT / Cardio', emoji: '🔥' },
];

const MOVEMENT_BARRIERS = [
  { id: 'desk', label: 'Desk job / sedentary work' },
  { id: 'time', label: 'Time constraints' },
  { id: 'pain', label: 'Chronic pain / injury' },
  { id: 'motivation', label: 'Motivation struggles' },
  { id: 'access', label: 'Limited access to gym/space' },
  { id: 'energy', label: 'Low energy' },
];

export default function PHOSMBodyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Get existing baseline if any
  const existingBaseline = useFoundationStore((s) => s.bodyBaseline);
  const setBodyBaseline = useFoundationStore((s) => s.setBodyBaseline);
  
  const [step, setStep] = useState<Step>('intro');
  const [baseline, setBaseline] = useState<BodyBaseline>(existingBaseline || defaultBaseline);

  const handleClose = () => router.back();

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const steps: Step[] = ['intro', 'sleep', 'fuel', 'movement', 'health', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      if (step === 'health') {
        // Save before showing done
        setBodyBaseline(baseline);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const steps: Step[] = ['intro', 'sleep', 'fuel', 'movement', 'health', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const toggleSleepChallenge = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBaseline((prev) => ({
      ...prev,
      sleepChallenges: prev.sleepChallenges.includes(id)
        ? prev.sleepChallenges.filter((c) => c !== id)
        : [...prev.sleepChallenges, id],
    }));
  };

  const toggleExerciseType = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBaseline((prev) => ({
      ...prev,
      exerciseTypes: prev.exerciseTypes.includes(id)
        ? prev.exerciseTypes.filter((t) => t !== id)
        : [...prev.exerciseTypes, id],
    }));
  };

  const toggleMovementBarrier = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBaseline((prev) => ({
      ...prev,
      movementBarriers: prev.movementBarriers.includes(id)
        ? prev.movementBarriers.filter((b) => b !== id)
        : [...prev.movementBarriers, id],
    }));
  };

  const stepNumber = ['intro', 'sleep', 'fuel', 'movement', 'health', 'done'].indexOf(step);
  const totalSteps = 5; // Not counting intro and done

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name={step === 'intro' ? 'close' : 'arrow-back'} size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Body Baseline</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress */}
        {step !== 'intro' && step !== 'done' && (
          <View style={styles.progressRow}>
            {[1, 2, 3, 4].map((n) => (
              <View
                key={n}
                style={[
                  styles.progressDot,
                  stepNumber >= n && styles.progressDotFilled,
                ]}
              />
            ))}
          </View>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* INTRO */}
            {step === 'intro' && (
              <View style={styles.stepContainer}>
                <Text style={styles.emoji}>🫀</Text>
                <Text style={styles.title}>Your Body Baseline</Text>
                <Text style={styles.subtitle}>
                  The science of body health is clear:{'\n'}
                  sleep, nutrition, hydration, movement.{'\n\n'}
                  But what do those look like <Text style={styles.emphasis}>for you</Text>?
                </Text>
                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    We'll capture YOUR ideal sleep, YOUR eating patterns, YOUR movement preferences.
                    {'\n\n'}
                    This helps your check-ins be specific to you — not generic.
                  </Text>
                </View>
                <View style={styles.aiHint}>
                  <Ionicons name="sparkles" size={16} color={BODY_AMBER} />
                  <Text style={styles.aiHintText}>AI will use this to personalize your guidance</Text>
                </View>
              </View>
            )}

            {/* SLEEP */}
            {step === 'sleep' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>💤 Sleep</Text>
                <Text style={styles.subtitle}>
                  How much sleep does YOUR body need to feel good?
                </Text>

                <Text style={styles.sectionLabel}>Ideal hours of sleep</Text>
                <View style={styles.optionRow}>
                  {SLEEP_HOURS.map((h) => (
                    <Pressable
                      key={h}
                      style={[
                        styles.optionChip,
                        baseline.idealSleepHours === h && styles.optionChipSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setBaseline((prev) => ({ ...prev, idealSleepHours: h }));
                      }}
                    >
                      <Text style={[
                        styles.optionChipText,
                        baseline.idealSleepHours === h && styles.optionChipTextSelected,
                      ]}>
                        {h}h
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Preferred bedtime</Text>
                <View style={styles.optionRow}>
                  {BEDTIMES.map((t) => (
                    <Pressable
                      key={t}
                      style={[
                        styles.optionChipWide,
                        baseline.preferredBedtime === t && styles.optionChipSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setBaseline((prev) => ({ ...prev, preferredBedtime: t }));
                      }}
                    >
                      <Text style={[
                        styles.optionChipText,
                        baseline.preferredBedtime === t && styles.optionChipTextSelected,
                      ]}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Preferred wake time</Text>
                <View style={styles.optionRow}>
                  {WAKE_TIMES.map((t) => (
                    <Pressable
                      key={t}
                      style={[
                        styles.optionChipWide,
                        baseline.preferredWakeTime === t && styles.optionChipSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setBaseline((prev) => ({ ...prev, preferredWakeTime: t }));
                      }}
                    >
                      <Text style={[
                        styles.optionChipText,
                        baseline.preferredWakeTime === t && styles.optionChipTextSelected,
                      ]}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Any sleep challenges?</Text>
                <View style={styles.checkList}>
                  {SLEEP_CHALLENGES.map((c) => {
                    const selected = baseline.sleepChallenges.includes(c.id);
                    return (
                      <Pressable
                        key={c.id}
                        style={[styles.checkItem, selected && styles.checkItemSelected]}
                        onPress={() => toggleSleepChallenge(c.id)}
                      >
                        <Ionicons
                          name={selected ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={selected ? BODY_AMBER : COLORS.textMuted}
                        />
                        <Text style={[styles.checkLabel, selected && styles.checkLabelSelected]}>
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* FUEL */}
            {step === 'fuel' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>🍽️ Fuel</Text>
                <Text style={styles.subtitle}>
                  How does YOUR body prefer to be fueled?
                </Text>

                <Text style={styles.sectionLabel}>Meals per day</Text>
                <View style={styles.mealOptions}>
                  {MEALS_OPTIONS.map((m) => (
                    <Pressable
                      key={m.value}
                      style={[
                        styles.mealOption,
                        baseline.mealsPerDay === m.value && styles.mealOptionSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setBaseline((prev) => ({ ...prev, mealsPerDay: m.value }));
                      }}
                    >
                      <Text style={[
                        styles.mealOptionLabel,
                        baseline.mealsPerDay === m.value && styles.mealOptionLabelSelected,
                      ]}>
                        {m.label}
                      </Text>
                      <Text style={styles.mealOptionDesc}>{m.desc}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Daily water goal (glasses)</Text>
                <View style={styles.optionRow}>
                  {HYDRATION_OPTIONS.map((g) => (
                    <Pressable
                      key={g}
                      style={[
                        styles.optionChip,
                        baseline.hydrationGoal === g && styles.optionChipSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setBaseline((prev) => ({ ...prev, hydrationGoal: g }));
                      }}
                    >
                      <Text style={[
                        styles.optionChipText,
                        baseline.hydrationGoal === g && styles.optionChipTextSelected,
                      ]}>
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Dietary notes (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Vegetarian, allergies, restrictions..."
                  placeholderTextColor={COLORS.textMuted}
                  value={baseline.dietaryNotes}
                  onChangeText={(t) => setBaseline((prev) => ({ ...prev, dietaryNotes: t }))}
                  maxLength={100}
                />
              </View>
            )}

            {/* MOVEMENT */}
            {step === 'movement' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>🏃 Movement</Text>
                <Text style={styles.subtitle}>
                  What kind of movement do YOU enjoy?{'\n'}
                  Not what you "should" do — what you'll actually do.
                </Text>

                <Text style={styles.sectionLabel}>Exercise types you enjoy</Text>
                <View style={styles.exerciseGrid}>
                  {EXERCISE_TYPES.map((e) => {
                    const selected = baseline.exerciseTypes.includes(e.id);
                    return (
                      <Pressable
                        key={e.id}
                        style={[styles.exerciseChip, selected && styles.exerciseChipSelected]}
                        onPress={() => toggleExerciseType(e.id)}
                      >
                        <Text style={styles.exerciseEmoji}>{e.emoji}</Text>
                        <Text style={[styles.exerciseLabel, selected && styles.exerciseLabelSelected]}>
                          {e.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.sectionLabel}>Realistic days per week</Text>
                <View style={styles.optionRow}>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <Pressable
                      key={d}
                      style={[
                        styles.optionChip,
                        baseline.exerciseDaysPerWeek === d && styles.optionChipSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setBaseline((prev) => ({ ...prev, exerciseDaysPerWeek: d }));
                      }}
                    >
                      <Text style={[
                        styles.optionChipText,
                        baseline.exerciseDaysPerWeek === d && styles.optionChipTextSelected,
                      ]}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>What makes movement harder?</Text>
                <View style={styles.checkList}>
                  {MOVEMENT_BARRIERS.map((b) => {
                    const selected = baseline.movementBarriers.includes(b.id);
                    return (
                      <Pressable
                        key={b.id}
                        style={[styles.checkItem, selected && styles.checkItemSelected]}
                        onPress={() => toggleMovementBarrier(b.id)}
                      >
                        <Ionicons
                          name={selected ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={selected ? BODY_AMBER : COLORS.textMuted}
                        />
                        <Text style={[styles.checkLabel, selected && styles.checkLabelSelected]}>
                          {b.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* HEALTH CONTEXT */}
            {step === 'health' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>🏥 Health Context</Text>
                <Text style={styles.subtitle}>
                  This is optional, but helps AI understand YOUR normal.
                </Text>

                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    Any health conditions, medications, or factors that affect your daily energy or body state?
                    {'\n\n'}
                    This stays private and just helps personalize your experience.
                  </Text>
                </View>

                <TextInput
                  style={[styles.textInput, styles.textInputLarge]}
                  placeholder="e.g., ADHD, thyroid condition, chronic fatigue, certain medications..."
                  placeholderTextColor={COLORS.textMuted}
                  value={baseline.healthNotes}
                  onChangeText={(t) => setBaseline((prev) => ({ ...prev, healthNotes: t }))}
                  multiline
                  maxLength={300}
                  textAlignVertical="top"
                />

                <Pressable style={styles.skipLink} onPress={handleNext}>
                  <Text style={styles.skipLinkText}>Skip — I'd rather not share</Text>
                </Pressable>
              </View>
            )}

            {/* DONE */}
            {step === 'done' && (
              <View style={styles.stepContainer}>
                <Text style={styles.emoji}>✨</Text>
                <Text style={styles.title}>Body Baseline Set</Text>
                
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>💤 Sleep</Text>
                    <Text style={styles.summaryValue}>
                      {baseline.idealSleepHours}h ideal, {baseline.preferredBedtime} bedtime
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>🍽️ Fuel</Text>
                    <Text style={styles.summaryValue}>
                      {baseline.mealsPerDay} meals, {baseline.hydrationGoal} glasses water
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>🏃 Movement</Text>
                    <Text style={styles.summaryValue}>
                      {baseline.exerciseDaysPerWeek}x/week
                      {baseline.exerciseTypes.length > 0 && ` — ${baseline.exerciseTypes.slice(0, 2).join(', ')}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    Your Body check-in will now reference YOUR baselines.
                    {'\n\n'}
                    "You got 5h sleep (below your {baseline.idealSleepHours}h baseline)"
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Button */}
          <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + SPACING.md }]}>
            <Pressable
              style={styles.primaryBtn}
              onPress={step === 'done' ? handleClose : handleNext}
            >
              <Text style={styles.primaryBtnText}>
                {step === 'intro' ? "Let's Set It Up" : step === 'done' ? 'Done' : 'Continue'}
              </Text>
              {step !== 'done' && <Ionicons name="arrow-forward" size={20} color="#000" />}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressDotFilled: {
    backgroundColor: BODY_AMBER,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  stepContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  emphasis: {
    color: BODY_AMBER,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.md,
  },
  cardText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  aiHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  aiHintText: {
    fontSize: 13,
    color: BODY_AMBER,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipWide: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipSelected: {
    backgroundColor: BODY_AMBER + '22',
    borderColor: BODY_AMBER,
  },
  optionChipText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  optionChipTextSelected: {
    color: BODY_AMBER,
    fontWeight: '600',
  },
  checkList: {
    width: '100%',
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  checkItemSelected: {
    backgroundColor: BODY_AMBER + '15',
  },
  checkLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  checkLabelSelected: {
    color: COLORS.text,
  },
  mealOptions: {
    width: '100%',
    gap: 10,
  },
  mealOption: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealOptionSelected: {
    backgroundColor: BODY_AMBER + '15',
    borderColor: BODY_AMBER,
  },
  mealOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  mealOptionLabelSelected: {
    color: BODY_AMBER,
  },
  mealOptionDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  exerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  exerciseChipSelected: {
    backgroundColor: BODY_AMBER + '22',
    borderColor: BODY_AMBER,
  },
  exerciseEmoji: {
    fontSize: 16,
  },
  exerciseLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  exerciseLabelSelected: {
    color: BODY_AMBER,
    fontWeight: '500',
  },
  textInput: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  textInputLarge: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  skipLink: {
    marginTop: SPACING.lg,
  },
  skipLinkText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    gap: 12,
  },
  summaryRow: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BODY_AMBER,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.button,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
});
