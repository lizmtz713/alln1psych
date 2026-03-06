/**
 * System Check card — "Your Life Today": CTA to check in or post-check insight.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useCockpitStore } from '../../stores/cockpitStore';
import { COLORS, SPACING } from '../../lib/constants';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface SystemCheckCardProps {
  onPressCheckIn: () => void;
}

export function SystemCheckCard({ onPressCheckIn }: SystemCheckCardProps) {
  const lastCheckInDate = useCockpitStore((s) => s.lastCheckInDate);
  const crossSystemInsight = useCockpitStore((s) => s.crossSystemInsight);
  const getCrossSystemInsight = useCockpitStore((s) => s.getCrossSystemInsight);

  const checkedInToday = lastCheckInDate === todayKey();

  useEffect(() => {
    if (checkedInToday && !crossSystemInsight) {
      getCrossSystemInsight();
    }
  }, [checkedInToday, crossSystemInsight, getCrossSystemInsight]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressCheckIn();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      disabled={checkedInToday}
    >
      {!checkedInToday ? (
        <>
          <Text style={styles.emoji}>🩺</Text>
          <View style={styles.textWrap}>
            <Text style={styles.title}>How are you today?</Text>
            <Text style={styles.sub}>Quick check-in — 6 gauges, under a minute</Text>
          </View>
          <Text style={styles.cta}>Check in</Text>
        </>
      ) : (
        <>
          <Text style={styles.emoji}>✓</Text>
          <View style={styles.textWrap}>
            <Text style={styles.title}>You checked in today</Text>
            <Text style={styles.sub} numberOfLines={2}>
              {crossSystemInsight || 'Your gauges are updated. Small steps count.'}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardPressed: { opacity: 0.9 },
  emoji: { fontSize: 24 },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  sub: { fontSize: 13, color: COLORS.textSecondary },
  cta: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
});
