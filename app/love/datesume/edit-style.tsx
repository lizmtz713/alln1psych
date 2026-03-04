/**
 * Datésumé — Edit style: attachment, love languages, conflict, strengths, growth edges.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';
const LOVE_LANGS = ['Words of affirmation', 'Quality time', 'Acts of service', 'Physical touch', 'Gifts'];
const ATTACHMENT_OPTIONS = ['Secure', 'Anxious', 'Avoidant', 'Anxious-Avoidant', 'Still figuring it out'];

export default function EditStyleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, update } = useDatesumeStore();
  const [attachmentStyle, setAttachmentStyle] = useState('');
  const [loveLanguages, setLoveLanguages] = useState<string[]>([]);
  const [conflictStyle, setConflictStyle] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [growthEdgesText, setGrowthEdgesText] = useState('');

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    const d = useDatesumeStore.getState().datesume;
    if (d) {
      setAttachmentStyle(d.attachmentStyle ?? '');
      setLoveLanguages(d.loveLanguages ?? []);
      setConflictStyle(d.conflictStyle ?? '');
      setStrengthsText((d.strengths ?? []).join(', '));
      setGrowthEdgesText((d.growthEdges ?? []).join(', '));
    }
  }, [datesume?.id, datesume?.updatedAt]);

  const toggleLoveLang = (lang: string) => {
    const next = loveLanguages.includes(lang) ? loveLanguages.filter((l) => l !== lang) : [...loveLanguages, lang];
    setLoveLanguages(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const parseList = (s: string) => s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    update({
      attachmentStyle: attachmentStyle.trim() || undefined,
      loveLanguages,
      conflictStyle: conflictStyle.trim() || undefined,
      strengths: parseList(strengthsText),
      growthEdges: parseList(growthEdgesText),
    });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Attachment style</Text>
      <View style={styles.chipRow}>
        {ATTACHMENT_OPTIONS.map((opt) => (
          <Pressable key={opt} style={[styles.chip, attachmentStyle === opt && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAttachmentStyle(opt); }}>
            <Text style={[styles.chipText, attachmentStyle === opt && styles.chipTextSelected]}>{opt}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Love languages</Text>
      <View style={styles.chipRow}>
        {LOVE_LANGS.map((lang) => (
          <Pressable key={lang} style={[styles.chip, loveLanguages.includes(lang) && styles.chipSelected]} onPress={() => toggleLoveLang(lang)}>
            <Text style={[styles.chipText, loveLanguages.includes(lang) && styles.chipTextSelected]}>{lang}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Conflict style (optional)</Text>
      <TextInput style={styles.input} value={conflictStyle} onChangeText={setConflictStyle} placeholder="How you handle conflict" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Strengths (comma separated)</Text>
      <TextInput style={styles.input} value={strengthsText} onChangeText={setStrengthsText} placeholder="e.g. Patience, humor" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Growth edges (comma separated)</Text>
      <TextInput style={styles.input} value={growthEdgesText} onChangeText={setGrowthEdgesText} placeholder="What you are working on" placeholderTextColor={COLORS.textMuted} />
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
