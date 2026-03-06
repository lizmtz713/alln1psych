/**
 * IntentSelector — 6 intent options before composing Mind Mail.
 * Reduces anxiety by choosing purpose first (relationship-first flow).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import { MIND_MAIL_INTENTS, type MindMailIntent } from '../../types/mindMail';

export interface IntentSelectorProps {
  selectedIntent: MindMailIntent | null;
  onSelect: (intent: MindMailIntent) => void;
}

export function IntentSelector({ selectedIntent, onSelect }: IntentSelectorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>What's this about?</Text>
      <View style={styles.grid}>
        {MIND_MAIL_INTENTS.map(({ id, label, emoji }) => {
          const isSelected = selectedIntent === id;
          return (
            <Pressable
              key={id}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(id);
              }}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  chipPressed: {
    opacity: 0.9,
  },
  emoji: {
    fontSize: 18,
  },
  chipLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: COLORS.accent,
  },
});
