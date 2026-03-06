/**
 * Your Life Today — Home section: System Check + Connection Prompt.
 * Daily Anchors: resets at midnight via dailyAnchorsStore.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SystemCheckCard } from './SystemCheckCard';
import { ConnectionPromptCard } from './ConnectionPromptCard';
import { useDailyAnchorsStore } from '../../stores/dailyAnchorsStore';
import { COLORS, SPACING } from '../../lib/constants';

export interface YourLifeTodaySectionProps {
  onPressCheckIn?: () => void;
}

export function YourLifeTodaySection({ onPressCheckIn }: YourLifeTodaySectionProps) {
  const router = useRouter();

  useEffect(() => {
    try {
      useDailyAnchorsStore.getState().ensureDate();
    } catch (_) { /* no-op: avoid throw on first load */ }
  }, []);

  const handleCheckIn = () => {
    router.push('/(modals)/cockpit-checkin');
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your life today</Text>
      <View style={styles.cards}>
        <View style={styles.cardWrap}>
          <SystemCheckCard onPressCheckIn={onPressCheckIn ?? handleCheckIn} />
        </View>
        <View style={styles.cardWrap}>
          <ConnectionPromptCard />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  cards: {},
  cardWrap: { marginBottom: 10 },
});
