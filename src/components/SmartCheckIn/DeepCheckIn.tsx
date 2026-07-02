/**
 * DeepCheckIn — 3-5 minute reflective check-in
 * 
 * For: Weekly reflection, high-state moments, pattern review
 * Only offered when State is high (user has capacity)
 * 
 * Science: Reflection-on-action, spacing effect, meaning-making
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { QuickCheckIn } from './QuickCheckIn';
import type { CheckInResult, GaugeName } from './types';

interface DeepCheckInProps {
  onComplete: (result: CheckInResult) => void;
  onCancel?: () => void;
  weeklyPatterns?: {
    averageGauges: Partial<Record<GaugeName, number>>;
    lowestGauge: GaugeName;
    trend: 'improving' | 'stable' | 'declining';
    checkInCount: number;
  };
}

type DeepStep = 'quick' | 'patterns' | 'reflection' | 'insight' | 'complete';

export function DeepCheckIn({
  onComplete,
  onCancel,
  weeklyPatterns,
}: DeepCheckInProps) {
  const [step, setStep] = useState<DeepStep>('quick');
  const [quickResult, setQuickResult] = useState<CheckInResult | null>(null);
  const [reflection, setReflection] = useState('');
  const [insight, setInsight] = useState('');
  
  const handleQuickComplete = useCallback((result: CheckInResult) => {
    setQuickResult(result);
    setStep(weeklyPatterns ? 'patterns' : 'reflection');
  }, [weeklyPatterns]);
  
  const handleFinish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({
      level: 'deep',
      timestamp: new Date(),
      gauges: quickResult?.gauges || {},
      reflection,
      insights: insight ? [insight] : [],
      context: {
        dayPart: getDayPart(),
      },
    });
  }, [quickResult, reflection, insight, onComplete]);
  
  return (
    <View style={styles.container}>
      {step === 'quick' && (
        <QuickCheckIn
          onComplete={handleQuickComplete}
          onCancel={onCancel}
        />
      )}
      
      {step === 'patterns' && weeklyPatterns && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <Text style={styles.emoji}>📊</Text>
          <Text style={styles.title}>Your Week</Text>
          
          <View style={styles.patternCard}>
            <Text style={styles.patternLabel}>
              You checked in {weeklyPatterns.checkInCount} times this week
            </Text>
            
            <View style={styles.trendRow}>
              <Text style={styles.trendLabel}>Overall trend:</Text>
              <Text style={[
                styles.trendValue,
                { color: weeklyPatterns.trend === 'improving' ? COLORS.success : 
                         weeklyPatterns.trend === 'declining' ? COLORS.warning : 
                         COLORS.textSecondary }
              ]}>
                {weeklyPatterns.trend === 'improving' ? '📈 Improving' :
                 weeklyPatterns.trend === 'declining' ? '📉 Declining' :
                 '➡️ Stable'}
              </Text>
            </View>
            
            <Text style={styles.patternInsight}>
              Your {weeklyPatterns.lowestGauge} gauge has been consistently lower than others.
            </Text>
          </View>
          
          <Pressable 
            style={styles.primaryButton}
            onPress={() => setStep('reflection')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      )}
      
      {step === 'reflection' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <Text style={styles.emoji}>✍️</Text>
          <Text style={styles.title}>Reflection</Text>
          <Text style={styles.subtitle}>
            What's one thing you've noticed about yourself this week?
          </Text>
          
          <TextInput
            style={styles.textInput}
            value={reflection}
            onChangeText={setReflection}
            placeholder="Type your reflection..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.buttonRow}>
            <Pressable 
              style={styles.secondaryButton}
              onPress={() => setStep('insight')}
            >
              <Text style={styles.secondaryButtonText}>Skip</Text>
            </Pressable>
            <Pressable 
              style={styles.primaryButton}
              onPress={() => setStep('insight')}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
      
      {step === 'insight' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <Text style={styles.emoji}>💡</Text>
          <Text style={styles.title}>Insight</Text>
          <Text style={styles.subtitle}>
            What's one small thing you could do differently next week?
          </Text>
          
          <TextInput
            style={styles.textInput}
            value={insight}
            onChangeText={setInsight}
            placeholder=\"One small change...\"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.buttonRow}>
            <Pressable 
              style={styles.secondaryButton}
              onPress={handleFinish}
            >
              <Text style={styles.secondaryButtonText}>Skip</Text>
            </Pressable>
            <Pressable 
              style={styles.primaryButton}
              onPress={handleFinish}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function getDayPart(): "morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.displayMd,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  
  // Pattern card
  patternCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patternLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trendLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
  },
  trendValue: {
    ...TYPOGRAPHY.labelLg,
  },
  patternInsight: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  
  // Text input
  textInput: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  
  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.labelLg,
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.textSecondary,
  },
});

export default DeepCheckIn;
