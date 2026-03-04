/**
 * Emergency Mode prompt — "Would you like to switch to Emergency Mode?"
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../lib/constants';

interface EmergencyPromptModalProps {
  visible: boolean;
  onYes: () => void;
  onNotNow: () => void;
}

export function EmergencyPromptModal({ visible, onYes, onNotNow }: EmergencyPromptModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { paddingBottom: insets.bottom + SPACING.lg }]}>
          <Text style={styles.title}>It seems like you're having a really hard time right now.</Text>
          <Text style={styles.body}>
            Would you like to switch to Emergency Mode? It simplifies everything so you can focus on what matters.
          </Text>
          <View style={styles.buttons}>
            <Pressable style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]} onPress={onYes}>
              <Text style={styles.btnPrimaryText}>Yes</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]} onPress={onNotNow}>
              <Text style={styles.btnSecondaryText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  buttons: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  btnPrimary: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  btnSecondaryText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  pressed: { opacity: 0.9 },
});
