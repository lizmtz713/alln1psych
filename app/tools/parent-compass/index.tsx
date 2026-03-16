/**
 * Parent Compass — Quick reference for raising humans.
 * Tools → People → Parent Compass. Evidence-based, modular, never shaming.
 * Route: /tools/parent-compass
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  PARENT_COMPASS_TOPICS,
  PARENT_COMPASS_AGE_GUIDES,
  PARENT_COMPASS_SCENARIOS,
} from '../../../src/data/parentCompass';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

function Section({
  title,
  subtitle,
  entries,
  onPress,
}: {
  title: string;
  subtitle: string;
  entries: { id: string; title: string; emoji: string; quickInsight: string }[];
  onPress: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      {entries.map((entry) => (
        <Pressable
          key={entry.id}
          style={({ pressed }) => [styles.entryCard, pressed && styles.entryCardPressed]}
          onPress={() => onPress(entry.id)}
        >
          <Text style={styles.entryEmoji}>{entry.emoji}</Text>
          <View style={styles.entryBody}>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={styles.entryInsight} numberOfLines={2}>{entry.quickInsight}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>
      ))}
    </View>
  );
}

export default function ParentCompassIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const openEntry = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tools/parent-compass/${id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Parent Compass</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          A quick reference for raising humans. Science-based, practical, and modular. Each topic takes about 30–60 seconds to read, with "Learn more" for deeper exploration.
        </Text>
        <Text style={styles.tone}>
          Parenting is a learning process. Small improvements make a big difference.
        </Text>

        <Section
          title="Core topics"
          subtitle="What most parents need to understand"
          entries={PARENT_COMPASS_TOPICS}
          onPress={openEntry}
        />
        <Section
          title="By age"
          subtitle="Early childhood · Middle childhood · Adolescence"
          entries={PARENT_COMPASS_AGE_GUIDES}
          onPress={openEntry}
        />
        <Section
          title="In the moment"
          subtitle="Quick guides for common situations"
          entries={PARENT_COMPASS_SCENARIOS}
          onPress={openEntry}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Parent Compass connects with your Connection, Emotion, and State gauges. When your gauges are low, consider spending time together or managing your own stress so you can show up calmly.
          </Text>
        </View>
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
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 8 },
  tone: { fontSize: 14, fontStyle: 'italic', color: TEXT_MUTED, marginBottom: 24 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: TEXT_MUTED, marginBottom: 12 },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 10,
  },
  entryCardPressed: { opacity: 0.9 },
  entryEmoji: { fontSize: 28, marginRight: 14 },
  entryBody: { flex: 1, minWidth: 0 },
  entryTitle: { fontSize: 16, fontWeight: '600', color: TEXT },
  entryInsight: { fontSize: 13, color: TEXT_MUTED, marginTop: 4, lineHeight: 18 },
  footer: { marginTop: 16 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
