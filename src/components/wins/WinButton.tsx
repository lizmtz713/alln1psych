/**
 * Small + button for home screen — opens Win Capture flow.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

export function WinButton() {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/win-capture');
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={handlePress}
    >
      <Text style={styles.plus}>+</Text>
      <Text style={styles.label}>Win</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonPressed: { opacity: 0.9 },
  plus: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text },
});
