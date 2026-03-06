/**
 * Bias Check — Library of all cognitive biases.
 * Route: /tools/bias-check/library
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { BIASES } from '../../../src/data/biases';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const CATEGORY_LABELS: Record<string, string> = {
  thinking: 'Thinking',
  social: 'Social',
  memory: 'Memory',
  decision: 'Decision',
  self: 'Self',
};

export default function BiasLibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBias = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tools/bias-check/library/${id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Bias Library</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>{BIASES.length} cognitive biases — tap one to learn more.</Text>
        {BIASES.map((b) => (
          <Pressable
            key={b.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handleBias(b.id)}
          >
            {b.category ? (
              <Text style={styles.category}>{CATEGORY_LABELS[b.category] ?? b.category}</Text>
            ) : null}
            <Text style={styles.name}>{b.name}</Text>
            <Text style={styles.shortDesc} numberOfLines={2}>{b.shortDescription}</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} style={styles.chevron} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 15, color: TEXT_MUTED, marginBottom: SPACING.lg },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardPressed: { opacity: 0.9 },
  category: { fontSize: 11, fontWeight: '600', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 4 },
  name: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 4 },
  shortDesc: { fontSize: 14, color: TEXT_MUTED },
  chevron: { position: 'absolute', right: 12, top: '50%', marginTop: -10 },
});
