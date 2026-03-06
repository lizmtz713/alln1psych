/**
 * 5-4-3-2-1 Grounding — 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste. Anchors to present.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

const STEPS = [
  { n: 5, sense: 'see', prompt: 'Name 5 things you can see', icon: 'eye' as const },
  { n: 4, sense: 'touch', prompt: 'Name 4 things you can touch', icon: 'hand-left' as const },
  { n: 3, sense: 'hear', prompt: 'Name 3 things you can hear', icon: 'ear' as const },
  { n: 2, sense: 'smell', prompt: 'Name 2 things you can smell', icon: 'flower' as const },
  { n: 1, sense: 'taste', prompt: 'Name 1 thing you can taste', icon: 'nutrition' as const },
];

export interface FiveFourGroundingProps {
  onComplete: (durationSeconds: number) => void;
}

export function FiveFourGrounding({ onComplete }: FiveFourGroundingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [startedAt] = useState(Date.now());

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      onComplete(durationSeconds);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i <= stepIndex && styles.dotActive]}
          />
        ))}
      </View>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={step.icon} size={48} color={COLORS.accent} />
        </View>
        <Text style={styles.stepLabel}>{step.n} things you can {step.sense}</Text>
        <Text style={styles.prompt}>{step.prompt}</Text>
        <Text style={styles.hint}>Take your time. Say them out loud or in your head.</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
        onPress={handleNext}
      >
        <Text style={styles.nextBtnText}>{isLast ? 'Done' : 'Next'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.accent },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    marginBottom: 24,
  },
  iconWrap: { alignSelf: 'center', marginBottom: 16 },
  stepLabel: { fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  prompt: { fontSize: 20, color: COLORS.text, textAlign: 'center', lineHeight: 28, marginBottom: 12 },
  hint: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  nextBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  nextBtnPressed: { opacity: 0.9 },
  nextBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
