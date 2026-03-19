/**
 * Life Literacy — Hub: what humans need to know to navigate life well.
 * 15 domains. Each answers: What is this? Why does it matter? What helps?
 * Route: /learn/life-literacy
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { LIFE_LITERACY_DOMAINS } from '../../../src/data/lifeLiteracyDomains';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function LifeLiteracyHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Life Literacy</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          What do humans need to know to navigate life well? Not an encyclopedia—each topic answers: What is this? Why does it matter? What helps?
        </Text>
        {LIFE_LITERACY_DOMAINS.map((domain) => (
          <Pressable
            key={domain.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/learn/life-literacy/${domain.id}`);
            }}
          >
            <Text style={styles.cardEmoji}>{domain.emoji}</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{domain.title}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>{domain.quickTruth}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </Pressable>
        ))}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Life Literacy connects to your gauges, the Human Manual, and tools like the Relationship Toolkit and Life Direction Finder.
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
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  cardSub: { fontSize: 13, color: TEXT_MUTED, marginTop: 4, lineHeight: 18 },
  footer: { marginTop: 24 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
