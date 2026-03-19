/**
 * Life Literacy — Single domain page.
 * Structure: What is this? (quickTruth) → Why it matters → What helps.
 * Optional links to Manual or tools.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getLifeLiteracyDomainById } from '../../../src/data/lifeLiteracyDomains';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function LifeLiteracyDomainScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const domain = id ? getLifeLiteracyDomainById(id) : undefined;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const openManual = () => {
    if (domain?.manualRef) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/learn/manual/${domain.manualRef}`);
    }
  };

  const openTool = () => {
    if (domain?.toolRef) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(domain.toolRef as any);
    }
  };

  if (!domain) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Not found</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>This topic isn’t available.</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{domain.title}</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* What is this? */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What is this?</Text>
          <Text style={styles.quickTruth}>{domain.quickTruth}</Text>
        </View>

        {/* Why it matters */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Why it matters</Text>
          <Text style={styles.paragraph}>{domain.whyMatters}</Text>
        </View>

        {/* What helps */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What helps</Text>
          {domain.whatHelps.map((item, i) => (
            <Text key={i} style={styles.bulletItem}>• {item}</Text>
          ))}
        </View>

        {/* Go deeper: Manual */}
        {domain.manualRef && (
          <Pressable style={styles.ctaCard} onPress={openManual}>
            <Ionicons name="book-outline" size={22} color={ACCENT} />
            <View style={styles.ctaBody}>
              <Text style={styles.ctaTitle}>Go deeper in the Manual</Text>
              <Text style={styles.ctaSub}>More detail and science</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={ACCENT} />
          </Pressable>
        )}

        {/* Try a tool */}
        {domain.toolRef && (
          <Pressable style={styles.ctaCard} onPress={openTool}>
            <Ionicons name="construct-outline" size={22} color={ACCENT} />
            <View style={styles.ctaBody}>
              <Text style={styles.ctaTitle}>Try a tool</Text>
              <Text style={styles.ctaSub}>Practice with a guided flow</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={ACCENT} />
          </Pressable>
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickTruth: { fontSize: 17, fontWeight: '600', color: TEXT, lineHeight: 24 },
  paragraph: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  bulletItem: { fontSize: 15, color: TEXT, lineHeight: 22, marginBottom: 4 },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  ctaBody: { flex: 1, minWidth: 0, marginLeft: 12 },
  ctaTitle: { fontSize: 15, fontWeight: '600', color: TEXT },
  ctaSub: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 16, color: TEXT_MUTED },
});
