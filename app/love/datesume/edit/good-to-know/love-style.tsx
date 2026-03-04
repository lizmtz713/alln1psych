/**
 * Good to Know — Love Style.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { LOVE_LANGUAGE_OPTIONS } from '../../../../../src/types/datesume';
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

export default function LoveStyleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;
  const [loveLanguages, setLoveLanguages] = useState<string[]>([]);
  const [howIShowLove, setHowIShowLove] = useState<string[]>([]);
  const [howINeedLove, setHowINeedLove] = useState<string[]>([]);
  const [qualityTimeStyle, setQualityTimeStyle] = useState('');

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (g) {
      setLoveLanguages(g.loveLanguages ?? []);
      setHowIShowLove(g.howIShowLove ?? []);
      setHowINeedLove(g.howINeedLove ?? []);
      setQualityTimeStyle(g.qualityTimeStyle ?? '');
    }
  }, [datesume?.updatedAt]);

  const toggleLoveLang = (lang: string) => {
    const next = loveLanguages.includes(lang) ? loveLanguages.filter((l) => l !== lang) : [...loveLanguages, lang];
    setLoveLanguages(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGoodToKnow({ loveLanguages, howIShowLove, howINeedLove, qualityTimeStyle: qualityTimeStyle.trim() || undefined });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Love languages</Text>
      <View style={styles.chipRow}>
        {LOVE_LANGUAGE_OPTIONS.map((lang) => (
          <Pressable key={lang} style={[styles.chip, loveLanguages.includes(lang) && styles.chipSelected]} onPress={() => toggleLoveLang(lang)}>
            <Text style={[styles.chipText, loveLanguages.includes(lang) && styles.chipTextSelected]}>{lang}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>How I show love</Text>
      <ListEditor items={howIShowLove} onChange={setHowIShowLove} placeholder="Add" />
      <Text style={styles.label}>How I need love</Text>
      <ListEditor items={howINeedLove} onChange={setHowINeedLove} placeholder="Add" />
      <Text style={styles.label}>Quality time style</Text>
      <TextInput style={[styles.input, styles.textArea]} value={qualityTimeStyle} onChangeText={setQualityTimeStyle} placeholder="e.g. Deep convos over coffee" placeholderTextColor={COLORS.textMuted} multiline />
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
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
