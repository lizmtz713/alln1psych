/**
 * Focus Tool — Active focus timer session.
 * Route: /tools/focus/session?duration=15
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../src/lib/constants';
import { useFocusStore } from '../../../src/stores/focusStore';

const BG = COLORS.background;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

export default function FocusSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { duration } = useLocalSearchParams<{ duration?: string }>();
  const durationMinutes = Math.min(99, Math.max(1, parseInt(duration ?? '15', 10) || 15));
  const totalSeconds = durationMinutes * 60;

  const addSession = useFocusStore((s) => s.addSession);

  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startWall = useRef<number | null>(null);
  const elapsedWhenPaused = useRef(0);

  useEffect(() => {
    if (!running) return;
    startWall.current = startWall.current ?? Date.now();
    const t = setInterval(() => {
      const elapsed = elapsedWhenPaused.current + Math.round((Date.now() - (startWall.current ?? Date.now())) / 1000);
      const left = totalSeconds - elapsed;
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        setCompleted(true);
        addSession(durationMinutes, totalSeconds);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      setRemaining(left);
    }, 1000);
    return () => clearInterval(t);
  }, [running, totalSeconds, durationMinutes, addSession]);

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const elapsed = totalSeconds - remaining;
    elapsedWhenPaused.current = elapsed;
    startWall.current = null;
    setRunning(false);
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    startWall.current = Date.now();
    setRunning(true);
  };

  const handleEndEarly = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const completedSec = totalSeconds - remaining;
    addSession(durationMinutes, completedSec);
    router.back();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins + ':' + (secs < 10 ? '0' : '') + secs;

  if (completed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.doneTitle}>Focus session complete</Text>
          <Text style={styles.doneSub}>{durationMinutes} minutes</Text>
        </View>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
        <Text style={styles.headerTitle}>{durationMinutes} min focus</Text>
        <View style={styles.closeBtn} />
      </View>

      <View style={styles.timerWrap}>
        <Text style={styles.timer}>{display}</Text>
        <Text style={styles.timerSub}>{running ? 'Stay focused' : 'Tap Start when ready'}</Text>
      </View>

      <View style={styles.actions}>
        {running ? (
          <Pressable style={styles.pauseBtn} onPress={handlePause}>
            <Text style={styles.pauseBtnText}>Pause</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.startBtn} onPress={handleResume}>
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
        )}
        <Pressable style={styles.endBtn} onPress={handleEndEarly}>
          <Text style={styles.endBtnText}>End early</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  timerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timer: { fontSize: 56, fontWeight: '700', color: COLORS.accent, fontVariant: ['tabular-nums'] },
  timerSub: { fontSize: 16, color: TEXT_MUTED, marginTop: SPACING.md },
  actions: { padding: SPACING.lg, gap: SPACING.sm },
  startBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  pauseBtn: { backgroundColor: COLORS.surfaceElevated, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  pauseBtnText: { fontSize: 18, fontWeight: '600', color: TEXT },
  endBtn: { paddingVertical: 14, alignItems: 'center' },
  endBtnText: { fontSize: 16, color: TEXT_MUTED },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  doneTitle: { fontSize: 22, fontWeight: '700', color: TEXT },
  doneSub: { fontSize: 16, color: TEXT_MUTED, marginTop: 4 },
  doneBtn: { backgroundColor: COLORS.accent, marginHorizontal: SPACING.lg, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
