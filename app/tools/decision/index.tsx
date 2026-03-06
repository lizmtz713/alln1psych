/**
 * Decision Tool — Past decisions and start new / quick.
 * Route: /tools/decision
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useDecisionStore } from '../../../src/stores/decisionStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DecisionIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const decisions = useDecisionStore((s) => s.getDecisions());

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNewFull = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/decision/new');
  };

  const handleQuick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/decision/quick');
  };

  const handleOpen = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/decision/' + id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Decisions</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Think it through or decide quick.</Text>

        <Pressable style={({ pressed }) => [styles.primaryCard, pressed && styles.cardPressed]} onPress={handleNewFull}>
          <Text style={styles.primaryEmoji}>🧭</Text>
          <View style={styles.primaryText}>
            <Text style={styles.primaryTitle}>8-step decision</Text>
            <Text style={styles.primarySub}>Clarify, options, values, risks, bias check, 10-10-10, decide.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>

        <Pressable style={({ pressed }) => [styles.secondaryCard, pressed && styles.cardPressed]} onPress={handleQuick}>
          <Text style={styles.secondaryEmoji}>⚡</Text>
          <View style={styles.secondaryText}>
            <Text style={styles.secondaryTitle}>Quick decision</Text>
            <Text style={styles.secondarySub}>Question + options + pick one.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>

        <Text style={styles.sectionLabel}>Past decisions</Text>
        {decisions.length === 0 ? (
          <Text style={styles.empty}>No decisions yet. Start with the 8-step or quick flow above.</Text>
        ) : (
          decisions.map((d) => (
            <Pressable key={d.id} style={({ pressed }) => [styles.decisionCard, pressed && styles.cardPressed]} onPress={() => handleOpen(d.id)}>
              <Text style={styles.decisionQuestion} numberOfLines={2}>{d.question}</Text>
              <Text style={styles.decisionMeta}>
                {formatDate(d.createdAt)}
                {d.decidedAt ? ' · Decided' : ' · In progress'}
                {d.type === 'quick' ? ' · Quick' : ''}
              </Text>
            </Pressable>
          ))
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 16, color: TEXT_MUTED, marginBottom: SPACING.lg },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.accentMuted,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardPressed: { opacity: 0.9 },
  primaryEmoji: { fontSize: 32, marginRight: 14 },
  primaryText: { flex: 1 },
  primaryTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  primarySub: { fontSize: 14, color: TEXT_MUTED, marginTop: 4 },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  secondaryEmoji: { fontSize: 28, marginRight: 14 },
  secondaryText: { flex: 1 },
  secondaryTitle: { fontSize: 17, fontWeight: '600', color: TEXT },
  secondarySub: { fontSize: 14, color: TEXT_MUTED, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED, marginBottom: SPACING.sm },
  empty: { fontSize: 14, color: TEXT_MUTED },
  decisionCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  decisionQuestion: { fontSize: 16, fontWeight: '600', color: TEXT },
  decisionMeta: { fontSize: 12, color: TEXT_MUTED, marginTop: 6 },
});
