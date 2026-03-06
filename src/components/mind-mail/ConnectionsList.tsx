/**
 * ConnectionsList — temperature rings + tap to compose Mind Mail.
 * Shown in Connections mode on Mind Mail index; tap opens compose with recipient pre-filled.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TemperatureGauge } from '../circle/TemperatureGauge';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { CircleMember } from '../../stores/circleStore';

export interface ConnectionsListProps {
  members: CircleMember[];
  onSelectPerson: (id: string, name: string) => void;
}

export function ConnectionsList({ members, onSelectPerson }: ConnectionsListProps) {
  if (members.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No one in your Circle yet.</Text>
        <Text style={styles.emptySub}>Add people in Lights or Circle to send Mind Mail.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {members.map((m) => (
        <Pressable
          key={m.id}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPerson(m.id, m.name);
          }}
        >
          <TemperatureGauge temperature={m.temperature ?? 'green'} size="sm" noPulse />
          <View style={styles.rowBody}>
            <Text style={styles.name} numberOfLines={1}>
              {m.name}
            </Text>
            {m.temperatureLabel ? (
              <Text style={styles.label} numberOfLines={1}>
                {m.temperatureLabel}
              </Text>
            ) : null}
          </View>
          <Text style={styles.chevron}>→</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowBody: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  empty: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
