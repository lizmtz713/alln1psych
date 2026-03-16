/**
 * Short Walk — 2–5 min walk to regulate. Instruction + Done.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../../lib/constants';

export interface ShortWalkProps {
  onComplete: (durationSeconds: number) => void;
}

const SUGGESTED_SECONDS = 180; // 3 min

export function ShortWalk({ onComplete }: ShortWalkProps) {
  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(SUGGESTED_SECONDS);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚶</Text>
      <Text style={styles.title}>Short walk</Text>
      <Text style={styles.body}>
        Take 2–5 minutes. Step outside or walk around the room. Focus on your steps and what you see and hear. No phone. Just movement and presence.
      </Text>
      <Text style={styles.hint}>When you’re done, tap below.</Text>
      <Pressable style={styles.doneBtn} onPress={handleDone}>
        <Text style={styles.doneBtnText}>I did it</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: SPACING.md },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  hint: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl },
  doneBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  doneBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
