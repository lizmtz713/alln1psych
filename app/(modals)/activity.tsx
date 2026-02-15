/**
 * Activity modal — supports breathing and other types.
 * Route: /(modals)/activity?id=breathing
 */

import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { getActivityById } from '../../src/lib/activities';

type BreathPhase = 'inhale' | 'hold' | 'exhale';
const BOX_BREATH = { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 };

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const activity = id ? getActivityById(id) : null;
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const { width } = useWindowDimensions();
  const circleSize = Math.min(width * 0.5, 200);

  useEffect(() => {
    if (!running || activity?.id !== 'breathing') return;
    const phases: BreathPhase[] = ['inhale', 'hold', 'exhale', 'hold'];
    const durations = [BOX_BREATH.inhale, BOX_BREATH.hold, BOX_BREATH.exhale, BOX_BREATH.holdAfter];
    let phaseIndex = 0;
    let sec = 0;
    const t = setInterval(() => {
      sec++;
      setCount(sec);
      if (sec >= durations[phaseIndex]) {
        sec = 0;
        phaseIndex = (phaseIndex + 1) % 4;
        setPhase(phases[phaseIndex]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [running, activity?.id]);

  if (!activity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.error}>Activity not found.</Text>
      </View>
    );
  }

  if (activity.id === 'breathing') {
    const phaseLabel = phase === 'inhale' ? 'Breathe in' : phase === 'exhale' ? 'Breathe out' : 'Hold';
    const scaleNum = phase === 'inhale' ? 1.4 : phase === 'exhale' ? 0.7 : 1.1;
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
        <Text style={styles.sub}>Box breathing — 4 in, 4 hold, 4 out, 4 hold.</Text>
        {!running ? (
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setRunning(true);
              setPhase('inhale');
              setCount(0);
            }}
          >
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
        ) : (
          <>
            <View style={[styles.circleWrap, { width: circleSize, height: circleSize }]}>
              <View
                style={[
                  styles.circle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    transform: [{ scale: phase === 'inhale' ? 1.35 : phase === 'exhale' ? 0.75 : 1.1 }],
                  },
                ]}
              />
            </View>
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
            <Pressable style={styles.stopBtn} onPress={() => setRunning(false)}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>
      <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
      <Text style={styles.placeholder}>Coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  backBtn: {
    padding: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 32,
  },
  error: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: 24,
  },
  pressed: { opacity: 0.9 },
  startBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  circleWrap: {
    alignSelf: 'center',
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: COLORS.accent,
    opacity: 0.6,
  },
  phaseLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 32,
  },
  stopBtn: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  stopBtnText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
});
