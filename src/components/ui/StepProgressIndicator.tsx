import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  accentColor?: string;
}

export function StepProgressIndicator({ 
  currentStep, 
  totalSteps, 
  accentColor = COLORS.accent 
}: StepProgressIndicatorProps) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        
        return (
          <View key={i} style={styles.stepContainer}>
            <View 
              style={[
                styles.progressStep,
                isCompleted && [styles.progressStepCompleted, { backgroundColor: accentColor, borderColor: accentColor }],
                isCurrent && [styles.progressStepCurrent, { borderColor: accentColor }],
                !isCompleted && !isCurrent && styles.progressStepUpcoming,
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={18} color="#fff" />
              ) : (
                <Text 
                  style={[
                    styles.progressStepText,
                    isCurrent && [styles.progressStepTextCurrent, { color: accentColor }],
                    !isCurrent && styles.progressStepTextUpcoming,
                  ]}
                >
                  {stepNum}
                </Text>
              )}
            </View>
            {i < totalSteps - 1 && (
              <View 
                style={[
                  styles.progressLine,
                  stepNum < currentStep 
                    ? [styles.progressLineCompleted, { backgroundColor: accentColor }] 
                    : styles.progressLineUpcoming,
                ]} 
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  progressStepCompleted: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  progressStepCurrent: {
    backgroundColor: 'transparent',
    borderColor: COLORS.accent,
  },
  progressStepUpcoming: {
    backgroundColor: 'transparent',
    borderColor: COLORS.textMuted + '40',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressStepTextCurrent: {
    color: COLORS.accent,
  },
  progressStepTextUpcoming: {
    color: COLORS.textMuted,
  },
  progressLine: {
    width: 32,
    height: 2,
    marginHorizontal: 4,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.accent,
  },
  progressLineUpcoming: {
    backgroundColor: COLORS.textMuted + '40',
  },
});
