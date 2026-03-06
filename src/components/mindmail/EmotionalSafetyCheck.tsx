/**
 * Mind Mail Safety - Pre-send checklist.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

const CHECK_ITEMS = [
  'Is this kind?',
  'Is this something you would say to their face?',
  'Take a breath. Send when ready.',
];

export interface EmotionalSafetyCheckProps {
  onConfirm: () => void;
  onCancel?: () => void;
}

export function EmotionalSafetyCheck(props: EmotionalSafetyCheckProps) {
  const { onConfirm, onCancel } = props;
  const [checked, setChecked] = useState(0);
  const allChecked = checked >= CHECK_ITEMS.length;

  const toggle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked((c) => (c === index ? index - 1 : index + 1));
  };

  const handleConfirm = () => {
    if (!allChecked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Before you send</Text>
      <Text style={styles.sub}>A quick check-in for you and for them.</Text>
      {CHECK_ITEMS.map((label, i) => (
        <Pressable key={i} style={styles.row} onPress={() => toggle(i)}>
          <View style={[styles.box, i <= checked && styles.boxChecked]}>
            {i <= checked ? <Text style={styles.check}>✓</Text> : null}
          </View>
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      ))}
      <View style={styles.actions}>
        {onCancel && (
          <Pressable style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.pressed]} onPress={onCancel}>
            <Text style={styles.btnSecondaryText}>Cancel</Text>
          </Pressable>
        )}
        <Pressable style={({ pressed }) => [styles.btn, styles.btnPrimary, !allChecked && styles.btnDisabled, pressed && allChecked && styles.pressed]} onPress={handleConfirm} disabled={!allChecked}>
          <Text style={[styles.btnPrimaryText, !allChecked && styles.btnPrimaryTextDisabled]}>Send when ready</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg },
  title: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  sub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  boxChecked: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  check: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  label: { fontSize: 15, lineHeight: 22, color: COLORS.text, flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.lg },
  btn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.button },
  btnSecondary: { borderWidth: 1, borderColor: COLORS.border },
  btnSecondaryText: { fontSize: 14, color: COLORS.textSecondary },
  btnPrimary: { backgroundColor: COLORS.accent },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  btnPrimaryTextDisabled: { color: COLORS.textMuted },
  pressed: { opacity: 0.8 },
});
