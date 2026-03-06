/**
 * GuidedPrompts — prompts per intent to reduce blank-box paralysis.
 * User can tap a prompt to use as a starting point.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { MindMailIntent } from '../../types/mindMail';

const PROMPTS_BY_INTENT: Record<MindMailIntent, string[]> = {
  encouragement: [
    "I'm thinking of you and wanted you to know I believe in you.",
    "You've got this. I'm in your corner.",
    "Whatever today holds, you don't have to face it alone.",
  ],
  gratitude: [
    "Thank you for being in my life. It matters more than I say.",
    "I don't say it enough: I'm grateful for you.",
    "Something you did recently really meant a lot to me.",
  ],
  apology: [
    "I'm sorry. I want you to know I see how that affected you.",
    "I was wrong about ___. I'm working on it.",
    "I hurt you and I'm sorry. Can we talk?",
  ],
  concern: [
    "Hey, I've been thinking about you. How are you really doing?",
    "No pressure to reply—just wanted to check in.",
    "You've been on my mind. Here if you want to talk.",
  ],
  boundary: [
    "I need to be honest about what works for me going forward.",
    "I care about you and also need to protect my energy. Here's what I need.",
    "This is hard to say, but I need to set a limit around ___.",
  ],
  grief: [
    "I'm so sorry you're going through this. I'm here.",
    "I don't have the right words. I just want you to know I see you.",
    "You don't have to be strong. I'm holding space for you.",
  ],
};

export interface GuidedPromptsProps {
  intent: MindMailIntent;
  onSelectPrompt: (text: string) => void;
}

export function GuidedPrompts({ intent, onSelectPrompt }: GuidedPromptsProps) {
  const prompts = PROMPTS_BY_INTENT[intent] ?? [];

  if (prompts.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Start from a prompt (optional)</Text>
      <View style={styles.list}>
        {prompts.map((p, i) => (
          <Pressable
            key={i}
            style={({ pressed }) => [styles.promptChip, pressed && styles.promptChipPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPrompt(p);
            }}
          >
            <Text style={styles.promptText} numberOfLines={2}>
              {p}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  list: {
    gap: 8,
  },
  promptChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  promptChipPressed: {
    backgroundColor: COLORS.surfaceElevated,
    opacity: 0.95,
  },
  promptText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
