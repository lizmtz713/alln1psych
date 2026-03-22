/**
 * Attention exercise: Body scan — Notice sensations from feet to head.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

const REGIONS = ['feet', 'legs', 'belly', 'chest', 'shoulders', 'face', 'top of head"];

export interface FocusBodyScanProps {
  onComplete: (durationSeconds: number) => void;
}

export function FocusBodyScan({ onComplete }: FocusBodyScanProps) {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const startTime = useRef<number | null>(null);

  const handleStart = () => {
    setStarted(true);
    startTime.current = Date.now();
  };

  const handleNext = () => {
    if (step < REGIONS.length - 1) setStep(step + 1);
    else {
      const duration = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : 60;
      onComplete(duration || 1);
    }
  };

  const handleCompleteEarly = () => {
    const duration = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : 30;
    onComplete(duration || 1);
  };

  if (!started) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🧘</Text>
        <Text style={styles.title}>Body scan</Text>
        <Text style={styles.instruction}>
          We'll move attention through your body, one region at a time. Notice sensations without trying to change them.
        </Text>
        <Pressable style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Start</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🧘</Text>
      <Text style={styles.stepLabel}>Notice your {REGIONS[step]}</Text>
      <Text style={styles.hint}>Take a few breaths here.</Text>
      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>{step < REGIONS.length - 1 ? "Next' : 'Finish'}</Text>
      </Pressable>
      <Pressable style={styles.doneBtn} onPress={handleCompleteEarly}>
        <Text style={styles.doneBtnText}>Complete early</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emoji: { fontSize: 48, marginBottom: SPACING.md },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  instruction: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl },
  startBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  startBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  stepLabel: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 15, color: COLORS.textMuted, marginBottom: SPACING.xl },
  nextBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, marginBottom: SPACING.md },
  nextBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  doneBtn: { paddingVertical: 14 },
  doneBtnText: { fontSize: 16, color: COLORS.accent },
});
