/**
 * CockpitContextStrip — Context layer below the instrument cluster.
 * Explains why gauges are what they are (sleep, cycle, life transition, stress).
 * See docs/CONTEXT_SYSTEM.md. When items empty, renders nothing.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

export interface ContextItem {
  id: string;
  label: string;
  detail?: string;
}

export interface CockpitContextStripProps {
  items: ContextItem[];
  /** e.g. "Context affecting your system" */
  sectionTitle?: string;
}

export function CockpitContextStrip({ items, sectionTitle = 'Context' }: CockpitContextStripProps) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{sectionTitle}</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'stretch',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: { marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  detail: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
