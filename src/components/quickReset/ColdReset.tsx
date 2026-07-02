/**
 * Cold Reset — Brief cold exposure (face/wrists) to activate parasympathetic response.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../../lib/constants';

export interface ColdResetProps {
  durationSeconds?: number;
  onComplete: (durationSeconds: number) => void;
}

export function ColdReset({ durationSeconds = 90, onComplete }: ColdResetProps) {
  const [phase, setPhase] = useState<'prep' | 'cold' | 'done'>('prep');
  const [countdown, setCountdown] = useState(10);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase !== 'cold') return;
    const t = setInterval(() => {
      setElapsed((e) => {
        if (e >= durationSeconds) {
          setPhase('done');
          onComplete(e);
          return e;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, durationSeconds, onComplete]);

  useEffect(() => {
    if (phase !== 'prep') return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setPhase('cold');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  if (phase === 'done') {
    return (
      <View style={styles.container}>
        <Text style={styles.doneTitle}>Cold reset complete</Text>
        <Text style={styles.doneBody}>Your body got a brief activation.</Text>
      </View>
    );
  }

  if (phase === 'prep') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Get ready</Text>
        <Text style={styles.body}>
          Cold water on face or wrists, or hold an ice cube. 15–30 seconds is enough.
        </Text>
        <Text style={styles.countdown}>{countdown}</Text>
        <Text style={styles.hint}>Start when the countdown hits 0</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.coldTitle}>Cold exposure</Text>
      <Text style={styles.coldBody}>Splash face, hold cold to wrists, or sip cold water. Breathe.</Text>
      <Text style={styles.timer}>{elapsed}s</Text>
      <Pressable
        style={styles.doneEarlyBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onComplete(elapsed);
        }}
      >
        <Text style={styles.doneEarlyText}>I'm done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  body: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  countdown: { fontSize: 64, fontWeight: '200', color: COLORS.accent, marginBottom: 8 },
  hint: { fontSize: 14, color: COLORS.textMuted },
  coldTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  coldBody: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  timer: { fontSize: 48, fontWeight: '700', color: COLORS.text, marginBottom: 24 },
  doneEarlyBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  doneEarlyText: { fontSize: 16, color: COLORS.textMuted },
  doneTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  doneBody: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
});
