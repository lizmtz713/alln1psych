/**
 * Bias Check — Single bias detail.
 * Route: /tools/bias-check/library/[id]
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../src/lib/constants';
import { getBiasById } from '../../../../src/data/biases';

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

export default function BiasDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bias = id ? getBiasById(id) : undefined;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!id || !bias) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Bias</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Bias not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Bias</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {bias.category ? (
          <Text style={styles.category}>{CATEGORY_LABELS[bias.category] ?? bias.category}</Text>
        ) : null}
        <Text style={styles.name}>{bias.name}</Text>
        <Text style={styles.shortDesc}>{bias.shortDescription}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What it is</Text>
          <Text style={styles.body}>{bias.description}</Text>
        </View>
        {bias.patterns.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Example phrases we look for</Text>
            <View style={styles.patternList}>
              {bias.patterns.map((p, i) => (
                <Text key={i} style={styles.pattern}>• {p}</Text>
              ))}
            </View>
          </View>
        ) : null}
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: TEXT_MUTED },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  category: { fontSize: 12, fontWeight: '600', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 6 },
  name: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 8 },
  shortDesc: { fontSize: 16, color: TEXT_MUTED, marginBottom: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED, textTransform: 'uppercase', marginBottom: 8 },
  body: { fontSize: 15, color: TEXT, lineHeight: 22 },
  patternList: { gap: 4 },
  pattern: { fontSize: 14, color: TEXT_MUTED },
});
