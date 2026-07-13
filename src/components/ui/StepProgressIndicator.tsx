import React, { Fragment } from 'react';
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
  const compact = totalSteps > 6;

  return (
    <View style={styles.progressRow}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        
        return (
          <Fragment key={i}>
            <View 
              style={[
                styles.progressStep,
                compact && styles.progressStepCompact,
                isCompleted && [styles.progressStepCompleted, { backgroundColor: accentColor, borderColor: accentColor }],
                isCurrent && [styles.progressStepCurrent, { borderColor: accentColor }],
                !isCompleted && !isCurrent && styles.progressStepUpcoming,
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={compact ? 15 : 18} color="#fff" />
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
                  compact && styles.progressLineCompact,
                  stepNum < currentStep 
                    ? [styles.progressLineCompleted, { backgroundColor: accentColor }] 
                    : styles.progressLineUpcoming,
                ]} 
              />
            )}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    width: '100%',
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
  progressStepCompact: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    flex: 1,
    minWidth: 4,
    height: 2,
    marginHorizontal: 3,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.accent,
  },
  progressLineCompact: {
    minWidth: 2,
    marginHorizontal: 1,
  },
  progressLineUpcoming: {
    backgroundColor: COLORS.textMuted + '40',
  },
});
