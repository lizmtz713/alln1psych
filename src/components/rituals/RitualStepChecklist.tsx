/**
 * RitualStepChecklist — Completion loop: each step lights up a gauge.
 * Tap to complete → gauge delta applied → "Body +2" feedback.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import type { GaugeKey } from '../../stores/cockpitStore';

export interface RitualStepDef {
  id: string;
  label: string;
  /** Gauge key and delta applied when step is completed (e.g. { body: 2 }). Multiple = multiple chips. */
  deltas: Partial<Record<GaugeKey, number>>;
}

export interface RitualStepChecklistProps {
  steps: RitualStepDef[];
  completedIds: string[];
  onCompleteStep: (step: RitualStepDef) => void;
  /** Optional: show step numbers */
  showNumbers?: boolean;
}

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

export function RitualStepChecklist({
  steps,
  completedIds,
  onCompleteStep,
  showNumbers = true,
}: RitualStepChecklistProps) {
  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => {
        const done = completedIds.includes(step.id);
        return (
          <RitualStepRow
            key={step.id}
            step={step}
            index={showNumbers ? index + 1 : undefined}
            done={done}
            onPress={() => {
              if (done) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCompleteStep(step);
            }}
          />
        );
      })}
    </View>
  );
}

function RitualStepRow({
  step,
  index,
  done,
  onPress,
}: {
  step: RitualStepDef;
  index?: number;
  done: boolean;
  onPress: () => void;
}) {
  const [feedback, setFeedback] = useState<Array<{ gauge: GaugeKey; delta: number }>>([]);

  const handlePress = () => {
    if (done) return;
    onPress();
    const entries = Object.entries(step.deltas).filter(([, d]) => typeof d === 'number' && d > 0) as [GaugeKey, number][];
    setFeedback(entries.map(([gauge, delta]) => ({ gauge, delta })));
    const t = setTimeout(() => setFeedback([]), 1800);
    return () => clearTimeout(t);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, done && styles.rowDone, pressed && !done && styles.rowPressed]}
      onPress={handlePress}
    >
      <View style={styles.left}>
        <View style={[styles.checkbox, done && styles.checkboxDone]}>
          {done ? (
            <Ionicons name="checkmark" size={18} color="#fff" />
          ) : (
            <View style={styles.checkboxEmpty} />
          )}
        </View>
        {index != null && <Text style={styles.num}>{index}</Text>}
        <Text style={[styles.label, done && styles.labelDone]}>{step.label}</Text>
      </View>
      {feedback.length > 0 && (
        <View style={styles.feedbackRow}>
          {feedback.map(({ gauge, delta }) => (
            <View key={gauge} style={styles.feedbackChip}>
              <Text style={[styles.feedbackText, { color: (COLORS as any).gauges?.[gauge] ?? COLORS.accent }]}>
                {GAUGE_LABELS[gauge]} +{delta}
              </Text>
            </View>
          ))}
        </View>
      )}
      {done && feedback.length === 0 && (
        <View style={styles.feedbackRow}>
          {Object.entries(step.deltas).map(([gauge, delta]) =>
            typeof delta === 'number' && delta > 0 ? (
              <View key={gauge} style={styles.feedbackChipSmall}>
                <Text style={[styles.feedbackTextSmall, { color: (COLORS as any).gauges?.[gauge as GaugeKey] ?? COLORS.accent }]}>
                  {GAUGE_LABELS[gauge as GaugeKey]} ↑
                </Text>
              </View>
            ) : null
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: SPACING.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowDone: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg ?? 'rgba(124,77,255,0.08)' },
  rowPressed: { opacity: 0.9 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkboxEmpty: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'transparent' },
  num: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, minWidth: 18 },
  label: { fontSize: 16, fontWeight: '500', color: COLORS.text, flex: 1 },
  labelDone: { color: COLORS.textSecondary },
  feedbackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, width: '100%', marginLeft: 36 },
  feedbackChip: {
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  feedbackText: { fontSize: 13, fontWeight: '700' },
  feedbackChipSmall: {
    backgroundColor: COLORS.background,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  feedbackTextSmall: { fontSize: 12, fontWeight: '600' },
});
