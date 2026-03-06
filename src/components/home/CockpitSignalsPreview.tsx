/**
 * CockpitSignalsPreview — Relationship preview without replacing Signals tab.
 * One line (e.g. "3 people may need attention"), optional hero, shortcut to Signals.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../lib/constants';

export interface CockpitSignalsPreviewProps {
  /** Number of people needing attention (from Signals logic) */
  needAttentionCount: number;
  /** Hero name for today (optional) */
  heroName?: string | null;
  /** Hero id for deep link to Transmit */
  heroId?: string | null;
}

export function CockpitSignalsPreview({
  needAttentionCount,
  heroName,
  heroId,
}: CockpitSignalsPreviewProps) {
  const router = useRouter();

  const openSignals = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/signals');
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Signals</Text>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={openSignals}
      >
        <Text style={styles.line}>
          {needAttentionCount === 0
            ? 'Your people are in view'
            : needAttentionCount === 1
              ? '1 person may need attention'
              : `${needAttentionCount} people may need attention`}
        </Text>
        {heroName ? (
          <Text style={styles.hero}>Today: {heroName}</Text>
        ) : null}
        <Text style={styles.cta}>Open Signals →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  cardPressed: { opacity: 0.92 },
  line: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  hero: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  cta: { fontSize: 13, color: COLORS.accent, fontWeight: '600', marginTop: 8 },
});
