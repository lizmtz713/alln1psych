/**
 * Physiological Sigh — Double inhale + long exhale. Fast stress relief (Huberman).
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

const INHALE1 = 2;
const INHALE2 = 1;
const EXHALE = 10;

export interface PhysiologicalSighProps {
  durationSeconds?: number;
  onComplete: (durationSeconds: number) => void;
}

type Phase = 'in1' | 'in2' | 'out';

export function PhysiologicalSigh({ durationSeconds = 90, onComplete }: PhysiologicalSighProps) {
  const [phase, setPhase] = useState<Phase>('in1');
  const [count, setCount] = useState(INHALE1);
  const [elapsed, setElapsed] = useState(0);
  const [sighs, setSighs] = useState(0);
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const sec = phase === 'in1' ? INHALE1 : phase === 'in2' ? INHALE2 : EXHALE;
    const toVal = phase === 'out' ? 0.8 : 1.2;
    Animated.timing(scale, { toValue: toVal, duration: sec * 1000, useNativeDriver: true }).start();
  }, [phase]);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => {
        if (e >= durationSeconds) {
          onComplete(e);
          return e;
        }
        return e + 1;
      });
      setCount((c) => {
        if (c <= 1) {
          if (phase === 'in1') {
            setPhase('in2');
            return INHALE2;
          }
          if (phase === 'in2') {
            setPhase('out');
            return EXHALE;
          }
          setPhase('in1');
          setSighs((s) => s + 1);
          return INHALE1;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, durationSeconds, onComplete]);

  const label = phase === 'in1' ? 'First inhale' : phase === 'in2' ? 'Top up' : 'Long exhale';

  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>{label}</Text>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
      <Text style={styles.countLabel}>{count}</Text>
      <Text style={styles.hint}>Double inhale, then long exhale</Text>
      <Text style={styles.sighs}>Sigh {sighs + 1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  phaseLabel: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 24 },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  countLabel: { marginTop: 24, fontSize: 48, fontWeight: '700', color: COLORS.text },
  hint: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  sighs: { marginTop: 8, fontSize: 13, color: COLORS.textMuted },
});
