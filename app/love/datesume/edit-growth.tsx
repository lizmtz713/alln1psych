/**
 * Datésumé — Edit growth journey: list + add (title, type, year, insights).
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { GROWTH_TYPES, type GrowthEntry } from '../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';
const currentYear = new Date().getFullYear();

function InsightList({ insights, onChange }: { insights: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const s = input.trim();
    if (s) {
      onChange([...insights, s]);
      setInput('');
    }
  };
  const remove = (i: number) => onChange(insights.filter((_, idx) => idx !== i));
  return (
    <View>
      {insights.map((ins, i) => (
        <View key={i} style={styles.insightRow}>
          <Text style={styles.insightText}>{ins}</Text>
          <Pressable onPress={() => remove(i)} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </Pressable>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput style={[styles.input, { flex: 1 }]} value={input} onChangeText={setInput} placeholder="Add insight" placeholderTextColor={COLORS.textMuted} onSubmitEditing={add} />
        <Pressable style={styles.smallBtn} onPress={add}>
          <Text style={styles.smallBtnText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function EditGrowthScreen() {
  const insets = useSafeAreaInsets();
  const { datesume, init, addGrowth, removeGrowth } = useDatesumeStore();

  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addType, setAddType] = useState<GrowthEntry['type']>('therapy');
  const [addYear, setAddYear] = useState('');
  const [addOngoing, setAddOngoing] = useState(false);
  const [addInsights, setAddInsights] = useState<string[]>([]);

  useEffect(() => {
    init();
  }, [init]);

  const list = datesume?.growthJourney ?? [];

  const saveNew = () => {
    const title = addTitle.trim();
    if (!title) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addGrowth({
      title,
      type: addType,
      year: addYear.trim() ? parseInt(addYear.trim(), 10) : undefined,
      ongoing: addOngoing,
      insights: addInsights,
    });
    setShowAdd(false);
    setAddTitle('');
    setAddYear('');
    setAddOngoing(false);
    setAddInsights([]);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {list.map((g) => (
        <View key={g.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{g.title}</Text>
            <View style={styles.cardActions}>
              <Pressable onPress={() => { removeGrowth(g.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.cardMeta}>{GROWTH_TYPES.find((t) => t.value === g.type)?.label ?? g.type}{g.year ? ` · ${g.year}` : ''}{g.ongoing ? ' · Ongoing' : ''}</Text>
          {g.insights.length > 0 && (
            <View style={styles.insightsWrap}>
              {g.insights.map((ins, i) => (
                <Text key={i} style={styles.insightBullet}>• {ins}</Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {!showAdd ? (
        <Pressable style={styles.addCard} onPress={() => setShowAdd(true)}>
          <Ionicons name="add-circle-outline" size={28} color={ACCENT} />
          <Text style={styles.addCardText}>Add growth entry</Text>
        </Pressable>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={addTitle} onChangeText={setAddTitle} placeholder="e.g. Individual therapy" placeholderTextColor={COLORS.textMuted} />
          <Text style={styles.label}>Type</Text>
          <View style={styles.chipRow}>
            {GROWTH_TYPES.map((t) => (
              <Pressable key={t.value} style={[styles.chip, addType === t.value && styles.chipSelected]} onPress={() => setAddType(t.value)}>
                <Text style={[styles.chipText, addType === t.value && styles.chipTextSelected]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Year (optional)</Text>
          <TextInput style={styles.input} value={addYear} onChangeText={setAddYear} placeholder="e.g. 2022" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" />
          <View style={styles.row}>
            <Text style={styles.label}>Ongoing</Text>
            <Pressable style={[styles.toggle, addOngoing && styles.toggleOn]} onPress={() => setAddOngoing(!addOngoing)}>
              <Text style={styles.toggleText}>{addOngoing ? 'Yes' : 'No'}</Text>
            </Pressable>
          </View>
          <Text style={styles.label}>Insights</Text>
          <InsightList insights={addInsights} onChange={setAddInsights} />
          <View style={styles.row}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, !addTitle.trim() && styles.saveBtnDisabled]} onPress={saveNew} disabled={!addTitle.trim()}>
              <Text style={styles.saveBtnText}>Add</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardActions: { flexDirection: 'row', gap: 12 },
  cardMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  insightsWrap: { marginTop: 8 },
  insightBullet: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  addCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: BORDER_RADIUS.input, gap: 8 },
  addCardText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  form: { marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  chipText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  toggle: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  toggleOn: { borderColor: ACCENT },
  toggleText: { fontSize: 14, color: COLORS.text },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  insightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  insightText: { fontSize: 14, color: COLORS.text, flex: 1 },
  smallBtn: { backgroundColor: ACCENT, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.input, justifyContent: 'center' },
  smallBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  cancelBtnText: { fontSize: 16, color: COLORS.textMuted },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 14, paddingHorizontal: 24, borderRadius: BORDER_RADIUS.button },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
