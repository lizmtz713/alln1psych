/**
 * Circumplex-style emotion picker — Energy × Valence (science-backed, own visual).
 * One tap: pick quadrant. High/low energy × pleasant/unpleasant.
 * Not copying Apple's flower; different layout and copy.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

export interface CircumplexOption {
  id: string;
  label: string;
  state: number;
  emotion: number;
  /** Quadrant: high-pleasant, high-unpleasant, low-pleasant, low-unpleasant */
  quadrant: 'hp' | 'hu' | 'lp' | 'lu';
}

const OPTIONS: CircumplexOption[] = [
  { id: 'excited', label: 'Excited', state: 78, emotion: 82, quadrant: 'hp' },
  { id: 'focused', label: 'Focused', state: 72, emotion: 75, quadrant: 'hp' },
  { id: 'calm', label: 'Calm', state: 85, emotion: 80, quadrant: 'lp' },
  { id: 'content', label: 'Content', state: 80, emotion: 78, quadrant: 'lp' },
  { id: 'stressed', label: 'Stressed', state: 38, emotion: 42, quadrant: 'hu' },
  { id: 'anxious', label: 'Anxious', state: 35, emotion: 38, quadrant: 'hu' },
  { id: 'drained', label: 'Drained', state: 42, emotion: 45, quadrant: 'lu' },
  { id: 'sad', label: 'Sad', state: 40, emotion: 28, quadrant: 'lu' },
];

const QUADRANT_LABELS = {
  hp: 'High energy · Pleasant',
  hu: 'High energy · Unpleasant',
  lp: 'Low energy · Pleasant',
  lu: 'Low energy · Unpleasant',
};

export interface CircumplexEmotionPickerProps {
  selectedId: string | null;
  onSelect: (option: CircumplexOption) => void;
  /** Compact: show 4 quadrants only (one option per quadrant). */
  compact?: boolean;
}

export function CircumplexEmotionPicker({
  selectedId,
  onSelect,
  compact = false,
}: CircumplexEmotionPickerProps) {
  const [expandedQuadrant, setExpandedQuadrant] = useState<'hp' | 'hu' | 'lp' | 'lu' | null>(null);

  const handleQuadrantPress = (quadrant: 'hp' | 'hu' | 'lp' | 'lu') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (compact) {
      const first = OPTIONS.find((o) => o.quadrant === quadrant);
      if (first) onSelect(first);
      return;
    }
    setExpandedQuadrant((prev) => (prev === quadrant ? null : quadrant));
  };

  const handleOptionPress = (opt: CircumplexOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(opt);
    setExpandedQuadrant(null);
  };

  if (compact) {
    const quadrants: ('hp' | 'hu' | 'lp' | 'lu')[] = ['hp', 'lp', 'hu', 'lu'];
    return (
      <View style={styles.compactRoot}>
        <Text style={styles.axisLabel}>Pleasant ← → Unpleasant</Text>
        <View style={styles.compactGrid}>
          {quadrants.map((q) => {
            const opt = OPTIONS.find((o) => o.quadrant === q);
            const selected = opt && selectedId === opt.id;
            if (!opt) return null;
            return (
              <Pressable
                key={q}
                style={[styles.compactCell, styles[`cell_${q}`], selected && styles.compactCellSelected]}
                onPress={() => handleQuadrantPress(q)}
              >
                <Text style={[styles.compactCellText, selected && styles.compactCellTextSelected]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.axisLabel}>↑ Energy</Text>
      </View>
    );
  }

  const quadrants: ('hp' | 'hu' | 'lp' | 'lu')[] = ['hp', 'hu', 'lp', 'lu'];
  return (
    <View style={styles.root}>
      <Text style={styles.axisLabel}>Pleasant ← → Unpleasant</Text>
      <View style={styles.grid}>
        {quadrants.map((q) => {
          const optionsInQuadrant = OPTIONS.filter((o) => o.quadrant === q);
          const isExpanded = expandedQuadrant === q;
          const selectedInQuadrant = optionsInQuadrant.find((o) => o.id === selectedId);
          return (
            <View key={q} style={[styles.cell, styles[`cell_${q}`]]}>
              <Pressable
                style={[styles.quadrantBtn, selectedInQuadrant && styles.quadrantBtnSelected]}
                onPress={() => handleQuadrantPress(q)}
              >
                <Text style={styles.quadrantLabel}>{QUADRANT_LABELS[q]}</Text>
                {selectedInQuadrant && (
                  <Text style={styles.quadrantSelectedText}>{selectedInQuadrant.label}</Text>
                )}
              </Pressable>
              {isExpanded && (
                <View style={styles.optionsPop}>
                  {optionsInQuadrant.map((opt) => (
                    <Pressable
                      key={opt.id}
                      style={[styles.optionBtn, selectedId === opt.id && styles.optionBtnSelected]}
                      onPress={() => handleOptionPress(opt)}
                    >
                      <Text style={[styles.optionBtnText, selectedId === opt.id && styles.optionBtnTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.axisLabel}>↑ Energy</Text>
    </View>
  );
}

const cellBase: ViewStyle = {
  flex: 1,
  minHeight: 88,
  padding: SPACING.sm,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: BORDER_RADIUS.md,
  borderWidth: 1,
  borderColor: COLORS.border,
};

const styles = StyleSheet.create({
  root: { marginVertical: SPACING.md },
  compactRoot: { marginVertical: SPACING.md },
  axisLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: '48%',
    minHeight: 96,
  },
  cell_hp: {},
  cell_hu: {},
  cell_lp: {},
  cell_lu: {},
  quadrantBtn: {
    ...cellBase,
    width: '100%',
    minHeight: 88,
    backgroundColor: COLORS.surface,
  },
  quadrantBtnSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg ?? 'rgba(124,77,255,0.12)',
  },
  quadrantLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4 },
  quadrantSelectedText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  optionsPop: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionBtnSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  optionBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  optionBtnTextSelected: { color: COLORS.accent },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  compactCell: {
    ...cellBase,
    width: '48%',
    minHeight: 80,
    backgroundColor: COLORS.surface,
  } as const,
  compactCellSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg ?? 'rgba(124,77,255,0.12)',
  },
  compactCellText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  compactCellTextSelected: { color: COLORS.accent },
});
