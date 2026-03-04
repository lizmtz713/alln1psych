/**
 * Datésumé — Edit summary, looking for, dealbreakers (chips).
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';

export default function EditSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, update } = useDatesumeStore();

  const [summary, setSummary] = useState('');
  const [lookingForText, setLookingForText] = useState('');
  const [dealbreakersText, setDealbreakersText] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const d = useDatesumeStore.getState().datesume;
    if (d) {
      setSummary(d.summary ?? '');
      setLookingForText((d.lookingFor ?? []).join(', '));
      setDealbreakersText((d.dealbreakers ?? []).join(', '));
    }
  }, [datesume?.id, datesume?.updatedAt]);

  const parseChips = (s: string) => s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    update({
      summary: summary.trim() || undefined,
      lookingFor: parseChips(lookingForText),
      dealbreakers: parseChips(dealbreakersText),
    });
    router.back();
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Summary</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={summary}
        onChangeText={setSummary}
        placeholder="A short intro about you and what you want"
        placeholderTextColor={COLORS.textMuted}
        multiline
      />
      <Text style={styles.label}>Looking for (comma or semicolon separated)</Text>
      <TextInput
        style={styles.input}
        value={lookingForText}
        onChangeText={setLookingForText}
        placeholder="e.g. Long-term, monogamy, growth"
        placeholderTextColor={COLORS.textMuted}
      />
      <Text style={styles.label}>Dealbreakers (comma or semicolon separated)</Text>
      <TextInput
        style={styles.input}
        value={dealbreakersText}
        onChangeText={setDealbreakersText}
        placeholder="e.g. Smoking, dishonesty"
        placeholderTextColor={COLORS.textMuted}
      />
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
