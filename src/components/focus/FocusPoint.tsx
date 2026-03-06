/**
 * Attention exercise: Point — Fix gaze on a single point for 1–2 minutes.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

export interface FocusPointProps {
  onComplete: (durationSeconds: number) => void;
}

export function FocusPoint({ onComplete }: FocusPointProps) {
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!started) return;
    startTime.current = Date.now();
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [started]);

  const handleComplete = () => {
    const duration = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : elapsed;
    onComplete(duration || 1);
  };

  if (!started) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>👁️</Text>
        <Text style={styles.title}>Single-point gaze</Text>
        <Text style={styles.instruction}>
          Choose a small spot (a dot, a mark). Rest your gaze there without straining. When your eyes or mind wander, gently return to the point.
        </Text>
        <Text style={styles.hint}>~1–2 minutes.</Text>
        <Pressable style={styles.startBtn} onPress={() => setStarted(true)}>
          <Text style={styles.startBtnText}>Start</Text>
        </Pressable>
      </View>
    );
  }

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.timer}>{mins}:{secs.toString().padStart(2, '0')}</Text>
      <Text style={styles.sub}>Keep a soft gaze on the point.</Text>
      <Pressable style={styles.doneBtn} onPress={handleComplete}>
        <Text style={styles.doneBtnText}>I'm done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emoji: { fontSize: 48, marginBottom: SPACING.md },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent, marginBottom: SPACING.lg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  instruction: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.lg },
  hint: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl },
  startBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  startBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  timer: { fontSize: 42, fontWeight: '700', color: COLORS.accent, fontVariant: ['tabular-nums'], marginBottom: 8 },
  sub: { fontSize: 15, color: COLORS.textMuted, marginBottom: SPACING.xl },
  doneBtn: { paddingVertical: 14, paddingHorizontal: 24 },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
});
