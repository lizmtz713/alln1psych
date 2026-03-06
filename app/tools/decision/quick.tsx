/**
 * Decision Tool — Quick decision: question + options + pick one.
 * Route: /tools/decision/quick
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useDecisionStore } from '../../../src/stores/decisionStore';
import type { DecisionOption } from '../../../src/types/decision';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function genId(): string {
  return 'opt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

export default function DecisionQuickScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addDecision = useDecisionStore((s) => s.addDecision);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<DecisionOption[]>([{ id: genId(), label: '' }, { id: genId(), label: '' }]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const setOptionLabel = (id: string, label: string) => {
    setOptions((o) => o.map((x) => (x.id === id ? { ...x, label } : x)));
  };

  const addOption = () => {
    if (options.length >= 4) return;
    setOptions((o) => [...o, { id: genId(), label: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions((o) => o.filter((x) => x.id !== id));
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDecide = () => {
    const valid = options.filter((o) => o.label.trim());
    if (valid.length < 2 || !question.trim()) return;
    const chosen = chosenId && valid.some((o) => o.id === chosenId) ? chosenId : valid[0].id;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = addDecision({
      type: 'quick',
      question: question.trim(),
      options: valid,
      decidedAt: new Date().toISOString(),
      chosenOptionId: chosen,
      decisionNote: note.trim() || undefined,
    });
    router.replace('/tools/decision/' + id);
  };

  const validOptions = options.filter((o) => o.label.trim());
  const canDecide = question.trim().length > 0 && validOptions.length >= 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Quick decision</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.prompt}>What are you deciding?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. What to have for dinner"
          placeholderTextColor={TEXT_MUTED}
          value={question}
          onChangeText={setQuestion}
        />
        <Text style={styles.prompt}>Options (pick one)</Text>
        {options.map((o) => (
          <View key={o.id} style={styles.optionRow}>
            <Pressable
              style={[styles.optionRadio, chosenId === o.id && styles.optionRadioChosen]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setChosenId(o.id); }}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Option"
              placeholderTextColor={TEXT_MUTED}
              value={o.label}
              onChangeText={(t) => setOptionLabel(o.id, t)}
            />
            <Pressable onPress={() => removeOption(o.id)} style={styles.removeBtn}>
              <Ionicons name="close-circle" size={22} color={TEXT_MUTED} />
            </Pressable>
          </View>
        ))}
        {options.length < 4 && (
          <Pressable style={styles.addOptionBtn} onPress={addOption}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.accent} />
            <Text style={styles.addOptionText}>Add option</Text>
          </Pressable>
        )}
        <Text style={styles.prompt}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Why this one?"
          placeholderTextColor={TEXT_MUTED}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <Pressable style={[styles.decideBtn, !canDecide && styles.decideBtnDisabled]} onPress={handleDecide} disabled={!canDecide}>
          <Text style={styles.decideBtnText}>Decide</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  prompt: { fontSize: 16, fontWeight: '600', color: TEXT, marginBottom: 8 },
  input: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: BORDER, padding: 14, fontSize: 16, color: TEXT, marginBottom: SPACING.md },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  optionRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: BORDER },
  optionRadioChosen: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  removeBtn: { padding: 4 },
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.lg },
  addOptionText: { fontSize: 15, color: COLORS.accent, fontWeight: '600' },
  decideBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginTop: 8 },
  decideBtnDisabled: { opacity: 0.5 },
  decideBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
