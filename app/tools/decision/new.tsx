/**
 * Decision Tool — 8-step decision flow.
 * Route: /tools/decision/new
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useDecisionStore } from '../../../src/stores/decisionStore';
import type { DecisionOption, DecisionRisk } from '../../../src/types/decision';
import { runAchievementChecks } from '../../../src/services/achievementChecker';
import { sendMessageWithSystemPromptOnly, hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function genId(): string {
  return 'opt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

const STEP_LABELS = [
  'Clarify',
  'Options',
  'Values',
  'Evaluate',
  'Risks',
  'Bias check',
  '10-10-10',
  'Decide',
];

export default function DecisionNewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addDecision = useDecisionStore((s) => s.addDecision);

  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [clarify, setClarify] = useState('');
  const [aiClarity, setAiClarity] = useState<string | null>(null);
  const [aiClarityLoading, setAiClarityLoading] = useState(false);
  const [options, setOptions] = useState<DecisionOption[]>([{ id: genId(), label: '' }, { id: genId(), label: '' }]);
  const [values, setValues] = useState<string[]>(['']);
  const [evaluateNotes, setEvaluateNotes] = useState('');
  const [risks, setRisks] = useState<DecisionRisk[]>([]);
  const [biasCheck, setBiasCheck] = useState('');
  const [forecast10min, setForecast10min] = useState('');
  const [forecast10months, setForecast10months] = useState('');
  const [forecast10years, setForecast10years] = useState('');
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 8) setStep(step + 1);
  };

  const addOption = () => {
    setOptions((o) => [...o, { id: genId(), label: '' }]);
  };

  const setOptionLabel = (id: string, label: string) => {
    setOptions((o) => o.map((x) => (x.id === id ? { ...x, label } : x)));
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions((o) => o.filter((x) => x.id !== id));
  };

  const addValue = () => setValues((v) => [...v, '']);
  const setValueAt = (i: number, s: string) => setValues((v) => v.map((x, j) => (j === i ? s : x)));

  const addRisk = (optionId: string) => {
    setRisks((r) => [...r, { optionId, description: '', severity: 'medium' }]);
  };

  const setRiskDesc = (idx: number, desc: string) => {
    setRisks((r) => r.map((x, i) => (i === idx ? { ...x, description: desc } : x)));
  };

  const handleDecide = () => {
    const optionIds = options.map((o) => o.id);
    const chosen = chosenOptionId && optionIds.includes(chosenOptionId) ? chosenOptionId : optionIds[0];
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = addDecision({
      type: 'full',
      question: question.trim() || 'Untitled decision',
      clarify: clarify.trim() || undefined,
      options: options.filter((o) => o.label.trim()),
      values: values.filter(Boolean),
      evaluateNotes: evaluateNotes.trim() || undefined,
      risks: risks.length ? risks : undefined,
      biasCheck: biasCheck.trim() || undefined,
      forecast101010:
        forecast10min || forecast10months || forecast10years
          ? { in10min: forecast10min, in10months: forecast10months, in10years: forecast10years }
          : undefined,
      decidedAt: new Date().toISOString(),
      chosenOptionId: chosen,
      decisionNote: decisionNote.trim() || undefined,
    });
    runAchievementChecks();
    router.replace('/tools/decision/' + id);
  };

  const validOptions = options.filter((o) => o.label.trim()).length >= 2;
  const canNext = step === 1 ? (question.trim().length > 0) : step === 2 ? validOptions : true;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Step {step}: {STEP_LABELS[step - 1]}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <Text style={styles.prompt}>What decision are you facing?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Whether to change jobs"
              placeholderTextColor={TEXT_MUTED}
              value={question}
              onChangeText={(t) => { setQuestion(t); setAiClarity(null); }}
            />
            <Text style={styles.prompt}>Clarify it in one sentence (optional).</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="What exactly is the choice?"
              placeholderTextColor={TEXT_MUTED}
              value={clarify}
              onChangeText={setClarify}
              multiline
            />
            {question.trim() && (
              <Pressable
                style={[styles.aiClarityBtn, aiClarityLoading && styles.aiClarityBtnDisabled]}
                onPress={async () => {
                  const hasKey = await hasOpenAIKey();
                  if (!hasKey) { Alert.alert('API key needed', 'Add your OpenAI API key in Settings to use AI clarity.'); return; }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAiClarityLoading(true);
                  setAiClarity(null);
                  try {
                    const sys = 'Help the user clarify this decision. Offer 1–2 short clarifying questions or a one-sentence reframe. Be brief and warm. Reply with plain text only.';
                    const content = (question.trim() + (clarify.trim() ? '\nContext: ' + clarify.trim() : ''));
                    const res = await sendMessageWithSystemPromptOnly([{ role: 'user', content }], sys, 200);
                    if (res && !res.startsWith('[')) setAiClarity(res.trim());
                  } catch { Alert.alert('Could not get clarity', 'Check your connection and try again.'); }
                  finally { setAiClarityLoading(false); }
                }}
                disabled={aiClarityLoading}
              >
                {aiClarityLoading ? <ActivityIndicator size="small" color={COLORS.accent} /> : <Ionicons name="sparkles" size={18} color={COLORS.accent} />}
                <Text style={styles.aiClarityBtnText}>{aiClarityLoading ? '…' : 'Get AI clarity'}</Text>
              </Pressable>
            )}
            {aiClarity && (
              <View style={styles.aiClarityCard}>
                <Text style={styles.aiClarityLabel}>AI reflection</Text>
                <Text style={styles.aiClarityText}>{aiClarity}</Text>
              </View>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.prompt}>List your options (at least 2).</Text>
            {options.map((o) => (
              <View key={o.id} style={styles.optionRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Option"
                  placeholderTextColor={TEXT_MUTED}
                  value={o.label}
                  onChangeText={(t) => setOptionLabel(o.id, t)}
                />
                <Pressable onPress={() => removeOption(o.id)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={24} color={TEXT_MUTED} />
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addOptionBtn} onPress={addOption}>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.accent} />
              <Text style={styles.addOptionText}>Add option</Text>
            </Pressable>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.prompt}>What values matter for this decision?</Text>
            {values.map((v, i) => (
              <TextInput
                key={i}
                style={styles.input}
                placeholder="e.g. family, growth, security"
                placeholderTextColor={TEXT_MUTED}
                value={v}
                onChangeText={(t) => setValueAt(i, t)}
              />
            ))}
            <Pressable style={styles.addOptionBtn} onPress={addValue}>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.accent} />
              <Text style={styles.addOptionText}>Add value</Text>
            </Pressable>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.prompt}>How do the options stack up? Notes.</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Compare options against your values. No wrong answer."
              placeholderTextColor={TEXT_MUTED}
              value={evaluateNotes}
              onChangeText={setEvaluateNotes}
              multiline
            />
          </>
        )}

        {step === 5 && (
          <>
            <Text style={styles.prompt}>Risks or downsides per option (optional).</Text>
            {options.filter((o) => o.label.trim()).map((o) => (
              <View key={o.id} style={styles.riskBlock}>
                <Text style={styles.riskOptionLabel}>{o.label}</Text>
                {risks.filter((r) => r.optionId === o.id).map((r, idx) => {
                  const globalIdx = risks.findIndex((x) => x === r);
                  return (
                    <TextInput
                      key={r.optionId + idx}
                      style={[styles.input, styles.inputSmall]}
                      placeholder="One risk"
                      placeholderTextColor={TEXT_MUTED}
                      value={r.description}
                      onChangeText={(t) => setRiskDesc(globalIdx, t)}
                    />
                  );
                })}
                <Pressable style={styles.addOptionBtn} onPress={() => addRisk(o.id)}>
                  <Text style={styles.addOptionText}>+ Risk</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {step === 6 && (
          <>
            <Text style={styles.prompt}>Bias check. What might be clouding your judgment?</Text>
            <Text style={styles.hint}>e.g. Sunk cost, overconfidence, avoiding discomfort, peer pressure.</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Note any biases you might have..."
              placeholderTextColor={TEXT_MUTED}
              value={biasCheck}
              onChangeText={setBiasCheck}
              multiline
            />
          </>
        )}

        {step === 7 && (
          <>
            <Text style={styles.prompt}>10-10-10. How will you feel about this decision?</Text>
            <Text style={styles.hint}>In 10 minutes, 10 months, 10 years.</Text>
            <Text style={styles.forecastLabel}>In 10 minutes</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="..." placeholderTextColor={TEXT_MUTED} value={forecast10min} onChangeText={setForecast10min} multiline />
            <Text style={styles.forecastLabel}>In 10 months</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="..." placeholderTextColor={TEXT_MUTED} value={forecast10months} onChangeText={setForecast10months} multiline />
            <Text style={styles.forecastLabel}>In 10 years</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="..." placeholderTextColor={TEXT_MUTED} value={forecast10years} onChangeText={setForecast10years} multiline />
          </>
        )}

        {step === 8 && (
          <>
            <Text style={styles.prompt}>Choose one.</Text>
            {options.filter((o) => o.label.trim()).map((o) => (
              <Pressable
                key={o.id}
                style={[styles.optionCard, chosenOptionId === o.id && styles.optionCardChosen]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setChosenOptionId(o.id); }}
              >
                <Text style={styles.optionCardLabel}>{o.label}</Text>
                {chosenOptionId === o.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />}
              </Pressable>
            ))}
            <Text style={styles.prompt}>Note (optional).</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Why this one? Or a commitment to yourself."
              placeholderTextColor={TEXT_MUTED}
              value={decisionNote}
              onChangeText={setDecisionNote}
              multiline
            />
          </>
        )}

        <View style={styles.footer}>
          {step < 8 ? (
            <Pressable style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]} onPress={handleNext} disabled={!canNext}>
              <Text style={styles.nextBtnText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.nextBtn, !chosenOptionId && styles.nextBtnDisabled]} onPress={handleDecide} disabled={!chosenOptionId}>
              <Text style={styles.nextBtnText}>I'm deciding</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  prompt: { fontSize: 16, fontWeight: '600', color: TEXT, marginBottom: 8 },
  hint: { fontSize: 14, color: TEXT_MUTED, marginBottom: 12 },
  input: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: BORDER, padding: 14, fontSize: 16, color: TEXT, marginBottom: SPACING.md },
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  inputSmall: { marginBottom: 8 },
  aiClarityBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent, borderRadius: BORDER_RADIUS?.card ?? 12 },
  aiClarityBtnDisabled: { opacity: 0.6 },
  aiClarityBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
  aiClarityCard: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS?.card ?? 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  aiClarityLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 6 },
  aiClarityText: { fontSize: 15, color: TEXT, lineHeight: 22 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeBtn: { padding: 4 },
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  addOptionText: { fontSize: 15, color: COLORS.accent, fontWeight: '600' },
  riskBlock: { marginBottom: SPACING.lg },
  riskOptionLabel: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 6 },
  forecastLabel: { fontSize: 14, color: TEXT_MUTED, marginBottom: 4 },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 2, borderColor: BORDER, padding: SPACING.lg, marginBottom: SPACING.md },
  optionCardChosen: { borderColor: COLORS.accent },
  optionCardLabel: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1 },
  footer: { marginTop: SPACING.xl },
  nextBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
