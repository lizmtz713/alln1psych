/**
 * ToolIntro — Orient before act.
 * Pattern: tool name → human situation → what it helps you do → Start.
 * Optional: "Why this helps" for credibility.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { ToolIntroContent } from '../../data/toolIntroContent';

export interface ToolIntroProps {
  content: ToolIntroContent;
  onStart: () => void;
  /** When provided, a Back control is shown (e.g. when intro is full-screen with no modal header). */
  onBack?: () => void;
}

export function ToolIntro({ content, onStart, onBack }: ToolIntroProps) {
  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStart();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  return (
    <>
      {onBack ? (
        <Pressable style={styles.backWrap} onPress={handleBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.emoji}>{content.icon}</Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.humanSituation}>{content.humanSituation}</Text>
          <Text style={styles.whatItHelps}>{content.whatItHelps}</Text>
          {content.whyThisHelps ? (
            <View style={styles.whyWrap}>
              <Text style={styles.whyLabel}>Why this helps</Text>
              <Text style={styles.whyText}>{content.whyThisHelps}</Text>
            </View>
          ) : null}
        </View>
        <Pressable
          style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
          onPress={handleStart}
        >
          <Text style={styles.startBtnText}>Start</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  backWrap: { padding: 12, paddingLeft: 8, marginBottom: 8 },
  backText: { fontSize: 16, color: COLORS.accent, fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: 24,
  },
  emoji: { fontSize: 36, marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  humanSituation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  whatItHelps: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  whyWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  whyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  whyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnPressed: { opacity: 0.9 },
  startBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
