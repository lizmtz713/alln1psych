/**
 * AchievementModal — Shown when an achievement unlocks.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { getAchievementById } from '../../data/achievements';

export interface AchievementModalProps {
  achievementId: string | null;
  visible: boolean;
  onDismiss: () => void;
}

export function AchievementModal({ achievementId, visible, onDismiss }: AchievementModalProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const achievement = achievementId ? getAchievementById(achievementId) : null;

  useEffect(() => {
    if (visible && achievement) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.9);
      opacity.setValue(0);
    }
  }, [visible, achievement]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  if (!achievement) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.emoji}>{achievement.emoji}</Text>
          <Text style={styles.title}>Achievement Unlocked!</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleDismiss}
          >
            <Text style={styles.buttonText}>Nice!</Text>
          </Pressable>
        </Animated.View>
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
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.accentMuted,
  },
  emoji: { fontSize: 56, marginBottom: SPACING.md },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.button,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
