/**
 * Memory Builder — Memory tips and learn more (science-based).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { MEMORY_TIPS, MEMORY_LEARN_MORE } from '../../../src/data/memoryBuilder';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function MemoryBuilderTipsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Memory tips</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          Five simple rules. Memory improves when attention, association, and repetition work together.
        </Text>

        {MEMORY_TIPS.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipBody}>{tip.body}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Learn more</Text>
        {MEMORY_LEARN_MORE.map((item) => {
          const isOpen = expandedId === item.id;
          return (
            <Pressable
              key={item.id}
              style={styles.learnCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId((prev) => (prev === item.id ? null : item.id));
              }}
            >
              <View style={styles.learnHeader}>
                <Text style={styles.learnTitle}>{item.title}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
              </View>
              {isOpen && <Text style={styles.learnBody}>{item.body}</Text>}
            </Pressable>
          );
        })}
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: TEXT_MUTED, marginBottom: 20, lineHeight: 22 },
  tipCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 12,
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  tipBody: { fontSize: 14, color: TEXT_MUTED, marginTop: 6, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginTop: 24, marginBottom: 12 },
  learnCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 8,
  },
  learnHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  learnTitle: { fontSize: 15, fontWeight: '600', color: TEXT, flex: 1 },
  learnBody: { fontSize: 14, color: TEXT_MUTED, marginTop: 10, lineHeight: 20 },
});
