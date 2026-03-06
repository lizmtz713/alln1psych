/**
 * Shake It Out — Release tension through movement. Shake hands, arms, shoulders, whole body.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

const SEGMENTS = [
  { label: 'Shake your hands', duration: 15, emoji: '🙌' },
  { label: 'Shake your arms', duration: 15, emoji: '💪' },
  { label: 'Roll your shoulders', duration: 15, emoji: '🔄' },
  { label: 'Shake your whole body', duration: 20, emoji: '🕺' },
];

export interface ShakeItOutProps {
  onComplete: (durationSeconds: number) => void;
}

export function ShakeItOut({ onComplete }: ShakeItOutProps) {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SEGMENTS[0].duration);
  const segment = SEGMENTS[segmentIndex];

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          if (segmentIndex < SEGMENTS.length - 1) {
            setSegmentIndex((i) => i + 1);
            return SEGMENTS[segmentIndex + 1].duration;
          }
          const totalDuration = SEGMENTS.reduce((sum, s) => sum + s.duration, 0);
          onComplete(totalDuration);
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [segmentIndex, onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{segment.emoji}</Text>
      <Text style={styles.label}>{segment.label}</Text>
      <Text style={styles.timer}>{timeLeft}s</Text>
      <Text style={styles.hint}>Let tension go. No need to be graceful.</Text>
      <View style={styles.progressRow}>
        {SEGMENTS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i <= segmentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 72, marginBottom: 24 },
  label: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  timer: { fontSize: 48, fontWeight: '700', color: COLORS.accent, marginBottom: 8 },
  hint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 32 },
  progressRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.accent },
});
