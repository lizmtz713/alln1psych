/**
 * Goals & Intentions — Direction + Active Goals + AI Goal Builder + Review & Reflect.
 * Values → Direction → Actions; tied to Direction and Alignment gauges.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useGoalsStore } from '../../src/stores/goalsStore';
import { GoalBuilderModal } from '../../src/components/goals/GoalBuilderModal';
import { ReviewReflectModal } from '../../src/components/goals/ReviewReflectModal';
import { DIRECTION_AREAS, DIRECTION_DISPLAY } from '../../src/types/goals';
import type { DirectionArea } from '../../src/types/goals';
import type { ActiveGoal } from '../../src/types/goals';

const GAUGE_LABELS: Record<string, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

const MOMENTUM_LABELS: Record<ActiveGoal['momentum'], string> = {
  warm: 'Warm',
  steady: 'Steady',
  cool: 'Cool',
  stalled: 'Stalled',
};

export default function ProfileGoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [builderVisible, setBuilderVisible] = useState(false);
  const [reviewGoalId, setReviewGoalId] = useState<string | null>(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const directionAreas = useGoalsStore((s) => s.directionAreas);
  const goals = useGoalsStore((s) => s.goals);
  const toggleDirectionArea = useGoalsStore((s) => s.toggleDirectionArea);
  const removeGoal = useGoalsStore((s) => s.removeGoal);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Direction & Goals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Direction */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DIRECTION</Text>
          <Text style={styles.sectionTitle}>Your focus areas right now</Text>
          <Text style={styles.sectionSub}>Choose 1–3. This connects to your Direction gauge—clarity of life path, not task completion.</Text>
          <View style={styles.chips}>
            {DIRECTION_AREAS.map((area) => (
              <Pressable
                key={area}
                style={[
                  styles.chip,
                  directionAreas.includes(area as DirectionArea) && styles.chipActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleDirectionArea(area as DirectionArea);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    directionAreas.includes(area as DirectionArea) && styles.chipTextActive,
                  ]}
                >
                  {DIRECTION_DISPLAY[area as DirectionArea] ?? area}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 2. Active Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE GOALS</Text>
          <Text style={styles.sectionTitle}>What you're working toward</Text>
          {goals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No goals yet. Build one below.</Text>
            </View>
          ) : (
            goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title ?? 'Goal'}</Text>
                  <Pressable
                    hitSlop={12}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      removeGoal(goal.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                  </Pressable>
                </View>
                <Text style={styles.goalIntent}>{goal.intent ?? ''}</Text>
                <View style={styles.goalMeta}>
                  <View style={styles.momentumBadge}>
                    <Text style={styles.momentumText}>Momentum: {MOMENTUM_LABELS[goal.momentum ?? 'warm'] ?? goal.momentum ?? 'Warm'}</Text>
                  </View>
                  <Text style={styles.gaugesText}>
                    Supports: {(goal.supportedGauges ?? []).map((g) => GAUGE_LABELS[g] ?? g).join(', ')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 3. Build a Goal */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.buildCard, pressed && styles.buildCardPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setBuilderVisible(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={28} color={COLORS.accent} />
            <View>
              <Text style={styles.buildTitle}>Build a goal</Text>
              <Text style={styles.buildSub}>AI-assisted • 30 seconds</Text>
            </View>
          </Pressable>
        </View>

        {/* 4. Review & Reflect */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REVIEW & REFLECT</Text>
          <Text style={styles.sectionTitle}>Weekly reflection</Text>
          <Text style={styles.sectionSub}>How did your goals go this week? What helped? What got in the way?</Text>
          <Pressable
            style={({ pressed }) => [styles.reviewCard, pressed && styles.reviewCardPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (goals.length === 1) setReviewGoalId(goals[0].id);
              else if (goals.length > 1) setShowGoalPicker(true);
            }}
          >
            <Ionicons name="refresh-outline" size={22} color={COLORS.accent} />
            <View>
              <Text style={styles.reviewTitle}>Reflect on this week</Text>
              <Text style={styles.reviewSub}>Look back and adjust</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <GoalBuilderModal visible={builderVisible} onClose={() => setBuilderVisible(false)} />
      {showGoalPicker && (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.pickerOverlay} onPress={() => setShowGoalPicker(false)}>
            <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
              <Text style={styles.pickerTitle}>Which goal would you like to reflect on?</Text>
              {goals.map((goal) => {
                const momentum = goal.momentum ?? 'warm';
                const isStruggling = momentum === 'cool' || momentum === 'stalled';
                const rowBg = momentum === 'stalled' ? styles.pickerRowStalled : momentum === 'cool' ? styles.pickerRowCool : undefined;
                const lifeArea = goal.lifeArea ?? 'Other';
                const lifeLabel = DIRECTION_DISPLAY[lifeArea as DirectionArea] ?? lifeArea;
                const momentumLabel = MOMENTUM_LABELS[momentum] ?? momentum;
                return (
                  <Pressable
                    key={goal.id}
                    style={({ pressed }) => [styles.pickerRow, rowBg, pressed && styles.pickerRowPressed]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setReviewGoalId(goal.id);
                      setShowGoalPicker(false);
                    }}
                  >
                    <View style={styles.pickerRowContent}>
                      <Text style={styles.pickerRowText}>{goal.title ?? 'Goal'}</Text>
                      <Text style={styles.pickerRowBadge}>{lifeLabel}</Text>
                      <Text style={[styles.pickerRowMomentum, isStruggling && styles.pickerRowMomentumStruggling]}>
                        Momentum: {momentumLabel}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                  </Pressable>
                );
              })}
              <Pressable style={styles.pickerCancel} onPress={() => setShowGoalPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
      <ReviewReflectModal
        visible={reviewGoalId != null}
        goalId={reviewGoalId}
        goalTitle={goals.find((g) => g.id === reviewGoalId)?.title ?? ''}
        onClose={() => setReviewGoalId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  section: { marginBottom: SPACING.xl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  sectionSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  chipText: { fontSize: 15, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.accent, fontWeight: '600' },
  emptyCard: {
    padding: 20,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
  goalCard: {
    padding: 16,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  goalTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 },
  goalIntent: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 10 },
  goalMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  momentumBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.accentBg },
  momentumText: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
  gaugesText: { fontSize: 12, color: COLORS.textMuted },
  buildCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  buildCardPressed: { opacity: 0.9 },
  buildTitle: { fontSize: 17, fontWeight: '600', color: COLORS.accent },
  buildSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewCardPressed: { opacity: 0.9 },
  reviewTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  reviewSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  pickerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 6,
  },
  pickerRowCool: { backgroundColor: 'rgba(251, 146, 60, 0.12)', borderLeftWidth: 3, borderLeftColor: COLORS.amber },
  pickerRowStalled: { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderLeftWidth: 3, borderLeftColor: COLORS.warning },
  pickerRowPressed: { opacity: 0.9 },
  pickerRowContent: { flex: 1 },
  pickerRowText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  pickerRowBadge: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  pickerRowMomentum: { fontSize: 12, color: COLORS.accent, marginTop: 2, fontWeight: '500' },
  pickerRowMomentumStruggling: { color: COLORS.amber },
  pickerCancel: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  pickerCancelText: { fontSize: 16, color: COLORS.textMuted },
});
