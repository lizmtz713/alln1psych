/**
 * Love History — Add entry. Guided prompts; optional anonymous.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useLoveHistoryStore } from '../../src/stores/loveHistoryStore';
import { useUserStore } from '../../src/stores/userStore';
import {
  RELATIONSHIP_TYPES,
  RELATIONSHIP_TYPES_TEEN,
  ENDING_TYPES,
  type RelationshipType,
  type EndingType,
} from '../../src/types/loveHistory';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';

const REL_LABELS: Record<RelationshipType, string> = {
  crush: 'Crush', kiss: 'Kiss', fling: 'Fling', situationship: 'Situationship',
  dating: 'Dating', relationship: 'Relationship', engaged: 'Engaged',
  married: 'Married', divorced: 'Divorced',
};
const END_LABELS: Record<EndingType, string> = {
  mutual: 'Mutual', ghosted: 'Ghosted', 'grew-apart': 'Grew apart',
  cheating: 'Cheating', 'moved-away': 'Moved away', 'wrong-timing': 'Wrong timing', other: 'Other',
};
const ACCENT = '#EC4899';

export default function LoveHistoryAddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ageGroup = useUserStore((s) => s.ageGroup);
  const addEntry = useLoveHistoryStore((s) => s.addEntry);
  const types = ageGroup === '13-17' ? RELATIONSHIP_TYPES_TEEN : [...RELATIONSHIP_TYPES];

  const [name, setName] = useState('');
  const [type, setType] = useState<RelationshipType>('dating');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [howItEnded, setHowItEnded] = useState<EndingType | null>(null);
  const [howItEndedOther, setHowItEndedOther] = useState('');
  const [lessons, setLessons] = useState('');
  const [notes, setNotes] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addEntry({
      name: isAnonymous ? null : (name.trim() || null),
      type,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: isCurrent ? null : (endDate || null),
      durationMonths: null,
      howItEnded,
      howItEndedOther: howItEnded === 'other' ? howItEndedOther : undefined,
      lessons: lessons.trim() ? lessons.trim().split(/\n/).filter(Boolean) : [],
      notes: notes.trim(),
      skillsDeveloped: [],
      isAnonymous,
    });
    router.back();
  };

  const canSave = startDate.trim().length > 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Anonymous</Text>
        <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ false: COLORS.surfaceElevated, true: ACCENT }} thumbColor="#fff" />
      </View>
      {!isAnonymous && <Text style={styles.label}>Name (optional)</Text>}
      {!isAnonymous && (
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Alex" placeholderTextColor={COLORS.textMuted} />
      )}
      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {types.map((t) => (
          <Pressable key={t} style={[styles.chip, type === t && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setType(t); }}>
            <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>{REL_LABELS[t]}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Start date</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} />
      <View style={styles.row}>
        <Text style={styles.label}>Currently ongoing</Text>
        <Switch value={isCurrent} onValueChange={setIsCurrent} trackColor={{ false: COLORS.surfaceElevated, true: ACCENT }} thumbColor="#fff" />
      </View>
      {!isCurrent && (
        <>
          <Text style={styles.label}>End date</Text>
          <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} />
          <Text style={styles.label}>How it ended</Text>
          <View style={styles.chipRow}>
            {(ENDING_TYPES as readonly EndingType[]).map((e) => (
              <Pressable key={e} style={[styles.chip, howItEnded === e && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setHowItEnded(e); }}>
                <Text style={[styles.chipText, howItEnded === e && styles.chipTextSelected]}>{END_LABELS[e]}</Text>
              </Pressable>
            ))}
          </View>
          {howItEnded === 'other' && (
            <TextInput style={styles.input} value={howItEndedOther} onChangeText={setHowItEndedOther} placeholder="Describe" placeholderTextColor={COLORS.textMuted} />
          )}
        </>
      )}
      <Text style={styles.label}>Lessons (one per line, optional)</Text>
      <TextInput style={[styles.input, styles.textArea]} value={lessons} onChangeText={setLessons} placeholder="What did you learn?" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Anything else" placeholderTextColor={COLORS.textMuted} multiline />
      <Pressable style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} onPress={handleSave} disabled={!canSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: ACCENT + '22' },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginTop: 32 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
