/**
 * Emergency Mode — Breathe with me. Animated circle, 4-4-4 breathing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useEmergencyStore } from '../../src/stores/emergencyStore';

const ACCENT = COLORS.accent;
const IN = 4;
const HOLD = 4;
const OUT = 4;

export default function EmergencyBreatheScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useEmergencyStore.getState().recordAction('breathe');

  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [count, setCount] = useState(IN);
  const [running, setRunning] = useState(true);
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!running) return;
    const sec = phase === 'in' ? IN : phase === 'hold' ? HOLD : OUT;
    const toVal = phase === 'in' ? 1.2 : phase === 'hold' ? 1 : 0.6;
    Animated.timing(scale, { toValue: toVal, duration: sec * 1000, useNativeDriver: true }).start();
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          if (phase === 'in') { setPhase('hold'); return HOLD; }
          if (phase === 'hold') { setPhase('out'); return OUT; }
          setPhase('in');
          return IN;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, running]);

  const label = phase === 'in' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Breathe out';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Breathe with me</Text>
        <Text style={styles.subtitle}>Follow the circle.</Text>
        <Animated.View style={[styles.circleWrap, { transform: [{ scale }] }]}>
          <View style={styles.circle} />
        </Animated.View>
        <Text style={styles.phaseLabel}>{label}</Text>
        <Text style={styles.countLabel}>{count}</Text>
        <Pressable style={styles.stopBtn} onPress={() => { setRunning(false); router.back(); }}>
          <Text style={styles.stopBtnText}>Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { alignSelf: 'flex-start' },
  backText: { fontSize: 16, color: ACCENT },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xxl },
  circleWrap: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  circle: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  phaseLabel: { marginTop: 24, fontSize: 20, fontWeight: '600', color: COLORS.text },
  countLabel: { marginTop: 8, fontSize: 48, fontWeight: '700', color: COLORS.text },
  stopBtn: { marginTop: 32, paddingVertical: 12, paddingHorizontal: 24 },
  stopBtnText: { fontSize: 16, color: COLORS.textMuted },
});
