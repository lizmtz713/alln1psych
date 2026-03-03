/**
 * QuickCheckIn — 30-60 second full cockpit check-in
 * 
 * Science applied:
 * - Body first (interoception)
 * - Varied questions (anti-habituation)
 * - Match to capacity (adapts based on State)
 * - Meaningful (creates insight, not just data)
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { ALL_GAUGES, GAUGE_ORDER, getVariantIndex } from './questionBank';
import type { GaugeName, CheckInResult } from './types';

interface QuickCheckInProps {
  onComplete: (result: CheckInResult) => void;
  onCancel?: () => void;
  currentState?: number; // Current State gauge value, for adaptive depth
  context?: {
    trigger?: string;
    event?: string;
  };
}

export function QuickCheckIn({
  onComplete,
  onCancel,
  currentState = 50,
  context,
}: QuickCheckInProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<GaugeName, number>>>({});
  const [startTime] = useState(new Date());
  
  // Get variant based on day (rotates questions)
  const variant = getVariantIndex('quick');
  
  // Adaptive: If state is low, use simpler questions
  const effectiveVariant = currentState < 40 ? 3 : variant; // 3 = quick/simple
  
  const currentGauge = GAUGE_ORDER[step];
  const gaugeConfig = ALL_GAUGES[currentGauge];
  const questionVariant = gaugeConfig.variants[Math.min(effectiveVariant, gaugeConfig.variants.length - 1)];
  
  const isLastStep = step === GAUGE_ORDER.length - 1;
  const progress = (step + 1) / GAUGE_ORDER.length;
  
  const handleAnswer = useCallback((value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newAnswers = { ...answers, [currentGauge]: value };
    setAnswers(newAnswers);
    
    if (isLastStep) {
      // Complete
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({
        level: 'quick',
        timestamp: new Date(),
        gauges: newAnswers,
        context: {
          ...context,
          dayPart: getDayPart(),
        },
      });
    } else {
      setStep(step + 1);
    }
  }, [answers, currentGauge, isLastStep, step, context, onComplete]);
  
  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLastStep) {
      onComplete({
        level: 'quick',
        timestamp: new Date(),
        gauges: answers,
        context: {
          ...context,
          dayPart: getDayPart(),
        },
      });
    } else {
      setStep(step + 1);
    }
  }, [answers, isLastStep, step, context, onComplete]);
  
  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: gaugeConfig.color }]} />
      </View>
      
      {/* Step indicator */}
      <View style={styles.stepRow}>
        {GAUGE_ORDER.map((g, i) => (
          <View
            key={g}
            style={[
              styles.stepDot,
              i === step && { backgroundColor: ALL_GAUGES[g].color },
              i < step && { backgroundColor: COLORS.success },
            ]}
          />
        ))}
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Gauge emoji */}
        <Text style={styles.gaugeEmoji}>{gaugeConfig.emoji}</Text>
        
        {/* Question */}
        <Text style={styles.question}>{questionVariant.question}</Text>
        {(questionVariant as { subtext?: string }).subtext && (
          <Text style={styles.subtext}>{(questionVariant as { subtext?: string }).subtext}</Text>
        )}
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {questionVariant.type === 'checklist' ? (
            <ChecklistInput
              items={questionVariant.items}
              color={gaugeConfig.color}
              onComplete={(value) => handleAnswer(value)}
            />
          ) : questionVariant.type === 'multi' ? (
            <MultiSelectInput
              options={questionVariant.options}
              color={gaugeConfig.color}
              calculate={questionVariant.calculate}
              onComplete={(value) => handleAnswer(value)}
            />
          ) : (
            <SingleSelectInput
              options={questionVariant.options}
              color={gaugeConfig.color}
              onSelect={(value) => handleAnswer(value)}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        {onCancel && (
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════

function SingleSelectInput({
  options,
  color,
  onSelect,
}: {
  options: any[];
  color: string;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.singleOptions}>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          style={({ pressed }) => [
            styles.singleOption,
            pressed && { backgroundColor: `${color}20`, borderColor: color },
          ]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={styles.optionEmoji}>{opt.emoji}</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionLabel}>{opt.label}</Text>
            {opt.desc && <Text style={styles.optionDesc}>{opt.desc}</Text>}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function MultiSelectInput({
  options,
  color,
  calculate,
  onComplete,
}: {
  options: any[];
  color: string;
  calculate: (selected: string[], options: any[]) => number;
  onComplete: (value: number) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  
  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };
  
  const handleDone = () => {
    const value = calculate(selected, options);
    onComplete(value);
  };
  
  return (
    <View>
      <View style={styles.multiGrid}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              style={[
                styles.multiChip,
                isSelected && { backgroundColor: `${color}30`, borderColor: color },
              ]}
              onPress={() => toggle(opt.id)}
            >
              <Text style={styles.chipEmoji}>{opt.emoji}</Text>
              <Text style={[styles.chipLabel, isSelected && { color }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.doneButton} onPress={handleDone}>
        <LinearGradient
          colors={[color, `${color}CC`]}
          style={styles.doneGradient}
        >
          <Text style={styles.doneText}>
            {selected.length === 0 ? 'None of these' : `Done (${selected.length})`}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function ChecklistInput({
  items,
  color,
  onComplete,
}: {
  items: { id: string; label: string; emoji: string }[];
  color: string;
  onComplete: (value: number) => void;
}) {
  const [checked, setChecked] = useState<string[]>([]);
  
  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };
  
  const handleDone = () => {
    const value = checked.length * 25; // Each item = 25 points
    onComplete(value);
  };
  
  return (
    <View>
      <View style={styles.checklistContainer}>
        {items.map((item) => {
          const isChecked = checked.includes(item.id);
          return (
            <Pressable
              key={item.id}
              style={[
                styles.checklistItem,
                isChecked && { backgroundColor: `${color}15`, borderColor: color },
              ]}
              onPress={() => toggle(item.id)}
            >
              <Text style={styles.checklistEmoji}>{item.emoji}</Text>
              <Text style={[styles.checklistLabel, isChecked && { color }]}>
                {item.label}
              </Text>
              <View style={[styles.checkbox, isChecked && { backgroundColor: color, borderColor: color }]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.doneButton} onPress={handleDone}>
        <LinearGradient
          colors={[color, `${color}CC`]}
          style={styles.doneGradient}
        >
          <Text style={styles.doneText}>
            {checked.length === 0 ? 'None' : `Done (${checked.length}/${items.length})`}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getDayPart(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
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
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: '100%',
  },
  
  // Steps
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
    paddingBottom: 100,
    alignItems: 'center',
  },
  gaugeEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  question: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtext: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  optionsContainer: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  
  // Single select
  singleOptions: {
    gap: SPACING.sm,
  },
  singleOption: {
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
  optionTextContainer: {
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
  
  // Multi select
  multiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  multiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  chipLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
  
  // Checklist
  checklistContainer: {
    gap: SPACING.sm,
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
  checklistEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  checklistLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    flex: 1,
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
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Done button
  doneButton: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  doneGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  doneText: {
    ...TYPOGRAPHY.labelLg,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  skipButton: {
    padding: SPACING.md,
  },
  skipText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
  },
  cancelButton: {
    padding: SPACING.md,
  },
  cancelText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
  },
});

export default QuickCheckIn;
