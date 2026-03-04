/**
 * Good to Know — Lifestyle Basics.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { ENERGY_OPTIONS, SCHEDULE_OPTIONS, PLANNER_OPTIONS, type GoodToKnow } from '../../../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../../../src/lib/constants';

const ACCENT = '#EC4899';

export default function LifestyleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;

  const [energy, setEnergy] = useState<GoodToKnow['energy']>();
  const [schedule, setSchedule] = useState<GoodToKnow['schedule']>();
  const [homeStyle, setHomeStyle] = useState('');
  const [plannerOrSpontaneous, setPlannerOrSpontaneous] = useState<GoodToKnow['plannerOrSpontaneous']>();

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (g) {
      setEnergy(g.energy);
      setSchedule(g.schedule);
      setHomeStyle(g.homeStyle ?? '');
      setPlannerOrSpontaneous(g.plannerOrSpontaneous);
    }
  }, [g?.energy, g?.schedule, g?.homeStyle, g?.plannerOrSpontaneous]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGoodToKnow({
      energy,
      schedule,
      homeStyle: homeStyle.trim() || undefined,
      plannerOrSpontaneous,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Energy</Text>
      <View style={styles.chipRow}>
        {ENERGY_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={[styles.chip, energy === opt.value && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEnergy(opt.value); }}>
            <Text style={[styles.chipText, energy === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Schedule</Text>
      <View style={styles.chipRow}>
        {SCHEDULE_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={[styles.chip, schedule === opt.value && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSchedule(opt.value); }}>
            <Text style={[styles.chipText, schedule === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Home style</Text>
      <TextInput style={styles.input} value={homeStyle} onChangeText={setHomeStyle} placeholder="e.g. Cozy, plants, books" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Planner or spontaneous</Text>
      <View style={styles.chipRow}>
        {PLANNER_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={[styles.chip, plannerOrSpontaneous === opt.value && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPlannerOrSpontaneous(opt.value); }}>
            <Text style={[styles.chipText, plannerOrSpontaneous === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
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
