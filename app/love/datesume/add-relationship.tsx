/**
 * Datésumé — Add relationship experience.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { RELATIONSHIP_TITLES, RELATIONSHIP_TYPES } from '../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const s = input.trim();
    if (s) {
      onChange([...items, s]);
      setInput('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const remove = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.listRow}>
          <Text style={styles.listItemText}>{item}</Text>
          <Pressable onPress={() => remove(i)} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          onSubmitEditing={add}
        />
        <Pressable style={styles.addBtn} onPress={add}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AddRelationshipScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addRelationship = useDatesumeStore((s) => s.addRelationship);

  const [title, setTitle] = useState(RELATIONSHIP_TITLES[0]);
  const [type, setType] = useState<'casual' | 'serious' | 'engaged' | 'married'>('serious');
  const [partnerName, setPartnerName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [startYear, setStartYear] = useState(currentYear - 5);
  const [isOngoing, setIsOngoing] = useState(false);
  const [endYear, setEndYear] = useState<number | undefined>(currentYear);
  const [whatIBrought, setWhatIBrought] = useState<string[]>([]);
  const [wins, setWins] = useState<string[]>([]);
  const [howItEnded, setHowItEnded] = useState('');
  const [whoEnded, setWhoEnded] = useState<'me' | 'them' | 'mutual' | undefined>();
  const [currentStatus, setCurrentStatus] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState<string[]>([]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addRelationship({
      title,
      type,
      partnerName: isAnonymous ? undefined : (partnerName.trim() || undefined),
      isAnonymous,
      startYear,
      endYear: isOngoing ? undefined : endYear,
      isOngoing,
      whatIBrought,
      wins,
      howItEnded: howItEnded.trim() || undefined,
      whoEnded,
      currentStatus: currentStatus.trim() || undefined,
      lessonsLearned,
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
      <Text style={styles.label}>Title</Text>
      <View style={styles.chipRow}>
        {RELATIONSHIP_TITLES.map((t) => (
          <Pressable key={t} style={[styles.chip, title === t && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTitle(t); }}>
            <Text style={[styles.chipText, title === t && styles.chipTextSelected]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {RELATIONSHIP_TYPES.map((t) => (
          <Pressable key={t} style={[styles.chip, type === t && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setType(t); }}>
            <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Anonymous</Text>
        <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ false: COLORS.surfaceElevated, true: ACCENT }} thumbColor="#fff" />
      </View>
      {!isAnonymous && (
        <>
          <Text style={styles.label}>Partner name (optional)</Text>
          <TextInput style={styles.input} value={partnerName} onChangeText={setPartnerName} placeholder="Name" placeholderTextColor={COLORS.textMuted} />
        </>
      )}
      <Text style={styles.label}>Start year</Text>
      <View style={styles.chipRow}>
        {YEARS.slice(0, 20).map((y) => (
          <Pressable key={y} style={[styles.chip, startYear === y && styles.chipSelected]} onPress={() => setStartYear(y)}>
            <Text style={[styles.chipText, startYear === y && styles.chipTextSelected]}>{y}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Still ongoing</Text>
        <Switch value={isOngoing} onValueChange={setIsOngoing} trackColor={{ false: COLORS.surfaceElevated, true: ACCENT }} thumbColor="#fff" />
      </View>
      {!isOngoing && (
        <>
          <Text style={styles.label}>End year</Text>
          <View style={styles.chipRow}>
            {YEARS.slice(0, 20).map((y) => (
              <Pressable key={y} style={[styles.chip, endYear === y && styles.chipSelected]} onPress={() => setEndYear(y)}>
                <Text style={[styles.chipText, endYear === y && styles.chipTextSelected]}>{y}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Who ended it</Text>
          <View style={styles.chipRow}>
            {(['me', 'them', 'mutual'] as const).map((w) => (
              <Pressable key={w} style={[styles.chip, whoEnded === w && styles.chipSelected]} onPress={() => setWhoEnded(w)}>
                <Text style={[styles.chipText, whoEnded === w && styles.chipTextSelected]}>{w}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>How it ended (optional)</Text>
          <TextInput style={[styles.input, styles.textArea]} value={howItEnded} onChangeText={setHowItEnded} placeholder="Brief description" placeholderTextColor={COLORS.textMuted} multiline />
        </>
      )}
      <Text style={styles.label}>Current status with them (optional)</Text>
      <TextInput style={styles.input} value={currentStatus} onChangeText={setCurrentStatus} placeholder="e.g. Friends" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>What I brought</Text>
      <ListEditor items={whatIBrought} onChange={setWhatIBrought} placeholder="Add item" />
      <Text style={styles.label}>Wins</Text>
      <ListEditor items={wins} onChange={setWins} placeholder="Add win" />
      <Text style={styles.label}>Lessons learned</Text>
      <ListEditor items={lessonsLearned} onChange={setLessonsLearned} placeholder="Add lesson" />
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  chipText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  listItemText: { fontSize: 15, color: COLORS.text, flex: 1 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 16 },
  addBtn: { backgroundColor: ACCENT, paddingHorizontal: 20, borderRadius: BORDER_RADIUS.input, justifyContent: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
