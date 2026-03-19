/**
 * Friendship radar — Surfaces 5 / 15 / 50 tiers from lights (constellation data).
 * "5 closest" · "15 close" · "50 wider" with counts and optional names.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCircleStore } from '../../stores/circleStore';
import { useLightsStore } from '../../stores/lightsStore';
import type { Light } from '../../types/lights';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

const TIER_LABELS: Record<string, { label: string; sub: string }> = {
  five: { label: '5 closest', sub: 'Your inner circle' },
  fifteen: { label: '15 close', sub: 'Regular connection' },
  fifty: { label: '50 wider', sub: 'Broader circle' },
};

function groupLightsByTier(lights: Light[]): Record<string, Light[]> {
  const groups: Record<string, Light[]> = { five: [], fifteen: [], fifty: [], network: [], archived: [] };
  for (const l of lights) {
    if (groups[l.tier]) groups[l.tier].push(l);
  }
  return groups;
}

export function FriendshipRadar() {
  const members = useCircleStore((s) => s.members);
  const getLights = useLightsStore((s) => s.getLights);
  const lights = getLights(members);
  const byTier = groupLightsByTier(lights);

  const tiers = (['five', 'fifteen', 'fifty'] as const).map((tier) => ({
    tier,
    ...TIER_LABELS[tier],
    count: byTier[tier]?.length ?? 0,
    names: (byTier[tier] ?? []).slice(0, 5).map((l) => l.name),
  }));

  const total = tiers.reduce((s, t) => s + t.count, 0);
  if (total === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your circle</Text>
      <Text style={styles.subtitle}>5 closest · 15 close · 50 wider</Text>
      <View style={styles.rows}>
        {tiers.map(({ tier, label, sub, count, names }) => (
          <View key={tier} style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.tierLabel}>{label}</Text>
              <Text style={styles.tierSub}>{sub}</Text>
            </View>
            <Text style={styles.count}>{count}</Text>
            {names.length > 0 && (
              <Text style={styles.names} numberOfLines={1}>
                {names.join(', ')}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  rows: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowLeft: { flex: 1, minWidth: 100 },
  tierLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  tierSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  count: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    minWidth: 24,
    textAlign: 'right',
  },
  names: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flexBasis: '100%',
    marginLeft: 0,
    marginTop: 2,
  },
});
