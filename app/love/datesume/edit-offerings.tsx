/**
 * Datésumé — Edit what I offer: daily life, adventures, tough times, fun.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

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

export default function EditOfferingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, update } = useDatesumeStore();
  const [dailyLife, setDailyLife] = useState<string[]>([]);
  const [adventures, setAdventures] = useState<string[]>([]);
  const [toughTimes, setToughTimes] = useState<string[]>([]);
  const [fun, setFun] = useState<string[]>([]);

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    const d = useDatesumeStore.getState().datesume;
    if (d?.offerings) {
      setDailyLife(d.offerings.dailyLife ?? []);
      setAdventures(d.offerings.adventures ?? []);
      setToughTimes(d.offerings.toughTimes ?? []);
      setFun(d.offerings.fun ?? []);
    }
  }, [datesume?.id, datesume?.updatedAt]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    update({ offerings: { dailyLife, adventures, toughTimes, fun } });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Daily life</Text>
      <ListEditor items={dailyLife} onChange={setDailyLife} placeholder="What you bring day to day" />
      <Text style={styles.sectionTitle}>Adventures</Text>
      <ListEditor items={adventures} onChange={setAdventures} placeholder="Trips, experiences" />
      <Text style={styles.sectionTitle}>Tough times</Text>
      <ListEditor items={toughTimes} onChange={setToughTimes} placeholder="How you show up when hard" />
      <Text style={styles.sectionTitle}>Fun</Text>
      <ListEditor items={fun} onChange={setFun} placeholder="Play, humor, lightness" />
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  listItemText: { fontSize: 15, color: COLORS.text, flex: 1 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 20 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: ACCENT, paddingHorizontal: 20, borderRadius: BORDER_RADIUS.input, justifyContent: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
