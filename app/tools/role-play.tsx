/**
 * Role Play — Family Edition
 * Route: /tools/role-play
 *
 * Shows how a typical argument ("The Crash") can be resolved using
 * systemic, probabilistic language ("The InGauge Optimization").
 * Flight-manual / vehicle-diagnostic vibe: dark, clean typography, neon accents.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import roleplayScenarios from '../../src/data/roleplayScenarios.json';

type Scenario = (typeof roleplayScenarios)[number];

// Flight-manual palette: dark slate, neon accents (no medical/therapy look)
const BG = '#0f172a';       // slate-900
const SURFACE = '#1e293b';  // slate-800
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.65)';
const NEON_CRASH = '#f97316';   // amber-500 for crash
const CRASH_BG = 'rgba(249,115,22,0.12)';
const CRASH_BORDER = 'rgba(249,115,22,0.35)';
const NEON_OPT = '#22d3ee';     // cyan-400 for optimization
const OPT_BG = 'rgba(34,211,238,0.12)';
const OPT_BORDER = 'rgba(34,211,238,0.35)';
const FOCUS_ACCENT = '#38bdf8'; // sky-400 for focus badge

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [revealed, setRevealed] = useState(false);

  const onFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealed((r) => !r);
  };

  return (
    <View style={styles.scenarioBlock}>
      {/* Header: Title + Focus */}
      <Text style={styles.scenarioTitle}>{scenario.title}</Text>
      <View style={styles.focusBadge}>
        <Ionicons name="git-compare-outline" size={14} color={FOCUS_ACCENT} />
        <Text style={styles.focusText}>{scenario.focus}</Text>
      </View>

      {/* Setup: Context + Roles */}
      <View style={styles.setupCard}>
        <Text style={styles.setupLabel}>SITUATION</Text>
        <Text style={styles.setupContext}>{scenario.context}</Text>
        <View style={styles.rolesRow}>
          <View style={styles.roleBox}>
            <Text style={styles.roleLabel}>PILOT (Teen)</Text>
            <Text style={styles.roleText}>{scenario.roles.pilot}</Text>
          </View>
          <View style={styles.roleBox}>
            <Text style={styles.roleLabel}>GROUND CONTROL (Parent)</Text>
            <Text style={styles.roleText}>{scenario.roles.groundControl}</Text>
          </View>
        </View>
      </View>

      {/* Interaction: Flip — default Crash, tap to reveal Optimization */}
      <Pressable
        onPress={onFlip}
        style={({ pressed }) => [
          styles.flipCard,
          revealed ? styles.flipCardOpt : styles.flipCardCrash,
          pressed && styles.flipCardPressed,
        ]}
      >
        {!revealed ? (
          <>
            <View style={styles.flipHeader}>
              <Ionicons name="warning" size={18} color={NEON_CRASH} />
              <Text style={[styles.flipTitle, { color: NEON_CRASH }]}>The Crash</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Parent:</Text>
              <Text style={styles.dialogueLine}>{scenario.theCrash.parent}</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Teen:</Text>
              <Text style={styles.dialogueLine}>{scenario.theCrash.teen}</Text>
            </View>
            <View style={styles.outcomeBadgeCrash}>
              <Text style={styles.outcomeText}>{scenario.theCrash.outcome}</Text>
            </View>
            <Text style={styles.tapHint}>Tap to see InGauge Optimization</Text>
          </>
        ) : (
          <>
            <View style={styles.flipHeader}>
              <Ionicons name="checkmark-circle" size={18} color={NEON_OPT} />
              <Text style={[styles.flipTitle, { color: NEON_OPT }]}>The InGauge Optimization</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Parent:</Text>
              <Text style={styles.dialogueLine}>{scenario.theInGaugeOptimization.parent}</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Teen:</Text>
              <Text style={styles.dialogueLine}>{scenario.theInGaugeOptimization.teen}</Text>
            </View>
            <View style={styles.outcomeBadgeOpt}>
              <Text style={styles.outcomeText}>{scenario.theInGaugeOptimization.outcome}</Text>
            </View>
            <Text style={styles.tapHint}>Tap to show The Crash again</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function RolePlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Role Play</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          See how a typical argument becomes a clean resolution using fleet language and telemetry.
        </Text>

        {(roleplayScenarios as Scenario[]).map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  intro: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  scenarioBlock: {
    marginBottom: SPACING.xxl,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginBottom: SPACING.sm,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  focusText: {
    fontSize: 13,
    color: FOCUS_ACCENT,
    fontWeight: '500',
  },
  setupCard: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  setupLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TEXT_MUTED,
    marginBottom: SPACING.sm,
  },
  setupContext: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  rolesRow: {
    gap: SPACING.md,
  },
  roleBox: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: NEON_OPT,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  flipCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    minHeight: 120,
  },
  flipCardCrash: {
    backgroundColor: CRASH_BG,
    borderColor: CRASH_BORDER,
  },
  flipCardOpt: {
    backgroundColor: OPT_BG,
    borderColor: OPT_BORDER,
  },
  flipCardPressed: {
    opacity: 0.92,
  },
  flipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  flipTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dialogueRow: {
    marginBottom: SPACING.sm,
  },
  dialogueWho: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  dialogueLine: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  outcomeBadgeCrash: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: BORDER_RADIUS.sm,
  },
  outcomeBadgeOpt: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(34,211,238,0.2)',
    borderRadius: BORDER_RADIUS.sm,
  },
  outcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT,
  },
  tapHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});
