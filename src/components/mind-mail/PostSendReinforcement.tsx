/**
 * PostSendReinforcement — "Connection strengthened" overlay after sending Mind Mail.
 * Closes the loop Daily Anchors opened; user dismisses to return.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';

export interface PostSendReinforcementProps {
  visible: boolean;
  onDismiss: () => void;
}

export function PostSendReinforcement({ visible, onDismiss }: PostSendReinforcementProps) {
  const handleDismiss = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <View style={styles.card}>
          <Text style={styles.emoji}>💜</Text>
          <Text style={styles.title}>Connection strengthened</Text>
          <Text style={styles.sub}>Small steps strengthen big bonds.</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleDismiss}
          >
            <Text style={styles.buttonText}>Done</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 280,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.accent,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
