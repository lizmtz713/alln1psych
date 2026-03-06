/**
 * ConstellationTimeline — 7d / 30d / All time range selector.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { TimelineRange } from '../../types/lightsConstellation';
import { COLORS } from '../../lib/constants';

export interface ConstellationTimelineProps {
  value: TimelineRange;
  onChange: (range: TimelineRange) => void;
}

const OPTIONS: { value: TimelineRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

export function ConstellationTimeline({ value, onChange }: ConstellationTimelineProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>View</Text>
      <View style={styles.segmented}>
        {OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(opt.value);
              }}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 12 },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: COLORS.accentBg,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  segmentText: { fontSize: 14, color: COLORS.textSecondary },
  segmentTextActive: { color: COLORS.accent, fontWeight: '600' },
});
