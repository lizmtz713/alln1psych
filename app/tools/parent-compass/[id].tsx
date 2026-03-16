/**
 * Parent Compass — Single topic / age guide / scenario.
 * Structure: Quick Insight → What Science Says → What It Looks Like → What Helps → Learn More.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getParentCompassEntryById } from '../../../src/data/parentCompass';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function ParentCompassEntryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = id ? getParentCompassEntryById(id) : undefined;
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Not found</Text>
          <View style={styles.backBtn} />
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
        <Text style={styles.headerTitle} numberOfLines={1}>{entry.title}</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.quickInsightBlock}>
          <Text style={styles.quickInsightLabel}>Quick insight</Text>
          <Text style={styles.quickInsightText}>{entry.quickInsight}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What science says</Text>
          <Text style={styles.paragraph}>{entry.scienceSays}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What it looks like in real life</Text>
          {entry.whatItLooksLike.map((item, i) => (
            <Text key={i} style={styles.bullet}>• {item}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What helps</Text>
          {entry.whatHelps.map((item, i) => (
            <Text key={i} style={styles.bullet}>• {item}</Text>
          ))}
        </View>

        {entry.learnMore.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.learnMoreHeader}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLearnMoreOpen((v) => !v);
              }}
            >
              <Text style={styles.sectionLabel}>Learn more</Text>
              <Ionicons name={learnMoreOpen ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
            </Pressable>
            {learnMoreOpen && (
              <View style={styles.learnMoreBody}>
                {entry.learnMore.map((item, i) => (
                  <Text key={i} style={styles.learnMoreItem}>• {item}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is education and guidance, not therapy. Consult a professional when you need clinical support.
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  quickInsightBlock: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  quickInsightLabel: { fontSize: 12, fontWeight: '600', color: ACCENT, marginBottom: 6, textTransform: 'uppercase' },
  quickInsightText: { fontSize: 17, fontWeight: '600', color: TEXT, lineHeight: 24 },
  section: { marginBottom: SPACING.xl },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paragraph: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  bullet: { fontSize: 15, color: TEXT, lineHeight: 22, marginBottom: 4 },
  learnMoreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  learnMoreBody: { marginTop: 8 },
  learnMoreItem: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, marginBottom: 4 },
  footer: { marginTop: 16 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
