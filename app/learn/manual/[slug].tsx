/**
 * Human Manual — Single page (Signal, Cascade, Repair, Long Game, Big Question).
 * Structure: Quick Truth → Science → What It Looks Like → What Helps → Learn More.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getManualPageBySlug } from '../../../src/data/humanManualPages';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function ManualPageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const page = slug ? getManualPageBySlug(slug) : undefined;
  const [expandedLearnMore, setExpandedLearnMore] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!page) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Not found</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>This page isn’t available.</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{page.title}</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Truth */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick truth</Text>
          <Text style={styles.quickTruth}>{page.quickTruth}</Text>
        </View>

        {/* The Science */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>The science</Text>
          <Text style={styles.paragraph}>{page.science}</Text>
        </View>

        {/* What It Looks Like */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What it looks like</Text>
          {page.whatItLooksLike.map((item, i) => (
            <Text key={i} style={styles.bulletItem}>• {item}</Text>
          ))}
        </View>

        {/* What Helps */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What helps</Text>
          {page.whatHelps.map((item, i) => (
            <Text key={i} style={styles.bulletItem}>• {item}</Text>
          ))}
        </View>

        {/* Family conflict tool CTA — for Conflict signal and Repair conflict pages */}
        {(slug === 'signal-conflict' || slug === 'repair-conflict') && (
          <Pressable
            style={styles.toolCtaCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/tools/family-conflict');
            }}
          >
            <Text style={styles.toolCtaEmoji}>🏠</Text>
            <View style={styles.toolCtaBody}>
              <Text style={styles.toolCtaTitle}>Family Conflict Navigator</Text>
              <Text style={styles.toolCtaSub}>Step-by-step reflection for difficult family relationships. Boundaries, repair, and support.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={ACCENT} />
          </Pressable>
        )}

        {/* Learn More (optional) */}
        {page.learnMore.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.learnMoreHeader}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedLearnMore((v) => !v);
              }}
            >
              <Text style={styles.sectionLabel}>Learn more</Text>
              <Ionicons name={expandedLearnMore ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
            </Pressable>
            {expandedLearnMore && (
              <View style={styles.bulletListMuted}>
                {page.learnMore.map((topic, i) => (
                  <Text key={i} style={styles.bulletItemMuted}>• {topic}</Text>
                ))}
              </View>
            )}
          </View>
        )}
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  section: { marginBottom: SPACING.xl },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickTruth: { fontSize: 17, fontWeight: '600', color: TEXT, lineHeight: 24 },
  paragraph: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  bulletItem: { fontSize: 15, color: TEXT, lineHeight: 22, marginBottom: 4 },
  bulletListMuted: { marginTop: 4 },
  bulletItemMuted: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 4 },
  learnMoreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  toolCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  toolCtaEmoji: { fontSize: 28, marginRight: 12 },
  toolCtaBody: { flex: 1, minWidth: 0 },
  toolCtaTitle: { fontSize: 15, fontWeight: '600', color: TEXT },
  toolCtaSub: { fontSize: 13, color: TEXT_MUTED, marginTop: 2, lineHeight: 18 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 16, color: TEXT_MUTED },
});
