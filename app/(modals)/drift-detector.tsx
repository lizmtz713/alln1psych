/**
 * Drift Detector Modal
 * 
 * Weekly "Value Drift Reflection" — notices when actions don't match stated values.
 * 
 * Philosophy:
 * - Reflective, curious tone: "Just noticing..." not judging
 * - Shows correlations over time: "When sleep < 6h, alignment tends to drop"
 * - Empowers user with self-knowledge, doesn't prescribe
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { useDriftPatterns } from '../../src/hooks/useDriftDetector';
import {
  recordValueReflection,
  markReflectionComplete,
  getAlignmentResponse,
  getWeeklyReflectionPrompt,
  SUGGESTED_VALUES,
  type AlignmentResponse,
} from '../../src/services/driftDetector';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';

type Step = 'values_setup' | 'reflection' | 'patterns' | 'complete';

export default function DriftDetectorModal() {
  const router = useRouter();
  const values = useUserStore((s) => s.values);
  const setValues = useUserStore((s) => s.setValues);
  const { insights, hasEnoughData, weeksOfData } = useDriftPatterns();

  // State
  const [step, setStep] = useState<Step>(values.length === 0 ? 'values_setup' : 'reflection');
  const [currentValueIndex, setCurrentValueIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, AlignmentResponse>>(new Map());
  const [selectedValues, setSelectedValues] = useState<string[]>(values);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentValue = values[currentValueIndex];
  const isLastValue = currentValueIndex === values.length - 1;
  const progressPercent = ((currentValueIndex + 1) / values.length) * 100;

  const handleClose = () => {
    router.back();
  };

  const handleSelectValue = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedValues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : prev.length < 5
          ? [...prev, value]
          : prev
    );
  };

  const handleAddCustomValue = () => {
    if (customValue.trim() && selectedValues.length < 5) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedValues((prev) => [...prev, customValue.trim()]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleSaveValues = () => {
    if (selectedValues.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setValues(selectedValues);
    setStep('reflection');
  };

  const handleResponse = async (response: AlignmentResponse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Record this response
    await recordValueReflection(currentValue, response);
    setResponses((prev) => new Map(prev).set(currentValue, response));

    if (isLastValue) {
      // Move to patterns or complete
      if (hasEnoughData && insights.length > 0) {
        setStep('patterns');
      } else {
        await markReflectionComplete();
        setStep('complete');
      }
    } else {
      setCurrentValueIndex((prev) => prev + 1);
    }
  };

  const handleFinish = async () => {
    await markReflectionComplete();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  // Render based on step
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={12}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {step === 'values_setup' ? 'Your Values' : 'Weekly Reflection'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step: Values Setup */}
          {step === 'values_setup' && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>💎</Text>
              </View>
              
              <Text style={styles.title}>What values matter most to you?</Text>
              <Text style={styles.subtitle}>
                Choose up to 5 values to track. We'll check in weekly to see how aligned your actions feel.
              </Text>

              <View style={styles.valuesGrid}>
                {SUGGESTED_VALUES.map(({ value, emoji }) => {
                  const isSelected = selectedValues.includes(value);
                  return (
                    <Pressable
                      key={value}
                      style={[
                        styles.valueChip,
                        isSelected && styles.valueChipSelected,
                      ]}
                      onPress={() => handleSelectValue(value)}
                    >
                      <Text style={styles.valueEmoji}>{emoji}</Text>
                      <Text
                        style={[
                          styles.valueText,
                          isSelected && styles.valueTextSelected,
                        ]}
                      >
                        {value}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Custom value input */}
              {showCustomInput ? (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Type your value..."
                    placeholderTextColor={COLORS.textMuted}
                    value={customValue}
                    onChangeText={setCustomValue}
                    onSubmitEditing={handleAddCustomValue}
                    autoFocus
                  />
                  <Pressable
                    style={styles.customAddButton}
                    onPress={handleAddCustomValue}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.addCustomButton}
                  onPress={() => setShowCustomInput(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.accent} />
                  <Text style={styles.addCustomText}>Add your own</Text>
                </Pressable>
              )}

              <Text style={styles.selectionCount}>
                {selectedValues.length} of 5 selected
              </Text>

              <Pressable
                style={[
                  styles.primaryButton,
                  selectedValues.length === 0 && styles.buttonDisabled,
                ]}
                onPress={handleSaveValues}
                disabled={selectedValues.length === 0}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>
            </View>
          )}

          {/* Step: Reflection */}
          {step === 'reflection' && values.length > 0 && (
            <View style={styles.stepContainer}>
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progressPercent}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentValueIndex + 1} of {values.length}
                </Text>
              </View>

              <View style={styles.reflectionCard}>
                <Text style={styles.reflectionPrompt}>
                  {getWeeklyReflectionPrompt([currentValue])}
                </Text>
                
                <View style={styles.valueHighlight}>
                  <Text style={styles.valueHighlightText}>{currentValue}</Text>
                </View>

                <Text style={styles.reflectionQuestion}>
                  This week, did your actions align with this value?
                </Text>
              </View>

              <View style={styles.responseOptions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.responseButton,
                    styles.responseYes,
                    pressed && styles.responsePressed,
                  ]}
                  onPress={() => handleResponse('yes')}
                >
                  <Text style={styles.responseEmoji}>✨</Text>
                  <Text style={styles.responseText}>Yes</Text>
                  <Text style={styles.responseHint}>Felt aligned</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.responseButton,
                    styles.responseMostly,
                    pressed && styles.responsePressed,
                  ]}
                  onPress={() => handleResponse('mostly')}
                >
                  <Text style={styles.responseEmoji}>🌤️</Text>
                  <Text style={styles.responseText}>Mostly</Text>
                  <Text style={styles.responseHint}>Some gaps</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.responseButton,
                    styles.responseNo,
                    pressed && styles.responsePressed,
                  ]}
                  onPress={() => handleResponse('not_really')}
                >
                  <Text style={styles.responseEmoji}>🌫️</Text>
                  <Text style={styles.responseText}>Not really</Text>
                  <Text style={styles.responseHint}>Drifted</Text>
                </Pressable>
              </View>

              <Text style={styles.noJudgment}>
                No right or wrong — just noticing.
              </Text>
            </View>
          )}

          {/* Step: Patterns */}
          {step === 'patterns' && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔮</Text>
              </View>

              <Text style={styles.title}>What we're noticing</Text>
              <Text style={styles.subtitle}>
                Based on {weeksOfData} weeks of reflections and your gauge data.
              </Text>

              <View style={styles.patternsContainer}>
                {insights.map((insight, index) => (
                  <View key={insight.pattern.id} style={styles.patternCard}>
                    <View style={styles.patternHeader}>
                      <View
                        style={[
                          styles.patternIndicator,
                          insight.pattern.alignmentImpact === 'negative'
                            ? styles.patternIndicatorNegative
                            : styles.patternIndicatorPositive,
                        ]}
                      />
                      <Text style={styles.patternConfidence}>
                        {insight.confidence === 'established' && 'Established pattern'}
                        {insight.confidence === 'emerging' && 'Emerging pattern'}
                        {insight.confidence === 'early' && 'Early signal'}
                      </Text>
                    </View>
                    
                    <Text style={styles.patternNarrative}>
                      {insight.pattern.narrative}
                    </Text>
                    
                    <Text style={styles.patternFrequency}>
                      {insight.pattern.frequency}
                    </Text>

                    {insight.suggestion && (
                      <View style={styles.patternSuggestion}>
                        <Text style={styles.patternSuggestionText}>
                          {insight.suggestion}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}

                {insights.length === 0 && (
                  <View style={styles.noPatterns}>
                    <Text style={styles.noPatternsText}>
                      Keep reflecting weekly. Patterns emerge with more data.
                    </Text>
                  </View>
                )}
              </View>

              <Pressable style={styles.primaryButton} onPress={handleFinish}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </View>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🪞</Text>
              </View>

              <Text style={styles.title}>Reflection complete</Text>

              {/* Summary of responses */}
              <View style={styles.summaryContainer}>
                {Array.from(responses.entries()).map(([value, response]) => (
                  <View key={value} style={styles.summaryRow}>
                    <Text style={styles.summaryValue}>{value}</Text>
                    <View
                      style={[
                        styles.summaryBadge,
                        response === 'yes' && styles.summaryBadgeYes,
                        response === 'mostly' && styles.summaryBadgeMostly,
                        response === 'not_really' && styles.summaryBadgeNo,
                      ]}
                    >
                      <Text style={styles.summaryBadgeText}>
                        {response === 'yes' && 'Aligned'}
                        {response === 'mostly' && 'Mostly'}
                        {response === 'not_really' && 'Drifted'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.closingMessage}>
                {getClosingMessage(responses)}
              </Text>

              {!hasEnoughData && (
                <View style={styles.dataProgress}>
                  <Ionicons name="analytics-outline" size={18} color={COLORS.textMuted} />
                  <Text style={styles.dataProgressText}>
                    {weeksOfData} of 4 weeks — patterns emerge with more data
                  </Text>
                </View>
              )}

              <Pressable style={styles.primaryButton} onPress={handleFinish}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getClosingMessage(responses: Map<string, AlignmentResponse>): string {
  const values = Array.from(responses.values());
  const driftCount = values.filter((r) => r === 'not_really').length;
  const alignedCount = values.filter((r) => r === 'yes').length;

  if (driftCount === 0 && alignedCount === values.length) {
    return 'Living your values fully this week. That\'s worth acknowledging.';
  }
  if (driftCount === 0) {
    return 'Mostly aligned. Progress, not perfection.';
  }
  if (driftCount > values.length / 2) {
    return 'Some drift this week. No judgment — life happens. Just noticing.';
  }
  return 'A mixed week. The noticing itself is valuable.';
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.headingSm,
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    ...TYPOGRAPHY.headingMd,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },

  // Values grid
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  valueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  valueChipSelected: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.accent,
  },
  valueEmoji: {
    fontSize: 16,
  },
  valueText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  valueTextSelected: {
    color: COLORS.accent,
  },
  
  // Custom value
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.md,
  },
  customInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customAddButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  addCustomText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },
  selectionCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },

  // Progress
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textMuted,
    minWidth: 50,
    textAlign: 'right',
  },

  // Reflection
  reflectionCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  reflectionPrompt: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  valueHighlight: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  valueHighlightText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.accent,
  },
  reflectionQuestion: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
  },

  // Response buttons
  responseOptions: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  responseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  responseYes: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  responseMostly: {
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderColor: 'rgba(250, 204, 21, 0.25)',
  },
  responseNo: {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  responsePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  responseEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  responseText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  responseHint: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  noJudgment: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Patterns
  patternsContainer: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  patternCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  patternIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  patternIndicatorPositive: {
    backgroundColor: COLORS.green,
  },
  patternIndicatorNegative: {
    backgroundColor: COLORS.orange,
  },
  patternConfidence: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  patternNarrative: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  patternFrequency: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  patternSuggestion: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  patternSuggestionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  noPatterns: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noPatternsText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Summary
  summaryContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  summaryValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  summaryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.full,
  },
  summaryBadgeYes: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  summaryBadgeMostly: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },
  summaryBadgeNo: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  summaryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  closingMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  dataProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dataProgressText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Buttons
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
