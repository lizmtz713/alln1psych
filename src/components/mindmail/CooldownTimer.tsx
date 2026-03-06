/**
 * Mind Mail Safety - Cooldown countdown.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SendType } from '../../stores/mindMailStore';
import { getCooldownRemaining, COOLDOWN_MINUTES } from '../../services/mindMailSafetyService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

export interface CooldownTimerProps {
  sendType: SendType;
  onDone?: () => void;
}

export function CooldownTimer(props: CooldownTimerProps) {
  const { sendType, onDone } = props;
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const remaining = await getCooldownRemaining(sendType);
      if (!cancelled) {
        setMinutesLeft(remaining);
        if (remaining <= 0) onDone?.();
      }
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sendType, onDone]);

  if (minutesLeft == null || minutesLeft <= 0) return null;

  const label = sendType === 'anonymous' ? 'Anonymous' : sendType === 'soft' ? 'Soft-share' : String(sendType);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Cooldown - {label}</Text>
      <Text style={styles.body}>
        You can send another {label.toLowerCase()} message in <Text style={styles.minutes}>{minutesLeft} min</Text>. This helps keep things calm.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginVertical: SPACING.sm },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  body: { fontSize: 13, color: COLORS.textSecondary },
  minutes: { fontWeight: '700', color: COLORS.accent },
});
