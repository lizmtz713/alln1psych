/**
 * CockpitStatusHeader — Pre-Flight / status at top of Cockpit.
 * Answers: How am I doing? (fastest possible understanding layer.)
 * Shows: time-aware greeting, system status, optional one-line summary.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

function getTimeAwareGreeting(firstName: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good morning, ${firstName}`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export interface CockpitStatusHeaderProps {
  /** User's first name */
  firstName: string;
  /** System status label: Thriving | Stable | Strained | Needs support | Check In */
  systemStatusLabel: string;
  /** Optional one-line summary (e.g. "Low sleep may be affecting State and Emotion today.") */
  summaryLine?: string | null;
}

export function CockpitStatusHeader({
  firstName,
  systemStatusLabel,
  summaryLine,
}: CockpitStatusHeaderProps) {
  const greeting = getTimeAwareGreeting(firstName);
  const date = formatDate();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.date}>{date}</Text>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>System status:</Text>
        <Text style={styles.statusValue}>{systemStatusLabel}</Text>
      </View>
      {summaryLine && summaryLine.trim() ? (
        <Text style={styles.summary} numberOfLines={2}>
          {summaryLine.trim()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  summary: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
