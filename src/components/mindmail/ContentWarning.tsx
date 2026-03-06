/**
 * Mind Mail Safety — Receiver: sensitive content warning with Show / Dismiss.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../lib/constants';

export interface ContentWarningProps {
  children: React.ReactNode;
  label?: string;
}

export function ContentWarning({ children, label = 'This message may contain sensitive content.' }: ContentWarningProps) {
  const [state, setState] = useState<'hidden' | 'show' | 'dismissed'>('hidden');

  const handleShow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('show');
  };
  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('dismissed');
  };

  if (state === 'show') return <View style={styles.revealed}>{children}</View>;
  if (state === 'dismissed') {
    return (
      <View style={styles.dismissedWrap}>
        <Text style={styles.dismissedText}>You chose not to view this message.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.btn, styles.btnShow, pressed && styles.pressed]} onPress={handleShow}>
          <Text style={styles.btnShowText}>Show</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.btn, styles.btnDismiss, pressed && styles.pressed]} onPress={handleDismiss}>
          <Text style={styles.btnDismissText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.amber, padding: SPACING.md, marginVertical: SPACING.sm },
  label: { ...TYPOGRAPHY.body, color: COLORS.text, marginBottom: SPACING.sm },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  btn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.button },
  btnShow: { backgroundColor: COLORS.accent },
  btnShowText: { ...TYPOGRAPHY.bodySm, fontWeight: '600', color: '#fff' },
  btnDismiss: { borderWidth: 1, borderColor: COLORS.border },
  btnDismissText: { ...TYPOGRAPHY.bodySm, color: COLORS.textSecondary },
  pressed: { opacity: 0.8 },
  revealed: { marginVertical: SPACING.sm },
  dismissedWrap: { padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.border },
  dismissedText: { ...TYPOGRAPHY.secondary, color: COLORS.textMuted, fontStyle: 'italic' },
});
