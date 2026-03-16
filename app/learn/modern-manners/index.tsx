/**
 * Modern Manners — 10 skills that make relationships and societies work.
 * Route: /learn/modern-manners
 * 1 idea, 1 example, 1 practice link per skill. Research-backed; maps to existing tools and lessons.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { MODERN_MANNERS_10 } from '../../../src/data/modernManners10';

const BG = COLORS.background;
const CARD = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function ModernMannersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Modern Manners</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          10 skills research says matter most — for relationships and society. Not etiquette rules; these are learnable interpersonal skills.
        </Text>

        {MODERN_MANNERS_10.map((skill, index) => (
          <View key={skill.id} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillNumber}>{index + 1}</Text>
              <Text style={styles.skillTitle}>{skill.title}</Text>
            </View>
            <Text style={styles.oneLiner}>{skill.oneLiner}</Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>Example</Text>
              <Text style={styles.exampleText}>{skill.example}</Text>
            </View>
            <View style={styles.actions}>
              {skill.lessonRoute && skill.lessonLabel ? (
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(skill.lessonRoute as any);
                  }}
                >
                  <Ionicons name="book-outline" size={18} color={ACCENT} />
                  <Text style={styles.actionBtnText}>{skill.lessonLabel}</Text>
                  <Ionicons name="chevron-forward" size={16} color={MUTED} />
                </Pressable>
              ) : null}
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && styles.actionBtnPressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(skill.toolRoute as any);
                }}
              >
                <Ionicons name="construct-outline" size={18} color="#fff" />
                <Text style={styles.actionBtnPrimaryText}>Practice: {skill.toolLabel}</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These map to Core Human Skills (Learn → 16 Human Skills). Respect + empathy + responsibility — everything else builds from those.
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: {
    fontSize: 15,
    color: MUTED,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  skillCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  skillNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentMuted || ACCENT + '30',
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: SPACING.sm,
  },
  skillTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: TEXT },
  oneLiner: { fontSize: 14, color: MUTED, lineHeight: 20, marginBottom: SPACING.sm },
  exampleBox: {
    backgroundColor: COLORS.inputSurface || 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.input,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  exampleLabel: { fontSize: 11, fontWeight: '700', color: MUTED, marginBottom: 4 },
  exampleText: { fontSize: 14, color: TEXT, fontStyle: 'italic', lineHeight: 20 },
  actions: { gap: SPACING.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.sm,
  },
  actionBtnPressed: { opacity: 0.8 },
  actionBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: ACCENT },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.input,
  },
  actionBtnPrimaryText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#fff' },
  footer: { marginTop: SPACING.lg },
  footerText: { fontSize: 12, color: MUTED, lineHeight: 18, fontStyle: 'italic' },
});
