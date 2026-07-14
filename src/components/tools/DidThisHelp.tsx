/**
 * Did this help? — Quick feedback after using a tool.
 * See docs/TOOL-QUALITY-STANDARD.md (Step 8).
 * Use at the bottom of tool result screens to measure usefulness.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { recordInterventionOutcome, type OutcomeValue } from '../../services/learningLoop';

export interface DidThisHelpProps {
  /** Tool id for analytics (e.g. 'quick-decision', 'tone-check'). */
  toolId: string;
  /** Called with (helpful, toolId). Optional: persist or send to backend. */
  onFeedback?: (helpful: boolean, toolId: string) => void;
  /** Optional: after feedback, navigate back or close. */
  onAfterFeedback?: () => void;
  /** Override prompt. Default: "Did this help?" */
  prompt?: string;
}

export function DidThisHelp({
  toolId,
  onFeedback,
  onAfterFeedback,
  prompt = 'Did this help?',
}: DidThisHelpProps) {
  const [answered, setAnswered] = useState<OutcomeValue | null>(null);

  const handlePress = (outcome: OutcomeValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswered(outcome);
    void recordInterventionOutcome({ toolId, outcome });
    onFeedback?.(outcome === 'better', toolId);
    onAfterFeedback?.();
  };

  if (answered !== null) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.thanks}>Thanks for your feedback.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={() => handlePress('better')}
        >
          <Text style={styles.btnText}>Better</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={() => handlePress('same')}
        >
          <Text style={styles.btnText}>Same</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => handlePress('worse')}>
          <Text style={styles.btnText}>Worse</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => handlePress('unsure')}>
          <Text style={styles.btnText}>Not sure</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  prompt: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  pressed: { opacity: 0.85 },
  btnText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  thanks: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
