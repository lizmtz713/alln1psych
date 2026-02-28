/**
 * WeeklyReflectionCard Component
 * 
 * Shows on Learn tab or Cockpit once per week to prompt
 * the user for their value alignment check-in.
 * 
 * Design: Gentle, reflective, curious — not demanding.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useWeeklyReflection } from '../hooks/useDriftDetector';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../lib/constants';

interface Props {
  /** Variant affects styling — compact for cockpit, full for learn tab */
  variant?: 'compact' | 'full';
}

export function WeeklyReflectionCard({ variant = 'full' }: Props) {
  const router = useRouter();
  const { isDue, loading, hasValues, valuesCount } = useWeeklyReflection();

  // Don't show if not due or still loading
  if (loading || !isDue) {
    return null;
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/drift-detector');
  };

  if (variant === 'compact') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.compactContainer,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
      >
        <View style={styles.compactIcon}>
          <Text style={styles.compactEmoji}>🪞</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle}>Weekly check-in</Text>
          <Text style={styles.compactSubtitle}>
            {hasValues 
              ? 'How aligned were you?' 
              : 'Set your values to track'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      {/* Decorative top accent */}
      <View style={styles.accentBar} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>🪞</Text>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Time for your weekly value check-in</Text>
          <Text style={styles.subtitle}>
            {hasValues ? (
              valuesCount === 1 
                ? 'A moment to notice how you\'ve been living your value.'
                : `A moment to notice how you've been living your ${valuesCount} values.`
            ) : (
              'Start by choosing the values that matter most to you.'
            )}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>
              {hasValues ? 'Reflect' : 'Choose Values'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Gentle pattern indicator */}
      <View style={styles.footer}>
        <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.footerText}>Takes about 2 minutes</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  accentBar: {
    height: 3,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
  },
  content: {
    padding: SPACING.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emoji: {
    fontSize: 24,
  },
  textContent: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
  },
  buttonPressed: {
    backgroundColor: COLORS.accentDark,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  
  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  compactEmoji: {
    fontSize: 18,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  compactSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default WeeklyReflectionCard;
