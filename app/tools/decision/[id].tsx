/**
 * Decision Tool — View a single decision and add/view follow-up reflections.
 * Route: /tools/decision/[id]
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useDecisionStore } from '../../../src/stores/decisionStore';
import type { Decision } from '../../../src/types/decision';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function DecisionDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getDecision = useDecisionStore((s) => s.getDecision);
  const reflections = useDecisionStore((s) => s.reflections);
  const addReflection = useDecisionStore((s) => s.addReflection);

  const decision = id ? getDecision(id) : undefined;
  const refsForDecision = decision ? reflections.filter((r) => r.decisionId === decision.id) : [];

  const [reflectionBody, setReflectionBody] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAddReflection = () => {
    const body = reflectionBody.trim();
    if (!body || !decision) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addReflection(decision.id, body);
    setReflectionBody('');
  };

  if (!id || !decision) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Decision</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Decision not found.</Text>
        </View>
      </View>
    );
  }

  const chosenOption = decision.options?.find((o) => o.id === decision.chosenOptionId);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Decision</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, decision.type === 'quick' && styles.badgeQuick]}>
              <Text style={styles.badgeText}>{decision.type === 'quick' ? 'Quick' : '8-step'}</Text>
            </View>
            <Text style={styles.date}>{formatDate(decision.createdAt)}</Text>
          </View>
          <Text style={styles.question}>{decision.question}</Text>
          {decision.decidedAt && chosenOption && (
            <View style={styles.chosenRow}>
              <Text style={styles.chosenLabel}>You chose: </Text>
              <Text style={styles.chosenOption}>{chosenOption.label}</Text>
            </View>
          )}
          {decision.decisionNote ? (
            <Text style={styles.note}>{decision.decisionNote}</Text>
          ) : null}
        </View>

        {decision.type === 'full' && (
          <>
            {decision.clarify ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Clarify</Text>
                <Text style={styles.sectionBody}>{decision.clarify}</Text>
              </View>
            ) : null}
            {decision.options && decision.options.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Options</Text>
                {decision.options.map((o) => (
                  <Text key={o.id} style={[styles.optionLine, o.id === decision.chosenOptionId && styles.optionChosen]}>
                    • {o.label}
                    {o.id === decision.chosenOptionId ? ' ✓' : ''}
                  </Text>
                ))}
              </View>
            ) : null}
            {decision.values && decision.values.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Values</Text>
                <Text style={styles.sectionBody}>{decision.values.filter(Boolean).join(' · ')}</Text>
              </View>
            ) : null}
            {decision.evaluateNotes ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Evaluate</Text>
                <Text style={styles.sectionBody}>{decision.evaluateNotes}</Text>
              </View>
            ) : null}
            {decision.risks && decision.risks.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risks</Text>
                {decision.risks.map((r, i) => (
                  <View key={i} style={styles.riskRow}>
                    <Text style={styles.riskOption}>
                      {decision.options?.find((o) => o.id === r.optionId)?.label ?? 'Option'}
                    </Text>
                    <Text style={styles.riskDesc}>{r.description}</Text>
                    {r.severity ? <Text style={styles.riskSev}>{r.severity}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
            {decision.biasCheck ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bias check</Text>
                <Text style={styles.sectionBody}>{decision.biasCheck}</Text>
              </View>
            ) : null}
            {decision.forecast101010 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>10-10-10</Text>
                <Text style={styles.sectionBody}>10 min: {decision.forecast101010.in10min}</Text>
                <Text style={styles.sectionBody}>10 months: {decision.forecast101010.in10months}</Text>
                <Text style={styles.sectionBody}>10 years: {decision.forecast101010.in10years}</Text>
              </View>
            ) : null}
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up reflections</Text>
          {refsForDecision.length === 0 ? (
            <Text style={styles.muted}>No reflections yet. Add one below.</Text>
          ) : (
            refsForDecision.map((r) => (
              <View key={r.id} style={styles.reflectionCard}>
                <Text style={styles.reflectionBody}>{r.body}</Text>
                <Text style={styles.reflectionDate}>{formatDateTime(r.createdAt)}</Text>
              </View>
            ))
          )}
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="How did it go? What would you do differently?"
            placeholderTextColor={TEXT_MUTED}
            value={reflectionBody}
            onChangeText={setReflectionBody}
            multiline
          />
          <Pressable
            style={[styles.addReflectionBtn, !reflectionBody.trim() && styles.addReflectionBtnDisabled]}
            onPress={handleAddReflection}
            disabled={!reflectionBody.trim()}
          >
            <Text style={styles.addReflectionBtnText}>Add reflection</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: TEXT_MUTED },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  card: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: BORDER },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  badge: { backgroundColor: COLORS.accentBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeQuick: { backgroundColor: COLORS.accentBgStrong },
  badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
  date: { fontSize: 13, color: TEXT_MUTED },
  question: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 8 },
  chosenRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chosenLabel: { fontSize: 14, color: TEXT_MUTED },
  chosenOption: { fontSize: 14, fontWeight: '600', color: TEXT },
  note: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic' },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED, marginBottom: 6, textTransform: 'uppercase' },
  sectionBody: { fontSize: 15, color: TEXT, marginBottom: 4 },
  optionLine: { fontSize: 15, color: TEXT, marginBottom: 4 },
  optionChosen: { fontWeight: '600', color: COLORS.accent },
  riskRow: { marginBottom: 8, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: BORDER },
  riskOption: { fontSize: 12, color: TEXT_MUTED, marginBottom: 2 },
  riskDesc: { fontSize: 14, color: TEXT },
  riskSev: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  muted: { fontSize: 14, color: TEXT_MUTED, marginBottom: 12 },
  reflectionCard: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: BORDER },
  reflectionBody: { fontSize: 15, color: TEXT, marginBottom: 6 },
  reflectionDate: { fontSize: 12, color: TEXT_MUTED },
  input: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: BORDER, padding: 14, fontSize: 16, color: TEXT, marginBottom: 8 },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  addReflectionBtn: { backgroundColor: COLORS.accent, paddingVertical: 12, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  addReflectionBtnDisabled: { opacity: 0.5 },
  addReflectionBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
