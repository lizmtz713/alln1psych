/**
 * Home screen entry points for Cockpit Snapshot — share/save current gauges as a card.
 * Use near the cockpit: icon-only button or chip style.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';

export interface CockpitShareButtonProps {
  /** Icon-only (no "Share" label) */
  compact?: boolean;
}

export function CockpitShareButton({ compact }: CockpitShareButtonProps) {
  const router = useRouter();

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/share/cockpit');
  };

  if (compact) {
    return (
      <Pressable onPress={onPress} style={styles.iconBtn} hitSlop={12}>
        <Ionicons name="share-outline" size={22} color={COLORS.textMuted} />
      </Pressable>
    );
  }

  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onPress}>
      <Ionicons name="share-outline" size={18} color={COLORS.accent} />
      <Text style={styles.buttonText}>Share</Text>
    </Pressable>
  );
}

export function ShareCockpitChip() {
  const router = useRouter();

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/share/cockpit');
  };

  return (
    <Pressable style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]} onPress={onPress}>
      <Ionicons name="share-outline" size={16} color={COLORS.accent} />
      <Text style={styles.chipText}>Share snapshot</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: { padding: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipPressed: { opacity: 0.9 },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
});
