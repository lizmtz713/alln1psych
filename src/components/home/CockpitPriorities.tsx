/**
 * CockpitPriorities — "What matters today": 2–4 actionable priority cards.
 * One self, one relationship, optional growth/tool. Not a junk drawer.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../lib/constants';

export interface PriorityItem {
  id: string;
  label: string;
  sublabel?: string;
  emoji?: string;
  route: string;
  params?: Record<string, string>;
}

export interface CockpitPrioritiesProps {
  /** Max 4 items. e.g. self (check-in), relationship (Transmit to X), gauge suggestion, one tool. */
  items: PriorityItem[];
  onTransmitToHero?: (recipientId: string, recipientName: string) => void;
}

export function CockpitPriorities({ items, onTransmitToHero }: CockpitPrioritiesProps) {
  const router = useRouter();
  if (items.length === 0) return null;

  const handlePress = (item: PriorityItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.id.startsWith('hero-') && onTransmitToHero && item.params?.recipientId && item.params?.recipientName) {
      onTransmitToHero(item.params.recipientId, item.params.recipientName);
      return;
    }
    if (item.id === 'transmit-hero' && item.params?.hero) {
      router.push(`/(tabs)/people?hero=${encodeURIComponent(item.params.hero)}` as any);
      return;
    }
    router.push({ pathname: item.route as any, params: item.params });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What matters today</Text>
      <View style={styles.cardRow}>
        {items.slice(0, 4).map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handlePress(item)}
          >
            {item.emoji ? <Text style={styles.emoji}>{item.emoji}</Text> : null}
            <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
            {item.sublabel ? <Text style={styles.sublabel} numberOfLines={1}>{item.sublabel}</Text> : null}
          </Pressable>
        ))}
      </View>
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
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  card: {
    minWidth: 160,
    flex: 1,
    maxWidth: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  cardPressed: { opacity: 0.92 },
  emoji: { fontSize: 20, marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
  sublabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
});
