/**
 * MicroCheckIn — 5-second single gauge check
 * 
 * For: Watch, widget, contextual prompts
 * Science: EMA (Ecological Momentary Assessment)
 * 
 * Just emoji taps. No text. Captures in-the-moment state.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../lib/constants';
import type { GaugeName } from './types';
import { ALL_GAUGES } from './questionBank';

interface MicroCheckInProps {
  gauge: GaugeName;
  question?: string;
  onComplete: (value: number) => void;
  onDismiss?: () => void;
}

export function MicroCheckIn({
  gauge,
  question,
  onComplete,
  onDismiss,
}: MicroCheckInProps) {
  const gaugeConfig = ALL_GAUGES[gauge as keyof typeof ALL_GAUGES];
  // Use the 'quick' variant (emoji-only)
  const quickVariant = gaugeConfig.variants.find((v: { id: string }) => v.id === 'quick') || gaugeConfig.variants[0];
  const options = quickVariant.options ?? [];
  
  const handleSelect = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(value);
  };
  
  return (
    <View style={styles.container}>
      {/* Question */}
      <Text style={styles.question}>
        {question || quickVariant.question}
      </Text>
      
      {/* Emoji options - single row */}
      <View style={styles.optionsRow}>
        {options.map((opt: { id: string; label: string; emoji: string; value?: number; valence?: string }) => (
          <Pressable
            key={opt.id}
            style={({ pressed }) => [
              styles.emojiButton,
              { borderColor: gaugeConfig.color },
              pressed && styles.emojiButtonPressed,
            ]}
            onPress={() => handleSelect('value' in opt && typeof opt.value === 'number' ? opt.value : 50)}
          >
            <Text style={styles.emoji}>{opt.emoji}</Text>
          </Pressable>
        ))}
      </View>
      
      {/* Scale hint */}
      <View style={styles.hintRow}>
        <Text style={styles.hintText}>low</Text>
        <Text style={styles.hintText}>high</Text>
      </View>
      
      {/* Dismiss */}
      {onDismiss && (
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Not now</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Compact version for watch/widget
 */
export function MicroCheckInCompact({
  gauge,
  onComplete,
}: {
  gauge: GaugeName;
  onComplete: (value: number) => void;
}) {
  const gaugeConfig = ALL_GAUGES[gauge as keyof typeof ALL_GAUGES];
  const quickVariant = gaugeConfig.variants.find((v: { id: string }) => v.id === 'quick') || gaugeConfig.variants[0];
  const options = quickVariant.options ?? [];
  
  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactEmoji}>{gaugeConfig.emoji}</Text>
      <View style={styles.compactOptions}>
        {options.map((opt: { id: string; label: string; emoji: string; value?: number; valence?: string }) => (
          <Pressable
            key={opt.id}
            style={styles.compactButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete('value' in opt && typeof opt.value === 'number' ? opt.value : 50);
            }}
          >
            <Text style={styles.compactEmoji}>{opt.emoji}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  question: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButtonPressed: {
    transform: [{ scale: 1.1 }],
    backgroundColor: COLORS.surfaceElevated,
  },
  emoji: {
    fontSize: 28,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  hintText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textDim,
  },
  dismissButton: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
  },
  dismissText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
  },
  
  // Compact (watch/widget)
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compactOptions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  compactButton: {
    padding: SPACING.xs,
  },
  compactEmoji: {
    fontSize: 20,
  },
});

export default MicroCheckIn;
