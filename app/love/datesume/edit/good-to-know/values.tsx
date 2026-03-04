/**
 * Good to Know — Core Values.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { CORE_VALUES_SUGGESTIONS, POLITICAL_OPTIONS, type GoodToKnow } from '../../../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../../../src/lib/constants';

const ACCENT = '#EC4899';

export default function ValuesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [religion, setReligion] = useState('');
  const [politicalLeaning, setPoliticalLeaning] = useState<GoodToKnow['politicalLeaning']>();

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (g) {
      setCoreValues(g.coreValues ?? []);
      setReligion(g.religion ?? '');
      setPoliticalLeaning(g.politicalLeaning);
    }
  }, [datesume?.updatedAt]);

  const toggleValue = (v: string) => {
    const next = coreValues.includes(v) ? coreValues.filter((x) => x !== v) : [...coreValues, v];
    setCoreValues(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGoodToKnow({ coreValues, religion: religion.trim() || undefined, politicalLeaning });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Core values (tap to select)</Text>
      <View style={styles.chipRow}>
        {CORE_VALUES_SUGGESTIONS.map((v) => (
          <Pressable key={v} style={[styles.chip, coreValues.includes(v) && styles.chipSelected]} onPress={() => toggleValue(v)}>
            <Text style={[styles.chipText, coreValues.includes(v) && styles.chipTextSelected]}>{v}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Religion / spirituality (optional)</Text>
      <TextInput style={styles.input} value={religion} onChangeText={setReligion} placeholder="e.g. Spiritual but not religious" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Political alignment (optional)</Text>
      <View style={styles.chipRow}>
        {POLITICAL_OPTIONS.map((opt) => (
          <Pressable key={String(opt.value)} style={[styles.chip, politicalLeaning === opt.value && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPoliticalLeaning(opt.value); }}>
            <Text style={[styles.chipText, politicalLeaning === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
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
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  chipText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
