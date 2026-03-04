/**
 * Alignment Discovery — AI-guided values clarification through scenarios and reflection.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { VALUES_SCENARIOS } from '../../../src/data/discoveryQuestions';
import { ALIGNMENT_VALUES } from '../../../src/lib/gaugeOptions';
import { synthesizeValues, type ValueWithReason } from '../../../src/services/discoveryAI';

type Step = 'intro' | 'questions' | 'synthesizing' | 'result' | 'edit';

const VALUE_EMOJIS: Record<string, string> = {
  Family: '👨‍👩‍👧',
  Freedom: '🦅',
  Honesty: '🏆',
  Creativity: '🎨',
  Growth: '🌱',
  Security: '🛡️',
  Adventure: '🏔️',
  Service: '🤝',
  Health: '💪',
  Connection: '💜',
  Success: '⭐',
  Peace: '☮️',
  Justice: '⚖️',
  Loyalty: '❤️',
  Authenticity: '✨',
  Knowledge: '📚',
  Love: '💕',
  Independence: '🔑',
  Fun: '🎉',
  Faith: '🙏',
};

export default function AlignmentDiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { alignment: def, setAlignment: setDef } = useGaugeDefinitionsStore();

  const [step, setStep] = useState<Step>('intro');
  const [scenarioChoices, setScenarioChoices] = useState<
    Array<{ scenarioId: string; selectedOption?: { label: string; values: string[] }; freeText?: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [synthesis, setSynthesis] = useState<ValueWithReason[] | null>(null);
  const [tensions, setTensions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const scenario = VALUES_SCENARIOS[currentIndex];
  const isLast = currentIndex === VALUES_SCENARIOS.length - 1;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('questions');
    setCurrentIndex(0);
    setScenarioChoices([]);
  };

  const handleSelectOption = (option: { label: string; values: string[] }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!scenario) return;
    setScenarioChoices((prev) => {
      const next = prev.filter((c) => c.scenarioId !== scenario.id);
      next.push({ scenarioId: scenario.id, selectedOption: option });
      return next;
    });
  };

  const handleFreeText = (text: string) => {
    if (!scenario) return;
    setScenarioChoices((prev) => {
      const next = prev.filter((c) => c.scenarioId !== scenario.id);
      next.push({ scenarioId: scenario.id, freeText: text });
      return next;
    });
  };

  const canContinue = () => {
    if (!scenario) return false;
    if (scenario.freeText) {
      const r = scenarioChoices.find((c) => c.scenarioId === scenario.id)?.freeText ?? '';
      return r.trim().length > 0;
    }
    return scenarioChoices.some((c) => c.scenarioId === scenario.id && c.selectedOption);
  };

  const handleNext = () => {
    if (!canContinue()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      setStep('synthesizing');
      setError(null);
      const choices = VALUES_SCENARIOS.map((s) => {
        const c = scenarioChoices.find((x) => x.scenarioId === s.id);
        return c ?? { scenarioId: s.id };
      });
      const reflections = choices.map((c) => c.freeText ?? '').filter(Boolean);
      synthesizeValues(choices, reflections)
        .then((res) => {
          setSynthesis(res.topValues);
          setTensions(res.tensions);
          setStep('result');
        })
        .catch((e) => {
          setError(e?.message ?? 'Something went wrong');
          setSynthesis([]);
          setTensions('');
          setStep('result');
        });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    else setStep('intro');
  };

  const handleYesSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const values = (synthesis ?? []).map((v) => v.value).filter(Boolean);
    setDef({
      topValues: values.slice(0, 5),
      coreValuesSelected: [...new Set([...(def.coreValuesSelected ?? []), ...values])],
    });
    router.back();
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('edit');
  };

  const handleSwapValue = (index: number, newValue: string) => {
    if (!synthesis) return;
    const next = [...synthesis];
    next[index] = { ...next[index], value: newValue, reason: next[index].reason };
    setSynthesis(next);
    setEditIndex(null);
  };

  const handleSaveEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const values = (synthesis ?? []).map((v) => v.value).filter(Boolean);
    setDef({
      topValues: values.slice(0, 5),
      coreValuesSelected: [...new Set([...(def.coreValuesSelected ?? []), ...values])],
    });
    router.back();
  };

  if (step === 'intro') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.heroEmoji}>⚖️</Text>
          <Text style={styles.heroTitle}>Discover Your Values</Text>
          <Text style={styles.heroSub}>
            Values aren't what you THINK should matter. They're what ACTUALLY does. Let's find yours through reflection, not guessing.
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Let's Start</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === 'questions' && scenario) {
    const selected = scenarioChoices.find((c) => c.scenarioId === scenario.id);
    const freeText = scenario.freeText ? (selected?.freeText ?? '') : '';

    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.progress}>
            Question {currentIndex + 1} of {VALUES_SCENARIOS.length}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionText}>{scenario.scenario}</Text>
          {scenario.freeText ? (
            <TextInput
              style={styles.textArea}
              placeholder="What were you doing? What did it feel like?"
              placeholderTextColor={COLORS.textMuted}
              value={freeText}
              onChangeText={handleFreeText}
              multiline
              numberOfLines={4}
            />
          ) : (
            <View style={styles.optionsList}>
              {scenario.options?.map((opt) => {
                const isSelected = selected?.selectedOption?.label === opt.label;
                return (
                  <Pressable
                    key={opt.label}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => handleSelectOption(opt)}
                  >
                    <View style={styles.radio}>{isSelected ? <View style={styles.radioInner} /> : null}</View>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <Pressable
            style={[styles.primaryButton, !canContinue() && styles.primaryButtonDisabled]}
            onPress={handleNext}
            disabled={!canContinue()}
          >
            <Text style={styles.primaryButtonText}>{isLast ? 'See my values' : 'Continue'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === 'synthesizing') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.synthesizingWrap}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.synthesizingText}>Finding your values...</Text>
        </View>
      </View>
    );
  }

  if (step === 'edit' && synthesis) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => setStep('result')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit your top 5</Text>
        </View>
        <ScrollView contentContainerStyle={styles.editContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.editHint}>Tap a value to swap it for another.</Text>
          {synthesis.map((v, i) => (
            <View key={i} style={styles.editRow}>
              <Text style={styles.editRank}>{i + 1}.</Text>
              {editIndex === i ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {ALIGNMENT_VALUES.map((val) => (
                    <Pressable
                      key={val}
                      style={[styles.chip, synthesis[i].value === val && styles.chipSelected]}
                      onPress={() => handleSwapValue(i, val)}
                    >
                      <Text style={[styles.chipText, synthesis[i].value === val && styles.chipTextSelected]}>{val}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Pressable style={styles.valueChip} onPress={() => setEditIndex(i)}>
                  <Text style={styles.valueChipEmoji}>{VALUE_EMOJIS[v.value] ?? '•'}</Text>
                  <Text style={styles.valueChipText}>{v.value ?? (v as { label?: string }).label ?? ''}</Text>
                  <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable style={styles.primaryButton} onPress={handleSaveEdit}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (step === 'result' && synthesis) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>✨</Text>
          <Text style={styles.resultTitle}>Your Core Values</Text>
          <Text style={styles.resultSub}>Based on your choices, these values seem to matter most:</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {(synthesis?.length ? synthesis.slice(0, 5) : []).map((v, i) => {
            const label = v.value ?? (v as { label?: string }).label ?? '';
            return (
              <View key={i} style={styles.valueCard}>
                <Text style={styles.valueRank}>{i + 1}. {VALUE_EMOJIS[v.value ?? label] ?? '•'} {(label || '').toUpperCase()}</Text>
                <Text style={styles.valueReason}>{v.reason ?? ''}</Text>
              </View>
            );
          })}
          {tensions ? (
            <View style={styles.tensionsCard}>
              <Text style={styles.tensionsText}>{tensions}</Text>
            </View>
          ) : null}
          <Text style={styles.resultCta}>Do these feel right?</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={handleEdit}>
              <Text style={styles.secondaryButtonText}>Let me edit</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleYesSave}>
              <Text style={styles.primaryButtonText}>Yes, save</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  introContent: { padding: 24, paddingTop: 48 },
  heroEmoji: { fontSize: 48, marginBottom: 16 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  heroSub: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 32 },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, color: COLORS.accent },
  progress: { flex: 1, textAlign: 'center', fontSize: 14, color: COLORS.textMuted },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  questionContent: { padding: 24, paddingBottom: 48 },
  questionText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 20, lineHeight: 26 },
  textArea: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 16, fontSize: 16, color: COLORS.text, minHeight: 120, textAlignVertical: 'top', marginBottom: 24 },
  optionsList: { marginBottom: 24 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  optionRowSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent },
  optionLabel: { fontSize: 16, color: COLORS.text, flex: 1 },
  synthesizingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  synthesizingText: { fontSize: 16, color: COLORS.textMuted },
  resultContent: { padding: 24, paddingBottom: 48 },
  resultEmoji: { fontSize: 40, marginBottom: 12 },
  resultTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  resultSub: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 20 },
  errorText: { fontSize: 14, color: COLORS.error, marginBottom: 12 },
  valueCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  valueRank: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  valueReason: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  tensionsCard: { backgroundColor: COLORS.accentBg, borderRadius: BORDER_RADIUS.input, padding: 14, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  tensionsText: { fontSize: 14, color: COLORS.text, fontStyle: 'italic', lineHeight: 20 },
  resultCta: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  secondaryButton: { flex: 1, paddingVertical: 14, borderRadius: BORDER_RADIUS.button, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  editContent: { padding: 24 },
  editHint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  editRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  editRank: { width: 28, fontSize: 16, color: COLORS.textMuted },
  valueChip: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, borderWidth: 1, borderColor: COLORS.border },
  valueChipEmoji: { marginRight: 8, fontSize: 18 },
  valueChipText: { flex: 1, fontSize: 16, color: COLORS.text }, // explicit so chip text visible on dark surface
  chipScroll: { flex: 1, maxHeight: 120 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surface, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accent },
  chipText: { fontSize: 14, color: COLORS.text }, // explicit so chip text visible on dark surface
  chipTextSelected: { color: COLORS.accent, fontWeight: '600' },
});
