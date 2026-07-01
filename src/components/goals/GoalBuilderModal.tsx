/**
 * AI Goal Builder — Conversational flow: life area → progress → barriers → suggestions → pick goal.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { DIRECTION_AREAS, BARRIER_OPTIONS, WHY_IT_MATTERS_OPTIONS } from '../../types/goals';
import { getSuggestionsForArea } from '../../services/goalSuggestions';
import { useGoalsStore } from '../../stores/goalsStore';
import type { DirectionArea } from '../../types/goals';

const GAUGE_LABELS: Record<string, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

export interface GoalBuilderModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'area' | 'progress' | 'barrier' | 'suggestions' | 'why';

export function GoalBuilderModal({ visible, onClose }: GoalBuilderModalProps) {
  const addGoal = useGoalsStore((s) => s.addGoal);
  const [step, setStep] = useState<Step>('area');
  const [lifeArea, setLifeArea] = useState<DirectionArea | ''>('');
  const [progressText, setProgressText] = useState('');
  const [barrier, setBarrier] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<{ title: string; intent: string; gauges: string[] } | null>(null);
  const [whyItMatters, setWhyItMatters] = useState<string>('');

  const suggestions = lifeArea ? getSuggestionsForArea(lifeArea, progressText, barrier) : [];
  const canNext =
    (step === 'area' && lifeArea) ||
    (step === 'progress' && progressText.trim().length > 0) ||
    (step === 'barrier') ||
    (step === 'suggestions' && selectedSuggestion) ||
    step === 'why';

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'area') setStep('progress');
    else if (step === 'progress') setStep('barrier');
    else if (step === 'barrier') setStep('suggestions');
    else if (step === 'suggestions' && selectedSuggestion) setStep('why');
    else if (step === 'why' && selectedSuggestion) {
      addGoal({
        title: selectedSuggestion.title,
        intent: selectedSuggestion.intent,
        momentum: 'warm',
        supportedGauges: selectedSuggestion.gauges as any,
        lifeArea: lifeArea || 'Other',
        whyItMatters: whyItMatters.trim() || undefined,
      });
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setStep('area');
    setLifeArea('');
    setProgressText('');
    setBarrier('');
    setSelectedSuggestion(null);
    setWhyItMatters('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={resetAndClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Build a goal</Text>
          <Pressable onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 'area' && (
            <>
              <Text style={styles.prompt}>What part of your life do you want to improve right now?</Text>
              <View style={styles.chips}>
                {DIRECTION_AREAS.map((area) => (
                  <Pressable
                    key={area}
                    style={[styles.chip, lifeArea === area && styles.chipActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLifeArea(area); }}
                  >
                    <Text style={[styles.chipText, lifeArea === area && styles.chipTextActive]}>{area}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {step === 'progress' && (
            <>
              <Text style={styles.prompt}>What would progress look like for you?</Text>
              <Pressable style={styles.inputBox} onPress={() => setProgressText('Feel healthier')}>
                <Text style={styles.optionText}>Feel healthier</Text>
              </Pressable>
              <Pressable style={styles.inputBox} onPress={() => setProgressText('Reduce stress')}>
                <Text style={styles.optionText}>Reduce stress</Text>
              </Pressable>
              <Pressable style={styles.inputBox} onPress={() => setProgressText('Improve my relationships')}>
                <Text style={styles.optionText}>Improve my relationships</Text>
              </Pressable>
              <Pressable style={styles.inputBox} onPress={() => setProgressText('Make progress on what matters')}>
                <Text style={styles.optionText}>Make progress on what matters</Text>
              </Pressable>
              {progressText ? <Text style={styles.selected}>Selected: {progressText}</Text> : null}
            </>
          )}
          {step === 'barrier' && (
            <>
              <Text style={styles.prompt}>What's getting in the way right now?</Text>
              <View style={styles.chips}>
                {BARRIER_OPTIONS.map((b) => (
                  <Pressable
                    key={b}
                    style={[styles.chip, barrier === b && styles.chipActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBarrier(b); }}
                  >
                    <Text style={[styles.chipText, barrier === b && styles.chipTextActive]}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {step === 'suggestions' && (
            <>
              <Text style={styles.prompt}>Here are some goals that might fit. Choose one.</Text>
              {suggestions.map((s, i) => (
                <Pressable
                  key={i}
                  style={[styles.suggestionCard, selectedSuggestion?.title === s.title && styles.suggestionCardActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedSuggestion(s); }}
                >
                  <Text style={styles.suggestionTitle}>{s.title}</Text>
                  <Text style={styles.suggestionIntent}>{s.intent}</Text>
                  <Text style={styles.suggestionGauges}>Supports: {s.gauges.map((g) => GAUGE_LABELS[g] ?? g).join(', ')}</Text>
                </Pressable>
              ))}
            </>
          )}
          {step === 'why' && (
            <>
              <Text style={styles.prompt}>Why does this goal matter to you?</Text>
              <Text style={styles.promptSub}>Optional—ties your goal to what you value (Alignment).</Text>
              <View style={styles.chips}>
                {WHY_IT_MATTERS_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.chip, whyItMatters === opt && styles.chipActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWhyItMatters(opt); }}
                  >
                    <Text style={[styles.chipText, whyItMatters === opt && styles.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
              {whyItMatters ? <Text style={styles.selected}>Selected: {whyItMatters}</Text> : null}
            </>
          )}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canNext}
          >
            <Text style={[styles.nextBtnText, !canNext && styles.nextBtnTextDisabled]}>
              {step === 'why' ? 'Add goal' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={canNext ? '#fff' : COLORS.textMuted} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  closeBtn: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  prompt: { fontSize: 17, fontWeight: '500', color: COLORS.text, marginBottom: 16 },
  promptSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  chipText: { fontSize: 15, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.accent, fontWeight: '600' },
  inputBox: { padding: 16, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  optionText: { fontSize: 15, color: COLORS.text },
  selected: { fontSize: 14, color: COLORS.textMuted, marginTop: 12 },
  suggestionCard: { padding: 16, borderRadius: BORDER_RADIUS.card, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  suggestionCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  suggestionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  suggestionIntent: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  suggestionGauges: { fontSize: 12, color: COLORS.textMuted },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, backgroundColor: COLORS.accent },
  nextBtnDisabled: { backgroundColor: COLORS.surface, opacity: 0.8 },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  nextBtnTextDisabled: { color: COLORS.textMuted },
});
