/**
 * Box Breathing — 4-4-4-4 (inhale, hold, exhale, hold). Calms nervous system.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

const IN = 4;
const HOLD1 = 4;
const OUT = 4;
const HOLD2 = 4;
const CYCLE_SEC = IN + HOLD1 + OUT + HOLD2;

export interface BoxBreathingProps {
  /** Total duration in seconds (default 2 min). Will complete after N seconds or full cycles. */
  durationSeconds?: number;
  onComplete: (durationSeconds: number) => void;
}

type Phase = 'in' | 'hold1' | 'out' | 'hold2';

export function BoxBreathing({ durationSeconds = 120, onComplete }: BoxBreathingProps) {
  const [phase, setPhase] = useState<Phase>('in');
  const [count, setCount] = useState(IN);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const sec = phase === 'in' ? IN : phase === 'hold1' ? HOLD1 : phase === 'out' ? OUT : HOLD2;
    const toVal = phase === 'in' ? 1.15 : phase === 'hold1' ? 1.15 : phase === 'out' ? 0.85 : 0.85;
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
          if (phase === 'in') {
            setPhase('hold1');
            return HOLD1;
          }
          if (phase === 'hold1') {
            setPhase('out');
            return OUT;
          }
          if (phase === 'out') {
            setPhase('hold2');
            return HOLD2;
          }
          setPhase('in');
          setCycles((cy) => cy + 1);
          return IN;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, durationSeconds, onComplete]);

  const label =
    phase === 'in'
      ? 'Breathe in'
      : phase === 'hold1'
        ? 'Hold'
        : phase === 'out'
          ? 'Breathe out'
          : 'Hold';

  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>{label}</Text>
      <Animated.View style={[styles.box, { transform: [{ scale }] }]}>
        <View style={styles.boxInner} />
      </Animated.View>
      <Text style={styles.countLabel}>{count}</Text>
      <Text style={styles.hint}>4 in · 4 hold · 4 out · 4 hold</Text>
      <Text style={styles.cycles}>Cycle {cycles + 1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  phaseLabel: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 24 },
  box: {
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxInner: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  countLabel: { marginTop: 24, fontSize: 48, fontWeight: '700', color: COLORS.text },
  hint: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  cycles: { marginTop: 8, fontSize: 13, color: COLORS.textMuted },
});
