/**
 * Attention exercise: Listening — Focus on sounds for 1–2 minutes.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

export interface FocusListeningProps {
  onComplete: (durationSeconds: number) => void;
}

export function FocusListening({ onComplete }: FocusListeningProps) {
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
        <Text style={styles.emoji}>👂</Text>
        <Text style={styles.title}>Listening</Text>
        <Text style={styles.instruction}>
          Close your eyes or soften your gaze. Notice sounds — near, far. Don't label or judge; just let them come and go. When your mind wanders, return to listening.
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
      <Text style={styles.emoji}>👂</Text>
      <Text style={styles.timer}>{mins}:{secs.toString().padStart(2, '0')}</Text>
      <Text style={styles.sub}>Notice sounds without grasping or pushing away.</Text>
      <Pressable style={styles.doneBtn} onPress={handleComplete}>
        <Text style={styles.doneBtnText}>I'm done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emoji: { fontSize: 48, marginBottom: SPACING.md },
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
