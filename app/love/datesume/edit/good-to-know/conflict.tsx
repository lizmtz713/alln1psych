/**
 * Good to Know — Conflict & Communication.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { COLORS, BORDER_RADIUS } from '../../../../../src/lib/constants';

const ACCENT = '#EC4899';

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
        <TextInput style={[styles.input, { flex: 1 }]} value={input} onChangeText={setInput} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} onSubmitEditing={add} />
        <Pressable style={styles.addBtn} onPress={add}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ConflictScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;
  const [howIFight, setHowIFight] = useState('');
  const [whatINeedDuringConflict, setWhatINeedDuringConflict] = useState('');
  const [howIApologize, setHowIApologize] = useState('');
  const [howINeedApologies, setHowINeedApologies] = useState('');
  const [redFlagsIWatchFor, setRedFlagsIWatchFor] = useState<string[]>([]);

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (g) {
      setHowIFight(g.howIFight ?? '');
      setWhatINeedDuringConflict(g.whatINeedDuringConflict ?? '');
      setHowIApologize(g.howIApologize ?? '');
      setHowINeedApologies(g.howINeedApologies ?? '');
      setRedFlagsIWatchFor(g.redFlagsIWatchFor ?? []);
    }
  }, [datesume?.updatedAt]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGoodToKnow({
      howIFight: howIFight.trim() || undefined,
      whatINeedDuringConflict: whatINeedDuringConflict.trim() || undefined,
      howIApologize: howIApologize.trim() || undefined,
      howINeedApologies: howINeedApologies.trim() || undefined,
      redFlagsIWatchFor,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>How I fight</Text>
      <TextInput style={[styles.input, styles.textArea]} value={howIFight} onChangeText={setHowIFight} placeholder="e.g. I go quiet first, then need to talk" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>What I need during conflict</Text>
      <TextInput style={[styles.input, styles.textArea]} value={whatINeedDuringConflict} onChangeText={setWhatINeedDuringConflict} placeholder="e.g. Space for 20 min, then conversation" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>How I apologize</Text>
      <TextInput style={[styles.input, styles.textArea]} value={howIApologize} onChangeText={setHowIApologize} placeholder="e.g. I say it directly and try to change behavior" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>How I need apologies</Text>
      <TextInput style={[styles.input, styles.textArea]} value={howINeedApologies} onChangeText={setHowINeedApologies} placeholder="e.g. Sincere words + follow-through" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>Red flags I watch for</Text>
      <ListEditor items={redFlagsIWatchFor} onChange={setRedFlagsIWatchFor} placeholder="Add one" />
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
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  listItemText: { fontSize: 15, color: COLORS.text, flex: 1 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 16 },
  addBtn: { backgroundColor: ACCENT, paddingHorizontal: 20, borderRadius: BORDER_RADIUS.input, justifyContent: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
