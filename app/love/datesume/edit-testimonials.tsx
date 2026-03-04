/**
 * Datésumé — Edit testimonials: add quotes with source.
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

export default function EditTestimonialsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, addTestimonial, removeTestimonial } = useDatesumeStore();

  const [quote, setQuote] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  const list = datesume?.testimonials ?? [];

  const handleAdd = () => {
    const q = quote.trim();
    if (!q) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addTestimonial({ quote: q, source: source.trim() || 'Anonymous' });
    setQuote('');
    setSource('');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {list.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.quote}>"{t.quote}"</Text>
          <Text style={styles.source}>— {t.source}</Text>
          <Pressable style={styles.deleteBtn} onPress={() => { removeTestimonial(t.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.label}>Add testimonial</Text>
      <TextInput style={[styles.input, styles.textArea]} value={quote} onChangeText={setQuote} placeholder="What someone said about you" placeholderTextColor={COLORS.textMuted} multiline />
      <TextInput style={styles.input} value={source} onChangeText={setSource} placeholder="Source (e.g. ex-partner, friend)" placeholderTextColor={COLORS.textMuted} />
      <Pressable style={[styles.saveBtn, !quote.trim() && styles.saveBtnDisabled]} onPress={handleAdd} disabled={!quote.trim()}>
        <Text style={styles.saveBtnText}>Add</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  quote: { fontSize: 15, color: COLORS.text, fontStyle: 'italic' },
  source: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  deleteBtnText: { fontSize: 14, color: COLORS.error },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
