/**
 * PreFlightComplete — Completion screen after Pre-Flight: optional insight, journal save.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FlightInsights, type FlightInsightItem } from './FlightInsights';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

export interface PreFlightCompleteProps {
  /** Single insight from sleep voice (optional). */
  insights: FlightInsightItem[];
  onTakeOff: () => void;
}

export function PreFlightComplete({ insights, onTakeOff }: PreFlightCompleteProps) {
  const handleTakeOff = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTakeOff();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>☀️</Text>
      <Text style={styles.title}>Ready for takeoff</Text>
      <Text style={styles.subtitle}>Your morning check-in is saved.</Text>

      <FlightInsights insights={insights} aiOnly={true} />

      <Pressable
        onPress={handleTakeOff}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Let&apos;s go</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  button: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
