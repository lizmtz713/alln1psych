/**
 * Good to Know — Life Goals.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { CAREER_AMBITION_OPTIONS, type GoodToKnow } from '../../../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../../../src/lib/constants';

const ACCENT = '#EC4899';
const KIDS_OPTIONS: { value: GoodToKnow['wantsKids']; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'have_them', label: 'Have them' },
];

export default function LifeGoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;

  const [wantsKids, setWantsKids] = useState<GoodToKnow['wantsKids']>();
  const [openToMarriage, setOpenToMarriage] = useState<boolean | undefined>();
  const [locationFlexibility, setLocationFlexibility] = useState('');
  const [careerAmbition, setCareerAmbition] = useState<GoodToKnow['careerAmbition']>();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (g) {
      setWantsKids(g.wantsKids);
      setOpenToMarriage(g.openToMarriage);
      setLocationFlexibility(g.locationFlexibility ?? '');
      setCareerAmbition(g.careerAmbition);
    }
  }, [g?.wantsKids, g?.openToMarriage, g?.locationFlexibility, g?.careerAmbition]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGoodToKnow({
      wantsKids,
      openToMarriage,
      locationFlexibility: locationFlexibility.trim() || undefined,
      careerAmbition,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Kids</Text>
      <View style={styles.chipRow}>
        {KIDS_OPTIONS.map((opt) => (
          <Pressable key={opt.value!} style={[styles.chip, wantsKids === opt.value && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWantsKids(opt.value); }}>
            <Text style={[styles.chipText, wantsKids === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Open to marriage</Text>
      <View style={styles.chipRow}>
        <Pressable style={[styles.chip, openToMarriage === true && styles.chipSelected]} onPress={() => setOpenToMarriage(true)}>
          <Text style={[styles.chipText, openToMarriage === true && styles.chipTextSelected]}>Yes</Text>
        </Pressable>
        <Pressable style={[styles.chip, openToMarriage === false && styles.chipSelected]} onPress={() => setOpenToMarriage(false)}>
          <Text style={[styles.chipText, openToMarriage === false && styles.chipTextSelected]}>No</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>Location flexibility</Text>
      <TextInput style={styles.input} value={locationFlexibility} onChangeText={setLocationFlexibility} placeholder="e.g. Open to relocating in 2–3 years" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Career ambition</Text>
      <View style={styles.chipRow}>
        {CAREER_AMBITION_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={[styles.chip, careerAmbition === opt.value && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCareerAmbition(opt.value); }}>
            <Text style={[styles.chipText, careerAmbition === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
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
